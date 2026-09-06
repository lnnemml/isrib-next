# Session summary — 2026-09-06 · Analytics: full dataLayer + CAPI

> Made analytics "повноцінна: via dataLayer + CAPI" with proper Meta dedup. Built +
> verifier-approved + prober-verified (feasible-headless). **Not deployed; GATED on
> Anton (db:push + GTM container + synthetic E2E).** This is the pre-cutover blocker
> Anton wanted closed before moving `isrib.shop`.

## Starting state (recon)

The unified `trackEvent`/`trackServerEvent` layer existed and **Meta CAPI + GA4
Measurement Protocol worked server-side**, BUT: the browser side was **never
bootstrapped** (no GTM / Pixel / Clarity injected — `trackEvent`'s `fbq`/`clarity`
calls were silent no-ops), and **conversion dedup was one-sided** (checkout never fired
a client `order_submitted`; the webhook `order_confirmed` carried no `event_id`).

## Decisions (with Anton)

- **Firing model: hybrid** — Meta Pixel loads **directly in code** (clean eventID dedup);
  **GA4 + Clarity via GTM tags**.
- **GTM: new container** — bootstrap is env-driven (`NEXT_PUBLIC_GTM_ID`), no-op until Anton
  creates the container + pastes the id.
- **Scope: full** — `orders.event_id` column + webhook Purchase dedup + `_fbp`/`_fbc`/phone/
  external_id CAPI match quality (→ `db:push` gate; touches checkout **G2**).
- **Coverage:** Clarity + product_viewed + page_view + email_subscribed. **Reddit deferred.**

## What shipped (3 slices)

- **A — bootstrap:** `src/components/analytics/GoogleTagManager.tsx` + `MetaPixel.tsx`
  (env-driven, no-op when unset), wired into the root layout. Next-16 `next/script`
  `afterInteractive` (doc-cited).
- **B — dedup + match quality [G2]:** client `order_submitted` Pixel fire reusing the
  server's `eventId`; `orders.event_id` column (nullable, additive); `submitOrder` stores
  it + passes CAPI match fields; `server.ts` `user_data` = hashed `em`/`ph`/`external_id`
  + raw `_fbp`/`_fbc`; NowPayments webhook reuses `order.event_id` for the Purchase.
  **No pricing/discount/referral/idempotency logic changed.**
- **C — coverage:** `EventParams` widened for arrays (`content_ids`); `ProductViewTracker`
  (product_viewed → ViewContent on product pages); `RouteChangeTracker` (page_view on SPA
  route change, GA4-only); `email_subscribed` (→ Lead, server CAPI) on new-lead registration.

## Verification

- **Verifier: APPROVE** — all 10 hard constraints. Critically: no money-logic change; the
  full shared-`eventId` dedup chain (client Pixel + server CAPI + stored + webhook);
  correct hashing (em/ph/external_id hashed, fbp/fbc raw); schema additive; IDs preserved
  (Pixel `1228338595957402`, GA4 `G-LJEBV5NPCT`, Clarity `wci5xmxfnu`); `order_submitted`
  still primary.
- **Prober: PASS** (feasible headless) — bootstrap no-ops with empty env; injects GTM +
  fbevents + `fbq("init")` + noscript fallbacks when configured; zero raw analytics calls
  in components; `page_view` GA4-only; product_viewed wired; build-green.
- **Blocked-on-gate (not run):** order→CAPI→webhook dedup E2E (needs db:push), GTM tag
  firing (needs the real container), Meta Test Events dedup (needs the real pixel + test code).

## GATED ON ANTON (in order)

1. **`npm run db:push`** — adds `orders.event_id`; **must precede deploy** (a checkout writes
   it). Additive/nullable — safe (choose "no truncation" if prompted, like the referral push).
2. **Create + publish the GTM container**, set `NEXT_PUBLIC_GTM_ID`, and confirm the Pixel /
   GA4 / Clarity / `META_CAPI_ACCESS_TOKEN` / `GA4_API_SECRET` envs in Vercel. Configure the
   GTM tags per [`../architecture/analytics-gtm-runbook.md`](../architecture/analytics-gtm-runbook.md)
   (GA4 config with pageview OFF; GA4 event tags; Clarity tag; **do NOT add a Meta Pixel tag**).
3. **Synthetic E2E** ([[qa-use-synthetic-not-real-customers]]) — GTM Preview + Meta Events
   Manager Test Events (confirm `InitiateCheckout` counted once = deduped) + GA4 DebugView;
   clean up after.

## Related
- [`../architecture/analytics-gtm-runbook.md`](../architecture/analytics-gtm-runbook.md) (the setup steps) ·
  [`../architecture/analytics.md`](../architecture/analytics.md) (status) · [ADR 0005](../decisions/0005-analytics-preservation.md)
- [`../log.md`](../log.md)
