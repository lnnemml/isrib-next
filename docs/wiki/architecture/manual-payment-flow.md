# Architecture — Manual Payment Flow

> No payment gateway wired into code beyond NowPayments crypto invoices.

## Order lifecycle (friction-less DR — [ADR 0010](../decisions/0010-frictionless-dr-checkout.md))

```
pending_payment_instructions  (short form submitted → confirmation + pay-instructions email)
  -> paid                      (crypto webhook OR ops manually confirms funds → email w/ /shipping link)
     └─ customer submits /shipping/<token> form → address stored, shipping_details_at stamped
  -> fulfilled                 (shipped)
cancelled                      (reachable from any state)
```

Only submit -> pending is automatic (confirmation + pay-instructions email). Crypto ->
paid is driven by the NowPayments webhook; manual -> paid is ops clicking confirm. The
shipping address is collected **after** paid, via the token-gated form.

## Checkout fields (minimal — [ADR 0010](../decisions/0010-frictionless-dr-checkout.md))

**Checkout collects only: first name, email, country + the crypto/manual toggle.** The
**cart** supplies the line items. **No address/city/postal/state/phone at checkout** —
those are deferred to the post-payment `/shipping/<token>` form (Full name, Address, City,
Postal code, Mobile) to minimise paid-traffic friction. **Never collect card/payment
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

1. Order received + payment instructions (customer, automatic on submit — crypto: invoice
   link; manual: real payment details ported from the lander's `buyer-confirmation.ts`).
2. New order (ops, automatic on submit).
3. Payment confirmed + **provide shipping details** (customer, on paid — carries the
   `/shipping/<token>` link; [ADR 0010](../decisions/0010-frictionless-dr-checkout.md)).
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
