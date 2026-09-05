"use server";

// Checkout server action (gate G2, Step 2). Lands a real order in Neon from the client
// cart. SECURITY: never trusts any client-supplied price — every line's unit price is
// recomputed server-side from the typed catalog + the per-gram calculator (ADR 0009).
// Resend emails = Step 3, NowPayments invoice = Step 4 (marked TODO at the call sites;
// both paths just create the order and redirect to the success page this step).

import { db } from "@/lib/db";
import { orders, orderItems, type NewOrderItem } from "@/lib/db/schema";
import { getProduct } from "@/lib/copy/products";
import { computeTieredPrice } from "@/lib/copy/pricing";
import { generateOrderNumber, generateShippingToken, deriveTrafficType } from "@/lib/order-number";
import { trackServerEvent } from "@/lib/analytics/server";
import { sendToCustomer, sendToAdmin } from "@/lib/email/send";
import { getCryptoRates } from "@/lib/email/rates";
import { orderReceivedManual, opsAlert, type EmailItem } from "@/lib/email/templates";
import { createInvoice } from "@/lib/nowpayments";
import { Client } from "@upstash/qstash";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Return shape designed for `useActionState`: a validation failure RETURNS { error };
// the manual path `redirect()`s (which throws NEXT_REDIRECT — re-thrown below — so { ok }
// is never actually returned in practice, but it keeps the type honest for the hook). The
// crypto path RETURNS { redirectUrl } so the client can navigate to the EXTERNAL
// NowPayments invoice (redirect() only works for internal routes through the action).
export type SubmitState = { error: string } | { redirectUrl: string } | { ok: true } | null;

const CRYPTO_DISCOUNT_PCT = 10;

// A cart line as posted from the client (prices deliberately absent — recomputed here).
interface ClientCartLine {
  productSlug: string;
  format: "powder" | "capsules";
  quantity: number;
  sizeLabel: string;
}

// Parse a powder sizeLabel ("2g" / "500mg") → mg. Returns null for anything else, so
// the caller can reject the order rather than guess.
function mgFromSizeLabel(sizeLabel: string): number | null {
  const g = /^([\d.]+)\s*g$/i.exec(sizeLabel.trim());
  if (g) return Math.round(parseFloat(g[1]) * 1000);
  const mg = /^([\d.]+)\s*mg$/i.exec(sizeLabel.trim());
  if (mg) return Math.round(parseFloat(mg[1]));
  return null;
}

