# ADR 0001 — Fork-not-rebuild (base on nootropics architecture)

**Status:** accepted · 2026-08-27

## Decision

Base the ISRIB Next.js platform on the architecture proven in `lnnemml/nootropics`
rather than designing a new one. Reuse route-group structure, `src/lib` layout,
analytics layer, manual-payment flow, and the Karpathy wiki pattern. Replace product
data, copy, brand, and the 6-product catalog with ISRIB specifics.

## Context

nootropics is a mature single-Next.js-app platform sharing the same DNA (same owner,
same manual-payment/crypto model, same analytics abstraction, same wiki pattern,
research-compound category). Rebuilding from scratch would waste weeks; the template
is directly reusable.

## Consequences

- Large reuse → "a few days" build is realistic on a Max plan.
- ISRIB has 6 products vs nootropics' 1 — the generic `products/[slug]` template +
  `src/lib/copy/products.ts` handle this.
- Content porting (rich legacy product HTML → new templates) is real, parallelizable
  work.

## Revisit if

The two products' requirements diverge enough that shared conventions become a
constraint rather than a help.
