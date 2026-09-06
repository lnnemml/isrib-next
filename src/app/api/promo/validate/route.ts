// ADR 0016 — promo-code preview for the checkout page. Returns valid/invalid + the
// discount percentage (0 when invalid). Deliberately does NOT distinguish "expired" or
// "inactive" from "unknown" — the client only needs to know whether to preview the
// discount. Server-side validation in submitOrder is authoritative; this only drives
// the client preview (mirrors /api/referral/validate).

import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const result = await validatePromoCode({ code });

  return NextResponse.json({
    valid: result.ok,
    discountPct: result.ok ? result.discountPct : 0,
  });
}
