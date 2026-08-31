# Architecture — Data Model

> **Stub — grows with `src/lib/db/schema.ts` (the ground truth for types).** This
> page explains intent. Based on the nootropics `orders` shape (ADR 0003).

## `orders` (denormalized single table for MVP)

`id` (nanoid), `created_at`, `status` (enum), `name`, `email`, `phone`, `address`,
`city`, `postal_code`, `state_region` (nullable), `country`, `product_slug`,
`quantity`, `format` (powder|capsules), `base_price` (cents), `payment_method`
(crypto|manual), `crypto_discount_pct` (nullable), `total_price` (cents),
`promo_code` (nullable), `note` (nullable), `nowpayments_invoice_id` (nullable),
`nowpayments_payment_url` (nullable), `order_number` (unique), UTM fields,
`confirmation_email_sent_at`, `user_id` (nullable — guest checkout stays supported).

Status enum: `pending_payment_instructions -> awaiting_payment -> paid ->
fulfilled`, or any -> `cancelled`.

## ISRIB-specific note vs nootropics

nootropics was single-product; ISRIB has 6. `product_slug` + `format` on the row is
enough for MVP (no `products`/`order_items` tables yet). Capsules vs powder affects
mg calculation — carry `format` explicitly (lesson from legacy `normalizeItem`).

## Product catalog data (`src/lib/copy/products.ts`)

Presentational product data (NOT a DB table) — typed, ported verbatim from the legacy
pages, rendered by `(shop)/products/[slug]`. Money is **integer cents**; `format`
(powder|capsules) is always explicit (no implicit mg→g conversion — the legacy bug).

Pricing is a **discriminated union on `pricing.kind`** (overview.md): `"fixed"` vs
`"per-gram-tiered"`. The tiered shape is never flattened into fixed formats.

```ts
type FormatKind = "powder" | "capsules";
interface FixedFormat { format: FormatKind; sku: string; sizeLabel: string; priceCents: number; }
interface Trial       { sizeLabel: string; priceCents: number; }
interface PerGramTier { rangeLabel: string; perGramCents: number; discountPct: number; }

interface PricingFixed         { kind: "fixed"; formats: FixedFormat[]; tiers?: PerGramTier[]; }
interface PricingPerGramTiered { kind: "per-gram-tiered"; trials: Trial[]; tiers: PerGramTier[]; formats?: FixedFormat[]; }
type Pricing = PricingFixed | PricingPerGramTiered;

interface Product {
  slug; name; categorySubtitle; description; trustBullets: string[];
  specs: { label; value }[]; pricing: Pricing;
  assets?: { formulaSvg?; spectra?: Spectrum[]; downloads?: DownloadItem[] };
}
// helpers: getProduct(slug), getAllProductSlugs(), formatCents(cents)
```

Pricing assignment (integer cents; verified to the cent against the authoritative table
and the legacy pages):

| Product | kind | pricing |
| --- | --- | --- |
| ISRIB A15 | fixed | powder 100mg 6000 / 500mg 13000 / 1g 20000; caps 25×20mg 17000 / 50×20mg 24000; **tiers** 2–4g 18000/g −10%, 5–9g 17000/g −15%, 10–30g 16000/g −20% |
| ISRIB Original | per-gram-tiered | trials 100mg 2700 / 500mg 6000; tiers 1g 10000/g, 2–4g 9000/g −10%, 5–9g 8500/g −15%, 10–30g 8000/g −20%; **caps** 25×20mg 10000 / 50×20mg 14000 |
| MPEP Oxalate | fixed | powder 100mg 6000 / 500mg 13000 / 1g 20000 |
| N-Acetyl-Bromantane | fixed | powder 500mg 4000 / 1g 7000 / 2g 13000 |
| Bromantane | fixed | powder 1g 4000 / 2g 7000 / 5g 16000 |
| ZZL-7 | fixed | powder 100mg 5000 |

**⚠ Deviation from overview.md (pending architect ratification — logged `escalate`
2026-08-31):** overview.md scopes A15 to `fixed` and Original to `per-gram-tiered`-only.
Anton ruled in-session (2026-08-31) that the real catalog also sells A15 bulk per-gram
tiers and Original capsules. Modeled as **optional secondary fields** on each union arm
(`tiers?` on fixed, `formats?` on tiered) — still a discriminated union, nothing
flattened. overview.md should be reconciled (or an ADR issued) by the architect. Not a
positioning change.

## Deferred (Track B)

`users`, `verification_tokens` (auth); `referral_codes`, `referrals`,
`discount_ledger` (referrals); tracking columns (`tracking_number`,
`tracking_carrier`, `shipped_at`).

## Related
- [`manual-payment-flow.md`](./manual-payment-flow.md) · [`../decisions/0003-order-storage-neon.md`](../decisions/0003-order-storage-neon.md)
