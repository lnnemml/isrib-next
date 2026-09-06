# Architecture — Analytics GTM Setup Runbook

> The manual configuration Anton must do in the **GTM web UI** + the **env vars** to
> set, to activate the analytics built in code (2026-09-06). The code half is done +
> verified; this is the half that lives outside the repo. Firing model = **hybrid**
> (ADR 0015-era decision): Meta Pixel loads **directly in code**; **GA4 + Clarity are
> GTM tags**. See [`analytics.md`](./analytics.md) and [ADR 0005](../decisions/0005-analytics-preservation.md).

## 1. Env vars (set locally + in Vercel)

| Var | Value | Consumed by |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | **the NEW container id `GTM-XXXXXXX`** (pending — Anton creates it) | `GoogleTagManager.tsx` (dataLayer + gtm.js) |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1228338595957402` | `MetaPixel.tsx` (base code) + `server.ts` (CAPI) |
| `NEXT_PUBLIC_GA4_ID` | `G-LJEBV5NPCT` | `server.ts` (GA4 MP). **Client GA4 is via the GTM tag** (put the ID in the tag). |
| `NEXT_PUBLIC_CLARITY_ID` | `wci5xmxfnu` | Not consumed in code (Clarity is a GTM tag — put the ID in the tag). |
| `META_CAPI_ACCESS_TOKEN` | (secret) | `server.ts` CAPI — **server only, never shipped** |
| `GA4_API_SECRET` | (secret) | `server.ts` GA4 MP — **server only** |

The bootstrap components **no-op when their env id is absent** — nothing fires until
`NEXT_PUBLIC_GTM_ID` + `NEXT_PUBLIC_META_PIXEL_ID` are set.

## 2. GTM container setup (new container)

1. **Create** a new GTM **Web** container → copy its `GTM-XXXXXXX` → set
   `NEXT_PUBLIC_GTM_ID` (local `.env.local` + Vercel).
2. **GA4 Configuration tag** — GA4 measurement ID `G-LJEBV5NPCT`. Fire on **Initialization
   – All Pages**. **Turn OFF "Send a page view event when this configuration loads"**
   (we push our own `page_view` dataLayer event — see step 4, avoids double-count).
3. **GA4 Event tags** — one per dataLayer event we push, each reading params from
   dataLayer variables (step 6). Create tags triggered by a **Custom Event** trigger
   matching each event name:
   - `order_submitted` (params: `value`, `currency`, `content_ids`, `num_items`, `event_id`)
   - `order_confirmed` (params: `value`, `currency`, `event_id`)
   - `product_viewed` (params: `content_ids`, `content_name`, `value`, `currency`)
   - `page_view` (param: `page_path`)
   - `journal_cta_click` / `journal_article_read` / `journal_toc_click`
     (params: `cta_location` / `article_slug` etc.)
4. **`page_view` for SPA nav** — the app pushes a `page_view` dataLayer event on every
   client-side route change (`RouteChangeTracker`). The GA4 Event tag above captures it.
   (Initial load: GA4 config init + the Meta Pixel base `PageView` cover it.)
5. **Microsoft Clarity tag** — add Clarity (community template or Custom HTML) with id
   `wci5xmxfnu`, fire on **All Pages**. Once it loads, `window.clarity` exists and
   `trackEvent`'s Clarity tagging calls start working (they're guarded until then).
6. **dataLayer variables** — create GTM variables for: `event_id`, `value`, `currency`,
   `content_ids`, `num_items`, `content_name`, `page_path`, plus the journal params.
   Map them into the GA4 event tags.
7. **Publish** the container.

## 3. Do NOT do these in GTM

- **Do NOT add a Meta Pixel tag** — the Pixel base code loads **directly in code**
  (`MetaPixel.tsx`). A GTM Pixel tag would double-fire every event.
- **Do NOT full-import** an old container — migrate tags by hand (ADR 0005; a full
  import overwrites).
- **Reddit Pixel** (`a2_hz77nm0joupm`) is **deferred** (not selected this session). When
  wanted: add it as a GTM tag firing on the relevant conversion events.

## 4. Dedup — how it works (already wired in code)

- `order_submitted`: the browser Pixel fires `InitiateCheckout` with `eventID = X`
  (`checkout/page.tsx`), and the server CAPI fires the same event with `event_id = X`
  (`submitOrder.ts`). **Meta dedups on `event_name` + `event_id` → counted once.** The
  eventId is minted once on the checkout page and reused on both sides + stored on the
  order (`orders.event_id`).
- `order_confirmed` (Purchase): the NowPayments webhook reads `orders.event_id` and
  passes it to CAPI, so a Purchase can dedup too.
- **Match quality:** CAPI `user_data` sends hashed `em`/`ph`/`external_id` (SHA-256) +
  **raw** `_fbp`/`_fbc` (Meta requires these un-hashed).

## 5. Gates + test plan (in order)

1. **`npm run db:push`** (Anton) — adds the nullable `orders.event_id` column. **Must
   precede deploy** — post-deploy a checkout writes `orders.event_id`; without the column
   the order insert errors. (Additive/nullable — safe; choose "no truncation" if prompted,
   like the referral push.)
2. Set env vars (step 1) locally + in Vercel; create + publish the GTM container (step 2).
3. **Synthetic E2E** ([[qa-use-synthetic-not-real-customers]] — use `@isrib-qa.test`,
   never a real imported customer):
   - **GTM Preview** — confirm tags fire on `order_submitted` / `product_viewed` /
     `page_view` / journal events.
   - **Meta Events Manager → Test Events** — enter the test code, place a synthetic order,
     confirm `InitiateCheckout` appears **once** (browser + server deduped), and that
     `user_data` shows matched fields (em, fbp, fbc, external_id).
   - **GA4 DebugView** — confirm events + params arrive (client via GTM + server via MP).
   - Clean up all synthetic orders/customers after (return Neon to baseline).
4. Only then wire the deploy + (later) the isrib.shop cutover.

## Related
- [`analytics.md`](./analytics.md) · [ADR 0005](../decisions/0005-analytics-preservation.md)
- [`checkout-architecture.md`](./checkout-architecture.md) (G2) ·
  [`../sessions_summary/2026-09-06-analytics-full-datalayer-capi.md`](../sessions_summary/2026-09-06-analytics-full-datalayer-capi.md)
