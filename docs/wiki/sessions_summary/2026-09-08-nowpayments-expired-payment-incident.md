# Session summary — 2026-09-08 | NowPayments "expired payment" incident (OPEN, resume tomorrow)

**Roles run:** LEAD (recon + live DB read + NowPayments API probe + dashboard analysis) → 1× explorer (read-only: IPN handler + order storage map). No code changed.

> **Follow-up 2026-09-09 (fix landed):** the rate-lock leg of this incident is now fixed
> in code — `createInvoice()` no longer sends `is_fixed_rate: true`. See
> **[Fix — 2026-09-09](#fix--2026-09-09-floating-rate-invoices)** at the bottom.

## Status: OPEN — waiting on customer

Anton has already emailed the customer requesting the transaction ID. **Resolution deferred to tomorrow.** Nothing was marked paid, nothing shipped, no code changed.

## The incident

Customer **Michaelmmonahan@mail.com** said they paid but saw "expired" and no funds arrived.

Live Neon read (`orders` by email): the customer created **4 duplicate orders**, all $117.00 (11700¢), all still in the initial status `pending_payment_instructions`, within ~9 min on 2026-09-08:

| Order | Time (UTC) | Invoice ID (our DB) | NowPayments Payment ID | Dashboard status |
|---|---|---|---|---|
| ISR-XJCJV4WW | 15:06:01 | 5088344743 | — | Expired |
| ISR-MDK7BF65 | 15:06:43 | 5688445656 | 5106519352 | Expired |
| ISR-WADHDMTP | 15:14:49 | 4943896028 | 5990546337 | Expired |
| ISR-CV2Z9FNG | 15:15:11 | 5634438153 | 6040782946 | Expired |

(Our DB stores the **invoice_id**; the dashboard shows the **payment_id** — different numbers, expected.)

## Diagnosis (corrected mid-investigation)

- **All of this customer's attempts are Expired with NO funds received by NowPayments.** Confirmed by the dashboard AND by account Balance ~152.85 USD ≈ the single unrelated **Finished** 153 USD payment (ISR-TGMVLEG4, a different customer). Nothing from Michael landed in custody.
- **Earlier hypothesis was WRONG and corrected:** I first suspected a late/partial deposit stuck because our webhook ignores non-`finished` statuses. That is NOT what happened here — NowPayments received nothing, so there was nothing to finish. Money is **not** in custody; nothing for us to credit/refund unless a txid proves an on-chain send.
- Root behavioural cause: customer hit the **10-min fixed-rate window** repeatedly, kept re-creating orders → 4 expired invoices.

## Decisive next step (tomorrow)

Wait for the customer's **txid**, then:
- txid never broadcast / unconfirmed → payment never completed → send ONE clean payment link.
- txid sent to a NowPayments address but late → ticket to support@nowpayments.io with txid + payment_id (Deposit protection is **Enabled** on the account; late/wrong-asset deposits sometimes recoverable).
- txid sent to a foreign address → lost, not our fault.

If we send a fresh link: create a new invoice on the **same order_id ISR-CV2Z9FNG** so the webhook flips that existing order to `paid` on payment; consider dropping `is_fixed_rate` / lengthening the window for the retry so the customer doesn't hit the same wall.

## Systemic gaps this exposed (backlog — decide separately, NOT yet built)

1. **Webhook handles only `finished`** (`src/app/api/webhooks/nowpayments/route.ts:47-50`) — `partially_paid` / `expired`-with-deposit / `confirmed` are silently 200-OK'd. Didn't cause THIS incident, but a real late/partial deposit WOULD be silently dropped. Add at least an **ops alert** on non-`finished` statuses that carry a deposit; ideally handle `partially_paid`.
2. **No raw IPN payload logging** — no `webhook_logs` table; only `console.error` on not-found/sig-fail. Every trace is blind. Consider an audit table.
3. **Duplicate-invoice churn** — checkout let one customer spawn 4 invoices for the same email/amount in 9 min. Reuse the active invoice instead of minting new ones.
4. **10-min fixed-rate window** is NOT our hardcode — it's NowPayments' rate-lock driven by `is_fixed_rate: true` (invoices themselves are timeless; a payment only truly expires after 7 days of no deposit). Levers: drop `is_fixed_rate` (customer bears FX risk) and/or add copy that the link doesn't die + pay in one go. No API field exists to extend the window in `createInvoice()`.

## Reference notes for resume

- NowPayments API from our env: only `x-api-key` + `NOWPAYMENTS_IPN_SECRET` present — **no email/password**, so the payment-list endpoints (Bearer JWT) can't be queried from code; use the dashboard or ask support.
- One-off Neon reads: copy a `.mjs` using `@neondatabase/serverless` Pool with `POSTGRES_URL` into the **repo root** (not /tmp — module resolution) and run `node --env-file=.env.local`, then delete it.

## Fix — 2026-09-09 (floating-rate invoices)

**Roles run:** LEAD (investigate + report + wiki) → implementer (1-file edit) — plan approved before edit.

**What changed.** `src/lib/nowpayments.ts` `createInvoice()` now sends
`is_fixed_rate: false` (was `true`), with an inline comment referencing this incident.
This removes the ~10-min rate-lock: late-confirming on-chain payments now settle at the
**current market rate at confirmation** and complete as `finished` instead of dying as
"Failed"/"Expired". `price_amount`/`price_currency` (fiat pricing) and IPN verification
are untouched. Confirmed the only call site is `submitOrder.ts:453` (crypto branch);
`is_fixed_rate` appears nowhere else in `src/`. `npx tsc --noEmit` clean.

**Trade-off accepted:** the customer now bears FX drift between invoice creation and
confirmation (floating). This is the intended fix — a small rate drift is far better
than a hard "Failed" that needs a manual NowPayments support ticket to recover.

This fix is code-only; it takes effect for **new** invoices after deploy (request-time
fetch body — no build-time inlining, a normal redeploy suffices). Runtime-verify post-deploy
that a new crypto invoice shows a floating (non-fixed) rate in the NowPayments dashboard.

## Fix 2 — 2026-09-09 (webhook hardening + duplicate-invoice dedup)

**Roles run:** LEAD (recon + design + 2 forks confirmed with Anton) → implementer (3-file edit) → verifier (APPROVE). `npx tsc --noEmit` clean.

Addresses backlog items **1** (webhook only `finished` + no logging) and **3** (duplicate-invoice churn) from above.

**Webhook** (`src/app/api/webhooks/nowpayments/route.ts`):
- **Durable audit log** — new `webhook_logs` table (`src/lib/db/schema.ts`): every VERIFIED
  IPN is inserted best-effort (`id, provider, order_number, payment_id, payment_status,
  actually_paid, raw_json, created_at`). No payment signal is blind again. Insert is wrapped
  (non-fatal) so it degrades gracefully until `db:push` runs.
- **Ops alert on deposit-bearing non-`finished` statuses** — the old silent `!= "finished" → 200`
  now, when funds landed (`partially_paid` OR `actually_paid > 0`), fires a loud `sendToAdmin`
  alert (order, status, payment_id, actually_paid, expected price) so a stuck deposit is caught
  by hand. Still returns 200; does NOT auto-mark-paid (needs a human decision). This is the
  safety net that would have surfaced the original incident. `finished` happy path unchanged.

**Dedup** (`src/app/actions/submitOrder.ts`):
- Root cause found: client `idempotencyKey` is `useState(() => nanoid())` — **per page mount**,
  so a customer returning to checkout mints a fresh key → new order + new invoice (exactly how
  Michael made 4). The unique-key constraint only stops same-page double-submits.
- Fix: before creating a new **crypto** order, if the same email has a recent (**<60 min**),
  still-unpaid (`pending_payment_instructions`) crypto order with the **same total** and a live
  `nowpaymentsPaymentUrl`, redirect the buyer to **that existing invoice** instead of minting
  another. Early-returns before insert/analytics/email/QStash (no double-fire). Match on
  email + total (Anton's call) so a changed cart still gets a fresh invoice. Floating-rate
  invoices stay payable, so reuse is safe. Narrows (does not eliminate) a sub-second race.

## Fix 3 — 2026-09-09 (partial-payment tolerance, ADR 0019)

**Roles run:** LEAD (policy research + fork confirmed with Anton) → implementer (1-file) → verifier (APPROVE). tsc clean.

`partially_paid` is now auto-handled (was: alert-only). The webhook computes
`paidRatio = actually_paid / pay_amount`: **≥ 0.98 (≤2% short) → treat like `finished`**
(mark paid, ship, full-value Purchase, absorb the gap; ops alert tagged `(partial)`);
**< 0.98 → hold + ops alert** showing the received % for a top-up/refund decision. Threshold
is `PARTIAL_PAYMENT_TOLERANCE = 0.98`; a missing/zero `pay_amount` → ratio 0 → never
auto-accepts. Rationale (network-fee shortfalls; top-up fee > shortfall) + revisit triggers
in [ADR 0019](../decisions/0019-partial-payment-tolerance.md).

**STILL OPEN / not addressed:**
2. NowPayments API from our env can't list payments (no email/password → no Bearer JWT); still
   dashboard/support only for lookups.

**DEPLOYED + verified (2026-09-09).** Anton ran `db:push` and deployed (HEAD `353b334`). Prober
non-invasive checks **PASS**: `webhook_logs` exists in prod Neon with the correct 8 columns (0 rows —
no IPN fired yet); isrib.shop + /checkout serve 200; working tree clean at the fix commit.

**Behavioral E2E — deferred by choice (Anton).** A synthetic crypto E2E (floating-invoice + dedup-reuse)
was NOT run: the automated (sandboxed) browser could not persist the cart across navigations
(localStorage blocked — an environment limitation, not a site bug; the live site takes real orders daily),
and Anton opted to rely on the verifier APPROVE + confirmed migration/deploy and monitor the **first real
crypto order** instead. To close the loop when convenient: watch that (a) a new crypto invoice is floating
(no ~10-min fixed-rate lock in the NowPayments dashboard), (b) a repeat crypto submit reuses the invoice,
and (c) `webhook_logs` starts receiving rows.
