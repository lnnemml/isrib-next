// NowPayments IPN webhook (G2 Step 4). Mirrors the NORA reference route, adapted to the
// ISRIB order schema + email templates. Marks an order "paid" once NowPayments reports a
// "finished" payment, then (best-effort) emails the customer the shipping-details link,
// alerts ops, and fires the Purchase conversion.
//
// ROBUSTNESS CONTRACT:
//  - Never throws out of POST — JSON.parse is wrapped, all sends use Promise.allSettled.
//  - Always returns 200 on the happy/known paths so NowPayments stops retrying; only a
//    bad signature (401) or missing secret (500) are non-200.
//  - Idempotent: an already-"paid" order (a retry after we processed it) short-circuits.
//  - Signature is verified constant-time via verifyIpnSignature (see lib/nowpayments.ts).
//  - No secrets are logged.

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyIpnSignature } from "@/lib/nowpayments";
import { sendToCustomer, sendToAdmin } from "@/lib/email/send";
import { paymentConfirmed } from "@/lib/email/templates";
import { trackServerEvent } from "@/lib/analytics/server";
import { cancelAbandonedNurture } from "@/lib/qstash";
import { eq } from "drizzle-orm";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const sig = req.headers.get("x-nowpayments-sig");

  if (!process.env.NOWPAYMENTS_IPN_SECRET) {
    console.error("NowPayments IPN: NOWPAYMENTS_IPN_SECRET not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  // Constant-time HMAC-SHA512 verify. verifyIpnSignature parses the body internally; a
  // malformed body throws here, so wrap the whole verify+parse in a try and treat any
  // failure as unauthorized (never let it escape POST).
  let data: Record<string, unknown>;
  try {
    if (!verifyIpnSignature(body, sig)) {
      return new Response("Unauthorized", { status: 401 });
    }
    data = JSON.parse(body) as Record<string, unknown>;
  } catch (err) {
    console.error("NowPayments IPN: signature/parse failure:", err);
    return new Response("Unauthorized", { status: 401 });
  }

  // Only act on fully completed payments; acknowledge everything else with 200.
  if (data.payment_status !== "finished") {
    return new Response("OK");
  }

  // We passed orderNumber as order_id when creating the invoice.
  const orderNumber = data.order_id as string;
  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      email: orders.email,
      name: orders.name,
      shippingToken: orders.shippingToken,
      totalPrice: orders.totalPrice,
      qstashMessageId1: orders.qstashMessageId1,
      qstashMessageId2: orders.qstashMessageId2,
    })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  // Unknown order — log and 200 so NowPayments stops retrying an order we can't resolve.
  if (!order) {
    console.error(`NowPayments IPN: order not found for order_id=${orderNumber}`);
    return new Response("OK");
  }

  // Idempotent — already processed; short-circuit without re-sending emails/events.
  if (order.status === "paid") {
    return new Response("OK");
  }

  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shippingUrl = `${baseUrl}/shipping/${order.shippingToken}`;

  // Compact inline ops alert — deliberately does NOT re-query order_items.
  const minimalPaidAdminHtml = `<p>Order <strong>${orderNumber}</strong> — $${(order.totalPrice / 100).toFixed(2)} — <strong>PAID</strong></p>`;

  const confirmed = paymentConfirmed({ firstName: order.name, orderNumber, shippingUrl });

  // Best-effort side effects — Promise.allSettled so no single failure throws out of POST.
  const results = await Promise.allSettled([
    sendToCustomer(order.email, confirmed.subject, confirmed.html),
    sendToAdmin(`Payment confirmed: ${orderNumber}`, minimalPaidAdminHtml),
    // "order_confirmed" → Purchase in the server EVENT_MAP (src/lib/analytics/server.ts).
    trackServerEvent("order_confirmed", {
      email: order.email,
      value: order.totalPrice / 100,
      currency: "USD",
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    }),
    // Actively cancel the pending abandoned-checkout nurture reminders — best-effort;
    // the consumer's status==="paid" guard remains the backstop.
    cancelAbandonedNurture([order.qstashMessageId1, order.qstashMessageId2]),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("NowPayments IPN side-effect failed (non-fatal):", r.reason);
  }

  return new Response("OK");
}
