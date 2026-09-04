# ADR 0011 — Admin panel (BI dashboard) + minimal cookie auth (NOT next-auth)

**Status:** accepted · 2026-09-04 · task **1.7**. Informed by a post-mortem of NORA's
admin-auth failures (below). Also closes the manual-paid gap flagged after G2 Step 4.

## Decision

Build a full **business-intelligence admin panel** for the single operator, protected by a
**minimal signed-cookie password gate — deliberately NOT next-auth**.

### Auth: one password + a signed httpOnly cookie, gated in `middleware.ts`

- One `ADMIN_PASSWORD` env var (plaintext, single operator) + `ADMIN_AUTH_SECRET` (HMAC key).
- `/admin/login` — a **Server Action** compares the password (`crypto.timingSafeEqual`, env
  value `.trim()`-ed), then signs a short-lived JWT (via **`jose`** — Edge-safe) and sets an
  **httpOnly, secure, SameSite=Lax** cookie (`isrib_admin_session`). Logout clears it.
- **`src/proxy.ts`** verifies the cookie JWT with `jose` on `/admin*` (except `/admin/login`);
  redirect to `/admin/login` on invalid. **All checks live in the proxy handler body.**
  **⚠️ Next 16 rename (corrected 2026-09-04):** in Next.js **16**, Middleware was renamed to
  **Proxy** — the interceptor file is **`proxy.ts`**, exporting a `proxy` function (`middleware.ts`
  is a deprecated alias that will break). And because this repo keeps `app/` under `src/`, the file
  must be **`src/proxy.ts`** — a repo-root `proxy.ts`/`middleware.ts` is **silently ignored** (empty
  middleware-manifest, gate never runs = unprotected /admin — the exact NORA failure class, caught by
  checking the build registered `ƒ Proxy`). NORA (Next 16.2.9) used `middleware.ts`; the name inverted
  by 16.3.3. **RULE: verify the build output shows the Proxy is registered.**
- No bcrypt, no DB, no adapter, no next-auth. `jose` verify is the only thing in middleware
  (Edge-safe). ~30 lines.

### Why NOT next-auth — the NORA post-mortem (do not repeat)

NORA used next-auth v5 beta on Next 16 for a single-admin panel and hit a **cluster** of bugs:
1. **The `authorized` callback is dead code** when middleware is written as `auth(async (req)=>…)`
   — it only runs when you `export default auth`. → `/admin` was silently **unprotected**. **THE
   RULE: with the wrapped form, every access check must be in the handler body.**
2. Interceptor file-naming (NORA on 16.2.9 renamed `proxy.ts`→`middleware.ts`; **our 16.3.3 is the
   opposite — `src/proxy.ts`**, see the corrected note above) + matcher bugs → **infinite redirect
   loop** on `/admin/login`.
3. A trailing newline / casing in the `ADMIN_PASSWORD_HASH` env var **silently broke
   `bcrypt.compare`** → correct password rejected. **RULE: `.trim()` every secret from env.**
4. Client `signIn` without a `SessionProvider` **froze** the login form.

For "let one person in," that beta tax is not worth it. A signed-cookie gate avoids the entire
class. (Adopt next-auth only if/when real **customer** accounts land — then reuse NORA's proven
two-instance + isolated-cookie pattern; not needed now.) We also avoid the lander's
`?secret=…` query form — it leaks into logs/history.

### Panel scope (task 1.7)

- **Orders table** — filter/sort; per-order actions: **change status**; **mark paid** (manual
  orders → fires the payment-confirmed/shipping email — closes the manual-paid gap);
  **enter tracking number** → **auto-sends the shipped email**.
- **Attribution** — render where each order came from (`traffic_type` organic/referral/paid +
  full UTM), already in the DB.
- **Group orders by customer** (by email).
- **BI (last 30 days):** **revenue** = Σ `total_price` of paid/fulfilled orders (ratified: this
  is gross **revenue/sales**, not COGS-profit — no cost data collected); **unpaid : paid ratio**;
  plus AOV, top products, revenue trend, per-UTM-source breakdown, "needs action" queue
  (paid w/o shipping address; shipping provided but not shipped), country breakdown.

### Schema additions (re-`db:push`)

Add to `orders`: `tracking_number`, `tracking_carrier`, `shipped_at` (all nullable). Status enum
unchanged — `fulfilled` = shipped (set when tracking is entered). No cost column (revenue model).

## Consequences

- **Closes the manual-paid gap:** the admin "mark paid" action is the missing manual-order
  `paid` transition (crypto is the webhook; manual is the admin). Fires the payment-confirmed
  email with the `/shipping/<token>` link (ADR 0010).
- **New shipped-email template** (tracking number + carrier) — Resend, light theme.
- **Auth is app-wide infra:** `middleware.ts` (new) + `jose` dep. First auth in isrib-next
  (Track A had none). Kept minimal + Edge-safe per the NORA rules above.
- Env: `ADMIN_PASSWORD`, `ADMIN_AUTH_SECRET` in `.env.local` (+ prod).

## Revisit if

Real customer accounts / multi-admin roles are needed → adopt next-auth then, reusing NORA's
two-instance + isolated-cookie pattern (NORA `decisions/0013`). True margin/profit needed → add
per-SKU cost config and switch the BI metric from revenue to revenue−COGS.

## See also

[`../architecture/admin-panel.md`](../architecture/admin-panel.md) — the panel spec (queries,
UI, actions). NORA post-mortem source: `NORA/docs/wiki/log.md:935-973`, `NORA/middleware.ts`,
`NORA/src/lib/auth.config.ts`.
