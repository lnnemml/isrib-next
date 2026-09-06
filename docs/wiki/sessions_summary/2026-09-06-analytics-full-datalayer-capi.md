# Session summary — 2026-09-06 · Analytics: full dataLayer + CAPI

> Made analytics "повноцінна: via dataLayer + CAPI" with proper Meta dedup. Built +
> verifier-approved + prober-verified + **deployed + full E2E verified (GTM Preview +
> Meta Test Events) + cleaned up.** This was the pre-cutover blocker Anton wanted closed
> before moving `isrib.shop` — **DONE.** Next: cutover.

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
- **Follow-up slice — `ScrollDepthTracker`:** fires `scroll_depth` at 25/50/75/90, re-armed on
  route change (full SPA coverage), GA4-only. Replaced the GTM-native scroll approach (would
  double-count). Plus env-driven `META_CAPI_TEST_EVENT_CODE` in `server.ts` for Test-Events routing.

## Verification

- **Verifier: APPROVE** — all 10 hard constraints. Critically: no money-logic change; the
  full shared-`eventId` dedup chain (client Pixel + server CAPI + stored + webhook);
  correct hashing (em/ph/external_id hashed, fbp/fbc raw); schema additive; IDs preserved
  (Pixel `1228338595957402`, GA4 `G-LJEBV5NPCT`, Clarity `wci5xmxfnu`); `order_submitted`
  still primary.
- **Prober: PASS** (feasible headless) — bootstrap no-ops with empty env; injects GTM +
  fbevents + `fbq("init")` + noscript fallbacks when configured; zero raw analytics calls
  in components; `page_view` GA4-only; product_viewed wired; build-green.

## Deployment + E2E verification (DONE — post-deploy)

Anton ran `db:push` (adds `orders.event_id`), created + published GTM container
**`GTM-KKX85H6G`** (DLV + triggers + GA4 tags + Clarity per the runbook), and moved the
CAPI secrets from the old `isrib-analytics-api-fbqy` project (`FB_ACCESS_TOKEN`→
`META_CAPI_ACCESS_TOKEN`, `GA_API_SECRET`→`GA4_API_SECRET`). Then deployed.

- **Server CAPI verified in Meta Test Events** (pixel `1228338595957402`): a LEAD direct probe
  (HTTP 200, `events_received:1`) AND Anton's **real app checkout** both landed as Server
  `InitiateCheckout` events → the app `submitOrder`→CAPI integration is proven, not just the
  raw endpoint. (Meta Test Events has strong latency — the initial "nothing shows" was that,
  plus browsing fires only client events.)
- **GTM Preview verified** (Anton): tags fire correctly.
- **Client dataLayer verified** (LEAD, deployed site): `product_viewed` (`content_ids` array),
  `page_view`, `scroll_depth` (25/50) push with correct params; `event_id` only on `order_submitted`.
- **Dedup:** client + server share one `event_id` (code-guaranteed). Full browser+server
  "Deduplicated" view needs an unblocked browser (the local Chrome adblocker 503s gtm.js +
  fbevents.js — [[analytics-capi-verified-and-adblock-caveat]]); real users (~70%) get it.
- **Cleanup done (Anton):** removed `META_CAPI_TEST_EVENT_CODE` from Vercel prod + `.env.local`
  + redeploy; deleted the synthetic test order; committed the pending slices (ScrollDepthTracker
  + env-driven test_event_code).

**Analytics = functionally complete + verified.** The env-driven `META_CAPI_TEST_EVENT_CODE`
stays in the code (inert without the env var) for future Test-Events runs — never set in prod.

## Related
- [`../architecture/analytics-gtm-runbook.md`](../architecture/analytics-gtm-runbook.md) (the setup steps) ·
  [`../architecture/analytics.md`](../architecture/analytics.md) (status) · [ADR 0005](../decisions/0005-analytics-preservation.md)
- [`../log.md`](../log.md)
