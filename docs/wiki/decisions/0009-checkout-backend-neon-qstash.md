# ADR 0009 — Checkout backend: Neon-only core + QStash for nurture only

**Status:** accepted · 2026-09-04 · extends [ADR 0003](./0003-order-storage-neon.md)
(order storage → Neon) and [ADR 0008](./0008-full-migration-and-cart.md) (multi-line orders + cart)

## Decision

The Day-2 checkout backend (gate **G2**) runs entirely on **Neon Postgres + Drizzle**
for all durable state, plus three stateless HTTP services already in the stack
(**Resend**, **NowPayments**, **Meta CAPI**). Concretely:

1. **DB driver = `drizzle-orm/neon-serverless` (WebSocket `Pool`), NOT `neon-http`.**
   The multi-line insert (`orders` + N×`order_items`) must be **atomic**, and only the
   serverless/Pool driver supports interactive `db.transaction()`. (NORA uses neon-http
   and has no transactions — we deliberately diverge for order integrity.)
2. **`orders` + `order_items` as two real tables** (supersedes the "or a JSON column"
   hedge in `data-model.md`). G2's test order is multi-item across ≥2 products.
3. **Payment:** NowPayments invoice on submit (crypto path) + an **idempotent,
   HMAC-SHA512-verified IPN webhook** that flips `status → paid`. The webhook always
   returns 200 (so NowPayments stops retrying) and no-ops if already paid.
4. **Email (Resend):** immediate order-confirmation + ops-alert fired inline at submit
   (`Promise.allSettled`, non-fatal); payment-confirmed fired from the webhook.
5. **Async nurture = Upstash QStash (the ONLY non-Neon async piece).** Two delayed
   abandoned-checkout emails (T+2h, T+24h) are enqueued as QStash delayed HTTP
   callbacks to a signature-verified consumer endpoint that re-reads Neon and guards
   on `payment_status` + per-email sent-timestamps before sending.
6. **No Upstash Redis. No Vercel Cron.**

### Four hardening improvements over the reference codebases (all adopted)

- **Idempotency key on order submit** — a client-generated key + `unique` DB column, so
  a double-submit returns the same order instead of creating a duplicate. (NORA/lander
  have no submit idempotency → double-submit = duplicate order.)
- **Timing-safe webhook signature compare** (`crypto.timingSafeEqual`) — both references
  use a plain `!==`.
- **Actually stamp `confirmation_email_sent_at`** (and the nurture sent-timestamps) —
  NORA defines the column but never writes it.
- **No app-level rate limiting** — the classic Redis use case, but unnecessary at this
  scale (~500 orders / 5 yrs); Vercel platform/WAF is sufficient. Documented as a
  conscious non-need, not an oversight.

## Context

Audit (2026-09-04) of the two reference backends before building G2:

- **NORA** (`/home/laptop/Documents/NORA`) — the platform reference. Entire order
  backend on **Neon alone**; no Redis, no queue, no cron. Only truly-async event (crypto
  settlement) handled by an idempotent HMAC webhook leaning on NowPayments' own retry.
  Uses the **neon-http** driver → no transactions; order-number uniqueness + `status==="paid"`
  guards stand in for atomicity. Single-product `orders` (no `order_items`).
- **isrib-a15-lander** (`/home/laptop/Documents/ISRIB/isrib-a15-lander`) — same Neon +
  NowPayments + Resend spine, but adds **QStash for exactly one job**: the two delayed
  abandoned-checkout emails. **No Upstash Redis anywhere** in either project.

**Anton's constraints:** free Vercel plan → **Vercel Cron is inadequate** (Hobby = once
per day, ±59 min precision; verified against Vercel docs 2026-09-04) — so a "Neon + cron
sweep" replacement for the delayed emails is not viable. He wants the nurture emails in
G2 now.

**The genuine fork was the nurture mechanism** (both work on free Vercel):
- *Resend native scheduling* (`scheduledAt`, up to 30 days, cancel via `POST /emails/{id}/cancel`;
  verified 2026-09-04) — zero new dependencies, guard = cancel-on-payment.
- *QStash* — one dependency, but the consumer re-reads Neon at send time → a stronger
  guard (live `payment_status` check + live crypto rates), and it is the lander's
  proven pattern.

**Anton chose QStash** (2026-09-04) for the stronger send-time guard, accepting the
dependency. Resend scheduling is recorded as the ready fallback if QStash is ever dropped.

## Consequences

- **G2 core is pure Neon** — a green multi-item test order (lands in Neon with its
  `order_items`, 2 emails fire, NowPayments invoice generates, webhook flips to paid,
  status updates) is the cutover gate (ADR 0003/0004). **No DNS move until green.**
- **QStash is an isolated, easily-removable dependency** — one producer call at submit,
  one signature-verified consumer route, three `QSTASH_*` env vars. If it fails, the
  order is unaffected (enqueue is wrapped, non-fatal). Swappable for Resend scheduling
  with no schema change.
- **New external-service surface for G2:** Neon (`DATABASE_URL` + non-pooling for
  migrations), Resend, NowPayments (`NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET`),
  QStash (`QSTASH_TOKEN` + `QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY`),
  Meta CAPI. No Redis/KV.
- **neon-serverless Pool** adds a WebSocket connection per invocation (heavier than
  neon-http) — acceptable for the checkout path; product/content pages stay on their
  existing SSG data path (no DB).

## Revisit if

- We need scheduled/recurring server work beyond the two nurture emails (reconciliation,
  reminder drips) — re-evaluate QStash schedules vs. upgrading the Vercel plan for cron.
- App-level rate limiting becomes necessary (abuse/spam on checkout) — that is the one
  thing that would reintroduce a Redis/KV (e.g. Upstash Redis ratelimit or a Postgres
  counter).
- Order volume outgrows the neon-serverless per-invocation connection model — consider a
  pooler (PgBouncer / Neon pooled endpoint) tuning pass.

## See also

[`../architecture/checkout-architecture.md`](../architecture/checkout-architecture.md)
— the full mechanism spec (schema, order flow, webhook, nurture) that drives G2.