export async function submitOrder(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  try {
    const raw = {
      name:           (formData.get("name") as string | null)?.trim() ?? "",
      email:          (formData.get("email") as string | null)?.trim() ?? "",
      country:        (formData.get("country") as string | null)?.trim() ?? "",
      paymentMethod:  formData.get("paymentMethod") as string | null,
      note:           (formData.get("note") as string | null)?.trim() || null,
      idempotencyKey: (formData.get("idempotencyKey") as string | null) ?? "",
      cart:           (formData.get("cart") as string | null) ?? "",
      eventId:        (formData.get("eventId") as string | null) || null,
      utmSource:      (formData.get("utmSource") as string | null) || null,
      utmMedium:      (formData.get("utmMedium") as string | null) || null,
      utmCampaign:    (formData.get("utmCampaign") as string | null) || null,
      utmContent:     (formData.get("utmContent") as string | null) || null,
      utmTerm:        (formData.get("utmTerm") as string | null) || null,
    };

    // 2. Idempotency — if this exact checkout attempt already landed, redirect to its
    // success page instead of creating a duplicate order (dedupes double-submit).
    if (raw.idempotencyKey) {
      const [existing] = await db
        .select()
        .from(orders)
        .where(eq(orders.idempotencyKey, raw.idempotencyKey))
        .limit(1);
      if (existing) {
        redirect("/checkout/success?order=" + existing.orderNumber);
      }
    } else {
      return { error: "Missing request key. Please refresh and try again." };
    }

    // 3. Required customer fields + a valid payment method. Shipping address is NOT
    // collected here — it's captured post-payment via /shipping/<token> (ADR 0010).
    if (!raw.name || !raw.email || !raw.country) {
      return { error: "Please fill in all required fields." };
    }
    if (raw.paymentMethod !== "crypto" && raw.paymentMethod !== "manual") {
      return { error: "Please choose a payment method." };
    }
    const paymentMethod = raw.paymentMethod;

    // 4. Parse the cart JSON.
    let clientLines: ClientCartLine[];
    try {
      const parsed: unknown = JSON.parse(raw.cart);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { error: "Your cart is empty." };
      }
      clientLines = parsed as ClientCartLine[];
    } catch {
      return { error: "Your cart is empty." };
    }

    // 5. SERVER-SIDE PRICE RECOMPUTE (security-critical). Resolve an authoritative unit
    // price per line from the typed catalog; never trust any client price.
    const orderId = nanoid();
    const items: NewOrderItem[] = [];
    let subtotalCents = 0;

    for (const line of clientLines) {
      if (typeof line?.productSlug !== "string" || typeof line?.sizeLabel !== "string") {
        return { error: "Your cart contains an invalid item. Please review it and try again." };
      }
      if (line.format !== "powder" && line.format !== "capsules") {
        return { error: "Your cart contains an invalid item. Please review it and try again." };
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        return { error: "Your cart contains an invalid quantity. Please review it and try again." };
      }

      const product = getProduct(line.productSlug);
      if (!product) {
        return { error: "Your cart contains a product we no longer offer. Please review it and try again." };
      }

      let unitPrice: number;

      if (line.format === "capsules" || product.pricing.kind === "fixed") {
        // Fixed SKU: match a FixedFormat by format + sizeLabel. `formats` is present on
        // fixed products AND as the optional secondary field on per-gram-tiered products
        // (A15/Original capsules).
        const formats = product.pricing.formats ?? [];
        const match = formats.find(
          (f) => f.format === line.format && f.sizeLabel === line.sizeLabel,
        );
        if (!match) {
          return { error: "One of your cart items is no longer available at that size. Please review it and try again." };
        }
        unitPrice = match.priceCents;
      } else {
        // Powder + per-gram-tiered: parse mg from the sizeLabel and run the calculator.
        // Server-authoritative — a gap/below-min/bulk result rejects the WHOLE order.
        const mg = mgFromSizeLabel(line.sizeLabel);
        if (mg == null) {
          return { error: "One of your cart items has an unrecognized size. Please review it and try again." };
        }
        const result = computeTieredPrice(mg, {
          trials: product.pricing.trials,
          tiers: product.pricing.tiers,
        });
        if (result.status !== "ok") {
          return { error: "One of your cart items is not available at that quantity. Please review it and try again." };
        }
        unitPrice = result.totalCents;
      }

      subtotalCents += unitPrice * line.quantity;

      items.push({
        id: nanoid(),
        orderId,
        productSlug: line.productSlug,
        format: line.format,
        quantity: line.quantity,
        sizeLabel: line.sizeLabel,
        // linePrice = per-UNIT price, matching CartLine.linePriceCents ("price for ONE unit").
        linePrice: unitPrice,
      });
    }

    // 6/7. Subtotal + crypto discount.
    const cryptoDiscountPct = paymentMethod === "crypto" ? CRYPTO_DISCOUNT_PCT : null;
    const totalCents =
      paymentMethod === "crypto"
        ? subtotalCents - Math.round((subtotalCents * CRYPTO_DISCOUNT_PCT) / 100)
        : subtotalCents;

    // 8. Identifiers + traffic classification. The shipping token is the unguessable
    // per-order key for the post-payment /shipping/<token> link (ADR 0010).
    const orderNumber = generateOrderNumber();
    const shippingToken = generateShippingToken();
    const trafficType = deriveTrafficType(raw.utmSource, raw.utmMedium);

    // 9. Atomic insert — order + all its items in one transaction (the whole point of
    // the neon-serverless WebSocket driver).
    //
    // TOCTOU guard (ADR 0009): the SELECT-by-idempotencyKey above closes the sequential
    // double-submit, but two submits with the SAME key can race PAST that SELECT before
    // either insert lands. Postgres then rejects the second insert with a unique-violation
    // (23505) on orders_idempotency_key_unique. We recover that as an idempotent SUCCESS:
    // re-SELECT the winning row and redirect to its success page. Only the insert is
    // wrapped so we don't mistake a later error for the collision.
    try {
      await db.transaction(async (tx) => {
        await tx.insert(orders).values({
          id: orderId,
          userId: null,
          name: raw.name,
          email: raw.email,
          // phone/address/city/postalCode/stateRegion omitted — nullable, collected
          // post-payment via /shipping/<token> (ADR 0010).
          country: raw.country,
          paymentMethod,
          cryptoDiscountPct,
          subtotalPrice: subtotalCents,
          totalPrice: totalCents,
          note: raw.note,
          orderNumber,
          shippingToken,
          idempotencyKey: raw.idempotencyKey,
          utmSource: raw.utmSource,
          utmMedium: raw.utmMedium,
          utmCampaign: raw.utmCampaign,
          utmContent: raw.utmContent,
          utmTerm: raw.utmTerm,
          trafficType,
          // status defaults to "pending_payment_instructions".
        });
        await tx.insert(orderItems).values(items);
      });
    } catch (insertErr) {
      // Narrow the unknown pg/neon error safely (no bare `any`): the driver surfaces the
      // Postgres SQLSTATE as `.code` and the violated constraint as `.constraint`.
      const pgErr = insertErr as { code?: string; constraint?: string };
      const isUniqueViolation =
        insertErr != null && typeof insertErr === "object" && "code" in insertErr && pgErr.code === "23505";
      if (isUniqueViolation) {
        // A concurrent submit with the same idempotency_key won the race. Re-read its
        // order and redirect to success — this is the idempotent recovery. If nothing is
        // found, the 23505 was on some OTHER constraint (e.g. an astronomically unlikely
        // nanoid order_number clash), so re-throw to surface as the generic error.
        const [existing] = await db
          .select()
          .from(orders)
          .where(eq(orders.idempotencyKey, raw.idempotencyKey))
          .limit(1);
        if (existing) {
          redirect("/checkout/success?order=" + existing.orderNumber);
        }
      }
      throw insertErr;
    }

    // 10. Server-side conversion event (order_submitted → Meta InitiateCheckout, the
    // primary conversion — ADR 0005). `value` is passed in DOLLARS: server.ts forwards
    // props.value straight into Meta CAPI custom_data.value / GA4 value, both of which
    // expect the monetary amount, so we divide cents by 100 (mirrors NORA). Never throws.
    const h = await headers();
    await trackServerEvent("order_submitted", {
      eventId: raw.eventId ?? undefined,
      email: raw.email,
      value: totalCents / 100,
      currency: "USD",
      userAgent: h.get("user-agent") ?? undefined,
      sourceUrl: h.get("referer") ?? undefined,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    });

    // 11. Transactional emails (Step 3). ALL email work is wrapped so a Resend/CoinGecko
    // failure NEVER breaks the order or the redirect — we log and continue. Money is
    // converted to dollars for the templates; `items` is rebuilt from the RECOMPUTED
    // order items (never client prices). Manual path also stamps confirmationEmailSentAt.
    const totalUsd = totalCents / 100;
    const subtotalUsd = subtotalCents / 100;
    const emailItems: EmailItem[] = items.map((it) => ({
      slug: it.productSlug,
      sizeLabel: it.sizeLabel,
      format: it.format,
      quantity: it.quantity,
      linePrice: it.linePrice,
    }));

    try {
      const sends: Promise<unknown>[] = [];

      if (paymentMethod === "manual") {
        // getCryptoRates never throws (empty strings on any failure → template fallback).
        const { btcEquivalent, ltcEquivalent } = await getCryptoRates(totalUsd);
        const manual = orderReceivedManual({
          firstName: raw.name,
          orderNumber,
          items: emailItems,
          subtotalUsd,
          totalUsd,
          btcEquivalent,
          ltcEquivalent,
        });
        sends.push(
          sendToCustomer(raw.email, manual.subject, manual.html).then(() =>
            // Stamp only after the customer confirmation actually dispatched.
            db.update(orders).set({ confirmationEmailSentAt: new Date() }).where(eq(orders.id, orderId)),
          ),
        );
      }
      // Crypto customer email is sent AFTER invoice creation (below), since it carries
      // the NowPayments invoice link.

      // Both paths: internal ops alert (no-op if ADMIN_EMAIL is unset).
      const ops = opsAlert({
        orderNumber,
        firstName: raw.name,
        email: raw.email,
        country: raw.country,
        items: emailItems,
        totalUsd,
        paymentMethod,
        utmSource: raw.utmSource,
        utmCampaign: raw.utmCampaign,
        utmContent: raw.utmContent,
      });
      sends.push(sendToAdmin(ops.subject, ops.html));

      const results = await Promise.allSettled(sends);
      for (const r of results) {
        if (r.status === "rejected") console.error("Order email failed (non-fatal):", r.reason);
      }
    } catch (emailErr) {
      // Belt-and-braces: even a synchronous throw while building emails must not break
      // the order or the redirect below.
      console.error("Order email step failed (non-fatal):", emailErr);
    }

    // 11b. Abandoned-checkout nurture (Step 5). Enqueue two delayed follow-ups via QStash
    // for ANY unpaid order (both payment methods) — T+2h and T+24h. NON-FATAL: a QStash
    // failure must never break the order or the redirect, and this block is deliberately
    // placed BEFORE the crypto branch's redirect() so it never sits between a redirect()
    // and its own try/catch. baseUrl is computed once here and reused by the crypto branch.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    try {
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
      const abandonedUrl = `${baseUrl}/api/abandoned-checkout`;
      const base = { orderNumber, email: raw.email, firstName: raw.name };
      // delay is in SECONDS per the QStash PublishRequest type.
      // Manual payment is confirmed by hand (admin markPaid), which is slower than the instant
      // crypto IPN webhook — so nudge manual buyers later (T+12h) to avoid nagging mid-arrangement.
      const abandonedDelay1 = paymentMethod === "manual" ? 43200 : 7200; // manual T+12h · crypto T+2h
      const m1 = await qstash.publishJSON({ url: abandonedUrl, body: { ...base, emailNumber: 1 }, delay: abandonedDelay1 });
      const m2 = await qstash.publishJSON({ url: abandonedUrl, body: { ...base, emailNumber: 2 }, delay: 86400 }); // T+24h both
      await db.update(orders).set({ qstashMessageId1: m1.messageId, qstashMessageId2: m2.messageId }).where(eq(orders.id, orderId));
    } catch (e) {
      console.error("QStash enqueue failed (non-fatal):", e);
    }

    // 12. Crypto path (Step 4): create the NowPayments hosted invoice, stamp its id/url
    // on the order, send the customer the invoice-link email, then redirect the buyer to
    // the hosted invoice to pay. The order is ALREADY saved + ops-alerted above, so if
    // invoice creation throws we fall through to the success page rather than losing the
    // order — ops can follow up manually. isRedirectError guards our own redirect().
    if (paymentMethod === "crypto") {
      try {
        const invoice = await createInvoice({
          orderNumber,
          amountUsd: totalUsd,
          successUrl: `${baseUrl}/checkout/success?order=${orderNumber}&paid=1`,
          cancelUrl: `${baseUrl}/checkout`,
          ipnCallbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
        });
        await db
          .update(orders)
          .set({ nowpaymentsInvoiceId: invoice.id, nowpaymentsPaymentUrl: invoice.invoice_url })
          .where(eq(orders.id, orderId));
        return { redirectUrl: invoice.invoice_url };
      } catch (err) {
        if (isRedirectError(err)) throw err;
        console.error("NowPayments invoice creation failed:", err);
        // order is saved + ops alerted — fall through to the success page
      }
    }

    // 13. Manual path (and the crypto fall-through above) land on the success page.
    redirect("/checkout/success?order=" + orderNumber);
  } catch (err) {
    // redirect() signals success by throwing NEXT_REDIRECT — must be re-thrown so Next
    // can perform the navigation (mirrors NORA's guard).
    if (isRedirectError(err)) throw err;
    console.error("submitOrder failed:", err);
    return { error: "Something went wrong placing your order. Please try again." };
  }
}
