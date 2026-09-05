# ADR 0013 — Customer accounts + auth (bespoke, on the `customers` anchor)

**Status:** accepted · 2026-09-05 · Anton signed off the three forks in-session.

## Decision

Build **customer accounts** (email + password) on top of the existing `customers`
table (ADR 0012), using a **bespoke signed-cookie auth** — the *same* mechanism as the
admin gate (ADR 0011), NOT next-auth. We reuse **NORA's two-instance + isolated-cookie
*architecture*** (a fully separate session, own cookie, own proxy branch) but not
NORA's next-auth *library*.

Three forks, agreed with Anton:

1. **Auth mechanism → bespoke, extend ADR 0011.** `jose` JWT for the session +
   `node:crypto` (`scryptSync`, timing-safe compare) for password hashing. A second,
   customer-only cookie **`isrib_customer_session`** — fully isolated from the admin
   `isrib_admin_session`. Own server actions. Zero new dependencies (`jose`,
   `node:crypto`, `nanoid` are already in the tree).
   - *Why not next-auth:* ADR 0011 documented the whole next-auth-v5-beta bug cluster
     on Next 16 (dead `authorized` callback → unprotected routes, redirect loops,
     `.trim()` secret bug, SessionProvider freeze). Our admin gate already proves the
     bespoke pattern is clean on Next 16.3.3. One consistent auth mechanism app-wide
     beats two (admin bespoke + customer next-auth).
   - The "reuse NORA pattern" instruction (CLAUDE.md, ADR 0011 revisit) is satisfied by
     the *isolation architecture* — separate cookie + separate proxy matcher — which the
     bespoke approach delivers.

2. **Data model → promote the `customers` table** (do NOT add a separate `users`
   table). Add nullable `passwordHash` + `emailVerifiedAt` to `customers`. A legacy
   buyer who registers with their known email **instantly inherits** their full order
   history + LTV (already unified by `groupByCustomer()`), and later their referral
   code — no table duplication, no second email-anchor. Directly sanctioned by ADR
   0012's "may promote `customers` to the auth user table."

3. **Scope → accounts core first; referral discount is phase 2.** v1 ships auth +
   email verification + password reset + the `(account)` cabinet with unified order
   history. The **personal referral discount** (per-customer code, discount at
   checkout, attribution) is a clean follow-up build — it touches the server-side price
   recompute in `submitOrder`, so it is kept out of the auth gate.

## Data model deltas (re-`db:push`)

- `customers`: `+ passwordHash text` (nullable — legacy/guest rows have none until
  they register), `+ emailVerifiedAt timestamp` (nullable — set on verify).
- New **`verification_tokens`** table (NORA-style, dual-use): `identifier` (email, or
  `"verify:"+email` for email-verification), `token` (unique), `expires`. One-time —
  **delete-on-use**. Password-reset token = 1-hour expiry; email-verify = 24-hour.
- `orders.userId` (existing nullable placeholder) → stamped with the logged-in
  `customers.id` on new orders. **Cabinet read path stays email-join** (via
  `groupByCustomer`) so legacy history shows immediately; a full `orders.customerId`
  FK backfill is a later optional step (ADR 0012 revisit), not required for v1.

## Auth mechanism (mirrors ADR 0011, second cookie)

- **`src/lib/customer/auth.ts`** (new): `hashPassword`/`verifyPassword` (scrypt,
  `timingSafeEqual`), `createCustomerSession(customerId)` (jose JWT, sub=id),
  `verifyCustomerSession(token)`, `getCurrentCustomer()` (reads the cookie, returns the
  customer row or null). Node-only crypto stays out of Edge.
- **`src/proxy.ts`**: add a `/account/:path*` branch that verifies
  `isrib_customer_session` with `jose` (Edge-safe) and redirects unauth'd → 
  `/account/login?callbackUrl=…`. Keep `.trim()` on every secret. **Verify the build
  still shows `ƒ Proxy` registered** (the ADR 0011 rule).
- New env: `CUSTOMER_AUTH_SECRET` (separate HMAC key from `ADMIN_AUTH_SECRET`).

## Auth flows (server actions + pages, `src/app/actions/customerAuth.ts`)

- `/account/register` — name + email + password + confirm → hash, upsert onto the
  `customers` row (create if new; set `passwordHash` if a legacy row exists for that
  email), send verification email, redirect to signin.
- `/account/login` — email + password; block if `emailVerifiedAt` is null (offer
  resend); on success set the cookie, redirect to callbackUrl (default `/account`).
- `/account/logout` — clear the cookie.
- `/account/verify-email/[token]` — set `emailVerifiedAt`, delete token.
- `/account/reset-password` — email → always "check your email" (no account-existence
  leak); `/account/reset-password/[token]` — new password, delete token, redirect to
  login (no auto sign-in).
- Password guard: min 8 chars (match NORA); email lowercased everywhere. Emails via the
  existing `sendToCustomer()` Resend helper, from `orders@isrib.shop`.

## Cabinet (`(account)` route group)

- `(account)/account/layout.tsx` — server-side `getCurrentCustomer()` guard (defence in
  depth behind the proxy).
- `/account` — welcome, last orders, logout, links.
- `/account/orders` + `/account/orders/[id]` — full history (live + legacy, by email via
  the `groupByCustomer` data layer), order detail with tracking when shipped.

## Consequences

- First customer-facing auth in isrib-next. Kept minimal + Edge-safe per the ADR 0011
  rules. The `ChromeGate` currently hides header/footer on `/admin*`; account pages keep
  the normal storefront chrome.
- `submitOrder` gains an optional "attach to logged-in customer" step (stamp
  `orders.userId`); guest checkout unchanged (still email-only, `userId` null).
- 212 imported legacy customers can claim their account with their known email and see
  five years of history on day one.

## Revisit if

- Referral/loyalty lands → phase 2 (referral code on the customer, discount in the
  price recompute). · Social login or multi-device session revocation needed → add a
  `sessions` table (JWT-only has no server-side revoke today). · We outgrow bespoke →
  the ADR 0011/0013 revisit path to a managed provider (Clerk/WorkOS) still stands.

## See also

ADR [0011](0011-admin-panel-and-auth.md) (the bespoke admin gate this mirrors) ·
[0012](0012-legacy-orders-import-and-customers.md) (the `customers` anchor being
promoted). NORA reference: `NORA/docs/wiki/decisions/0013-customer-auth-architecture.md`,
`NORA/src/lib/customer-auth.ts`, `NORA/src/app/actions/customerAuth.ts`.
