// Typed, PORTED product data for the 6-product catalog. Copy is ported verbatim from
// the legacy isrib.shop pages (subtitle / lead description / trust bullets / specs) — do
// NOT regenerate. Prices are integer cents. See docs/wiki/architecture/data-model.md.
//
// Pricing is a discriminated union on `kind` (overview.md): "fixed" (discrete
// format/size SKUs) vs "per-gram-tiered" (ISRIB Original — trials + per-gram tiers, NOT
// flattened to fixed). Two products additionally carry the *other* shape's data as
// optional secondary fields, per Anton's in-session ruling (2026-08-31): A15 also
// publishes bulk per-gram tiers; Original also sells capsule SKUs. `format`
// (powder|capsules) is always explicit — no implicit mg→g conversion (the legacy bug).

export type FormatKind = "powder" | "capsules";

export interface FixedFormat {
  format: FormatKind;
  sku: string;
  sizeLabel: string;
  priceCents: number;
}

export interface Trial {
  sizeLabel: string;
  priceCents: number;
}

export interface PerGramTier {
  rangeLabel: string;
  perGramCents: number;
  discountPct: number;
}

export interface PricingFixed {
  kind: "fixed";
  formats: FixedFormat[];
  tiers?: PerGramTier[]; // A15 bulk per-gram tiers (Anton 2026-08-31)
}

export interface PricingPerGramTiered {
  kind: "per-gram-tiered";
  trials: Trial[];
  tiers: PerGramTier[];
  formats?: FixedFormat[]; // Original capsule SKUs (Anton 2026-08-31)
}

export type Pricing = PricingFixed | PricingPerGramTiered;

export interface SpecRow {
  label: string;
  value: string;
}

export interface Spectrum {
  label: string;
  hint: string;
  src: string;
  alt: string;
}

export interface DownloadItem {
  href: string;
  filename: string;
  label: string;
}

export interface ProductAssets {
  formulaSvg?: string;
  spectra?: Spectrum[];
  downloads?: DownloadItem[];
}

export interface Product {
  slug: string; // canonical (redirect target)
  name: string;
  categorySubtitle: string;
  description: string;
  trustBullets: string[];
  specs: SpecRow[];
  pricing: Pricing;
  assets?: ProductAssets;
}

// Identical across all six legacy pages — ported verbatim.
const TRUST_BULLETS: string[] = [
  "COA available per batch",
  "Worldwide shipping",
  "Secure packaging",
  "Support via Email/Telegram/Signal",
  "Payments arranged individually",
];

