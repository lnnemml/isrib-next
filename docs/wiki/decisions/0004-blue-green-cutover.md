# ADR 0004 — Blue-green cutover, live site untouched

**Status:** accepted · 2026-08-27

## Decision

Build the new site in a separate repo + Vercel project. The live `isrib.shop` (and
its `api/checkout.js`) is not touched until cutover. Cutover = reassign the
`isrib.shop` domain on Vercel to the new project, only after gates G2 (checkout) +
G3 (analytics) + G4 (QA) are green. Keep the old deploy live >=7 days as rollback.

## Context

The site is live and taking orders. Any in-place edit risks broken checkout = lost
revenue. Vercel domain reassignment within one account is near-instant and instantly
reversible, so blue-green is effectively free.

## Consequences

- Zero-downtime, instantly reversible cutover.
- New repo lives in a separate folder (`isrib-next/`); the old folder (`isrib/`) is a
  read-only donor for content/env references, never imported.
- Env vars are copied into the new Vercel project as a deliberate cutover step, not
  `cp .env`.
- NowPayments webhook URL must be repointed (or route path matched) at cutover.

## Revisit if

n/a — this is a one-time migration constraint.
