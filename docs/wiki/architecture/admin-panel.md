# Architecture — Admin Panel (BI dashboard, task 1.7)

> Single-operator business-intelligence + order-management panel. Auth + scope ratified in
> [ADR 0011](../decisions/0011-admin-panel-and-auth.md). Applies the NORA admin-auth
> post-mortem (minimal signed-cookie gate, NOT next-auth).

## 1. Auth (minimal, Edge-safe — the NORA lesson applied)

- Env: `ADMIN_PASSWORD` (plaintext, single operator), `ADMIN_AUTH_SECRET` (HMAC key for the JWT).
- `src/lib/admin/auth.ts` — `jose`-based: `createSession()` (sign a short-lived JWT),
  `verifySession(token)` (verify), cookie name `isrib_admin_session` (httpOnly, secure,
  SameSite=Lax). Env values `.trim()`-ed. Password compared with `crypto.timingSafeEqual`.
- `src/app/(admin)/admin/login/page.tsx` — Server Component + **Server Action** `login(formData)`:
  compare password → `createSession()` → set cookie → `redirect("/admin")`. No client `signIn`.
  A `logout` action clears the cookie.
- **`src/proxy.ts`** (Next 16 renamed Middleware→Proxy; MUST be `src/proxy.ts` — under `src/` since
  `app/` is there; a root file is silently ignored → unprotected /admin) — `export async function
  proxy(req)`, matcher `["/admin", "/admin/:path*"]`. On `/admin` + `/admin/*` EXCEPT `/admin/login`:
  read the cookie, verify the JWT with `jose`; redirect to `/admin/login` if invalid. **Check is in
  the handler body** (the #1 NORA rule). jose-only re-inlined (no node:crypto/db import). **Verify the
  build shows `ƒ Proxy` is registered.**

## 2. Schema deltas (re-`db:push`)

Add to `orders` (all nullable): `tracking_number`, `tracking_carrier`, `shipped_at`. Status enum
unchanged; `fulfilled` = shipped (set when tracking is saved). No cost column (revenue model).

## 3. Data layer (`src/lib/admin/queries.ts` — server-only, Drizzle)

- `listOrders(filters)` — orders + their items (or a compact per-order summary), newest first;
  optional status/traffic filters.
- `groupByCustomer()` — group orders by `email`: name, order count, total paid, last order.
- `biSummary()` — last-30-days aggregates: **revenue** = Σ `total_price` where status ∈
  {paid, fulfilled} AND created_at ≥ now−30d; order counts by status; **unpaid:paid ratio**;
  AOV; top products (join order_items); revenue-by-traffic_type; revenue-by-utm_source;
  "needs action" counts (paid & `shipping_details_at IS NULL`; `shipping_details_at` set &
  `shipped_at IS NULL`); country breakdown. All money in integer cents; format at the edge.

## 4. Admin actions (`src/app/(admin)/admin/actions.ts`, "use server", auth-guarded)

Each re-verifies the admin session server-side (defence in depth beyond middleware):
- `setStatus(orderId, status)` — update status; `revalidatePath`.
- `markPaid(orderId)` — status → paid + fire `paymentConfirmed` email (the `/shipping/<token>`
  link) + ops note. **This is the manual-order paid transition** (crypto uses the webhook). Idempotent.
- `saveTracking(orderId, trackingNumber, carrier)` — set tracking + `shipped_at` + status →
  fulfilled + **auto-send the shipped email** (new template) with the tracking number/carrier.

## 5. UI (`src/app/(admin)/admin/page.tsx` + components)

Dashboard, dark-neutral admin styling (utility, not the marketing design system):
- **BI cards row:** 30-day revenue, paid/unpaid, AOV, order count; a small revenue trend.
- **Attribution panel:** revenue & orders by traffic_type + top UTM sources.
- **Needs-action queue:** paid-without-address, awaiting-shipment.
- **Orders table:** number, date, customer (email), items summary, total, status (inline change),
  attribution chip, tracking input; expand → full shipping address + per-order actions.
- **Customers view:** grouped by email with lifetime totals.

## 6. Emails

New `shipped` template (Resend, light theme) — tracking number + carrier + "your order shipped".
Reuses the `layout()`/`itemsTable()` helpers. `markPaid` reuses `paymentConfirmed` (§4).

## 7. Verification

- Auth: middleware blocks `/admin` unauthenticated → redirect to login; correct password →
  cookie set → `/admin` loads; wrong password rejected; `/admin/login` never loops. **Runtime-test
  the auth first** (the NORA failure mode).
- Actions: mark-paid fires the shipping email + flips status; saveTracking sends the shipped email
  + sets fulfilled; BI numbers reconcile against seeded test orders. Then cleanup.

## Related

[ADR 0011](../decisions/0011-admin-panel-and-auth.md) · [`data-model.md`](./data-model.md) ·
[`checkout-architecture.md`](./checkout-architecture.md) · [`manual-payment-flow.md`](./manual-payment-flow.md)
