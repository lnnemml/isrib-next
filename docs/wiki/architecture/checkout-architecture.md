# Architecture — Checkout Backend (G2)

> The mechanism spec for Day-2 checkout, the highest-risk gate. Ratified in
> [ADR 0009](../decisions/0009-checkout-backend-neon-qstash.md) (extends
> [ADR 0003](../decisions/0003-order-storage-neon.md) order-storage-Neon +
> [ADR 0008](../decisions/0008-full-migration-and-cart.md) multi-line). Derived from a
> 2026-09-04 audit of `NORA` (platform reference) and `isrib-a15-lander` (QStash pattern).

## 1. Stack (what runs where)

| Concern | Service | Notes |
|---|---|---|
| **All durable state** | **Neon Postgres + Drizzle** | orders, order_items, payment status, invoice ids, email timestamps |
| DB driver | `drizzle-orm/neon-serverless` (`Pool`, WebSocket) | **transactions required** for atomic multi-line insert — neon-http can't |
| Payment (crypto) | **NowPayments** | invoice on submit + HMAC-SHA512 IPN webhook |
| Email | **Resend** | immediate (inline) + payment-confirmed (webhook) |
| Delayed nurture email | **Upstash QStash** | the ONLY async piece — 2 delayed callbacks (T+2h, T+24h) |
| Analytics conversion | **Meta CAPI** (`trackServerEvent`) | `order_submitted` primary; Purchase on paid |
| Cache / KV / queue | **none** | no Upstash Redis, no Vercel Cron (Hobby cron inadequate) |

Everything except QStash lives in Neon or a stateless HTTP call. QStash holds **no
durable state** — its payload is advisory; the consumer re-reads Neon.

## 2. Schema (drives `src/lib/db/schema.ts` — that file is ground truth)

Mirrors NORA's `orders` shape, extended to **two tables** per ADR 0008. All money is
**integer cents**; all PKs are `text` nanoid. See [`data-model.md`](./data-model.md) for
the column-level list. G2-relevant additions beyond the data-model stub:

- `orders.idempotency_key` — `text unique` (client-generated per checkout attempt; dedupes
  double-submit).
- `orders.abandoned_email1_sent_at` / `abandoned_email2_sent_at` — `timestamptz nullable`
  (the nurture state machine; stamped by the QStash consumer on successful send).
- `orders.confirmation_email_sent_at` — actually written (unlike NORA).
- `order_items` — one row per cart line (`order_id` FK, `product_slug`, `format`,
  `quantity`, `size_label`, `line_price_cents`). `format` explicit — no mg→g conversion.

Migrations: `drizzle-kit push` for dev; `DATABASE_URL_NON_POOLING` (or Neon's direct
endpoint) for schema ops, pooled endpoint for runtime.

## 3. Order-submit flow (server action `submitOrder`)

1. **Idempotency:** if an order with this `idempotency_key` exists → return it (no new row).
2. Validate required fields + `payment_method` enum server-side. Never trust client prices.
3. **Recompute** every line price + subtotal + total server-side from `products.ts` /
   `pricing.ts` (the same helpers the UI uses) — the client cart is untrusted input.
4. Apply crypto discount (10%) if `payment_method === "crypto"`.
5. **Atomic write (transaction):** `insert orders` + `insert order_items[]` in one
   `db.transaction()`. `order_number` = `NR-`/`ISR-`-style 8-char nanoid with a `unique`
   constraint as the collision backstop.
6. `trackServerEvent("order_submitted" → Meta InitiateCheckout)` — primary conversion
   (ADR 0005). Non-fatal.
7. **Immediate emails (inline, `Promise.allSettled`, non-fatal):** customer confirmation +
   ops alert. Stamp `confirmation_email_sent_at` on success.
8. **Enqueue nurture (QStash, wrapped/non-fatal):** publish two delayed callbacks (§5).
9. **Crypto:** `createInvoice()` → `update orders` with invoice id/url → `redirect(invoice_url)`.
   **Manual:** `redirect(/checkout/success)`.

**Failure ordering:** the transaction makes order+items atomic; everything after (emails,
QStash, invoice) is best-effort and must not roll back a committed order. Invoice-creation
failure falls through to the success page (order already saved; ops follows up).

## 4. Payment webhook (`/api/webhooks/nowpayments`)

