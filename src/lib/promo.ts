import "server-only";

import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "./db";
import { promoCodes } from "./db/schema";

// ADR 0016 — launch promo codes. A checkout-applied percentage discount validated
// server-side, stored on the order, and reflected in the total. Non-stacking with the
// crypto/referral/reward discounts (best single) — see computeEffectiveDiscount.

// The drizzle interactive transaction handle, derived from db.transaction so it stays
// in lockstep with the driver type used everywhere else (submitOrder, referral.ts).
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Codes are stored and compared uppercase; trim + uppercase, null if empty.
export function normalizePromoCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
}

// Validate an incoming promo code against the promo_codes table. Valid only when the
// row exists AND is active AND (never expires OR expires in the future). Returns the
// row's discountPct on success. Callers get valid/invalid only — never WHY it failed.
export async function validatePromoCode(input: {
  code: string | null | undefined;
}): Promise<{ ok: true; code: string; discountPct: number } | { ok: false }> {
  const code = normalizePromoCode(input.code);
  if (code === null) return { ok: false };

  const [row] = await db
    .select({ discountPct: promoCodes.discountPct })
    .from(promoCodes)
    .where(
      and(
        eq(promoCodes.code, code),
        eq(promoCodes.active, true),
        or(isNull(promoCodes.expiresAt), gt(promoCodes.expiresAt, new Date())),
      ),
    )
    .limit(1);

  if (!row) return { ok: false };

  return { ok: true, code, discountPct: row.discountPct };
}

// Atomically bump the redemption counter for a code from INSIDE an order transaction.
// A SQL expression (not read-then-write) so concurrent redemptions can't over/under-count.
export async function incrementPromoRedemption(tx: Tx, code: string): Promise<void> {
  await tx
    .update(promoCodes)
    .set({ redemptionCount: sql`${promoCodes.redemptionCount} + 1` })
    .where(eq(promoCodes.code, code));
}
