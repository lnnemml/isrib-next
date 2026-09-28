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
2. **Manual arrangement** — note field lets customer pre-state method
   (SEPA/SWIFT, Western Union, bank transfer) before first contact. **PayPal was
   removed 2026-09-25** — Anton's PayPal account was blocked again (flagged for
   "narcotics" sales). The manual-payment email now offers USDT (TRC-20,
   RECOMMENDED) / BTC / LTC + a "reply to arrange SEPA/SWIFT/WU" fallback only.
3. **Card online** — permanently disabled UI slot ("coming soon"). Do not enable
   until a high-risk merchant account is approved via ADR.

### Card-on-invoice (NowPayments fiat on-ramp) — evaluated & REJECTED (2026-09-28)

NowPayments can let the buyer pay the invoice **by card** (fiat), merchant receives
crypto, via a fiat on-ramp partner (Guardarian / Banxa). This would be the ideal
ex-PayPal experience ("pay by card, no crypto"). **Rejected:** both providers require
**KYB (business verification)** — the exact business-level review that got Anton's
PayPal banned ("narcotics"). Enabling it would re-import the PayPal problem one layer
down. Instead, **all fiat→crypto conversion stays on the BUYER's side** (they buy crypto
with their card in their own wallet/on-ramp — personal KYC only, no business review).
See the crypto-buying guide below.

### Crypto-buying guide — `/how-to-pay-crypto` (2026-09-28)

Lowers the knowledge barrier for buyers new to crypto (the biggest ex-PayPal
conversion lever). A "ladder" of three ways to pay: (1) buy in a wallet app and send
it — leads with **Litecoin** for wallet users; (2) on-ramp direct to our address
(e.g. Paybis); (3) exchange withdrawal (USDT-TRC20 cheapest there). **Coin choice:** we
accept BTC/LTC/USDT and NowPayments converts every coin to its USD value, so the buyer
pays in whatever is easiest. Do **not** push USDT-TRC20 to a wallet user — sending it
needs separate **TRX for gas**; LTC/BTC carry their fee natively. Linked from the
payment + abandoned-checkout emails, the checkout payment selector, FAQ, and footer.
The 10% crypto discount is surfaced prominently at checkout (savings line) and in
emails.

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
