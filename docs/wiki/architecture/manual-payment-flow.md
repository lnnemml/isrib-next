# Architecture — Manual Payment Flow

> No payment gateway wired into code beyond NowPayments crypto invoices.

## Order lifecycle

```
pending_payment_instructions  (form submitted, confirmation email sent)
  -> awaiting_payment          (ops emails customer to arrange payment)
  -> paid                      (ops manually confirms funds)
  -> fulfilled                 (shipped)
cancelled                      (reachable from any state)
```

Only the first transition is automatic (submit -> pending + confirmation email).
All later ones are human — no webhook drives them except NowPayments marking crypto
orders paid.

## Checkout fields

Name, email, phone (real payment-coordination channel), shipping address
(state/province optional), quantity (shown in order summary), optional note
(preferred payment method / best contact time). **Never collect card/payment
details. Never add a card field "for later."**

## Payment method selection

1. **Crypto via NowPayments (default, 10% discount)** — discount funded by the
   spread between card fees + chargebacks vs. crypto network fees. Invoice generated
   on submit; webhook (`/api/webhooks/nowpayments`) marks paid.
2. **Manual arrangement** — note field lets customer pre-state method (PayPal,
   SEPA/SWIFT, Western Union, bank transfer) before first contact.
3. **Card online** — permanently disabled UI slot ("coming soon"). Do not enable
   until a high-risk merchant account is approved via ADR.

## Emails (Resend)

1. Order received (customer, automatic on submit).
2. New order (ops, automatic on submit).
3. Payment confirmed (customer, sent by ops when marking paid).
4. Shipped (customer, manual/semi-automatic).
5. Abandoned-checkout nurture ×2 (customer, T+2h / T+24h, **Upstash QStash** delayed
   callback; suppressed once paid). The only async piece — see
   [`checkout-architecture.md`](./checkout-architecture.md) §5 and
   [ADR 0009](../decisions/0009-checkout-backend-neon-qstash.md).

## Cutover note

NowPayments IPN/webhook URL currently points at the legacy endpoint. On cutover,
either match the new route to the old path or update the URL in the NowPayments
dashboard — otherwise crypto confirmations fire into nowhere. See
[`migration-plan.md`](./migration-plan.md).

## Related
- [`checkout-architecture.md`](./checkout-architecture.md) — the full G2 backend mechanism
- [`data-model.md`](./data-model.md) · [`../decisions/0003-order-storage-neon.md`](../decisions/0003-order-storage-neon.md) · [`../decisions/0009-checkout-backend-neon-qstash.md`](../decisions/0009-checkout-backend-neon-qstash.md)
