# ADR 0003 — Order storage Redis → Neon Postgres

**Status:** accepted · 2026-08-27

## Decision

Orders move from Redis (`savePendingOrder` in the legacy `api/checkout.js`) to Neon
Postgres via Drizzle as the source of truth. Redis remains cache only.

## Context

The nootropics platform uses Neon+Drizzle for typed, durable orders and server
actions. The legacy Redis checkout is fragile (a `ReferenceError` near line ~280 of
`api/checkout.js` could break checkout entirely) and untyped.

## Consequences

- Typed, durable order pipeline; the fragility class disappears.
- **This is the highest-risk migration step.** The checkout gate (G2) must be
  verified with a real end-to-end test order (lands in Neon, 2 emails fire,
  NowPayments invoice generates, status updates) before any domain reassignment.

## Revisit if

Order volume ever needs a normalized `products`/`order_items` model (currently
denormalized single `orders` table is enough).