- Read the **raw** body; recompute **HMAC-SHA512** over the recursively key-sorted JSON
  with `NOWPAYMENTS_IPN_SECRET`; compare to the `x-nowpayments-sig` header using
  **`crypto.timingSafeEqual`** (hardening vs. the references' `!==`). 401 on mismatch,
  500 if the secret is unset.
- Act only on `payment_status === "finished"`. Look up by `order_number`.
- **Idempotent:** no-op if already `paid`.
- On first paid: `update status → paid`, then `Promise.allSettled([payment-confirmed email,
  ops alert, trackServerEvent Purchase])`. **Cancel/clear the nurture emails is unnecessary
  under QStash** — the consumer's live `payment_status` re-check (§5) suppresses them.
- **Always return 200** (even order-not-found) so NowPayments stops retrying. NowPayments'
  own IPN retry is the system's only automatic retry.

## 5. Nurture emails (Upstash QStash — the one async piece)

**Producer (at submit, step 8):** `Client.publishJSON` two jobs to
`{SITE_URL}/api/abandoned-checkout` with `delay: 7200` (2h) and `delay: 86400` (24h),
payload = `{ orderId, orderNumber, email, firstName, ... }`. Wrapped in try/catch —
a QStash outage logs but never fails the order.

**Consumer (`/api/abandoned-checkout`, POST):**
1. **Verify QStash signature** — `Receiver` from `QSTASH_CURRENT_SIGNING_KEY` /
   `QSTASH_NEXT_SIGNING_KEY` over the `upstash-signature` header. 401 if invalid. This is
   the **only** guard on the endpoint.
2. Re-read the order from Neon. **Guards (in Postgres, not QStash):** skip if not found,
   if `status === "paid"`, or if that email number's timestamp is already set.
3. Render + send via Resend; stamp `abandoned_email{1,2}_sent_at = now()`.

Guard lives in Neon, so QStash retries / duplicate deliveries are safe. Live crypto rates
can be fetched at send time (send-time guard was the reason to pick QStash over Resend
scheduling — see ADR 0009).

**Fallback (recorded, not built):** Resend native scheduling (`scheduledAt`, ≤30 days,
cancel via `POST /emails/{id}/cancel`) replaces QStash with zero new deps — guard becomes
cancel-on-payment (in both the webhook AND the admin-confirm action). Swap needs no schema
change.

## 6. Env surface for G2

```
POSTGRES_URL                     # Neon pooled (runtime; mirrors NORA)
POSTGRES_URL_NON_POOLING         # Neon direct (migrations / drizzle-kit push)
RESEND_API_KEY  FROM_EMAIL  ADMIN_EMAIL
NOWPAYMENTS_API_KEY  NOWPAYMENTS_IPN_SECRET
QSTASH_TOKEN  QSTASH_CURRENT_SIGNING_KEY  QSTASH_NEXT_SIGNING_KEY
# Meta CAPI (already wired, ADR 0005): META_CAPI_ACCESS_TOKEN, GA4_API_SECRET, public IDs
# NO Upstash Redis / KV vars.
```

## 7. G2 gate — what "green" means (no DNS move until all true)

A real **multi-item** test order (≥2 line items across ≥2 products):
1. Lands in Neon as one `orders` row + N `order_items` rows (atomic).
2. Fires the customer confirmation + ops alert (Resend); `confirmation_email_sent_at` set.
3. Crypto path: NowPayments invoice generates; webhook (HMAC-verified) flips `status → paid`
   and fires the payment-confirmed email; second webhook is a no-op (idempotent).
4. Double-submit with the same idempotency key does **not** create a duplicate order.
5. QStash nurture: a paid order does **not** receive the abandoned-checkout emails (live
   guard); an unpaid one does at T+2h/T+24h.
6. `order_submitted` fires as the primary Meta conversion (ADR 0005).

Verified at **runtime** (real test order + DB inspection + Events Manager), not by build or
code review — per the prober role and ADR 0003 (G2 is the highest-risk step).

## Related

- [ADR 0009](../decisions/0009-checkout-backend-neon-qstash.md) · [ADR 0003](../decisions/0003-order-storage-neon.md) · [ADR 0008](../decisions/0008-full-migration-and-cart.md)
- [`data-model.md`](./data-model.md) · [`manual-payment-flow.md`](./manual-payment-flow.md) · [`analytics.md`](./analytics.md)
