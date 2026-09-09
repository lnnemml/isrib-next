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

**Still OPEN / not addressed by this fix (backlog above still stands):**
1. Webhook handles only `finished` — non-`finished` statuses carrying a deposit are still
   silently 200-OK'd, with no raw IPN logging. This fix does NOT touch the webhook.
2. Duplicate-invoice churn (one customer → 4 invoices in 9 min) — not addressed.
3. This fix is code-only; it takes effect for **new** invoices after deploy
   (`NEXT_PUBLIC_BASE_URL`-style build-time inlining does not apply — this is a request-time
   fetch body, so a normal redeploy suffices). Runtime-verify post-deploy that a new crypto
   invoice shows a floating (non-fixed) rate in the NowPayments dashboard.
