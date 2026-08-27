# ADR 0005 — Analytics preservation (migrate, don't rebuild)

**Status:** accepted · 2026-08-27

## Decision

Migrate the analytics stack 1:1. Keep the same GA4 (`G-LJEBV5NPCT`), Meta Pixel
(`1228338595957402`), Reddit (`a2_hz77nm0joupm`), and Clarity IDs. Keep the 2-event
model with `order_submitted` as the primary Meta conversion. Route all tracking
through `src/lib/analytics/` (`trackEvent` / `trackServerEvent`); never raw
`fbq()`/`dataLayer.push()`/`clarity()` in components.

## Context

The existing analytics (CAPI + browser dedup, 2-event model, UTM attribution chain)
is already built and drives live Meta campaign optimization. Regenerating IDs or
changing the primary conversion would reset accumulated learning.

## Consequences

- Campaign optimization history is preserved through cutover.
- Single-domain collapse → single GTM container going forward (migrate tags
  incrementally; never full-import).
- Expect a 24–48h GA4 custom-dimension lag post-cutover (not a bug).
- Real ROAS/CAC still computed on confirmed-only orders (Meta counts
  `order_submitted`, not confirmed payment).

## Revisit if

A cleaner event taxonomy is worth a deliberate, measured migration later.
