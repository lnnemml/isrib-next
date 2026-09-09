# ADR 0019 — Partial crypto payment: tolerance auto-accept

**Status:** Accepted · 2026-09-09
**Deciders:** Anton (policy) + LEAD (design)
**Relates to:** [ADR 0009](0009-checkout-backend-neon-qstash.md) (checkout backend),
the NowPayments incident (`sessions_summary/2026-09-08-nowpayments-expired-payment-incident.md`),
and the floating-rate fix (Fix 1, same incident file).

## Decision

When a NowPayments IPN reports `payment_status: "partially_paid"`, the webhook
(`src/app/api/webhooks/nowpayments/route.ts`) computes the fraction of the requested
crypto that actually arrived — `paidRatio = actually_paid / pay_amount` (both crypto
amounts, no FX needed) — and:

- **`paidRatio ≥ 0.98`** (underpaid by ≤ 2%) → **treat exactly like `finished`**: mark the
  order `paid`, email the customer the shipping link, fire the Purchase conversion (at the
  **full** order value), create the referral reward, cancel nurture. The shortfall is
  **absorbed**. The ops "Payment confirmed" alert is tagged `(partial)` and notes the
  absorbed amount for margin visibility.
- **`paidRatio < 0.98`** → **hold** the order (status stays unpaid) and fire a loud
  `sendToAdmin` alert showing the received % and asking ops to decide: request a top-up
  invoice for the difference, or refund.

The threshold is a named constant `PARTIAL_PAYMENT_TOLERANCE = 0.98`. A missing / zero /
non-finite `pay_amount` yields `paidRatio = 0`, so a malformed payload can **never**
auto-accept.

## Context

`partially_paid` ≠ the 2026-09-08 incident. There, NowPayments received **nothing**
(expired, no funds). `partially_paid` means **real funds are in custody**, just below the
invoice — so the only question is "ship or not", not "where's the money".

Why it happens: almost always the **network withdrawal fee**. A customer sends "exactly
$200" but their wallet/exchange deducts the send fee, so ~$197 arrives. Occasionally FX
drift (now smaller under floating rate), rounding, or a mistyped amount. The overwhelming
majority of underpayments are 1–3% — cents-to-a-few-dollars on a $117–200 order.

Why not "request a top-up" as the default: asking a customer to send **another** few
dollars of BTC is self-defeating — the network fee on the top-up transfer typically
**exceeds the shortfall**, and it doubles reconciliation work. Top-up only makes sense for
large gaps, which is exactly the `< 0.98` manual branch.

NowPayments documents both models — "Accept it" (credit what arrived) and "Hold" (wait for
the full amount). This ADR picks **Accept-within-tolerance, Hold-beyond** — the pragmatic
e-commerce middle path.

## Consequences

- **Fulfilment isn't blocked** by a $2–4 fee shortfall; no ops touch for the common case.
- **Small margin cost**: on top of the existing −10% crypto discount, we absorb ≤ 2% on
  underpaid crypto orders. Bounded and small in absolute terms; goodwill on a repeat-buyer
  research business outweighs it.
- **Abuse is negligible**: gaming a 2% tolerance on a $200 order nets ~$4, not worth it,
  and the buyer base is known + fulfilment is manual.
- **Revenue reporting**: an accepted partial reports the **full** order value as the
  Purchase (we treat it as a completed sale); the absorbed gap is a cost, not a revenue
  reduction. Intentional.
- **Large underpayments still get a human** — the `< 0.98` branch holds + alerts with the
  received %, so top-up-vs-refund stays a deliberate ops decision.

## Revisit if

- Absorbed-shortfall volume becomes material (watch the `(partial)` ops alerts and
  `webhook_logs`) → tighten the threshold or add an absolute-dollar cap.
- We start seeing deliberate underpayment abuse near the threshold → lower it / require
  top-up above a dollar floor.
- NowPayments changes `partially_paid` semantics or the `pay_amount` / `actually_paid`
  field meaning.
