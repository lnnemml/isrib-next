# Architecture — Folder Structure

> Mirrors `lnnemml/nootropics`.

```
src/app/
  (marketing)/          home, about, contact
  (shop)/
    products/[slug]/     generic product template (6 ISRIB products)
    isrib-a15/           flagship dedicated landing (rich: NMR, FID, mechanism)
    cart/  checkout/     self-contained checkout (no cross-domain)
  (blog)/ blog/[slug]/   MDX journal (Track B — SEO hub migration)
  (account)/ (admin)/ (auth)/   Track B
  go/                    DR landing (Track B) — standalone, no NavBar/Footer
  api/                   route handlers (webhooks/nowpayments, auth)
  actions/               server actions (submitOrder, updateOrderStatus)
  sitemap.ts  robots.ts
src/lib/
  db/         Drizzle schema + client
  analytics/  client.ts (trackEvent), server.ts (CAPI/GA4 MP), types.ts
  copy/       products.ts — typed product data (SKUs, prices, formats)
  email/      Resend templates + send
  auth/       Auth.js config (Track B)
src/components/  ui/ layout/ shop/ marketing/
public/  product images, NMR assets, FID downloads
docs/  raw/  wiki/   CLAUDE.md (schema, at repo root)
```

## Route groups, not top-level folders

`(marketing)`, `(shop)`, etc. let each zone have its own layout without changing
the URL (`/isrib-a15` stays `/isrib-a15`). `/go` sits outside all groups with its
own layout (no nav) — DR pages don't offer exits from the funnel.

## `src/lib/copy/` — why

Components need belief chains / objection responses / VOC phrases as typed TS data,
not parsed from markdown at runtime. When a wiki product/marketing page changes,
check whether `src/lib/copy/` needs a matching update (lint catches this).

## `src/lib/analytics/` — never call `fbq`/`dataLayer.push`/`clarity` directly

Route everything through `trackEvent()` / `trackServerEvent()` so failures stay
non-blocking and the event schema stays consistent. See
[`analytics.md`](./analytics.md).

## Related
- [`tech-stack.md`](./tech-stack.md)
