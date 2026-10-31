import "server-only";

// ADR 0025 — affiliate reads for attribution and the checkout preview. Named columns only, so a
// caller can never pick up more of the row than resolveAttribution needs.

import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import {
  isValidAffiliateCode,
  normalizeAffiliateCode,
  type AttributionAffiliate,
} from "./core";
import { affiliatesEnabled } from "./flag";

const BPS_PER_PERCENT = 100;

// Inactive rows come back too: resolveAttribution is what ignores them. Empty when the flag is off
// or there is nothing to look up, and neither case touches the database.
export async function getAffiliatesByCodes(
  codes: readonly (string | null | undefined)[],
): Promise<AttributionAffiliate[]> {
  if (!affiliatesEnabled()) return [];

  const normalized = codes
    .map(normalizeAffiliateCode)
    .filter((code): code is string => code !== null);
  if (normalized.length === 0) return [];

  return db
    .select({
      id: affiliates.id,
      code: affiliates.code,
      isActive: affiliates.isActive,
      notifyEmail: affiliates.notifyEmail,
      customerDiscountBps: affiliates.customerDiscountBps,
      commissionRateBps: affiliates.commissionRateBps,
    })
    .from(affiliates)
    .where(inArray(affiliates.code, [...new Set(normalized)]));
}

// The buyer's percentage for an active affiliate code, null for anything else. For the checkout
// preview only, so the percentage is all it hands back. A failed lookup is the same as no match:
// the validate routes carry on with their normal answer, and submitOrder stays authoritative.
export async function getActiveAffiliateDiscountPct(
  rawCode: string | null | undefined,
): Promise<number | null> {
  const code = normalizeAffiliateCode(rawCode);
  if (code === null || !isValidAffiliateCode(code)) return null;

  try {
    const [affiliate] = await getAffiliatesByCodes([code]);
    return affiliate?.isActive ? affiliate.customerDiscountBps / BPS_PER_PERCENT : null;
  } catch {
    console.error("Affiliate preview lookup failed (non-fatal)");
    return null;
  }
}
