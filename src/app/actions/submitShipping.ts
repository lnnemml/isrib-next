"use server";

// Post-payment shipping capture (ADR 0010). The payment-confirmed email links to
// /shipping/<token>; this action writes the structured address back onto the order row,
// keyed by the unguessable shipping_token (never the guessable order_number). On success
// it redirects back to the same token URL, which then renders the read-only "received"
// state — so a refresh is idempotent.

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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
