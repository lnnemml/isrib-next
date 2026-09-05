# ADR 0014 — Personal referral discount (phase 2 of customer accounts)

**Status:** accepted · 2026-09-05 · Anton signed off the three forks in-session.

## Decision

Add a **two-sided personal referral system** on the `customers` anchor (ADR 0012/0013),
ported from NORA's proven model but adapted to our pricing. A referral is shared as a
**`?ref=CODE` link**; the discount is a flat **10% that does NOT stack with the crypto
discount** (the effective order discount is `max(crypto, referral)` = at most 10%).

Three forks, agreed with Anton:

1. **Reward model → two-sided (NORA parity).**
   - **Referee** (the invited buyer): 10% off the order where a valid, non-self referral
     code is present.
   - **Referrer** (the code owner): a **10%-off-next-order credit** (a `discount_ledger`
     entry), created **only when the referred order transitions to `paid`** — via the
     NowPayments webhook (crypto) or the admin "mark paid" action (manual). Idempotent.
     Never expires.

2. **Discount value → 10%, NON-stacking with crypto (take the larger).**
   `effectiveDiscountPct = (isCrypto || validReferralCode || redeemedRewardCredit) ? 10 : 0`
   → `totalPrice = subtotalPrice − round(subtotalPrice × effectiveDiscountPct / 100)`.
   Because everything is 10% and non-stacking, the order total is `subtotal × 0.9` whenever
   ANY discount applies, else `subtotal`. This is a deliberate **margin-protection** choice
   (tiered per-gram discounts are already baked into the catalog).

3. **Entry → `?ref=CODE` link (frictionless, ADR 0010).** No manual code field at
   checkout. The code is captured from the URL into a cookie and auto-applied; the
   checkout preview shows "Referral applied". `submitOrder` re-validates server-side
   (authoritative).

## Consequences (read before building)

- **On crypto orders (the default/primary path) the referral gives the referee NO extra
  discount** (crypto already 10%, non-stacking). The referral discount only actually
  reduces the price on **manual-payment** orders. Attribution + the referrer reward still
  fire on ALL referred orders (the referee was still referred). Anton accepted this
  trade-off knowingly. **Revisit if** referral uptake is weak on the crypto path.
- **Reward credits are preserved, not wasted:** a referrer's available credit is redeemed
  ONLY when it is the sole reason for the 10% (i.e. a manual order with no incoming
  referral code). If crypto or an incoming referral code already yields the 10%, the credit
  is left `available` for a future order where it actually helps.
- Touches the **G2-critical paths** again (checkout price recompute + the paid transition
  in the webhook and admin markPaid). Reward creation is wrapped/non-fatal and idempotent
  so it can never break a payment transition. Verify with care (verifier on pricing +
  reward creation; runtime on the full flow).
- **Analytics:** a referral lowers `totalPrice`, hence the `value` sent to Meta/GA4. We
  keep `order_submitted` as-is (value = actual charged total); referral attribution lives
  in the DB (`referrals`, `orders.referralCodeUsed`), not in the pixel value, for now.

## Data model (re-`db:push`)

- `customers += referralCode text unique` — each customer's personal code. Generated at
  registration; **backfilled** for the 212 imported customers via a one-off script
  (`scripts/backfill-referral-codes.ts`). Format **`REF-XXXXXX`** (6 chars from an
  ambiguity-free alphabet, no I/O/0/1) — a distinct `REF-` prefix so codes never collide
  with `ISR-` order numbers.
- New **`discount_ledger`**: `id`, `customerId` (FK), `source` ("referral_reward"),
  `discountPct` (10), `status` ("available" | "redeemed" | "expired"), `redeemedOrderId`
  (nullable), `expiresAt` (nullable = never), `createdAt`.
- New **`referrals`** (junction): `id`, `referrerCustomerId` (FK customers — the code
  owner), `referredOrderId` (FK orders), `referredEmail`, `referrerRewardId` (nullable FK
  discount_ledger — set when the reward is created on paid), `createdAt`.
- `orders +=`:
  - `referralCodeUsed text` (nullable — snapshot of the code the referee used;
    attribution, always set when a valid non-self code is present),
  - `referredByCustomerId text` (nullable — the referrer's customer id; drives
    reward-on-paid),
  - `discountLedgerId text` (nullable FK discount_ledger — set when a referrer credit was
    redeemed on THIS order).
  Money stays `subtotalPrice` / `totalPrice` / `cryptoDiscountPct`; the effective 10% is
  reflected in `totalPrice` and the source is derivable from the fields above.

## Anti-abuse (implementation defaults, not forks)

- **Self-referral blocked:** a code is ignored if it belongs to the logged-in customer or
  if the referee email == the code owner's email.
- **Referrer reward is idempotent per referred order** (the `referrals` junction guards
  against double-creation on webhook retries / re-marking paid).
- Invalid/unknown codes are silently ignored (no error, no discount) — never block a sale.

## Build sequence

schema delta → referral lib (code-gen · validate · price-effect · createReferrerReward)
→ register code-gen + backfill script → `?ref` capture + checkout preview + submitOrder
integration → reward-on-paid (webhook + admin markPaid) → `/account/referrals` cabinet page.

## Revisit if

- Referral uptake is weak on the crypto path → reconsider the non-stacking rule (ADR fork 2).
- Abuse appears (link farming) → add per-referee first-order-only limit or velocity caps.

## See also

ADR [0013](0013-customer-accounts-auth.md) (accounts), [0012](0012-legacy-orders-import-and-customers.md)
(the `customers` anchor), [0010](0010-frictionless-dr-checkout.md) (frictionless checkout),
[0009](0009-checkout-backend-neon-qstash.md) (the paid transition this hooks). NORA source:
`NORA/docs/wiki/decisions/0017-referral-system.md`, `NORA/src/lib/referral.ts`,
`NORA/src/lib/referral-reward.ts`, `NORA/src/app/actions/submitOrder.ts`.
