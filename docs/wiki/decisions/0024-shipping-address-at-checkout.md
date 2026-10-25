# ADR 0024 — Collect the shipping address at checkout again (post-payment form removed)

**Status:** accepted · 2026-10-25 · **supersedes [ADR 0010](0010-frictionless-dr-checkout.md)**
§1–§3 (minimal checkout + token-gated post-payment shipping form). Anton's decision,
in-session.

## Decision

1. **Checkout collects everything before payment.** Required: full name, email, phone,
   address, city, postal code, country. Optional: state / region. The payment toggle,
   promo block, cart and hidden fields stay as they are.
2. **`submitOrder` writes the address with the order** (`phone`, `address`, `city`,
   `state_region`, `postal_code`) and stamps `shipping_details_at` at submit.
3. **The post-payment form is removed entirely:** the `/shipping/[token]` route,
   `ShippingForm`, the `submitShipping` action and the `shippingReceivedAdmin` email.
   `shipping_token` stays in the schema (NOT NULL, unique) and is still generated, but is
   unused. No schema change.
4. **Emails follow the new flow.**
   - The manual order-received email shows "Shipping to" with a reply-to-correct line.
   - The ops alert carries phone and address.
   - "Payment confirmed" no longer links to a form. When the order has an address, it shows
     the address and invites a reply if anything needs correcting. For an order placed
     before this change with no address, it asks the buyer to reply with their delivery
     details.
5. **The admin "awaiting shipment" count** becomes `status = 'paid'` AND address present
   AND not shipped. Without that, unpaid orders, which now carry an address from submit,
   would be counted.

## Context

ADR 0010 (2026-09-04) cut checkout to name / email / country to lift paid-traffic
conversion, and asked for the address after payment through a `/shipping/<token>` link.
Its own *Revisit if* allowed for taking the address earlier ("the nullable columns already
support collecting it earlier without a schema change"). Anton wants the full form back
before payment. When this was decided, 1 paid order had no address, and so did 4 shipped
ones that were resolved by hand.

On 2026-10-25, 15 orders made under ADR 0010 had no address: 14
`pending_payment_instructions` and 1 `paid`. Their emailed `/shipping/<token>` links will
404 once the route is gone. Point 4's no-address branch of the payment-confirmed email
covers the 14 if they pay. The 1 already-paid order needs a manual follow-up from Anton.

## Consequences

- More fields before the money commit, so conversion on cold paid traffic may drop. Anton
  traded that for complete orders with no chasing.
- `paidNoAddress` in admin now only covers orders placed before the change, and should go
  to 0 over time.
- Meta CAPI `order_submitted` can now carry the hashed phone (server.ts already hashes
  `props.phone`), which improves match quality. `order_submitted` stays the primary
  conversion (ADR 0005).
- FAQ, PaymentSelector and success-page copy that promised "a link after payment" is
  rewritten.

## Revisit if

- Checkout conversion drops noticeably compared with the ADR 0010 period. The options then
  are to split the funnel (a minimal form for paid traffic) or to bring back a post-payment
  step.
