// Pure discount arithmetic. No "server-only" and no db import, so it can be unit-tested without
// a connection. src/lib/referral.ts re-exports computeEffectiveDiscount and EffectiveDiscount.

export interface EffectiveDiscount {
  discountPct: number;
  totalCents: number;
  usesRewardCredit: boolean;
}

// ADR 0014 / ADR 0016 — discounts DO NOT STACK; the effective discount is the BEST
// SINGLE applicable percentage, never a sum. Crypto (CRYPTO_DISCOUNT_PCT), an incoming
// referral code (REFERRAL_DISCOUNT_PCT), and a redeemed reward credit are all worth
// exactly 10%, captured by this local DISCOUNT_PCT. A launch promo code (ADR 0016)
// adds a fourth source whose percentage may differ, so the effective rate is
// max(basePct, promoPct). When promoPct === 0 this reduces EXACTLY to the old
// flat-10-or-0 behaviour (the no-promo invariant). ADR 0025 — an affiliate rate is one
// more input to the same max(), and with affiliatePct 0 nothing changes.
const DISCOUNT_PCT = 10;

export function computeEffectiveDiscount(input: {
  subtotalCents: number;
  isCrypto: boolean;
  hasValidReferral: boolean;
  rewardCreditAvailable: boolean;
  promoPct: number;
  affiliatePct?: number;
}): EffectiveDiscount {
  const affiliatePct = input.affiliatePct ?? 0;
  const baseEligible =
    input.isCrypto || input.hasValidReferral || input.rewardCreditAvailable;
  const basePct = baseEligible ? DISCOUNT_PCT : 0; // existing flat-10 path
  const discountPct = Math.max(basePct, input.promoPct, affiliatePct); // non-stacking: best single
  const totalCents =
    input.subtotalCents - Math.round((input.subtotalCents * discountPct) / 100);

  // Consume the credit ONLY when it is the SOLE reason for the discount — never on a
  // crypto order, an order that already carries an incoming referral code, or one
  // discounted by a promo code or affiliate code, so a stored credit is never wasted on
  // a discount the order would get anyway.
  const usesRewardCredit =
    !input.isCrypto &&
    !input.hasValidReferral &&
    input.promoPct === 0 &&
    affiliatePct === 0 &&
    input.rewardCreditAvailable;

  return { discountPct, totalCents, usesRewardCredit };
}

// The percentage an order actually got, recovered from its stored totals, to one decimal: rates
// can be set to one decimal, so 12.5 has to stay 12.5. A whole rate comes back as 15, never "15.0".
// The order keeps no record of which discount won the max() above, so this is the only honest
// figure for one.
export function discountPctFromTotals(subtotalCents: number, totalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return Math.round(((subtotalCents - totalCents) * 1000) / subtotalCents) / 10;
}