const PRODUCTS: Product[] = [
  {
    slug: "isrib-a15",
    name: "ISRIB A15",
    categorySubtitle: "Ultra Potent Analog",
    description:
      "Ultra‑potent ISRIB analogue with enhanced bioavailability. Targets eIF2B.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₂₂H₂₂Cl₄N₂O₄" },
      { label: "MW", value: "520.24 g/mol" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White/off‑white powder" },
      { label: "Solubility", value: "DMSO" },
      { label: "Storage", value: "2-8°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "isrib-a15-100mg", sizeLabel: "100mg", priceCents: 6000 },
        { format: "powder", sku: "isrib-a15-500mg", sizeLabel: "500mg", priceCents: 13000 },
        { format: "powder", sku: "isrib-a15-1g", sizeLabel: "1g", priceCents: 20000 },
        { format: "capsules", sku: "isrib-a15-caps-25", sizeLabel: "25 × 20mg", priceCents: 17000 },
        { format: "capsules", sku: "isrib-a15-caps-50", sizeLabel: "50 × 20mg", priceCents: 24000 },
      ],
      tiers: [
        { rangeLabel: "2–4g", perGramCents: 18000, discountPct: 10 },
        { rangeLabel: "5–9g", perGramCents: 17000, discountPct: 15 },
        { rangeLabel: "10–30g", perGramCents: 16000, discountPct: 20 },
      ],
    },
    assets: {
      formulaSvg: "/images/isrib-a15-formula.svg",
      spectra: [
        {
          label: "¹H NMR",
          hint: "Click to zoom",
          src: "/images/isrib-a15-nmr-h1.png",
          alt: "¹H NMR spectrum of ISRIB A15",
        },
        {
          label: "¹³C NMR",
          hint: "Click to zoom",
          src: "/images/isrib-a15-nmr-c13.png",
          alt: "¹³C NMR spectrum of ISRIB A15",
        },
      ],
      downloads: [
        { href: "/files/isrib-a15-1h-fid.zip", filename: "isrib-a15-1h-fid.zip", label: "↓ ¹H FID" },
        { href: "/files/isrib-a15-13c-fid.zip", filename: "isrib-a15-13c-fid.zip", label: "↓ ¹³C FID" },
      ],
    },
  },
  {
    slug: "isrib-original",
    name: "ISRIB",
    categorySubtitle: "Original Molecule",
    description:
      "The foundational ISRIB molecule discovered at UCSF. Selectively targets the ISR pathway via eIF2B modulation.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₂₂H₂₄Cl₂N₂O₄" },
      { label: "MW", value: "451.3 g/mol" },
      { label: "CAS", value: "1597403-47-8" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White to off-white powder" },
      { label: "Solubility", value: "DMSO" },
      { label: "Storage", value: "-20°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "per-gram-tiered",
      trials: [
        { sizeLabel: "100mg", priceCents: 2700 },
        { sizeLabel: "500mg", priceCents: 6000 },
      ],
      tiers: [
        { rangeLabel: "1g", perGramCents: 10000, discountPct: 0 },
        { rangeLabel: "2–4g", perGramCents: 9000, discountPct: 10 },
        { rangeLabel: "5–9g", perGramCents: 8500, discountPct: 15 },
        { rangeLabel: "10–30g", perGramCents: 8000, discountPct: 20 },
      ],
      formats: [
        { format: "capsules", sku: "isrib-original-caps-25", sizeLabel: "25 × 20mg", priceCents: 10000 },
        { format: "capsules", sku: "isrib-original-caps-50", sizeLabel: "50 × 20mg", priceCents: 14000 },
      ],
    },
  },
  {
    slug: "zzl-7",
    name: "ZZL-7",
    categorySubtitle: "Fast-Onset Research Compound",
    description:
      "Rapid-acting research compound that disrupts the SERT–nNOS interaction.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₁H₂₀N₂O₄" },
      { label: "MW", value: "244.29 g/mol" },
      { label: "CAS", value: "99141‑91‑0" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White crystalline powder" },
      { label: "Solubility", value: "DMSO, Water" },
      { label: "Storage", value: "-20°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "zzl-7-100mg", sizeLabel: "100mg", priceCents: 5000 },
      ],
    },
  },
  {
    slug: "mpep-oxalate",
    name: "MPEP Oxalate",
    categorySubtitle: "mGluR5 Negative Allosteric Modulator",
    description:
      "Selective negative allosteric modulator of mGluR5. High specificity and potency.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₁H₁₀N₂ · C₂H₂O₄" },
      { label: "MW", value: "283.25 g/mol" },
      { label: "CAS", value: "96206-92-7" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "Yellow-white powder" },
      { label: "Solubility", value: "DMSO, Ethanol" },
      { label: "Storage", value: "2-8°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "mpep-oxalate-100mg", sizeLabel: "100mg", priceCents: 6000 },
        { format: "powder", sku: "mpep-oxalate-500mg", sizeLabel: "500mg", priceCents: 13000 },
        { format: "powder", sku: "mpep-oxalate-1g", sizeLabel: "1g", priceCents: 20000 },
      ],
    },
  },
  {
    slug: "bromantane",
    name: "Bromantane",
    categorySubtitle: "Dopaminergic Actoprotector",
    description:
      "Dopaminergic-noradrenergic adaptogen with actoprotective and immunomodulatory properties.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₆H₂₀BrN" },
      { label: "MW", value: "308.24 g/mol" },
      { label: "CAS", value: "87913-26-6" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "Off-white crystalline powder" },
      { label: "Solubility", value: "DMSO, Ethanol" },
      { label: "Storage", value: "2-8°C (or -20°C long-term)" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "bromantane-1g", sizeLabel: "1g", priceCents: 4000 },
        { format: "powder", sku: "bromantane-2g", sizeLabel: "2g", priceCents: 7000 },
        { format: "powder", sku: "bromantane-5g", sizeLabel: "5g", priceCents: 16000 },
      ],
    },
  },
  {
    slug: "n-acetyl-bromantane",
    name: "N-Acetyl-Bromantane",
    categorySubtitle: "Acylated Dopaminergic Actoprotector",
    description:
      "Acylated bromantane analog with enhanced safety profile and preserved dopaminergic actoprotective activity.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₈H₂₂BrNO" },
      { label: "MW", value: "364.28 g/mol" },
      { label: "CAS", value: "Not assigned (research compound)" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White crystalline powder" },
      { label: "Solubility", value: "DMSO, Ethanol" },
      { label: "Storage", value: "2-8°C (or -20°C long-term)" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "n-acetyl-bromantane-500mg", sizeLabel: "500mg", priceCents: 4000 },
        { format: "powder", sku: "n-acetyl-bromantane-1g", sizeLabel: "1g", priceCents: 7000 },
        { format: "powder", sku: "n-acetyl-bromantane-2g", sizeLabel: "2g", priceCents: 13000 },
      ],
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}

// Integer cents → display string. All catalog prices are whole dollars.
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toString() : dollars.toFixed(2)}`;
}
