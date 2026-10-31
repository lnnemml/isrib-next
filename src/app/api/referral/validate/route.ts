// ADR 0014 — referral code preview for the checkout page. EXISTS-ONLY check: does a
// customer own this referral code? Self-referral is NOT enforced here (the client may
// not have entered an email yet); it is enforced authoritatively server-side in
// submitOrder via validateReferralCode. This endpoint only drives the client preview.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getActiveAffiliateDiscountPct } from "@/lib/affiliate/lookup";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { normalizeReferralCode } from "@/lib/referral";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = normalizeReferralCode(new URL(request.url).searchParams.get("code"));
  if (code === null) {
    return NextResponse.json({ valid: false });
  }

  // ADR 0025 — the isrib_ref cookie can hold an affiliate code. Null with the flag off, with
  // no query.
  const affiliatePct = await getActiveAffiliateDiscountPct(code);
  if (affiliatePct !== null) {
    return NextResponse.json({ valid: true, discountPct: affiliatePct, kind: "affiliate" });
  }

  const [referrer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.referralCode, code))
    .limit(1);

  return NextResponse.json({ valid: !!referrer });
}
