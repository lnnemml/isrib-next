// ADR 0016 — promo-code preview for the checkout page. Returns valid/invalid + the
// discount percentage (0 when invalid). Deliberately does NOT distinguish "expired" or
// "inactive" from "unknown" — the client only needs to know whether to preview the
// discount. Server-side validation in submitOrder is authoritative; this only drives
// the client preview (mirrors /api/referral/validate).

import { NextResponse } from "next/server";
import { getActiveAffiliateDiscountPct } from "@/lib/affiliate/lookup";
import { validatePromoCode } from "@/lib/promo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  // ADR 0025 — affiliate codes share this field. Null with the flag off, with no query.
  const affiliatePct = await getActiveAffiliateDiscountPct(code);
  if (affiliatePct !== null) {
    return NextResponse.json({ valid: true, discountPct: affiliatePct, kind: "affiliate" });
  }

  const result = await validatePromoCode({ code });

  return NextResponse.json({
    valid: result.ok,
    discountPct: result.ok ? result.discountPct : 0,
  });
}
