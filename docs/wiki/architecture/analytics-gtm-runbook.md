# Architecture — Analytics GTM Setup Runbook

> The manual configuration Anton must do in the **GTM web UI** + the **env vars** to
> set, to activate the analytics built in code (2026-09-06). The code half is done +
> verified; this is the half that lives outside the repo. Firing model = **hybrid**
> (ADR 0015-era decision): Meta Pixel loads **directly in code**; **GA4 + Clarity are
> GTM tags**. See [`analytics.md`](./analytics.md) and [ADR 0005](../decisions/0005-analytics-preservation.md).

## 1. Env vars

### Analytics-critical (the only ones this build needs)

| Var | Value | Consumed by |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | **`GTM-KKX85H6G`** | `GoogleTagManager.tsx` (dataLayer + gtm.js) |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1228338595957402` | `MetaPixel.tsx` (base code) + `server.ts` (CAPI) |
| `NEXT_PUBLIC_GA4_ID` | `G-LJEBV5NPCT` | `server.ts` (GA4 MP). **Client GA4 is a GTM tag** — put the ID in the tag, not needed client-side. |
| `META_CAPI_ACCESS_TOKEN` | **(secret — source it)** | `server.ts` CAPI — **server only, never shipped** |
| `GA4_API_SECRET` | **(secret — source it)** | `server.ts` GA4 MP — **server only** |

The bootstrap components **no-op when their env id is absent** — nothing fires until
`NEXT_PUBLIC_GTM_ID` + `NEXT_PUBLIC_META_PIXEL_ID` are set.

### NOT env vars (common mistake)

- `NEXT_PUBLIC_CLARITY_ID` (`wci5xmxfnu`) and `NEXT_PUBLIC_REDDIT_PIXEL_ID`
  (`a2_hz77nm0joupm`) are **NOT consumed by code** (confirmed by grep) — Clarity + Reddit
  are **GTM tags**, so their IDs go **inside the GTM tag**, not in env. Setting them in env
  does nothing.

### Sourcing the two secrets

The old live analytics ran CAPI through a separate service
(`isrib-analytics-api-fbqy.vercel.app`) — that's why the old main project has no CAPI
secret. **Confirmed: the secrets live in that project's env, under different names.**
Copy them into `isrib-next`, renaming:

| Old (`isrib-analytics-api-fbqy`) | New (`isrib-next`) |
|---|---|
| `FB_ACCESS_TOKEN` | `META_CAPI_ACCESS_TOKEN` |
| `GA_API_SECRET` | `GA4_API_SECRET` |
| `FB_PIXEL_ID` (verify = `1228338595957402`) | `NEXT_PUBLIC_META_PIXEL_ID` |
| `GA_MEASUREMENT_ID` (verify = `G-LJEBV5NPCT`) | `NEXT_PUBLIC_GA4_ID` |

**Caveats:** (1) `FB_ACCESS_TOKEN` + `GA_API_SECRET` showed a Vercel "Needs Attention"
badge — reveal (eye icon) and confirm each holds a real value; if empty/invalid,
regenerate (below). (2) **The CAPI token must belong to pixel `1228338595957402`** (the
same pixel our client loads) — confirm `FB_PIXEL_ID` there equals it, else dedup breaks.

Regenerate if needed (non-destructive):
- **`META_CAPI_ACCESS_TOKEN`** — Meta **Events Manager → Data Sources → Pixel
  1228338595957402 → Settings → Conversions API → Generate access token**.
- **`GA4_API_SECRET`** — GA4 **Admin → Data Streams → (web stream for G-LJEBV5NPCT) →
  Measurement Protocol API secrets → Create**.

### Full app env (already set from prior sessions — verify present in the new project)

`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING` (drizzle-kit push), `CUSTOMER_AUTH_SECRET`,
`ADMIN_PASSWORD`, `ADMIN_AUTH_SECRET`, `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL`,
`NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `QSTASH_TOKEN`,
`QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `NEXT_PUBLIC_BASE_URL`
(`https://isrib.shop`). `NODE_ENV`/`VERCEL_ENV` are auto-set — don't set manually.
Note: `.env.example` omits `CUSTOMER_AUTH_SECRET` (doc gap — it IS required by the code).

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

