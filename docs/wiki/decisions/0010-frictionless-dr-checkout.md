# ADR 0010 — Friction-less DR checkout: minimal form + post-payment shipping

**Status:** accepted · 2026-09-04 · refines [ADR 0009](./0009-checkout-backend-neon-qstash.md)
(checkout backend) and the checkout flow in
[`manual-payment-flow.md`](../architecture/manual-payment-flow.md). Adapts the
`isrib-a15-lander` conversion pattern (audited 2026-09-04) to our multi-item cart.

## Decision

The checkout is optimised for **paid-traffic conversion**: collect the minimum to place
an order, defer shipping data until **after** payment is confirmed.

1. **Checkout form = 3 typed fields + payment toggle:** `first name`, `email`, `country`,
   and the crypto/manual selector. **No address/city/postal/state/phone at checkout.**
   The **cart** supplies the line items (we diverge from the lander's single-SKU product
   selector — our cart is multi-item, ADR 0008).
2. **Shipping address is collected post-payment via a token-gated form that writes to
   Neon** (option C2, chosen over the lander's email-reply/`mailto:` model). The
   payment-confirmed email links to `/shipping/<token>` — a short form (Full name,
   Address, City, Postal code, Mobile) that updates the order row. Structured address in
   the DB → ready for the future admin panel + label export; not lost in an inbox.
3. **`shipping_token`** = an unguessable per-order nanoid in the link (NOT the raw
   `order_number`, which is guessable — otherwise anyone could overwrite an address).
4. **Order lifecycle (unchanged enum; address is data, not status):**
   `pending_payment_instructions` (submit → confirmation+pay-instructions email)
   → `paid` (crypto webhook OR admin manually confirms funds) → confirmation email with the
   `/shipping/<token>` link → customer submits address (`shipping_details_at` stamped)
   → `fulfilled` (admin ships). `cancelled` from any state.
5. **Emails (redefines Step 3) match this flow:** (a) at submit — "order received +
   payment instructions" (crypto → invoice link; manual → real payment details sourced
   from the lander) + admin alert; (b) at paid — "payment confirmed — provide shipping
   details" with the `/shipping/<token>` link.

## Context

Anton's goal: a friction-less, semi-automated checkout like the live `isrib-a15-lander`,
to lift conversion on paid traffic. Audit of the lander (2026-09-04): its checkout is **5
fields (3 typed: name/email/country)**, no address; the delivery address is requested
**only after payment is confirmed**, via a prefilled `mailto:` reply that lands in
ProtonMail (never stored). Admin manually confirms manual-payment funds in `/admin`, which
triggers the address-request email.

Our Step-2 build had a **full shipping form at checkout** (address/city/postal/state/phone
all required) — higher friction, the opposite of the DR goal. This ADR reverses that:
strip checkout to the minimum, move shipping to a post-payment step.

We chose a **post-payment form → DB** over the lander's inbox-only reply because
isrib-next is DB-backed with an admin panel on the roadmap: a structured address beats
free-text email, at zero pre-payment friction (the form is only reached after paying).

## Consequences

- **Higher expected conversion** on the paid funnel (fewer fields before the money commit).
- **Step-2 rework:** the checkout form loses its shipping fields; `submitOrder` stops
  requiring them and generates a `shipping_token`; the success page reframes to
  "check your email / payment instructions". The Step-2 **core is reused unchanged** —
  transactional multi-line insert, server-side price recompute, idempotency, cart wiring.
- **Schema deltas (re-`db:push`):** `address`, `city`, `postal_code`, `state_region`,
  `phone` → **nullable** (were NOT NULL); add `shipping_token` (unique) + `shipping_details_at`
  (timestamp). Order can exist with no address until the post-payment form is submitted.
- **New route:** `/shipping/<token>` (server-validated token → short form → server action
  updates the order). Gated on token match; not on `order_number`.
- **An order may sit "paid, no address"** until the customer fills the form — acceptable
  (admin follows up; same as the lander, but now visible in the DB via
  `shipping_details_at IS NULL`).
- **Emails** are defined around this flow (Step 3); manual-payment details come verbatim
  from the lander's `buyer-confirmation.ts`.

## Revisit if

- Conversion data shows the post-payment form has high drop-off (address never provided) —
  consider a reminder email or falling back to the lander's `mailto:` nudge.
- We later want address at checkout for a specific (e.g. organic, low-friction-tolerant)
  funnel — the nullable columns already support collecting it earlier without a schema change.

## See also

[`../architecture/manual-payment-flow.md`](../architecture/manual-payment-flow.md) ·
[`../architecture/checkout-architecture.md`](../architecture/checkout-architecture.md) ·
[`../architecture/data-model.md`](../architecture/data-model.md) · [ADR 0009](./0009-checkout-backend-neon-qstash.md)
