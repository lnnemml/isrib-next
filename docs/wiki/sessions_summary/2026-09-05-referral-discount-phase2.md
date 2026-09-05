# Session summary — 2026-09-05 (evening) · Referral discount (phase 2)

> Read this + `log.md` (tail) + [ADR 0014](../decisions/0014-referral-discount.md). Phase 2 of
> customer accounts: a two-sided personal referral system on the `customers` anchor. **Built +
> build-green + verifier-approved (a money bug was caught and fixed). Full runtime is GATED on Anton
> running `db:push` (BEFORE deploy) + the code backfill.**

## What this session accomplished

Recon (NORA referral + our pricing) → agreed 3 forks with Anton → ADR 0014 → 8 implementer tasks →
2 verifier passes (one REJECT for a money defect, fixed, then APPROVE). No new dependencies.

### The 3 forks (ADR 0014)
1. **Two-sided (NORA parity):** referee gets 10% off; referrer gets a 10%-off-next-order credit,
   created only when the referred order is **paid**.
2. **10%, NON-stacking with crypto** — effective discount = `max(crypto, referral)`; order total is
   `subtotal × 0.9` whenever any discount applies. Margin protection.
3. **`?ref=CODE` link** entry (frictionless, ADR 0010) — no manual code field.

### Built (8 tasks, tsc + build green)
1. **Schema:** `customers += referralCode` (unique, `REF-XXXXXX`); new `discount_ledger` (referrer
   credits) + `referrals` (junction, `referredOrderId` UNIQUE = idempotency backstop); `orders +=
   referralCodeUsed, referredByCustomerId, discountLedgerId`.
2. **`src/lib/referral.ts`:** code gen, `validateReferralCode` (self-referral guard by id + email),
   `computeEffectiveDiscount` (non-stacking; `usesRewardCredit` only when the credit is the sole
   reason), `getAvailableRewardCredit`, `createReferrerReward` (idempotent, transactional).
3. **Code gen at register** (new + legacy-claim paths) + `scripts/backfill-referral-codes.ts`
   (`npm run backfill:referral-codes`) for the 212 imported customers.
4. **`?ref` capture** (`RefCapture` → `isrib_ref` cookie; Suspense-wrapped in layout so pages stay
   static) + `/api/referral/validate` + checkout preview + **submitOrder** integration (cookie →
   validate → effective discount → order fields + atomic ledger redeem).
5. **Reward-on-paid:** `createReferrerReward` added NON-FATAL to the NowPayments webhook (allSettled)
   + admin `markPaid` (try/catch), after the paid transition.
6. **`/account/referrals`** cabinet page (code + share link + available credits + masked history) +
   a link on the cabinet home; data layer `src/lib/customer/referrals.ts`.

### Verification
- **Verifier REJECT → fix → APPROVE.** Caught a real **money defect**: reward-credit double-spend
  TOCTOU (credit read outside the tx + an unconditional redeem `UPDATE … WHERE id=?`). Two concurrent
  manual checkouts by the same customer holding one credit could both spend it. **Fixed:** atomic
  conditional claim `UPDATE discount_ledger … WHERE id=? AND status='available' RETURNING id` inside
  the order transaction; a lost race falls back to no-discount (`effectiveTotalCents = subtotal`,
  `effectiveDiscountLedgerId = null`). Re-verified APPROVE. The **no-referral pricing path is
  unchanged byte-for-byte** (crypto ×0.9 / manual subtotal).

## ✅ FULL E2E RUNTIME-VERIFIED (2026-09-05)
Anton ran `db:push` (chose add-constraint-without-truncate → 212 intact) + `backfill:referral-codes
--commit` (all 212 have REF- codes). LEAD then drove the **entire flow** vs local dev: capture+validate
→ referee manual order ($200→$180, attribution recorded) → **reward-on-paid via a real HMAC-signed
NowPayments IPN** (credit created, idempotent on retry) → `/account/referrals` (code, share link,
available credit, masked history) → **self-referral blocked** + **credit auto-redeemed** on the
referrer's next manual order ($200→$180, ledger flipped to redeemed with matching order id). All test
data cleaned (DB back to 212 / 0 / 0). See the log gate for step-by-step. **Remaining: Anton commits +
deploys the code (db:push + backfill already done).** The section below is retained as the historical
hand-off.

## GATED ON ANTON — do IN THIS ORDER
1. **`npm run db:push`** — adds the referral tables/columns. **Must precede the deploy:** after the
   new code deploys but before the push, a *logged-in* checkout queries `discount_ledger` and would
   error. (Guest checkout without `?ref` is safe — `getAvailableRewardCredit(null)` skips the query.)
2. **`npm run backfill:referral-codes -- --commit`** — assign `REF-` codes to the 212 customers
   (dry-run first to confirm counts; idempotent — only fills NULLs).
3. **Commit + deploy** tasks 1–6 + the TOCTOU fix + the docs.
4. Then runtime-test: register → get code at `/account/referrals` → open `/?ref=REF-XXXX` in a fresh
   session → place a **manual** order (referee gets 10%) → mark it paid in admin → confirm the
   referrer's credit appears at their `/account/referrals` → place the referrer's next manual order and
   confirm the credit auto-applies + is marked redeemed. (Use synthetic `@isrib-qa.test` data — see
   [[qa-use-synthetic-not-real-customers]].)

## Known behavior / flags
- **Non-stacking consequence (accepted):** on **crypto** orders (the primary path) the referral adds
  no extra discount (crypto already 10%). It only reduces price on **manual** orders. Attribution +
  the referrer reward still fire on all referred orders. Revisit if crypto-path uptake is weak.
- **Reward credits are preserved:** a credit is redeemed only when it's the sole reason for the 10%
  (never wasted on a crypto order or one already carrying an incoming `?ref` code).
- Analytics `order_submitted` value = actual charged total (referral lowers it); referral attribution
  lives in the DB (`referrals`, `orders.referralCodeUsed`), not in the pixel value.

## What's next
Roadmap continues: journal migration (301s), analytics wiring (Pixel/CAPI/GA4/Clarity via the
`trackEvent` layer), migration-announce email (to the imported roster + leads), §2 organic, §3 relaunch.

## Related
- [ADR 0014](../decisions/0014-referral-discount.md) · [ADR 0013](../decisions/0013-customer-accounts-auth.md)
  (accounts) · [ADR 0012](../decisions/0012-legacy-orders-import-and-customers.md) (customers anchor) ·
  [ADR 0010](../decisions/0010-frictionless-dr-checkout.md) · [`../log.md`](../log.md) (tail).
- NORA source: `NORA/docs/wiki/decisions/0017-referral-system.md`.
