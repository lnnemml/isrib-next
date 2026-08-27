# ADR 0002 — Domain collapse (two domains → one app)

**Status:** accepted · 2026-08-27

## Decision

Collapse `isrib-a15.com` (landing) + `isrib.shop` (checkout) into one Next.js app.
`isrib.shop` stays the canonical storefront domain (5 years, 500+ buyers, organic
SEO weight). `isrib-a15.com` redirects to `/go` (DR landing, Track B) or 301s to
`isrib.shop`. `isrib-research.com` stays separate for now; migrates into `/journal`
with per-article 301s in Track B.

## Context

The cross-domain switch (isrib-a15.com → isrib.shop) was a validated conversion
killer — cold paid traffic showed binary complete-or-abandon behavior at the
domain/style switch. A single app makes checkout self-contained, resolving this
structurally.

## Consequences

- Resolves the cross-domain trust break "for free."
- Cutover touches domain routing on Vercel (near-instant, reversible).
- SEO of `isrib-research.com` must be protected with 301s when it migrates — do not
  rush that into Track A.

## Revisit if

A separate high-volume funnel needs its own domain/deploy.
