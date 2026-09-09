# Session summary — 2026-09-09 | NowPayments hardening (3 fixes) + crypto-payment UX

**Roles run:** LEAD (recon + design + policy forks with Anton + wiki + runtime/visual gates) →
implementer ×4 (each a scoped edit) → verifier ×3 (payment webhook + checkout copy) →
prober ×1 (non-invasive deploy check). All fixes traced back to the 2026-09-08 incident.

Full incident record this builds on:
[`2026-09-08-nowpayments-expired-payment-incident.md`](2026-09-08-nowpayments-expired-payment-incident.md)
(Fix 1 / Fix 2 / Fix 3 sections live there too).

## Context

The 2026-09-08 incident (a real BTC payment that confirmed late, missed the fixed-rate lock,
and died as "Failed") exposed three separate weaknesses in the crypto path. This session
closed all three, then added a customer-facing explainer so buyers understand the flow.

## What shipped

### Fix 1 — Floating-rate invoices ✅ deployed
`src/lib/nowpayments.ts` `createInvoice()` now sends **`is_fixed_rate: false`** (was `true`).
Late-confirming on-chain payments settle at the current market rate and complete as
`finished` instead of dying in the ~10-min rate-lock. One-line change; pricing + IPN verify
untouched. Verified `is_fixed_rate` optional (floating = default) against NowPayments docs.

### Fix 2 — Webhook audit + dedup ✅ deployed
`src/app/api/webhooks/nowpayments/route.ts` + `src/lib/db/schema.ts` + `src/app/actions/submitOrder.ts`:
- **`webhook_logs` table** — every VERIFIED IPN is now durably logged best-effort
  (`id, provider, order_number, payment_id, payment_status, actually_paid, raw_json, created_at`).
  No payment signal is blind again.
- **Ops alert on deposit-bearing non-`finished` statuses** — the old silent
  `!= "finished" → 200` now fires a loud `sendToAdmin` alert when funds landed
  (`partially_paid` or `actually_paid > 0`), the safety net the incident lacked.
- **Crypto duplicate-invoice dedup** — root cause: the client `idempotencyKey` is
  `useState(() => nanoid())`, regenerated **per page mount**, so a customer returning to
  checkout minted a new order + invoice (how Michael made 4 in 9 min). Now: before a new
  crypto order, if the same email has a recent (**<60 min**), unpaid crypto order with the
  **same total** and a live `nowpaymentsPaymentUrl`, redirect to that existing invoice
  (early-return, no double-fire of analytics/email/QStash). Match on email + total (Anton's
  call) so a changed cart still gets a fresh invoice.

### Fix 3 — Partial-payment tolerance (ADR 0019) ⏳ built, not committed
`src/app/api/webhooks/nowpayments/route.ts`: `partially_paid` is auto-handled.
`paidRatio = actually_paid / pay_amount` (crypto, no FX). **≥ 0.98** (≤2% short) → treat
exactly like `finished` (mark paid, ship, full-value Purchase, absorb the gap; ops alert
tagged `(partial)`). **< 0.98** → hold + ops alert with the received % for a top-up/refund
decision. Constant `PARTIAL_PAYMENT_TOLERANCE = 0.98`; missing/zero `pay_amount` → ratio 0 →
never auto-accepts. Rationale + revisit triggers:
[ADR 0019](../decisions/0019-partial-payment-tolerance.md).

### Crypto-payment UX explainer ⏳ built, not committed
`src/components/ui/PaymentSelector.tsx`: a collapsible **"How does crypto payment work?"**
hint under the Crypto card (mirrors the FaqAccordion +/− disclosure; sibling of the label so
the toggle never flips the radio). 5 plain steps: secure NowPayments page → pick coin → send
(cover the network fee) → live-rate so late transfers still work → auto-confirm + shipping-link
email. Compliance-clean, factually matches the live flow. **Visual gate PASS** (kitchen-sink,
collapsed + expanded).

## Decisions (forks Anton owned this session)

1. **Webhook audit depth** → durable `webhook_logs` table (not console-only).
2. **Dedup scope** → same email **+ same total**, 60-min window (conservative).
3. **Partial-payment policy** → tolerance auto-accept at **2%** (ADR 0019), not always-hold / always-top-up.

## Deploy + verification state

- **Fix 1 + Fix 2: LIVE.** Anton ran `db:push` + deployed (commits `a14f5c5` "nowpayments
  fixation", `353b334` "h" — terse messages, flagged). Prober non-invasive checks **PASS**:
  `webhook_logs` exists in prod Neon with correct 8 columns (0 rows — no IPN yet);
  isrib.shop + /checkout serve 200.
- **Fix 3 + explainer: verifier-APPROVED + tsc-clean, NOT committed.** No schema change → a
  normal redeploy (no `db:push`) ships them.
- **Behavioral synthetic E2E deferred by choice.** The sandboxed automation browser couldn't
  persist the cart (localStorage blocked — environment limit, not a site bug; the live site
  takes real orders daily), so floating-invoice + dedup-reuse were NOT exercised end-to-end.
  See [[qa-use-synthetic-not-real-customers]].

## Proposed commit plan (2 logical commits, not yet made)

1. `feat(payments): auto-accept partially_paid within 2% tolerance (ADR 0019)` — `route.ts`
   + ADR 0019 + incident-summary/log docs (folds in the Fix 1/2 verification doc updates).
2. `feat(checkout): explain crypto payment flow in an expandable hint` — `PaymentSelector.tsx`
   + log entry.

## Still open / next

- **Commit + deploy** Fix 3 + the explainer (above).
- **Close the loop on the first real crypto order:** confirm (a) new invoice is floating
  (no fixed-rate lock in the NowPayments dashboard), (b) a repeat crypto submit reuses the
  invoice, (c) `webhook_logs` starts filling, (d) a `partially_paid` behaves per ADR 0019.
- **No auto-handling of large underpayments** — `< 0.98` is alert-only (deliberate: manual
  top-up/refund decision).
- **No NowPayments payment-list API access** from our env (only `x-api-key` +
  `NOWPAYMENTS_IPN_SECRET`, no Bearer JWT) — lookups stay dashboard/support-only.
- **Michaelmmonahan incident** (original 4 expired orders) — still awaiting the customer's
  txid; unchanged by this session's code work.

## Files touched (all under `src/` via implementer; docs by LEAD)

- `src/lib/nowpayments.ts` — floating rate
- `src/app/api/webhooks/nowpayments/route.ts` — webhook_logs insert, non-finished alert, partial tolerance
- `src/lib/db/schema.ts` — `webhook_logs` table
- `src/app/actions/submitOrder.ts` — crypto dedup
- `src/components/ui/PaymentSelector.tsx` — crypto explainer
- Docs: ADR 0019, incident summary (Fix 1/2/3), `log.md`, `index.md`, this summary
