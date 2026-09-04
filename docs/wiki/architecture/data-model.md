# Architecture — Data Model

> **Stub — grows with `src/lib/db/schema.ts` (the ground truth for types).** This
> page explains intent. Based on the nootropics `orders` shape (ADR 0003), extended to
> **multi-line orders** per [ADR 0008](../decisions/0008-full-migration-and-cart.md).

## `orders` + `order_items` (multi-line — ADR 0008)

The live site has a real multi-item cart, so an order carries **line items**. **Two
real tables** (the earlier "or a JSON column" hedge is closed — decided in
[ADR 0009](../decisions/0009-checkout-backend-neon-qstash.md)).

**DB driver ([ADR 0009](../decisions/0009-checkout-backend-neon-qstash.md)):** use
`drizzle-orm/neon-serverless` (WebSocket `Pool`), **not** `neon-http` — the order+items
insert must be **atomic** (`db.transaction()`), which only the serverless driver supports.
(NORA uses neon-http and has no transactions; we diverge for order integrity.)

**`orders`** — customer + payment + totals, one row per order:
`id` (nanoid), `created_at`, `status` (enum), `name`, `email`, `country`, `payment_method`
(crypto|manual), `crypto_discount_pct` (nullable), `subtotal_price` (cents),
`total_price` (cents), `promo_code` (nullable), `note` (nullable),
`nowpayments_invoice_id` (nullable), `nowpayments_payment_url` (nullable),
`order_number` (unique), `idempotency_key` (unique — dedupes double-submit, ADR 0009),
UTM fields, `confirmation_email_sent_at` (**actually written**, ADR 0009),
`abandoned_email1_sent_at` / `abandoned_email2_sent_at` (nullable — QStash nurture state
machine, ADR 0009), `user_id` (nullable — guest checkout stays supported).
**Shipping — collected post-payment ([ADR 0010](../decisions/0010-frictionless-dr-checkout.md)),
so all NULLABLE:** `phone`, `address`, `city`, `postal_code`, `state_region`. Plus
`shipping_token` (unique, unguessable — the `/shipping/<token>` link) + `shipping_details_at`
(nullable timestamp, stamped when the post-payment form is submitted). **Checkout collects
only `name`/`email`/`country`** — the rest of the shipping fields fill in later.

**`order_items`** — one row per cart line: `id`, `order_id` (FK), `product_slug`,
`format` (powder|capsules), `quantity`, `size_label` (e.g. "2g", "50 × 20mg"),
`line_price` (cents). Capsules vs powder affects mg math — carry `format` explicitly
(lesson from legacy `normalizeItem`). No implicit mg→g conversion.

Status enum (per-order, unchanged): `pending_payment_instructions -> awaiting_payment
-> paid -> fulfilled`, or any -> `cancelled`.

**G2 test order is multi-item** — the end-to-end order that must pass before any
cutover contains ≥2 line items across ≥2 products.

## Cart (client state — ADR 0008)

A client-side cart holds line items { product_slug, format, quantity, sizeLabel,
linePriceCents } with a live count for the header badge; checkout reads the cart to
build the `order` + `order_items`. Persisted across reloads.

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
| ISRIB A15 | per-gram-tiered ¹ | trials 100mg 6000 / 500mg 13000; tiers 1g 20000/g, 2–4g 18000/g −10%, 5–9g 17000/g −15%, 10–30g 16000/g −20%; **caps** 25×20mg 17000 / 50×20mg 24000 |
| ISRIB Original | per-gram-tiered | trials 100mg 2700 / 500mg 6000; tiers 1g 10000/g, 2–4g 9000/g −10%, 5–9g 8500/g −15%, 10–30g 8000/g −20%; **caps** 25×20mg 10000 / 50×20mg 14000 |
| MPEP Oxalate | fixed | powder 100mg 6000 / 500mg 13000 / 1g 20000 |
| N-Acetyl-Bromantane | fixed | powder 500mg 4000 / 1g 7000 / 2g 13000 |
| Bromantane | fixed | powder 1g 4000 / 2g 7000 / 5g 16000 |
| ZZL-7 | fixed | powder 100mg 5000 |

**✓ Ratified — [ADR 0007](../decisions/0007-pricing-model-shape.md):** the union +
optional-secondary-fields shape (`tiers?` on fixed, `formats?` on tiered) is accepted;
overview.md reconciled. Nothing flattened.

**¹ A15 correction (ADR 0008 / the live A15 page):** the live A15 page is a **per-gram
calculator** (trials 100mg/500mg + tiers 1g→30g with savings + a custom-quantity
input), structurally identical to ISRIB Original — NOT `fixed`. So A15 is reassigned
`kind: "per-gram-tiered"` with capsules as `formats?`. **Applied 2026-08-31 in the A15
faithful port** — `products.ts` A15 is now `per-gram-tiered` (trials 100mg/500mg; tiers
1g→30g; caps as `formats?`), with machine-readable calculator bounds (`Trial.mg`,
`PerGramTier.minMg/maxMg`) driving `src/lib/copy/pricing.ts`. Prices unchanged (verified
to the cent, runtime + verifier); only the `kind` and grouping changed.

## Deferred (Track B)

`users`, `verification_tokens` (auth); `referral_codes`, `referrals`,
`discount_ledger` (referrals); tracking columns (`tracking_number`,
`tracking_carrier`, `shipped_at`).

## Related
- [`checkout-architecture.md`](./checkout-architecture.md) — the G2 mechanism spec (flow,
  webhook, nurture) built on this schema
- [`manual-payment-flow.md`](./manual-payment-flow.md) · [`../decisions/0003-order-storage-neon.md`](../decisions/0003-order-storage-neon.md) · [`../decisions/0009-checkout-backend-neon-qstash.md`](../decisions/0009-checkout-backend-neon-qstash.md)
