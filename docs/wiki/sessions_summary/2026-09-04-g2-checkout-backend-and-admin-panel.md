# Session summary — 2026-09-04 · G2 checkout backend + admin BI panel

> Read this + `log.md` (tail) + `roadmap.md` before continuing. This session built the
> **entire G2 checkout backend** (5 steps), reshaped checkout to a **friction-less DR flow**
> (ADR 0010), and built a **full BI admin panel** (task 1.7). Most of it is runtime-verified
> on localhost; the remaining work before cutover is a real-domain email + a preview e2e.

## What this session accomplished

Took the project from "content migrated, G1 closed" to **a functionally complete commerce
backend + admin panel** — everything needed to take and fulfil orders, minus the cutover
perimeter (real email domain, preview e2e).

### Day-1.5 audit + planning (before building)
- Deep audit of `NORA` (platform ref) + `isrib-a15-lander` (DR ref) order backends →
  **verdict: the whole mechanism fits in Neon**; Upstash Redis dropped entirely; QStash kept
  for nurture only (Anton's call, stronger send-time guard). Ratified in **ADR 0009**.
- Verified externals: Vercel **Hobby cron = once/day** (inadequate for T+2h nurture); **Resend
  supports native scheduling** (recorded as the QStash fallback).

### G2 checkout backend — all 5 steps built + runtime-verified
1. **DB foundation** — `orders` + `order_items` (Drizzle, **neon-serverless Pool driver** for
   atomic transactions), `db:push` to Neon. prober 5/5 (atomic multi-line insert, rollback,
   idempotency 23505, cascade).
2. **`submitOrder`** — transactional insert from the client cart, **server-side price recompute**
   (never trusts client prices), idempotency key + a **23505 TOCTOU recovery**, `order_submitted`
   analytics. Verified: real multi-item order (A15 2g + MPEP 1g) → Neon with recomputed prices.
3. **Resend emails** — order-received (manual: real PayPal/USDT/BTC/LTC ported from the lander) +
   ops alert + payment-confirmed; **light-theme, multi-item** templates. Fixed a **latent
   false-stamp bug** (Resend returns `{error}` not a throw → senders now throw on error). Verified:
   send accepted by Resend (`delivered@resend.dev`), `confirmation_email_sent_at` stamped.
4. **NowPayments** — `createInvoice` + **HMAC-SHA512 IPN webhook** (timing-safe, idempotent,
   always-200). Verified: real invoice created (redirect to nowpayments.io); signed IPN simulation
   → status `paid`; replay → no-op; forged sig → 401.
5. **QStash nurture** — 2 delayed abandoned-checkout emails (producer + signature-verified
   consumer, Neon-guarded). Verified: producer publish (messageId), consumer 401 on unsigned,
   template render. **Full round-trip deferred to a preview** (QStash can't reach localhost).

### ADR 0010 — friction-less DR checkout (reshaped Step 2)
- Audited the lander's checkout: **3 typed fields** (name/email/country), **no address**;
  shipping collected **after** payment. Adopted for isrib-next (multi-item cart supplies items).
- Checkout stripped to name/email/country + payment; **`/shipping/<token>`** post-payment form
  (unguessable token, writes to Neon). Verified end-to-end: short order → success → token →
  address saved + read-only revisit.

### Task 1.7 — admin BI panel (ADR 0011)
- **Auth:** minimal **signed-cookie gate** (`jose` JWT, `ADMIN_PASSWORD`), **NOT next-auth** —
  after a NORA auth post-mortem (the `authorized`-callback-is-dead-code trap etc.). Caught two
  Next-16 gotchas: **Middleware→Proxy rename** (`src/proxy.ts`, must be under `src/`, a root file
  is silently ignored = unprotected /admin). Verified: gate blocks/redirects, login/logout,
  forged-token probes all failure-closed.
- **Dashboard:** 30-day revenue, orders, AOV, paid/unpaid ratio, UTM/traffic attribution, top
  products, geography, needs-action queue, orders table (inline status / mark-paid / tracking),
  group-by-customer. Chrome-isolated from the marketing site. Verified with seeded data + a live
  `markPaid` (status→paid, dashboard recomputed, email non-fatal).
- **Closes the last G2 functional gap:** `markPaid` is the manual-order paid transition (crypto =
  webhook); `saveTracking` sends the new `shipped` email.

## Decisions filed this session (ADRs)
- **[ADR 0009](../decisions/0009-checkout-backend-neon-qstash.md)** — checkout backend: Neon-only
  core + QStash for nurture; neon-serverless driver; 4 hardening improvements.
- **[ADR 0010](../decisions/0010-frictionless-dr-checkout.md)** — minimal checkout form +
  post-payment `/shipping/<token>` form.
- **[ADR 0011](../decisions/0011-admin-panel-and-auth.md)** — admin BI panel + minimal cookie auth
  (NORA post-mortem; the Middleware→Proxy correction).
- Specs: [`checkout-architecture.md`](../architecture/checkout-architecture.md),
  [`admin-panel.md`](../architecture/admin-panel.md); reconciled `data-model.md`, `manual-payment-flow.md`.

## KNOWN GAPS / follow-ups before cutover (do these next)
1. **Real Resend domain** — verify `send.isrib.shop` in Resend + swap `FROM_EMAIL`. Until then
   only the account owner (`isrib.shop@protonmail.com`) + `delivered@resend.dev` receive; ops
   alerts to a non-owner `ADMIN_EMAIL` fail non-fatally. **Email DNS is independent of the website
   cutover.** (Interim: set `ADMIN_EMAIL=isrib.shop@protonmail.com` to receive ops alerts now.)
2. **Preview deploy + full e2e** — a real **multi-item test order** on a Vercel preview (public
   URL) → confirms the QStash round-trip (delayed delivery) + real email delivery → **G2 green**.
3. **Prod env vars on Vercel:** `POSTGRES_URL*`, `RESEND_API_KEY`/`FROM_EMAIL`/`ADMIN_EMAIL`,
   `NOWPAYMENTS_API_KEY`/`NOWPAYMENTS_IPN_SECRET`, `QSTASH_*`, `NEXT_PUBLIC_BASE_URL`,
   **`ADMIN_PASSWORD` + `ADMIN_AUTH_SECRET`** (fresh secret). `.env.local` is local-only.
4. **NowPayments IPN URL** at cutover → point at the new `/api/webhooks/nowpayments` (or rely on
   the per-invoice callback).
5. **Cutover:** no DNS move until a real order is green (ADR 0003/0004); old deploy = rollback.
6. **Minor cleanups (non-blocking):** single-source the payment addresses in `templates.ts` (they
   inline the `payment-details.ts` constants — fund-safety); consumer `JSON.parse` inside try/catch;
   abandoned-email #1 "Danylo, You placed" capitalization; deep `redirect-error` import → `unstable_rethrow`.

## Git / housekeeping
- **Large uncommitted batch** at session end (G2 Step 5 QStash + all of task 1.7 auth/schema/backend/
  dashboard + this session's wiki). Anton commits. Suggested breakdown:
  1. `feat(checkout): QStash abandoned-checkout nurture (G2 step 5)`
  2. `feat(admin): auth foundation — jose cookie gate (src/proxy.ts)`
  3. `feat(admin): BI dashboard + order actions + shipped email (task 1.7)`
  4. `docs(wiki): ADR 0009/0010/0011 + checkout/admin specs + session log`
- Local **test** admin creds are in `.env.local` (gitignored) — replace for prod.
- New deps: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`, `nanoid`, `ws`, `resend`,
  `@upstash/qstash`, `jose`.

## What's next (Anton's roadmap — tomorrow: cutover + manual gate, then these)

Immediate: **cutover** (real domain email, preview e2e, manual gate) → G2 green.

Then (Anton's planning numbers; note 1.6/1.7 labels differ from the earlier port numbering):
- **Customer accounts** — auth, password reset/recovery, password-strength safeguard, orders
  inside the cabinet, **personal referral discount**. (Reuse NORA's two-instance + isolated-cookie
  auth pattern — NORA `decisions/0013`; the admin gate is separate.)
- **Journal** — base structure; migrate `isrib-research.com` articles one-at-a-time with 301s.
- **Analytics wiring** — Pixel, CAPI, GA4, Clarity; **everything through the dataLayer** (the
  `trackEvent`/`trackServerEvent` layer already exists, ADR 0005; wire the call sites + IDs).
- **Migration-announce email** — announce the move + new features; offer a fresh discount to spark
  a re-order wave.
- **§2 Organic strategy** — Reddit/X presence + journal content plan + distribution channels +
  YouTube video format for ISRIB; a concrete what/where/when posting calendar.
- **§3 Landing + paid-traffic relaunch** — belief-installing landing (NORA-style, many sections,
  premium visual, image-heavy; open Q: UGC video or not for this audience); generate all imagery +
  A/B points; a 3–4 email lead-nurture flow (one belief per email); ad creatives (prior winner:
  "wasted money and why A15 will work now"); relaunch on lookalikes (1% / 2–5%), scale winners to
  CAC<100 / AOV 200 / CTR>5% / CPC<1.5.

## Related
- [`../log.md`](../log.md) (tail — gate-by-gate detail) · [`../roadmap.md`](../roadmap.md)
- [`../architecture/checkout-architecture.md`](../architecture/checkout-architecture.md) ·
  [`../architecture/admin-panel.md`](../architecture/admin-panel.md)
