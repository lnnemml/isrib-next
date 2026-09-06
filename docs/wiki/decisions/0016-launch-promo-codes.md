# ADR 0016 — Launch promo codes

**Status:** accepted · 2026-09-06

## Decision

Add a real, checkout-applied **promo-code** discount mechanism for the relaunch email
campaign (announce step of the cutover). A code entered at checkout applies a percentage
discount, validated server-side, stored on the order, and reflected in the total.

- **Storage:** a new `promo_codes` table (Drizzle) — `code` (unique, uppercase),
  `discountPct`, `active`, `expiresAt` (nullable), `redemptionCount`, `createdAt`. A DB
  table (not env/hardcoded) so codes can be disabled/expired and usage tracked without a
  redeploy.
- **Launch code:** 10% off, **7-day** expiry, **unlimited** redemptions (tracked, not
  capped). Code name is a seed value (default `RELAUNCH10`) — changeable in the seed/DB.
- **Stacking = NONE (best single discount).** Extends the ADR 0014 non-stacking rule: the
  effective discount is `max(crypto 10%, referral 10%, reward credit 10%, promo pct)` —
  one discount, never summed. `computeEffectiveDiscount` is generalised from its binary
  10%-or-0 form to a `max()` over the applicable percentages (behaviour is identical when
  no promo is present). A reward credit is still consumed only when it is the SOLE reason
  for the discount (now also gated on "no valid promo").
- **Consequence of 10% + non-stacking:** for a **crypto** order the code is neutral (both
  10%); its real effect is giving **manual-payment** buyers the 10% they'd otherwise only
  get via crypto. The relaunch email frames this honestly: "10% off your order — automatic
  with crypto, or use the code with any payment method."

## Context

The relaunch announcement to 500+ past customers needed an incentive. A `promo_code`
column already existed on `orders` but was dormant — never validated or applied. Promising
a code that doesn't reduce the price would be a broken promise to the whole list, so the
mechanism had to be built and verified with a real test order before the email sends.

## Consequences

- Touches the G2 checkout pricing path → requires a verifier pass + a **real test order**
  (with the code) on the live site before the email goes out.
- `db:push` (adds `promo_codes`) + seeding the launch code row are Anton-gated steps,
  done before the real-order verification and the send.
- Server-side validation is authoritative; the checkout field + `/api/promo/validate` only
  drive the client preview (mirrors the referral pattern).
- Redemption count increments atomically inside the order transaction (no over-count under
  concurrency); one code per order; codes never stack.

## Revisit if

- We want per-customer single-use codes (needs email×code tracking) or fixed-amount (not
  percentage) codes — both are additive to the table + validation.
- A future code needs a discount other than 10% AND must interact with crypto/referral
  differently than "best single" — revisit the `max()` model.

## Related
- [ADR 0014](0014-referral-discount.md) (non-stacking discount model) ·
  [ADR 0010](0010-frictionless-dr-checkout.md) ·
  `architecture/checkout-architecture.md`
