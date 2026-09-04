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
import { generateOrderNumber, deriveTrafficType } from "@/lib/order-number";
import { trackServerEvent } from "@/lib/analytics/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Return shape designed for `useActionState`: a validation failure RETURNS { error };
// success `redirect()`s (which throws NEXT_REDIRECT — re-thrown below — so { ok } is
// never actually returned in practice, but it keeps the type honest for the hook).
export type SubmitState = { error: string } | { ok: true } | null;

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
      phone:          (formData.get("phone") as string | null)?.trim() ?? "",
      address:        (formData.get("address") as string | null)?.trim() ?? "",
      city:           (formData.get("city") as string | null)?.trim() ?? "",
      postalCode:     (formData.get("postalCode") as string | null)?.trim() ?? "",
      stateRegion:    (formData.get("stateRegion") as string | null)?.trim() || null,
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

    // 3. Required customer/shipping fields + a valid payment method.
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

    // 6/7. Subtotal + crypto discount.
    const cryptoDiscountPct = paymentMethod === "crypto" ? CRYPTO_DISCOUNT_PCT : null;
    const totalCents =
      paymentMethod === "crypto"
        ? subtotalCents - Math.round((subtotalCents * CRYPTO_DISCOUNT_PCT) / 100)
        : subtotalCents;

    // 8. Identifiers + traffic classification.
    const orderNumber = generateOrderNumber();
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
          phone: raw.phone,
          address: raw.address,
          city: raw.city,
          postalCode: raw.postalCode,
          stateRegion: raw.stateRegion,
          country: raw.country,
          paymentMethod,
          cryptoDiscountPct,
          subtotalPrice: subtotalCents,
          totalPrice: totalCents,
          note: raw.note,
          orderNumber,
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

    // TODO(step 3): sendOrderEmails(order, items) then stamp orders.confirmationEmailSentAt.
    // TODO(step 4): if crypto → createInvoice(), db.update({ nowpaymentsInvoiceId,
    //   nowpaymentsPaymentUrl }), then redirect(invoice.invoice_url) instead of the line below.

    // 13. Both paths land on the success page this step.
    redirect("/checkout/success?order=" + orderNumber);
  } catch (err) {
    // redirect() signals success by throwing NEXT_REDIRECT — must be re-thrown so Next
    // can perform the navigation (mirrors NORA's guard).
    if (isRedirectError(err)) throw err;
    console.error("submitOrder failed:", err);
    return { error: "Something went wrong placing your order. Please try again." };
  }
}
