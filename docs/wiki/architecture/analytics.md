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

- `src/lib/analytics/client.ts` — `trackEvent(name, props?)` fires GTM dataLayer +
  fbq + Clarity simultaneously.
- `src/lib/analytics/server.ts` — `trackServerEvent(name, props)` fires Meta CAPI +
  GA4 Measurement Protocol.
- `src/lib/analytics/types.ts` — Window interface extensions.

**Never call `fbq()` / `dataLayer.push()` / `clarity()` directly in components.**

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
