# ADR 0025 — Affiliate program

**Status:** accepted · 2026-10-31 · Anton approved the plan and the discount in-session.

## Decision

Add a creator affiliate program, separate from the customer referral (ADR 0014). The first
affiliate is an X/Twitter influencer on a 30-day trial.

- **Commission:** 35% of `orders.total_price`, configurable per affiliate.
- **Buyer discount:** **15%**, configurable per affiliate. It does **not** stack with the 10%
  crypto discount. The ADR 0014/0016 best-single rule stands, and the affiliate rate is one more
  input to the `max()`.
- **Earned on paid.** Refunds are practically nonexistent. Cancelled or unpaid orders earn nothing.
- **Payouts:** manual, in crypto, twice a month. Recorded in admin with a tx hash.
- **Core principle:** full transparency for the affiliate, zero customer PII.
- **Feature flag:** `AFFILIATES_ENABLED` (`"true"` = on). Off means no buyer-facing change.

Worked example, $1,000 list-price crypto order: the buyer pays $850, commission is $297.50, and
$552.50 is left before the $10 shipping we absorb (ADR 0018). Without the code the same buyer
pays $900, so the code is worth 5 points over crypto.

## Context

A 10% code would have given crypto buyers nothing, because every crypto order already gets 10%
and discounts don't stack. Anton chose 15% over 20% and kept the non-stacking rule, so ADR 0014
and 0016 are extended, not reversed.

`influencer-outreach.md` listed the rate, tracking and payout as open. This ADR settles them.

## Rules

### Data model (additive only)

Money is integer cents. Rates are integer basis points (`3500` = 35%). `crypto_amount` is text,
so it stays exact.

- `affiliates`: `id`, `name`, `handle`, `code` (unique, stored uppercase), `commission_rate_bps`
  (default 3500), `customer_discount_bps` (default 1500), `notify_email`,
  `notify_telegram_chat_id`, `is_active`, `created_at`.
- `affiliate_clicks`: `id`, `affiliate_id`, `created_at`, `landing_path`, `visitor_hash`. Unique
  on (`affiliate_id`, `visitor_hash`). The hash uses a daily salt, so this unique index is the
  dedupe, per UTC day. Never store a raw IP.
- `orders` adds, all nullable: `affiliate_id` (FK, indexed), `attribution_source`
  (`link` | `code`), `commission_rate_snapshot_bps`, `commission_amount_cents`,
  `commission_earned_at`.
- `affiliate_payouts`: `id`, `affiliate_id`, `amount_cents`, `crypto_currency`, `crypto_amount`,
  `tx_hash` (unique), `period_start`, `period_end`, `paid_at`, `created_at`.
- `affiliate_login_tokens`: `id`, `affiliate_id`, `token_hash` (unique), `expires_at`, `used_at`,
  `created_at`.
- `affiliate_sessions`: `id`, `affiliate_id`, `token_hash` (unique), `expires_at`, `created_at`.
- `affiliate_login_attempts`: `id`, `visitor_hash`, `created_at`. For rate limiting only.

### Attribution

- Link, cookie and field reuse what exists. `?ref=CODE` writes the shared `isrib_ref` cookie for
  30 days, and the affiliate code uses the existing promo field. One cookie means last touch
  also works across customer referrals and affiliates.
- Precedence at checkout: a typed active affiliate code beats the cookie. A typed code equal to
  the cookie code counts as `link`, because the cookie pre-fills the field. An unknown or
  non-affiliate typed code leaves cookie attribution in place, and the discount is still best-single.
- An affiliate attribution drops any customer referral on that order (no reward credit). A reward
  credit is not consumed on an affiliate order.
- Self-purchase: if the buyer email equals the affiliate's `notify_email` (case-insensitive) there
  is no attribution and no affiliate discount.
- Inactive or unknown codes are ignored silently and never block a sale.
- Existing and repeat customers count ("every attributed sale"), as do manual orders marked paid.
- Attribution and the commission snapshot are written at order creation, from the final total.
- Affiliate codes must match `^[A-Z0-9_-]{2,32}$`, must not start with `REF-`, and must not exist
  in `promo_codes`.

### Clicks

The proxy runs only on page requests carrying `?ref`, plus the `/partner` gate. It stays free of
DB and `node:crypto` imports (see the rules at the top of `src/proxy.ts`). It sets the cookie and
fires a best-effort `waitUntil` POST to an internal route authenticated with
`AFFILIATE_HASH_SECRET`. That route validates the code, filters bots, hashes and inserts with
`ON CONFLICT DO NOTHING`. Customer `REF-` codes get the cookie but no click.

