# Session summary — 2026-09-05 (pm) · Customer accounts v1 (auth + cabinet)

> Read this + `log.md` (tail) + [ADR 0013](../decisions/0013-customer-accounts-auth.md) before
> continuing. This session built customer accounts end-to-end on the `customers` anchor (ADR 0012):
> email+password auth, email verification, password reset, and a guarded account cabinet with
> unified live+legacy order history. **Everything is built + build-green + routing/proxy
> runtime-verified, but the flow is GATED on Anton running `db:push` + setting one env var.**
> **Referral discount is phase 2 — not built.**

## What this session accomplished

Recon → agreed 3 architecture forks with Anton → filed ADR 0013 → 6 sequenced implementer tasks
(verifier on the auth core, prober on routing). No new dependencies.

### The 3 forks (ADR 0013)
1. **Bespoke auth, NOT next-auth** — extend the ADR 0011 admin pattern: `jose` JWT + `node:crypto`
   scrypt, second isolated cookie `isrib_customer_session`. Reuses NORA's *isolation architecture*,
   not its library — avoids the whole next-auth-v5-beta bug cluster ADR 0011 documented.
2. **Promote `customers`** — added nullable `password_hash` + `email_verified_at` to the existing
   table (not a new `users` table). A legacy buyer registering with their known email instantly
   inherits their history + LTV.
3. **Accounts core first, referral phase 2.**

### Built (6 tasks, all tsc + `next build` green)
1. **Schema** — `customers += password_hash, email_verified_at`; new `verification_tokens`
   (dual-use password-reset + email-verify, identifier prefix `"verify:"`, delete-on-use).
2. **`src/lib/customer/auth.ts`** — `hashPassword`/`verifyPassword` (scrypt, random salt,
   timingSafeEqual+length guard, never throws), `createCustomerSession(id)` (jose, `sub`=id, 30d),
   `verifyCustomerSession`, `getCurrentCustomer()`, `clearCustomerSession()`. `server-only`.
3. **`src/proxy.ts`** — added the `/account/:path*` gate: re-inlined jose-only verify with
   `CUSTOMER_AUTH_SECRET`, public whitelist (login/register/reset-password/verify-email + subpaths),
   redirect to `/account/login?callbackUrl=…`. Build still registers `ƒ Proxy`.
4. **`src/app/actions/customerAuth.ts`** + public pages under `(account)/account/`:
   register, login, logout, verify-email/[token], reset-password (request + [token] confirm).
   Legacy-row CLAIM on register; generic "invalid email or password" (no existence leak);
   verify-required-before-login (with resend); open-redirect-sanitized callback.
5. **Cabinet** — `(account)/account/(cabinet)/` guarded group (layout `getCurrentCustomer()` guard,
   scoped to the nested group so it never guards the public auth pages): `/account` home,
   `/account/orders`, `/account/orders/[id]`. New `src/lib/customer/orders.ts` (live-by-email +
   legacy, ownership by email match). Reused `formatCents`, status-badge, locked design tokens;
   `src/lib/admin/queries.ts` untouched.
6. **Checkout linkage** — `submitOrder` stamps `orders.userId = currentCustomer?.id ?? null`
   (guest checkout unchanged).

### Verification
- **Verifier (fresh context) APPROVED** the auth core: Edge-safe proxy, full cookie/secret
  isolation from admin, scrypt correctness, deleted-customer→null, secret `.trim()`.
- **Prober runtime (GET-only, no db:push): 9/9 PASS** — protected `/account*` → 307 to login with
  correct `callbackUrl`; public auth pages render with fields; `?registered=1` banner; admin gate
  un-regressed; clean dev boot, no runtime errors.

## ✅ SHIPPED + RUNTIME-VERIFIED (2026-09-05 pm)
Anton applied the gate (`db:push`, `CUSTOMER_AUTH_SECRET` local+Vercel, commit+deploy). LEAD then drove
the **full flow in a real browser** vs local dev (same Neon; verify tokens read from DB since test
emails receive no mail): **new signup** (register → login-before-verify BLOCKED → verify → login →
cabinet) and the **legacy CLAIM** marquee (register with a known email claims the existing row with NO
duplicate, preserves clientType/history, and `/account/orders` shows the legacy orders). All test data
cleaned up (`customers`=212, `verification_tokens`=0). The claim test used **synthetic
`@isrib-qa.test`** data — the auto-mode classifier correctly blocked using a real customer's email.
See the log gate for the step-by-step. The section below is retained as the historical hand-off.

## GATED ON ANTON (do these, then the flow works) — ✅ DONE
1. **`npm run db:push`** — applies `customers.password_hash`, `customers.email_verified_at`, and the
   `verification_tokens` table to Neon. Until then every register/login/reset POST throws a
   column-not-found error (expected).
2. **Set `CUSTOMER_AUTH_SECRET`** (a fresh random HMAC key, DISTINCT from `ADMIN_AUTH_SECRET`) in
   `.env.local` AND Vercel. Without it customer sessions silently fail to verify.
3. Verify/reset emails reuse the existing Resend sender (`FROM_EMAIL=orders@isrib.shop`) — no new mail
   config.
4. **Commit + deploy** the src changes (all of tasks 1–6) together with the docs (ADR 0013, this
   summary, log entries). Then runtime-test the full **register → verify-email → login → cabinet**
   flow on a preview/prod, ideally registering with a KNOWN legacy email to confirm the history+LTV
   inheritance.

## Flags / known follow-ups
- **verify-email mutates on GET** — one-time delete-on-use token via an external email link;
  acceptable for v1 (matches NORA). Revisit only if link-prefetch scanners become an issue.
- **Cabinet read path is email-join** (per ADR 0013). `orders.userId` is now stamped for new
  logged-in orders, but a full `orders.customerId` FK backfill of historical guest orders is a later
  optional step (ADR 0012 revisit).
- **`getCurrentCustomer()` returns the full row incl. `passwordHash`** — server-only; never forward to
  a client component (already respected). A stripped return type is a small optional cleanup.

## What's next
- **Phase 2 — personal referral discount** (leans on the per-customer history now in the DB): referral
  code per customer, discount applied in `submitOrder`'s server-side price recompute, attribution +
  referral history UI in the cabinet.
- Then the rest of the roadmap: journal migration (301s), analytics wiring (Pixel/CAPI/GA4/Clarity via
  `trackEvent`), migration-announce email to the imported roster + leads, §2 organic, §3 relaunch.

## Related
- [ADR 0013](../decisions/0013-customer-accounts-auth.md) · [ADR 0011](../decisions/0011-admin-panel-and-auth.md)
  (mirrored admin gate) · [ADR 0012](../decisions/0012-legacy-orders-import-and-customers.md) (the
  `customers` anchor promoted) · [`../log.md`](../log.md) (tail — gate-by-gate).
- NORA reference: `NORA/docs/wiki/decisions/0013-customer-auth-architecture.md`.
