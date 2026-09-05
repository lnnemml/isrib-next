"use server";

// Admin order-management Server Actions (ADR 0011 + admin-panel.md §4).
//
// DEFENSE IN DEPTH: every action re-verifies the admin session server-side via
// isAdminAuthed() before touching the DB — the proxy is the first gate, this is the second,
// so a misconfigured matcher can never leave a mutating action unprotected (the verifier
// flagged this). Each action returns a small { ok } | { error } result the UI renders.
//
// Money is never formatted here. Emails are sent NON-FATALLY (a Resend failure logs and the
// action still succeeds — a shipped/paid state must never be lost because email bounced).
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusEnum } from "@/lib/db/schema";
import { isAdminAuthed } from "@/lib/admin/auth";
import { sendToCustomer, sendToAdmin } from "@/lib/email/send";
import { paymentConfirmed, shipped, type EmailItem } from "@/lib/email/templates";
import { cancelAbandonedNurture } from "@/lib/qstash";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { error: string };

// The order_status enum values, sourced from the schema (single source of truth).
type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
const STATUS_VALUES = orderStatusEnum.enumValues;

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

// ── setStatus ─────────────────────────────────────────────────────────────────
export async function setStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  if (!(await isAdminAuthed())) return { error: "Unauthorized" };
  if (!STATUS_VALUES.includes(status)) return { error: "Invalid status." };

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  revalidatePath("/admin");
  return { ok: true };
}

// ── markPaid ──────────────────────────────────────────────────────────────────
// The MANUAL-order paid transition (crypto is driven by the NowPayments webhook). Idempotent:
// an order already paid/fulfilled returns ok without re-sending. On the transition it sends the
// paymentConfirmed email (the /shipping/<token> link) + a compact ops note, both non-fatally.
export async function markPaid(orderId: string): Promise<ActionResult> {
  if (!(await isAdminAuthed())) return { error: "Unauthorized" };

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { error: "Order not found." };
  if (order.status === "paid" || order.status === "fulfilled") {
    return { ok: true }; // idempotent — already paid, no re-send
  }

  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));

  // Actively cancel the pending abandoned-checkout nurture reminders — best-effort; the
  // helper never throws, so this can't roll back the paid state. Consumer's status guard
  // remains the backstop. (order came from select() with no projection, so the qstash ids
  // are present.)
  await cancelAbandonedNurture([order.qstashMessageId1, order.qstashMessageId2]);

  // Email is best-effort — a failure must not roll back the paid state.
  try {
    const shippingUrl = `${baseUrl()}/shipping/${order.shippingToken}`;
    const mail = paymentConfirmed({
      firstName: order.name,
      orderNumber: order.orderNumber,
      shippingUrl,
    });
    await sendToCustomer(order.email, mail.subject, mail.html);
    await sendToAdmin(
      `Order ${order.orderNumber} marked paid`,
      `Order <strong>${order.orderNumber}</strong> (${order.email}) was marked paid in the admin panel. Shipping-details link sent to the customer.`,
    );
  } catch (e) {
    console.error("markPaid email failed (non-fatal):", e);
  }

  revalidatePath("/admin");
  return { ok: true };
}

// ── saveTracking ────────────────────────────────────────────────────────────────
// Sets tracking + shipped_at + status=fulfilled, then auto-sends the shipped email with the
// tracking number/carrier (built from the order's line items). Email is non-fatal.
export async function saveTracking(
  orderId: string,
  trackingNumber: string,
  carrier: string,
): Promise<ActionResult> {
  if (!(await isAdminAuthed())) return { error: "Unauthorized" };

  const cleanTracking = trackingNumber.trim();
  const cleanCarrier = carrier.trim();
  if (!cleanTracking || !cleanCarrier) {
    return { error: "Tracking number and carrier are both required." };
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { error: "Order not found." };

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  await db
    .update(orders)
    .set({
      trackingNumber: cleanTracking,
      trackingCarrier: cleanCarrier,
      shippedAt: new Date(),
      status: "fulfilled",
    })
    .where(eq(orders.id, orderId));

  // Email is best-effort — a failure must not roll back the fulfilled/tracking state.
  try {
    const emailItems: EmailItem[] = items.map((it) => ({
      slug: it.productSlug,
      sizeLabel: it.sizeLabel,
      format: it.format,
      quantity: it.quantity,
      linePrice: it.linePrice,
    }));
    const mail = shipped({
      firstName: order.name,
      orderNumber: order.orderNumber,
      items: emailItems,
      trackingNumber: cleanTracking,
      carrier: cleanCarrier,
    });
    await sendToCustomer(order.email, mail.subject, mail.html);
  } catch (e) {
    console.error("saveTracking email failed (non-fatal):", e);
  }

  revalidatePath("/admin");
  return { ok: true };
}