`visitor_hash` = HMAC(HMAC(`AFFILIATE_HASH_SECRET`, UTC date), IP + user agent).

### Commission state

Earned or void is **derived from order status, not stored**, so it cannot drift from the order:
`paid`/`fulfilled` → earned, `cancelled` → void, anything else → pending.

`commission_earned_at` is an atomic claim (`UPDATE … WHERE commission_earned_at IS NULL
RETURNING`) and is the only trigger for the notification, so it fires once. All four paths that
can reach paid call it: the webhook, `markPaid`, `setStatus`, `saveTracking`. Each call is
non-fatal and can never break a payment transition.

A cancellation after payout leaves a negative balance that carries forward.
`balance = earned − sum(payouts)`.

### PII isolation

- Affiliates see **masked order numbers** (`ISR-******34`), in the dashboard, CSV and
  notifications. `/checkout/success?order=` shows products and totals with no login, so a full
  order number would reveal what a customer bought. Only the last 2 characters are shown, because
  showing 4 left about a million guesses against that page; 2 leave about a billion. Admin sees
  the full number.
- Partner queries live in one module, select named columns only, and always filter on the
  session's `affiliate_id`. They never touch `customers`, `order_items` or any contact field.
- Notifications carry only masked number, date, order amount and commission.

### Partner auth

- Opaque random tokens; only SHA-256 hashes are stored. Sessions live in the DB (30 days) in the
  `isrib_partner_session` cookie (httpOnly), so deactivating an affiliate cuts access at once. The
  proxy checks cookie presence only; the server checks the session and `is_active`.
- Magic link: 30 minutes when emailed, 24 hours when generated in admin. Single use.
- The link opens a **route handler** that returns a minimal HTML page with a "Sign in" button
  that POSTs the token. This has two reasons. A GET must never consume the token, because Telegram
  and email link previews fetch URLs. And a route handler renders outside the root layout, so the
  token URL never reaches GTM, Meta or Clarity.
- Rate limits: 3 links per affiliate per hour, 5 login requests per visitor hash per 15 minutes.
  The response is identical whether or not the email exists.

### Notifications

Telegram when `notify_telegram_chat_id` is set, through the Bot API with `TELEGRAM_BOT_TOKEN`.
Email otherwise, or if Telegram fails. Delivery failure only logs; the dashboard remains the
record.

## Consequences

- **Deploy order is mandatory: migrate → deploy → enable.** Code selects full `orders` rows in
  checkout and admin, so the new columns must exist first. The flag does not protect against this.
  To roll back: flag off, revert the code, then run the down migration.
- The repo uses `db:push`, which is not reversible, so this ships hand-written up/down SQL in
  `src/lib/db/migrations/` plus a small runner. All of it is additive. After it runs,
  `db:push` must show no diff for these objects.
- Changing `AFFILIATES_ENABLED` on Vercel needs a redeploy.
- `.env.local` points at production Neon, so local runs and tests touch production. QA uses
  synthetic `@isrib-qa.test` data only, and test orders are cancelled afterwards so they stay out
  of revenue.
- Touches the G2 checkout path, so a verifier pass and a real test order are required.
- The repo gains a test command using `node:test` and `tsx`, with no new dependency.
- The Privacy page gains an affiliate paragraph. It stays an AI-drafted template, not legal review.
- `/partner` still loads site analytics (GTM, Clarity). It shows no customer PII, so this is
  accepted for the trial.
- With a code applied, crypto and manual buyers pay the same price, so the code removes the crypto
  saving for those buyers. The checkout hides the "Save 10%" badge in that case.
- "Earned" follows order status, so `saveTracking` on an unpaid order counts as earned. Don't mark
  an unpaid affiliate order as shipped.

## Revisit if

- The trial ends: review commission against margin, and whether repeat customers should earn the
  full rate.
- 15% does not move conversion over the 10% crypto default.
- Self-purchase through a second email appears. The email check only stops the obvious case.

## See also

ADR [0014](0014-referral-discount.md), [0016](0016-launch-promo-codes.md),
[0018](0018-shipping-cost-and-september-orders.md), [0019](0019-partial-payment-tolerance.md),
[`marketing/influencer-outreach.md`](../marketing/influencer-outreach.md).
