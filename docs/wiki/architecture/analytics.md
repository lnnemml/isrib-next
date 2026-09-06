# Architecture — Analytics

> From ISRIB_Analytics_Summary v2–v4. **Migrate 1:1 — preserve IDs, don't rebuild.**
> See [ADR 0005](../decisions/0005-analytics-preservation.md).

## IDs to preserve (do not regenerate)

| Param | Value |
|---|---|
| GA4 | `G-LJEBV5NPCT` |
| Meta Pixel | `1228338595957402` |
| Reddit Pixel | `a2_hz77nm0joupm` |
| Clarity (shop) | `wci5xmxfnu` |
| Clarity (landing) | `wci589fgdr` |
| Analytics API | `isrib-analytics-api-fbqy.vercel.app` |

GTM containers were per-domain (GTM-M2QCB45Q shop, GTM-58KVC9F4 landing,
GTM-W5QH2NR5 research). Single-domain collapse means a single container going
forward — migrate tags incrementally; never full-import a container (it overwrites).

## Unified layer (the only analytics API in the codebase)

- `src/lib/analytics/client.ts` — `trackEvent(name, props?, eventId?)` fires GTM
  dataLayer + fbq + Clarity. `GA4_ONLY_EVENTS` (journal_* + `page_view`) stop at
  dataLayer (no Meta fan-out).
- `src/lib/analytics/server.ts` — `trackServerEvent(name, props)` fires Meta CAPI
  (graph v20.0) + GA4 Measurement Protocol.
- `src/lib/analytics/types.ts` — Window extensions + `EventParams` (supports arrays
  for `content_ids`).

**Never call `fbq()` / `dataLayer.push()` / `clarity()` directly in components** — the
only exceptions are the bootstrap components `src/components/analytics/{GoogleTagManager,MetaPixel}.tsx`.

## Implementation status (built + verified 2026-09-06)

Firing model = **hybrid**: **Meta Pixel loads directly** (`MetaPixel.tsx`) so
`trackEvent` fires `fbq(... {eventID})` for clean CAPI dedup; **GA4 + Clarity are GTM
tags**. Bootstrap (`GoogleTagManager.tsx` + `MetaPixel.tsx`, env-driven, no-op when
unset) is wired into the root layout. **The GTM container config + env values are a
manual step → [`analytics-gtm-runbook.md`](./analytics-gtm-runbook.md).**

- **Dedup wired:** client `order_submitted` (Pixel InitiateCheckout) + server CAPI share
  one `eventId`, stored on `orders.event_id`; the NowPayments webhook reuses it for the
  Purchase. **CAPI match quality:** hashed `em`/`ph`/`external_id` + raw `_fbp`/`_fbc`.
- **Coverage:** `product_viewed` (product pages → ViewContent), `page_view` (SPA route
  changes, GA4-only), `email_subscribed` (new-lead registration → Lead, server CAPI),
  journal `journal_*` (GA4-only).
- **GATED ON ANTON:** `npm run db:push` (adds `orders.event_id`; must precede deploy) +
  create/publish the GTM container + set `NEXT_PUBLIC_GTM_ID` + synthetic E2E in Meta
  Test Events. Full E2E not yet run (needs those). See the runbook §5.

## 2-event conversion model (keep)

| Event | Fires | Purpose |
|---|---|---|
| `order_submitted` | checkout, post-successful submit | **Primary Meta optimization signal** (maps to InitiateCheckout) |
| `order_confirmed` | admin confirms payment | Internal revenue tracking |

Deduplication: shared `event_id` between browser pixel and server CAPI (same
`orderId`). Meta counts once.

## Critical rule that carries over

**Meta "Purchases" tracks `order_submitted` (form submission), not confirmed
payment.** Real ROAS/CAC must be computed on confirmed-only orders. This is a
reporting discipline, not a code setting.

## What NOT to break

- `order_submitted` stays primary conversion (campaign optimization depends on it).
- GA4 custom dimensions appear 24–48h after first event — expect a lag window
  post-cutover, not a bug.
- Adblockers block GTM/Clarity/GA4 client for ~30% — normal; CAPI covers purchases
  server-side.

## Related
- [`../decisions/0005-analytics-preservation.md`](../decisions/0005-analytics-preservation.md)
- [`folder-structure.md`](./folder-structure.md)
