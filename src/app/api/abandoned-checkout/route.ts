// Abandoned-checkout nurture consumer (G2 Step 5). QStash delivers here at T+2h and
// T+24h after an unpaid order is placed (enqueued in src/app/actions/submitOrder.ts).
// Sends the appropriate reminder email and stamps abandoned_emailN_sent_at.
//
// ROBUSTNESS CONTRACT (mirrors the NowPayments webhook):
//  - A missing/invalid QStash signature returns 401 (never processed).
//  - Every GUARD that means "there's nothing to do" returns 200 OK so QStash STOPS
//    retrying: order not found, order already paid (don't nag a paid buyer), or the
//    relevant abandoned_emailN_sent_at is already set (a duplicate QStash delivery —
//    the stamp makes redelivery safe / idempotent).
//  - A transient send/stamp failure is caught + logged and STILL returns 200, so QStash
//    doesn't hammer us. It never throws out of POST.
//  - No secrets are logged.

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { getCryptoRates } from "@/lib/email/rates";
import { abandonedCheckout, type EmailItem } from "@/lib/email/templates";
import { sendToCustomer } from "@/lib/email/send";
import { Receiver } from "@upstash/qstash";
import { eq } from "drizzle-orm";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature");
  if (!signature) return new Response("Unauthorized", { status: 401 });

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/abandoned-checkout`;
  // verify() throws on an invalid signature — catch to a plain false.
  const valid = await receiver.verify({ signature, body, url }).catch(() => false);
  if (!valid) return new Response("Unauthorized", { status: 401 });

  const { orderNumber, emailNumber } = JSON.parse(body) as {
    orderNumber: string;
    emailNumber: 1 | 2;
  };

  // Fetch the order by its human-readable number (the enqueued payload's key).
  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      email: orders.email,
      name: orders.name,
      paymentMethod: orders.paymentMethod,
      totalPrice: orders.totalPrice,
      invoiceUrl: orders.nowpaymentsPaymentUrl,
      email1SentAt: orders.abandonedEmail1SentAt,
      email2SentAt: orders.abandonedEmail2SentAt,
    })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  // GUARD — unknown order: 200 so QStash stops retrying something we can't resolve.
  if (!order) {
    console.error(`abandoned-checkout: order not found for order_number=${orderNumber}`);
    return new Response("OK");
  }

  // GUARD — already paid: don't nag a paid buyer. 200 (stop retrying).
  if (order.status === "paid") return new Response("OK");

  // GUARD — this reminder already went out (duplicate QStash delivery): 200 idempotent.
  const alreadySent = emailNumber === 1 ? order.email1SentAt : order.email2SentAt;
  if (alreadySent) return new Response("OK");

  // Side effects wrapped so a transient failure returns 200 (QStash won't hammer us).
  try {
    const rows = await db
      .select({
        productSlug: orderItems.productSlug,
        sizeLabel: orderItems.sizeLabel,
        format: orderItems.format,
        quantity: orderItems.quantity,
        linePrice: orderItems.linePrice,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const items: EmailItem[] = rows.map((it) => ({
      slug: it.productSlug,
      sizeLabel: it.sizeLabel,
      format: it.format,
      quantity: it.quantity,
      linePrice: it.linePrice,
    }));

    const totalUsd = order.totalPrice / 100;
    // getCryptoRates never throws (empty strings on any failure → template fallback).
    const { btcEquivalent, ltcEquivalent } = await getCryptoRates(totalUsd);

    const { subject, html } = abandonedCheckout({
      firstName: order.name,
      orderNumber,
      items,
      totalUsd,
      paymentMethod: order.paymentMethod,
      invoiceUrl: order.invoiceUrl,
      emailNumber,
      btcEquivalent,
      ltcEquivalent,
    });

    await sendToCustomer(order.email, subject, html);

    // Stamp only after a genuine successful send — the guard above then makes any
    // future redelivery a no-op.
    await db
      .update(orders)
      .set(
        emailNumber === 1
          ? { abandonedEmail1SentAt: new Date() }
          : { abandonedEmail2SentAt: new Date() },
      )
      .where(eq(orders.id, order.id));
  } catch (err) {
    console.error("abandoned-checkout: send/stamp failed (non-fatal):", err);
  }

  return new Response("OK");
}
