# ADR 0007 — Pricing model: discriminated union + optional secondary fields

**Status:** accepted · 2026-08-31 · ratifies the Session 1.2 `escalate`

## Decision

Product pricing stays a **discriminated union** on `pricing.kind`
(`"fixed"` | `"per-gram-tiered"`), where `kind` denotes the **primary** sales/display
mode and drives the default product-page render. Each variant carries **optional
secondary fields** for real live extras:

- `PricingFixed { kind: "fixed"; formats: FixedFormat[]; tiers?: PerGramTier[] }`
  — A15 uses `formats` + bulk `tiers`.
- `PricingPerGramTiered { kind: "per-gram-tiered"; trials: Trial[]; tiers: PerGramTier[]; formats?: FixedFormat[] }`
  — ISRIB Original uses all three.

Nothing is flattened; the discriminant is preserved.

**Rejected:** (B) a single `fixed+tiers` shape — loses the `kind` discriminant that
drives the default UI. (C) drop the extra SKUs — contra Anton's in-session product
ruling and drops real live revenue SKUs.

## Context

`overview.md`'s authoritative table scoped A15 to `fixed` and ISRIB Original to
`per-gram-tiered` only. The live legacy pages are richer: A15 also sells a **100mg
powder** and **bulk per-gram tiers**; Original also sells **capsule SKUs**. The
orchestrator surfaced this as an `escalate` (options A/B/C, lean A); Anton ruled
in-session (WHAT-level) to keep the full live catalog.

Architect verification of the committed `products.ts`:
- A15 bulk tiers 18000/17000/16000 per-gram = exactly 10/15/20% off the $200/g base —
  internally consistent.
- Original trials + tiers match the live page to the cent.
- The A15 100mg self-conflict (JSON-LD $50 vs visible grid $60) was resolved to **$60**
  — the visible price the customer transacts on wins over JSON-LD metadata.

## Consequences

- The checkout/pricing consumer (Day 2) must handle a product presenting **multiple
  purchase modes**: read `kind` for the primary UI, optionally surface secondary
  (A15 bulk tiers, Original capsules).
- `overview.md` reconciled so it no longer contradicts the live catalog;
  `data-model.md` already records the shape.
- Prices remain authoritative from the live pages / analytics summary — never invented.

## Revisit if

A third pricing shape appears that optional-secondary-fields can't express cleanly →
promote to a richer model then.

## Related

- [`../product/overview.md`](../product/overview.md)
- [`../architecture/data-model.md`](../architecture/data-model.md)
