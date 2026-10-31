"use server";

// Checkout server action (gate G2, Step 2). Lands a real order in Neon from the client
// cart. SECURITY: never trusts any client-supplied price — every line's unit price is
// recomputed server-side from the typed catalog + the per-gram calculator (ADR 0009).
// Resend emails = Step 3, NowPayments invoice = Step 4 (marked TODO at the call sites;
// both paths just create the order and redirect to the success page this step).

import { db } from "@/lib/db";
import { orders, orderItems, discountLedger, type NewOrderItem } from "@/lib/db/schema";
import {
  normalizeReferralCode,
  validateReferralCode,
  computeEffectiveDiscount,
  getAvailableRewardCredit,
} from "@/lib/referral";
import { validatePromoCode, incrementPromoRedemption } from "@/lib/promo";
import { computeCommissionCents, resolveAttribution, type Attribution } from "@/lib/affiliate/core";
import { affiliatesEnabled } from "@/lib/affiliate/flag";
import { getAffiliatesByCodes } from "@/lib/affiliate/lookup";
import { getProduct } from "@/lib/copy/products";
import { computeTieredPrice } from "@/lib/copy/pricing";
import { generateOrderNumber, generateShippingToken, deriveTrafficType } from "@/lib/order-number";
import { trackServerEvent } from "@/lib/analytics/server";
import { sendToCustomer, sendToAdmin } from "@/lib/email/send";
import { getCryptoRates } from "@/lib/email/rates";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { orderReceivedManual, opsAlert, type EmailItem } from "@/lib/email/templates";
import { createInvoice } from "@/lib/nowpayments";
import { addMarketingContact, firstNameFromOrderName, safeErrorTag } from "@/lib/marketing/addContact";
import { Client } from "@upstash/qstash";
import { and, eq, gt, desc, isNotNull, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
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

// ADR 0025 — who, if anyone, this order is attributed to. The flag-off path makes no query, and
// a failed lookup costs the attribution, never the sale.
async function lookupAttribution(input: {
  typedCode: string | null;
  cookieCode: string | null;
  buyerEmail: string;
}): Promise<Attribution | null> {
  if (!affiliatesEnabled()) return null;
  try {
    const affiliates = await getAffiliatesByCodes([input.typedCode, input.cookieCode]);
    return resolveAttribution({ ...input, affiliates });
  } catch (e) {
    console.error("Affiliate attribution failed (non-fatal):", safeErrorTag(e));
    return null;
  }
}

export async function submitOrder(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  try {
    const raw = {
      name:           (formData.get("name") as string | null)?.trim() ?? "",
      email:          (formData.get("email") as string | null)?.trim() ?? "",
      // ADR 0024 — full shipping address collected at checkout (stateRegion optional).
      phone:          (formData.get("phone") as string | null)?.trim() ?? "",
      address:        (formData.get("address") as string | null)?.trim() ?? "",
      city:           (formData.get("city") as string | null)?.trim() ?? "",
      stateRegion:    (formData.get("stateRegion") as string | null)?.trim() || null,
      postalCode:     (formData.get("postalCode") as string | null)?.trim() ?? "",
      country:        (formData.get("country") as string | null)?.trim() ?? "",
      paymentMethod:  formData.get("paymentMethod") as string | null,
      note:           (formData.get("note") as string | null)?.trim() || null,
      idempotencyKey: (formData.get("idempotencyKey") as string | null) ?? "",
      cart:           (formData.get("cart") as string | null) ?? "",
      eventId:        (formData.get("eventId") as string | null) || null,
      // Meta browser cookies captured client-side at submit and forwarded for CAPI match
      // quality (analytics only — never affect pricing). fbp/fbc are sent to Meta UN-hashed.
      fbp:            (formData.get("fbp") as string | null) || null,
      fbc:            (formData.get("fbc") as string | null) || null,
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

    // 3. Required customer + shipping fields and a valid payment method. ADR 0024 — the
    // full shipping address is collected here at checkout (state / region is optional).
    if (
      !raw.name ||
      !raw.email ||
      !raw.phone ||
      !raw.address ||
      !raw.city ||
      !raw.postalCode ||
      !raw.country
    ) {
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

    // 6/7. Subtotal + discount (ADR 0014 — crypto / incoming referral / reward credit,
    // NON-STACKING, all worth a flat 10%). currentCustomer is fetched here because both
    // the reward-credit lookup and the self-referral guard need it. NO-REFERRAL invariant:
    // with no ref cookie AND no reward credit, computeEffectiveDiscount yields exactly the
    // old numbers — crypto → subtotal×0.9, manual → subtotal.
    //
    // ADR 0013 — attach the order to the logged-in customer if there is one; guest
    // checkout leaves this null. Email-join remains the cabinet read path for now.
    const currentCustomer = await getCurrentCustomer();
    const isCrypto = paymentMethod === "crypto";

    // Referee side — read the ?ref cookie (client-set), validate server-side (authoritative).
    const refCookie = (await cookies()).get("isrib_ref")?.value ?? null;
    const refCode = normalizeReferralCode(refCookie);
    const referral = refCode
      ? await validateReferralCode({ code: refCode, refereeEmail: raw.email, refereeCustomerId: currentCustomer?.id ?? null })
      : { ok: false as const };

    // Referrer side — a logged-in customer may have an available reward credit.
    const rewardCredit = await getAvailableRewardCredit(currentCustomer?.id ?? null);

    // ADR 0016 — promo code (posted from the checkout field). Server-side validation is
    // authoritative; the client preview is cosmetic. promoPct is 0 when absent/invalid, so
    // the NO-PROMO invariant holds: computeEffectiveDiscount yields exactly the old numbers.
    const promoRaw = formData.get("promoCode") as string | null;
    const promo = await validatePromoCode({ code: promoRaw });

    // ADR 0025 — an affiliate attribution drops any customer referral on this order (no
    // reward) and leaves a reward credit unconsumed. The credit is withheld rather than left
    // for computeEffectiveDiscount, so it cannot lift an order whose code is worth under 10%
    // without being spent. With no attribution this adds nothing to the numbers above.
    const attribution = await lookupAttribution({
      typedCode: promoRaw,
      cookieCode: refCookie,
      buyerEmail: raw.email,
    });
    const hasValidReferral = referral.ok && attribution === null;

    const eff = computeEffectiveDiscount({
      subtotalCents,
      isCrypto,
      hasValidReferral,
      rewardCreditAvailable: !!rewardCredit && attribution === null,
      promoPct: promo.ok ? promo.discountPct : 0,
      affiliatePct: attribution ? attribution.affiliate.customerDiscountBps / 100 : 0,
    });

    // Keep existing column semantics: cryptoDiscountPct reflects the crypto method only.
    const cryptoDiscountPct = isCrypto ? CRYPTO_DISCOUNT_PCT : null;
    const totalCents = eff.totalCents;

    // Attribution + reward-trigger fields (set whenever a valid referral is present, EVEN on
    // crypto orders where it adds no extra discount — the referee was still referred).
    const referralCodeUsed = referral.ok && hasValidReferral ? referral.code : null;
    const referredByCustomerId = referral.ok && hasValidReferral ? referral.referrerId : null;
    // Consume a reward credit ONLY when it's the sole reason for the discount (eff.usesRewardCredit).
    const discountLedgerId = eff.usesRewardCredit && rewardCredit ? rewardCredit.id : null;

    // 8. Identifiers + traffic classification. The shipping token is still generated
    // because the column is NOT NULL + unique, but it is unused since ADR 0024 removed
    // the post-payment shipping form.
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
    // (currentCustomer + referral/discount were resolved above in step 6/7.)
    //
    // ADR 0014 — atomically CLAIM the reward credit (guards against a concurrent order
    // spending the same credit — the read in getAvailableRewardCredit is not a lock).
    // These are assigned their final values from INSIDE the transaction so downstream
    // email/analytics report the amount actually charged.
    // Dedup duplicate crypto submits (incident 2026-09-08): the client idempotencyKey is
    // regenerated per page mount, so a customer who returns to checkout mints a fresh order
    // + invoice. If this same email already has a recent, still-unpaid crypto order with a
    // live invoice for the SAME total, send them back to THAT invoice instead of minting
    // another. Invoices are floating-rate now (ADR — no rate-lock), so a <60-min-old invoice
    // is still payable. Matches email + total to avoid reusing a stale invoice for a changed cart.
    // ADR 0025 — also matches the affiliate, so a same-total order never reuses an invoice whose
    // order is credited to someone else.
    if (paymentMethod === "crypto") {
      const sixtyMinAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [dupe] = await db
        .select({ orderNumber: orders.orderNumber, paymentUrl: orders.nowpaymentsPaymentUrl })
        .from(orders)
        .where(
          and(
            eq(orders.email, raw.email),
            eq(orders.paymentMethod, "crypto"),
            eq(orders.status, "pending_payment_instructions"),
            eq(orders.totalPrice, totalCents),
            attribution ? eq(orders.affiliateId, attribution.affiliate.id) : isNull(orders.affiliateId),
            isNotNull(orders.nowpaymentsPaymentUrl),
            gt(orders.createdAt, sixtyMinAgo),
          ),
        )
        .orderBy(desc(orders.createdAt))
        .limit(1);
      if (dupe?.paymentUrl) {
        console.log("[submitOrder] reusing live invoice for duplicate crypto submit:", dupe.orderNumber);
        return { redirectUrl: dupe.paymentUrl };
      }
    }

    let effectiveTotalCents = totalCents;
    let effectiveDiscountLedgerId: string | null = discountLedgerId;
    try {
      await db.transaction(async (tx) => {
        // ADR 0014 — claim the reward credit BEFORE inserting the order, guarding on
        // `status = "available"` so only one concurrent order can win the credit.
        if (discountLedgerId) {
          const claimed = await tx
            .update(discountLedger)
            .set({ status: "redeemed", redeemedOrderId: orderId })
            .where(and(eq(discountLedger.id, discountLedgerId), eq(discountLedger.status, "available")))
            .returning({ id: discountLedger.id });
          if (claimed.length === 0) {
            // Lost the race — the credit was already spent by a concurrent order. The credit was
            // the SOLE reason for the discount (usesRewardCredit invariant), so drop it: no discount.
            effectiveDiscountLedgerId = null;
            effectiveTotalCents = subtotalCents;
          }
        }
        await tx.insert(orders).values({
          id: orderId,
          userId: currentCustomer?.id ?? null,
          name: raw.name,
          email: raw.email,
          // ADR 0024 — shipping address written with the order; stateRegion is optional
          // (null when blank). shippingDetailsAt is stamped at submit.
          phone: raw.phone,
          address: raw.address,
          city: raw.city,
          stateRegion: raw.stateRegion,
          postalCode: raw.postalCode,
          country: raw.country,
          shippingDetailsAt: new Date(),
          paymentMethod,
          cryptoDiscountPct,
          // ADR 0016 — snapshot the applied promo code (uppercase, server-validated) or null.
          promoCode: promo.ok ? promo.code : null,
          subtotalPrice: subtotalCents,
          totalPrice: effectiveTotalCents,
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
          // ADR 0014 — referral attribution + reward-trigger fields.
          referralCodeUsed,
          referredByCustomerId,
          discountLedgerId: effectiveDiscountLedgerId,
          // ADR 0025 — attribution + commission snapshot, from the final total. Earned state
          // is derived from status; commissionEarnedAt stays null until the paid claim.
          affiliateId: attribution ? attribution.affiliate.id : null,
          attributionSource: attribution ? attribution.source : null,
          commissionRateSnapshotBps: attribution ? attribution.affiliate.commissionRateBps : null,
          commissionAmountCents: attribution
            ? computeCommissionCents(effectiveTotalCents, attribution.affiliate.commissionRateBps)
            : null,
          // Analytics dedup id (ADR 0005) — stored so the NowPayments webhook's Purchase
          // event can reuse it. Nullable: a missing incoming eventId stores null, never fails.
          eventId: raw.eventId,
          // status defaults to "pending_payment_instructions".
        });
        await tx.insert(orderItems).values(items);
        // ADR 0016 — atomically bump the promo redemption counter alongside the order
        // insert (never over-count under concurrency). Placed after the inserts so it
        // shares their transaction but can't interfere with the idempotency/reward logic.
        if (promo.ok) {
          await incrementPromoRedemption(tx, promo.code);
        }
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
    // externalId — a stable id for CAPI match quality: the logged-in customer id when
    // present, otherwise this order's id (never PII; hashed server-side). ADR 0024 — the
    // checkout form collects phone again; server.ts hashes it (digits only) into user_data.ph.
    const externalId = currentCustomer?.id ?? orderId;
    const h = await headers();
    await trackServerEvent("order_submitted", {
      eventId: raw.eventId ?? undefined,
      email: raw.email,
      phone: raw.phone,
      value: effectiveTotalCents / 100,
      currency: "USD",
      userAgent: h.get("user-agent") ?? undefined,
      sourceUrl: h.get("referer") ?? undefined,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      fbp: raw.fbp ?? undefined,
      fbc: raw.fbc ?? undefined,
      externalId,
    });

    // 11. Transactional emails (Step 3). ALL email work is wrapped so a Resend/CoinGecko
    // failure NEVER breaks the order or the redirect — we log and continue. Money is
    // converted to dollars for the templates; `items` is rebuilt from the RECOMPUTED
    // order items (never client prices). Manual path also stamps confirmationEmailSentAt.
    // effectiveTotalCents === totalCents on the crypto path (a credit is never claimed
    // there); on the manual path it reflects a lost-race fallback to no discount.
    const totalUsd = effectiveTotalCents / 100;
    const subtotalUsd = subtotalCents / 100;
    const emailItems: EmailItem[] = items.map((it) => ({
      slug: it.productSlug,
      sizeLabel: it.sizeLabel,
      format: it.format,
      quantity: it.quantity,
      linePrice: it.linePrice,
    }));

    // Customer greetings use the first name only (the checkout field is "Full name");
    // falls back to the full name if no token. Ops emails keep the full name.
    const greetingName = firstNameFromOrderName(raw.name) ?? raw.name;

    try {
      const sends: Promise<unknown>[] = [];

      if (paymentMethod === "manual") {
        // getCryptoRates never throws (empty strings on any failure → template fallback).
        const { btcEquivalent, ltcEquivalent } = await getCryptoRates(totalUsd);
        const manual = orderReceivedManual({
          firstName: greetingName,
          orderNumber,
          items: emailItems,
          subtotalUsd,
          totalUsd,
          btcEquivalent,
          ltcEquivalent,
          shippingAddress: {
            name: raw.name,
            address: raw.address,
            city: raw.city,
            stateRegion: raw.stateRegion,
            postalCode: raw.postalCode,
            country: raw.country,
            phone: raw.phone,
          },
          discountLabel: attribution ? `Discount (${eff.discountPct}%)` : undefined,
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
        phone: raw.phone,
        address: raw.address,
        city: raw.city,
        stateRegion: raw.stateRegion,
        postalCode: raw.postalCode,
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

    // 11c. ADR 0023 — the buyer auto-joins the marketing list (paid or unpaid). The order is
    // already committed; insert-only, so an existing/opted-out contact is never touched.
    // Runs via after() — scheduled here, executed AFTER the response is sent, so the DB insert
    // + Resend round-trip (no SDK timeout) never sits in front of the redirect. after() is
    // allowed in Server Functions and still runs when redirect() is called (Next docs,
    // functions/after.md). NON-FATAL: any error is logged and ignored — it can never change
    // the result or the redirect. Not reached on the idempotent-recovery path (that order
    // already existed).
    const marketingEmail = raw.email;
    const marketingFirstName = firstNameFromOrderName(raw.name);
    // Logs carry only the error name/code (safeErrorTag) — never the email.
    try {
      after(async () => {
        try {
          await addMarketingContact(marketingEmail, marketingFirstName, "orders");
        } catch (e) {
          console.error("Marketing list add failed (non-fatal):", safeErrorTag(e));
        }
      });
    } catch (e) {
      console.error("Marketing list add scheduling failed (non-fatal):", safeErrorTag(e));
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
