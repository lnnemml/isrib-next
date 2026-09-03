// Catalog size presets for the /products listing cards. A faithful port of the live
// products.html per-card <select> options, derived from the SAME typed data + calculator
// the product detail pages use — so prices never drift.
//
//  - fixed products (MPEP, N-Acetyl, Bromantane, ZZL-7): map pricing.formats (powder) →
//    options; the live catalog default (popular) is 1g for MPEP/N-Acetyl/Bromantane and
//    100mg for ZZL-7 (its only size).
//  - per-gram-tiered products (A15, ISRIB): generate the live 6-preset ladder
//    (100mg, 500mg, 1g, 2g, 5g, 10g) via computeTieredPrice — 2g is the popular default.
//
// Prices are integer cents, verified to the cent against products.ts / the live page.
import type { Product } from "./products";
import { computeTieredPrice } from "./pricing";

export interface CatalogOption {
  sizeLabel: string;
  mg: number;
  priceCents: number;
  popular?: boolean;
  // Discount vs the 1g "standard" baseline, carried from computeTieredPrice for the
  // per-gram tiers (A15/ISRIB 2/5/10g). 0/undefined for trials, the 1g standard tier,
  // and all fixed products — which the card treats as "no savings line".
  savingsCents?: number;
  savingsPct?: number;
}

// The live catalog per-gram ladder: trials (100/500mg) + 1/2/5/10g. 2g is the default.
const TIERED_PRESET_MG = [100, 500, 1000, 2000, 5000, 10000];
const TIERED_POPULAR_MG = 2000;

// Live catalog default (Most Popular) size per fixed product, keyed by slug. Matches the
// `selected` <option> in products.html: MPEP → 1g, N-Acetyl → 1g, Bromantane → 1g,
// ZZL-7 → 100mg (its only option).
const FIXED_POPULAR_SIZE: Record<string, string> = {
  "mpep-oxalate": "1g",
  "n-acetyl-bromantane": "1g",
  bromantane: "1g",
  "zzl-7": "100mg",
};

// Parse an mg quantity from a powder sizeLabel ("100mg" / "500mg" / "1g" / "2g" / "5g").
function mgFromSizeLabel(sizeLabel: string): number {
  const g = /^([\d.]+)\s*g$/i.exec(sizeLabel);
  if (g) return Math.round(parseFloat(g[1]) * 1000);
  const mg = /^([\d.]+)\s*mg$/i.exec(sizeLabel);
  if (mg) return Math.round(parseFloat(mg[1]));
  return 0;
}

export function getCatalogOptions(product: Product): CatalogOption[] {
  const { pricing } = product;

  if (pricing.kind === "per-gram-tiered") {
    // Generate the live ladder from the calculator, so each price is derived (not typed
    // twice). Trials return their fixed price; 1/2/5/10g return grams × tier per-gram.
    const options: CatalogOption[] = [];
    for (const mg of TIERED_PRESET_MG) {
      const result = computeTieredPrice(mg, { trials: pricing.trials, tiers: pricing.tiers });
      if (result.status !== "ok") continue; // presets are all valid; skip defensively
      options.push({
        sizeLabel: result.sizeLabel,
        mg,
        priceCents: result.totalCents,
        popular: mg === TIERED_POPULAR_MG,
        savingsCents: result.savingsCents,
        savingsPct: result.savingsPct,
      });
    }
    return options;
  }

  // fixed — powder formats only (capsules are sold on the detail page).
  const popularSize = FIXED_POPULAR_SIZE[product.slug];
  return pricing.formats
    .filter((f) => f.format === "powder")
    .map((f) => ({
      sizeLabel: f.sizeLabel,
      mg: mgFromSizeLabel(f.sizeLabel),
      priceCents: f.priceCents,
      popular: popularSize ? f.sizeLabel === popularSize : false,
    }));
}

// True when the product also sells capsules (A15, ISRIB Original) — drives the subtle
// "Also available in capsules" note on the card.
export function hasCapsules(product: Product): boolean {
  const { pricing } = product;
  const formats = pricing.kind === "fixed" ? pricing.formats : pricing.formats;
  return (formats ?? []).some((f) => f.format === "capsules");
}
