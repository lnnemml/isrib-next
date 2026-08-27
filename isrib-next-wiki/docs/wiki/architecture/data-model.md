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

## Deferred (Track B)

`users`, `verification_tokens` (auth); `referral_codes`, `referrals`,
`discount_ledger` (referrals); tracking columns (`tracking_number`,
`tracking_carrier`, `shipped_at`).

## Related
- [`manual-payment-flow.md`](./manual-payment-flow.md) · [`../decisions/0003-order-storage-neon.md`](../decisions/0003-order-storage-neon.md)
