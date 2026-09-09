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
import { orders, webhookLogs } from "@/lib/db/schema";
import { verifyIpnSignature } from "@/lib/nowpayments";
import { sendToCustomer, sendToAdmin } from "@/lib/email/send";
import { paymentConfirmed } from "@/lib/email/templates";
import { trackServerEvent } from "@/lib/analytics/server";
import { cancelAbandonedNurture } from "@/lib/qstash";
import { createReferrerReward } from "@/lib/referral";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// ADR 0019 — partial-payment tolerance. Accept a crypto underpayment of at most 2%
// (customer sent ≥98% of the requested amount) as fully paid and absorb the gap: a small
// shortfall is almost always the network withdrawal fee, and asking a customer to top-up a
// few dollars of BTC is pointless (the top-up network fee exceeds the shortfall). Below this,
// the order is held and ops is alerted to decide (top-up request or refund).
const PARTIAL_PAYMENT_TOLERANCE = 0.98;

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

  // Audit-log EVERY verified IPN (incident 2026-09-08). Best-effort: a logging failure
  // must never break the webhook — wrap and swallow so we still 200/continue.
  const orderId = typeof data.order_id === "string" ? data.order_id : null;
  const paymentStatus = typeof data.payment_status === "string" ? data.payment_status : null;
  const paymentId = data.payment_id != null ? String(data.payment_id) : null;
  const actuallyPaidRaw = data.actually_paid != null ? String(data.actually_paid) : null;
  const payCurrency = typeof data.pay_currency === "string" ? data.pay_currency : "?";
  const payAmountRaw = data.pay_amount != null ? String(data.pay_amount) : "?";
  const payAmountNum = Number(data.pay_amount ?? 0);
  const actuallyPaidNum = Number(data.actually_paid ?? 0);
  // Fraction of the requested crypto that actually arrived (0 when unknown/invalid → not accepted).
  const paidRatio =
    Number.isFinite(payAmountNum) && payAmountNum > 0 && Number.isFinite(actuallyPaidNum)
      ? actuallyPaidNum / payAmountNum
      : 0;
  // ADR 0019 — a partially_paid within tolerance is treated exactly like `finished`.
  const acceptedPartial = paymentStatus === "partially_paid" && paidRatio >= PARTIAL_PAYMENT_TOLERANCE;
  const treatAsPaid = paymentStatus === "finished" || acceptedPartial;
  try {
    await db.insert(webhookLogs).values({
      id: nanoid(),
      provider: "nowpayments",
      orderNumber: orderId,
      paymentId,
      paymentStatus,
      actuallyPaid: actuallyPaidRaw,
      rawJson: body,
    });
  } catch (err) {
    console.error("NowPayments IPN: webhook_logs insert failed (non-fatal):", err);
  }

  // Non-finished statuses: acknowledge with 200 (so NowPayments stops retrying), but if the
  // customer's crypto ALREADY landed (actually_paid > 0, or partially_paid) on a status that
  // is NOT finished, that is the incident scenario — a deposit that won't auto-credit. Alert
  // ops loudly so it can be recovered by hand. No auto-mark-paid (needs a human decision).
  if (!treatAsPaid) {
    const depositLanded = paymentStatus === "partially_paid" || (Number.isFinite(actuallyPaidNum) && actuallyPaidNum > 0);
    if (depositLanded) {
      const priceAmount = data.price_amount != null ? String(data.price_amount) : "?";
      const alertHtml =
        `<p><strong>⚠ NowPayments deposit on a NON-finished payment — manual review needed.</strong></p>` +
        `<p>Order <strong>${orderId ?? "(unknown)"}</strong> — status <strong>${paymentStatus ?? "(none)"}</strong></p>` +
        `<p>payment_id: ${paymentId ?? "?"} · actually_paid: ${actuallyPaidRaw ?? "?"} ${payCurrency} · expected: $${priceAmount}</p>` +
        `<p>The funds may be in NowPayments custody but were NOT auto-credited. Check the dashboard / open a support ticket if needed.</p>` +
        (paymentStatus === "partially_paid"
          ? `<p>Received <strong>${(paidRatio * 100).toFixed(1)}%</strong> of the requested ${payAmountRaw} ${payCurrency} — BELOW the ${(PARTIAL_PAYMENT_TOLERANCE * 100).toFixed(0)}% auto-accept threshold. Decide: request a top-up for the difference, or refund.</p>`
          : "");
      try {
        await sendToAdmin(`⚠ NowPayments ${paymentStatus} (deposit) — ${orderId ?? "unknown order"}`, alertHtml);
      } catch (err) {
        console.error("NowPayments IPN: non-finished ops alert failed (non-fatal):", err);
      }
    }
    return new Response("OK");
  }

  // We passed orderNumber as order_id when creating the invoice.
  const orderNumber = orderId!;
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
      // Analytics — the browser↔CAPI dedup id stored at checkout, and the account link used
      // for external_id match quality (mirrors submitOrder: customer id if any, else order id).
      eventId: orders.eventId,
      userId: orders.userId,
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
  // ADR 0019 — surface an accepted partial (absorbed shortfall) in the ops alert for margin visibility.
  const partialNote = acceptedPartial
    ? ` <em>(PARTIAL accepted — received ${actuallyPaidRaw ?? "?"} of ${payAmountRaw} ${payCurrency}, ${(paidRatio * 100).toFixed(1)}% — absorbed the gap)</em>`
    : "";
  const minimalPaidAdminHtml = `<p>Order <strong>${orderNumber}</strong> — $${(order.totalPrice / 100).toFixed(2)} — <strong>PAID</strong>${partialNote}</p>`;

  const confirmed = paymentConfirmed({ firstName: order.name, orderNumber, shippingUrl });

  // Best-effort side effects — Promise.allSettled so no single failure throws out of POST.
  const results = await Promise.allSettled([
    sendToCustomer(order.email, confirmed.subject, confirmed.html),
    sendToAdmin(`Payment confirmed${acceptedPartial ? " (partial)" : ""}: ${orderNumber}`, minimalPaidAdminHtml),
    // "order_confirmed" → Purchase in the server EVENT_MAP (src/lib/analytics/server.ts).
    trackServerEvent("order_confirmed", {
      // Reuse the eventId stored at checkout so the browser Pixel Purchase (if any) and this
      // CAPI Purchase dedup. Nullable in the schema → coerce to undefined when absent.
      eventId: order.eventId ?? undefined,
      email: order.email,
      value: order.totalPrice / 100,
      currency: "USD",
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      // Same stable external_id logic as checkout: customer id if linked, else the order id.
      externalId: order.userId ?? order.id,
    }),
    // Actively cancel the pending abandoned-checkout nurture reminders — best-effort;
    // the consumer's status==="paid" guard remains the backstop.
    cancelAbandonedNurture([order.qstashMessageId1, order.qstashMessageId2]),
    // ADR 0014 — create the referrer's reward credit if this order was referred. Best-effort
    // via allSettled: idempotent (createReferrerReward pre-checks the referrals junction) and
    // can never roll back or break the paid transition.
    createReferrerReward(order.id),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("NowPayments IPN side-effect failed (non-fatal):", r.reason);
  }

  return new Response("OK");
}
