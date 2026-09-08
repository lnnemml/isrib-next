"use server";

// Post-payment shipping capture (ADR 0010). The payment-confirmed email links to
// /shipping/<token>; this action writes the structured address back onto the order row,
// keyed by the unguessable shipping_token (never the guessable order_number). On success
// it redirects back to the same token URL, which then renders the read-only "received"
// state — so a refresh is idempotent.

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { shippingReceivedAdmin, type EmailItem } from "@/lib/email/templates";
import { sendToAdmin } from "@/lib/email/send";

export type ShippingState = { error: string } | { ok: true } | null;

export async function submitShipping(_prev: ShippingState, formData: FormData): Promise<ShippingState> {
  try {
    const token = (formData.get("token") as string | null)?.trim() ?? "";
    const fullName = (formData.get("fullName") as string | null)?.trim() ?? "";
    const address = (formData.get("address") as string | null)?.trim() ?? "";
    const city = (formData.get("city") as string | null)?.trim() ?? "";
    const postalCode = (formData.get("postalCode") as string | null)?.trim() ?? "";
    const mobile = (formData.get("mobile") as string | null)?.trim() ?? "";

    if (!token) {
      return { error: "Missing shipping link. Please use the link from your email." };
    }
    if (!fullName || !address || !city || !postalCode || !mobile) {
      return { error: "Please fill in all required fields." };
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.shippingToken, token))
      .limit(1);
    if (!order) {
      return { error: "We couldn't find that order. Please use the link from your email." };
    }

    await db
      .update(orders)
      .set({
        name: fullName,
        address,
        city,
        postalCode,
        phone: mobile,
        shippingDetailsAt: new Date(),
      })
      .where(eq(orders.shippingToken, token));

    // Notify the admin with the FULL order + shipping + line items so fulfilment
    // needs no DB lookup. Uses the SUBMITTED form values for the address fields
    // (the `order` row fetched above still holds the OLD null shipping values) and
    // `order.*` for everything else. BEST-EFFORT: wrapped in its OWN try/catch so a
    // mail failure can never surface as a user error or block the redirect — and it
    // must NOT reach the outer catch (which would wrongly return { error } to the
    // customer after shipping has already saved).
    try {
      const dbItems = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      const items: EmailItem[] = dbItems.map((it) => ({
        slug: it.productSlug,
        sizeLabel: it.sizeLabel,
        format: it.format,
        quantity: it.quantity,
        linePrice: it.linePrice,
      }));

      const { subject, html } = shippingReceivedAdmin({
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        email: order.email,
        paymentMethod: order.paymentMethod,
        subtotalPrice: order.subtotalPrice,
        totalPrice: order.totalPrice,
        cryptoDiscountPct: order.cryptoDiscountPct,
        promoCode: order.promoCode,
        referralCodeUsed: order.referralCodeUsed,
        note: order.note,
        // submitted form values (order row still has the old null shipping fields)
        name: fullName,
        address,
        city,
        postalCode,
        phone: mobile,
        // order row for the rest of the address
        stateRegion: order.stateRegion,
        country: order.country,
        items,
        utmSource: order.utmSource,
        utmCampaign: order.utmCampaign,
        utmContent: order.utmContent,
      });

      await sendToAdmin(subject, html);
    } catch (mailErr) {
      console.error("submitShipping: admin notification failed (non-fatal):", mailErr);
    }

    // Redirect back to the same token URL — now renders the read-only received state,
    // so a refresh stays idempotent.
    redirect("/shipping/" + token);
  } catch (err) {
    // redirect() signals success by throwing NEXT_REDIRECT — must be re-thrown.
    if (isRedirectError(err)) throw err;
    console.error("submitShipping failed:", err);
    return { error: "Something went wrong saving your shipping details. Please try again." };
  }
}
