# ADR 0008 — Full migration (preserve everything, not MVP) + multi-item cart

**Status:** accepted · 2026-08-31 · Anton's ruling · extends [ADR 0003](./0003-order-storage-neon.md)

## Decision

### 1. This is a full migration, not an MVP

The success bar is: **the new site preserves everything the live site does, and
improves UX in places** — never a reduction. Any session that would drop a feature,
page, or behaviour that exists on the live site is wrong by default. The word "MVP"
is retired from the wiki; where a page said "enough for MVP", the real (fuller) shape
is now the target.

**Operational consequence — parity check at every gate.** The architect's gate-time
drift check now explicitly includes: *did we drop anything the old site had?* A full
inventory of the live site (pages, features, interactions) should be enumerated early
(explorer over the local old-site path) so "everything" is a known list, not a guess.

### 2. Real multi-item cart (not single-order direct checkout)

The live site has a genuine multi-item cart (header cart badge with count → cart page
→ checkout); customers routinely buy A15 **together with** other SKUs. The new stack
was inherited cart-less from the single-product `nootropics` donor — that assumption
is overturned. We build:

- **Client cart state** — add / update / remove line items (each: product_slug,
  format, quantity, resolved line price), persisted, exposing a total count.
- **Header cart badge** — live count, click → checkout. (The header/site chrome is
  not built yet; it lands with this.)
- **Cart → checkout** — checkout consumes the cart's line items.
- **Multi-line orders** — one `order` has many `order_items`. Supersedes the
  single-`product_slug`-on-the-row model from ADR 0003 / data-model.md. See the
  reconciled `data-model.md`.

The manual-payment lifecycle is unchanged — a cart still produces one order; the order
just carries line items.

## Context

Surfaced when Anton reviewed the new generic `/products/[slug]` A15 page and found it
hollow versus the live A15 page — which is a full commerce page (per-gram calculator
with tiered savings, format selector, Add to Cart). The generic template (Session 1.2)
was presentational by design and dropped the commerce core; Session 1.3 (long-form
belief landing) was the wrong artifact for the A15 experience. Anton's direction:
preserve the real product pages faithfully, lightly design-lift, keep the cart.

## Consequences

- **1.3 (long-form belief landing) is parked** — not the A15 page. May later serve as
  the paid `isrib-a15.com` landing (Track B), not the core product page.
- **Product pages become faithful ports** of the live pages onto the new design
  system + components — with their commerce core (calculator, format selector,
  Add to Cart) intact — not generic template renders.
- **Sequence reshaped** (roadmap): site chrome + cart foundation → A15 faithful port
  (reference) → other 5 ports → Day-2 orders schema is **multi-line** (orders +
  order_items); G2's end-to-end test order is a multi-item order.
- **data-model.md** reconciled: multi-line order model; A15 `kind` corrected to
  `per-gram-tiered` (its real calculator UX), applied when the A15 page is ported.
- More work than the single-order model; accepted deliberately — it matches the live
  business and the "preserve everything" bar.

## Revisit if

Order data shows multi-SKU orders are genuinely rare AND the cart's carrying cost
hurts conversion or timeline → reconsider a lighter buy-now flow. (Current evidence:
Anton reports multi-SKU orders are common.)

## Related

- [`../architecture/data-model.md`](../architecture/data-model.md) ·
  [`./0003-order-storage-neon.md`](./0003-order-storage-neon.md) ·
  [`../architecture/manual-payment-flow.md`](../architecture/manual-payment-flow.md)
