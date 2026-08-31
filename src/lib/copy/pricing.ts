// Pure per-gram calculator — a faithful port of the live A15 `calculatePrice`/`findTier`
// (js/main.js). Money is integer cents; quantities are mg. This is the single source of
// truth for the order-block calculator, kept side-effect-free so it is easy to verify.
import type { Trial, PerGramTier } from "./products";

export const MIN_MG = 100;
export const MAX_MG = 30000;

export interface TieredPricing {
  trials: Trial[]; // trials carry exact `mg`
  tiers: PerGramTier[]; // tiers carry `minMg`/`maxMg`
}

export type TieredPriceResult =
  | {
      status: "ok";
      mg: number;
      grams: number;
      totalCents: number;
      perGramCents: number;
      savingsCents: number; // 0 unless > 0 (trials show none, matching live)
      savingsPct: number;
      sizeLabel: string;
    }
  | { status: "below-min" }
  | { status: "gap" } // between tier ranges — live returns invalid
  | { status: "bulk" }; // > 30g — live routes to contact

// mg → display label, matching the live formatQuantity ("100mg", "3g", "3.5g").
export function formatQuantity(mg: number): string {
  return mg >= 1000 ? `${mg / 1000}g` : `${mg}mg`;
}

// Savings baseline = the 0%-discount tier's per-gram (the 1g "standard"), matching the
// live BASE_PRICE_PER_G.
function baselinePerGram(tiers: PerGramTier[]): number {
  return tiers.find((t) => t.discountPct === 0)?.perGramCents ?? tiers[0]?.perGramCents ?? 0;
}

export function computeTieredPrice(mg: number, pricing: TieredPricing): TieredPriceResult {
  if (!Number.isFinite(mg) || mg < MIN_MG) return { status: "below-min" };
  if (mg > MAX_MG) return { status: "bulk" };

  const grams = mg / 1000;
  const baseline = baselinePerGram(pricing.tiers);
  const baseTotal = Math.round(grams * baseline);

  // Exact-match trial (fixed price) — e.g. 100mg $60, 500mg $130.
  const trial = pricing.trials.find((t) => t.mg === mg);
  if (trial) {
    return finish(mg, grams, trial.priceCents, Math.round(trial.priceCents / grams), baseTotal);
  }

  // Range-match per-gram tier — faithful findTier: mg within [minMg, maxMg].
  const tier = pricing.tiers.find(
    (t) => t.minMg != null && t.maxMg != null && mg >= t.minMg && mg <= t.maxMg,
  );
  if (tier) {
    return finish(mg, grams, Math.round(grams * tier.perGramCents), tier.perGramCents, baseTotal);
  }

  // Between ranges (e.g. 1.5g, 4.5g) — live returns null → invalid.
  return { status: "gap" };
}

function finish(
  mg: number,
  grams: number,
  totalCents: number,
  perGramCents: number,
  baseTotal: number,
): TieredPriceResult {
  const rawSavings = baseTotal - totalCents;
  const savingsCents = rawSavings > 0 ? rawSavings : 0;
  const savingsPct = savingsCents > 0 && baseTotal > 0 ? Math.round((savingsCents / baseTotal) * 100) : 0;
  return {
    status: "ok",
    mg,
    grams,
    totalCents,
    perGramCents,
    savingsCents,
    savingsPct,
    sizeLabel: formatQuantity(mg),
  };
}