## 2b. Exact GTM objects to create (container GTM-KKX85H6G)

Our client pushes `dataLayer.push({ event: <name>, event_id, ...props })`. So each GTM
**trigger** is a *Custom Event* matching `event`, and each **DLV** reads a top-level key.
**Only client `trackEvent` events reach GTM** — `order_confirmed` is server-only (CAPI/MP),
so it has NO GTM tag.

**Data Layer Variables (type: Data Layer Variable, v2):** `event_id`, `value`, `currency`,
`content_ids`, `num_items`, `content_name`, `page_path`, `cta_location`, `article_slug`,
`article_cluster`, `article_title`, `toc_heading`, `percent_scrolled`.

**Triggers (type: Custom Event, "Event name equals"):** `order_submitted`,
`product_viewed`, `page_view`, `scroll_depth`, `journal_cta_click`, `journal_article_read`,
`journal_toc_click`.

**Tags:**
| Tag | Type | Fires on | Key fields |
|---|---|---|---|
| GA4 Configuration | Google tag `G-LJEBV5NPCT` | Initialization – All Pages | **"Send page view on load" = OFF** |
| GA4 event · order_submitted | GA4 Event | CE order_submitted | value, currency, content_ids, num_items, event_id |
| GA4 event · product_viewed | GA4 Event | CE product_viewed | content_ids, content_name, value, currency |
| GA4 event · page_view | GA4 Event (name `page_view`) | CE page_view | page_path |
| GA4 event · scroll_depth | GA4 Event (name `scroll_depth`) | CE scroll_depth | percent_scrolled, page_path |
| GA4 event · journal_cta_click | GA4 Event | CE journal_cta_click | cta_location |
| GA4 event · journal_article_read | GA4 Event | CE journal_article_read | article_slug, article_cluster, article_title |
| GA4 event · journal_toc_click | GA4 Event | CE journal_toc_click | toc_heading |
| Microsoft Clarity | Custom HTML / Clarity template, id `wci5xmxfnu` | All Pages | — |

Notes: our `RouteChangeTracker` fires `page_view` on initial load too, so the GA4 config's
auto-pageview is OFF to avoid double-count. Meta catalog matching (`content_ids`) is handled
by the **direct** Pixel, not GTM — GA4 `content_ids` is optional (proper GA4 ecommerce would
use an `items` array; a future refinement). Then **Submit/Publish** the container.

## 2c. Scroll depth (landing + articles) — CODE-BASED (full SPA coverage)

**Decision (2026-09-06): code-based, not GTM-native.** `src/components/analytics/ScrollDepthTracker.tsx`
fires `trackEvent("scroll_depth", { percent_scrolled, page_path })` at thresholds
**25/50/75/90**, re-armed on route change (full SPA coverage), GA4-only. So GTM treats
`scroll_depth` like any other custom event (NOT the built-in Scroll Depth trigger).

**⚠️ Do NOT also use GTM's built-in Scroll Depth trigger** — the code tracker + a native
scroll trigger both fire on full page loads → double-count. If you already created a native
Scroll Depth trigger, **delete it** (and any tag pointing at it).

GTM objects for scroll (same pattern as the other events):
1. **DLV** `percent_scrolled` (Data Layer Variable) — plus `page_path` (already created).
2. **Trigger** (Custom Event, "Event name equals") `scroll_depth`, All Custom Events.
3. **GA4 Event tag** name `scroll_depth` (custom — NOT reserved `scroll`), param
   `percent_scrolled` = `{{percent_scrolled}}` (+ optional `page_path`), trigger = the
   `scroll_depth` Custom Event trigger.
4. **Disable GA4 enhanced-measurement "Scrolls"** (it only fires a single 90% event) so our
   25/50/75/90 is the one clean source.

Clarity (session replay + scroll heatmaps) already gives the qualitative view as a complement.

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
