# Session summary — 2026-09-05 · Customer accounts + header widget + referral (session wrap)

> Session-level overview tying together three shipped features. For per-feature detail read the
> linked summaries + ADRs. **Next session: journal migration (301s).**

## What this session delivered (3 features, all built + full-E2E runtime-verified)

1. **Customer accounts v1** — [ADR 0013](../decisions/0013-customer-accounts-auth.md) ·
   [detail](./2026-09-05-customer-accounts-v1.md). Bespoke auth (jose JWT + `node:crypto` scrypt,
   cookie `isrib_customer_session`) on the **promoted `customers` anchor** (added `passwordHash` +
   `emailVerifiedAt` + `verification_tokens`), a `/account/:path*` proxy gate, register / login /
   logout / verify-email / password-reset flows, and a guarded `(account)` cabinet with unified
   live+legacy order history. Checkout stamps `orders.userId` for logged-in buyers.
2. **Header account widget + inline sign-in** (NORA pattern) — logged-out "Sign in" popover with an
   inline email/password form (reuses `signInCustomer`); logged-in plaque → dropdown (My account /
   Order history / Log out). Isolated via a client fetch to a new `GET /api/account/me` so marketing
   pages stay static. (Logged in via the log gate; no separate ADR — it's UI.)
3. **Referral discount (phase 2)** — [ADR 0014](../decisions/0014-referral-discount.md) ·
   [detail](./2026-09-05-referral-discount-phase2.md). Two-sided (referee 10% + referrer
   10%-off-next-order credit), **10% non-stacking with crypto** (`max`), `?ref=CODE` link entry.
   Tables `discount_ledger` + `referrals`, `customers.referralCode` (REF-XXXXXX), reward-on-paid in
   the webhook + admin markPaid, `/account/referrals` cabinet page.

## Method (held the LEAD discipline throughout)

Recon (explorer, incl. the NORA reference) → agreed the WHAT-level forks with Anton via
AskUserQuestion → filed ADRs → delegated every `src/` change to **implementer** subagents → fresh-
context **verifier** on each security/money-critical core → **LEAD-driven browser + DB runtime E2E**.
The verifier caught a real **money defect** (reward-credit double-spend TOCTOU) that was fixed and
re-approved. Two safety events handled correctly: (a) the auto-mode classifier blocked registering a
real 5-year customer's email for a test — switched to synthetic `@isrib-qa.test` data
([[qa-use-synthetic-not-real-customers]]); (b) advised Anton to choose "add constraint WITHOUT
truncating" on the `db:push` prompt, preserving all 212 customers.

## Runtime E2E — what was proven live (local dev → prod Neon, synthetic data, cleaned up after)

- Accounts: register → login-blocked-until-verify → verify → login → cabinet; **legacy CLAIM** (a
  known email inherits full history + LTV).
- Header widget: inline login without visiting the login page → plaque → dropdown → logout.
- Referral: capture+validate → referee manual order $200→$180 → **reward-on-paid via a real
  HMAC-signed NowPayments IPN** (idempotent on retry) → `/account/referrals` → **self-referral
  blocked** + **credit auto-redeemed** ($200→$180, ledger→redeemed). DB returned to baseline
  (customers 212 / discount_ledger 0 / referrals 0) after cleanup.

## Current deploy state

- **DONE by Anton:** accounts v1 `db:push` + `CUSTOMER_AUTH_SECRET` (local+Vercel) + deploy; referral
  `db:push` (no-truncate) + `backfill:referral-codes --commit`. Test data cleaned.
- **PENDING commit + deploy (Anton):** the **header account widget** (3 files) + the **referral code**
  (schema, `src/lib/referral.ts`, register code-gen + backfill script, `?ref` capture + checkout +
  `submitOrder` + TOCTOU fix, webhook + admin reward-on-paid, `/account/referrals`) + all `docs/wiki/`
  from this session. Referral `db:push` already precedes this deploy (required — a logged-in checkout
  hits `discount_ledger`; guest checkout without `?ref` is safe).

## Known / accepted behavior

- **Referral non-stacking:** on crypto orders (the primary path) the referral adds no extra discount
  (crypto already 10%); it only reduces price on **manual** orders. Attribution + the referrer reward
  still fire on all referred orders. Reward credits are preserved (redeemed only when they're the sole
  reason for the 10%). Revisit if crypto-path uptake is weak (ADR 0014).
- Analytics `order_submitted` value = actual charged total; referral attribution lives in the DB.
- Legal/compliance copy unchanged; no money-back-guarantee language introduced anywhere.

## Next session — JOURNAL MIGRATION (301s)

Per Anton. Migrate the legacy SEO journal/blog hub into this platform with **301 redirects** from the
old URLs (preserve SEO equity — the business has ~5 years of organic content). Scope to define next
session; likely touches: content porting into the app (route group + MDX/rendering), a redirect map
(old → new paths) in `src/proxy.ts` or a redirects config, and the journal writing-rules page noted in
the backlog (`journal/writing-rules.md`). Start from [`../roadmap.md`](../roadmap.md) (Track B) and the
backlog in [`../index.md`](../index.md). Recon the legacy journal source first (in `docs/raw/legacy/`
or the live `lnnemml/ISRIB` site) for a complete URL inventory before building the redirect map.

## Related
- ADRs [0013](../decisions/0013-customer-accounts-auth.md) · [0014](../decisions/0014-referral-discount.md)
  · [0012](../decisions/0012-legacy-orders-import-and-customers.md) (the customers anchor).
- Detail summaries: [accounts v1](./2026-09-05-customer-accounts-v1.md) ·
  [referral phase 2](./2026-09-05-referral-discount-phase2.md).
- [`../log.md`](../log.md) (gate-by-gate) · [`../roadmap.md`](../roadmap.md).
