# Session summary — 2026-09-06 · Journal BUILD (infra + 7 articles + 301s)

> Executed the journal migration ([`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md),
> [ADR 0015](../decisions/0015-journal-migration-and-organic-growth.md)). Built +
> verifier-approved + prober/LEAD runtime-verified. **Not yet committed/deployed; the
> `isrib-research.com` domain move is still pending.**

## What shipped

The `isrib-research.com` SEO hub ported into `isrib.shop/journal` — 7 real articles
across 4 clusters (compare/guide/science/blog), restyled onto the LOCKED shop design
system (no teal/serif — sub-brand editorial treatment via masthead + "The Synthesis
Lab" byline).

- **Deps:** `next-mdx-remote@6`, `gray-matter@4`, `reading-time@1.5`, `rehype-slug@6`,
  `github-slugger@2`. Renderer `next-mdx-remote/rsc` on Next 16.3.3 / React 19.2.8.
- **Files:** `content/journal/{cluster}/*.mdx` (7, byte-identical bodies) ·
  `src/lib/journal/{mdx,toc,schema}.ts` · `src/components/journal/*` (11 components) ·
  `src/app/(journal)/journal/{layout,page,[cluster]/page,[cluster]/[slug]/page,author/page}.tsx` ·
  `src/app/sitemap.ts` (new) · `src/app/robots.ts` · `next.config.ts` (host-gated
  301/308 redirects) · additive `src/lib/analytics/{client,types}.ts` (journal GA4 events).
- **URL model:** `/journal/{cluster}/{slug}`, `/journal/{cluster}`, `/journal`,
  `/journal/author`. Canonicals + JSON-LD at `https://isrib.shop/journal/...`.
- **Redirects:** every `isrib-research.com/{path}` → `isrib.shop/journal/{path}`
  (308, host-gated), with `/sitemap.xml` + `/robots.txt` → the canonical files.

## Method (held the LEAD line)

3 read-only explorers (target DS/analytics/routes · source components/lib · Next-16 MDX
approach) → 4 sequential implementer slices → 1 focused fix → fresh-context verifier →
prober runtime → LEAD structural gate. LEAD wrote no `src/`. Three technical forks
resolved by LEAD before delegating: renderer (`next-mdx-remote/rsc`, not `@next/mdx` —
Turbopack-safe), restyle-onto-shop-DS, analytics via `trackEvent`.

## Verification

- **Verifier: APPROVE** — all 9 hard constraints (CTA→`/products/isrib-a15`, no teal,
  additive analytics, no forbidden copy, no forbidden-file edits, redirects host-gated,
  canonical journal URLs, Next-16 async params, TS strict).
- **Prober: ALL PASS** — 10 journal pages 200; CTA + citations + JSON-LD + TOC anchors
  render; 404 hygiene; host-gated 308s correct; **critical negative test** (isrib.shop
  traffic NOT redirected); sitemap/robots correct; zero console errors.
- **Build-green:** `tsc` + `next build`; 7 articles + 4 cluster indexes + home + author
  prerendered SSG.
- **LEAD structural gate:** tables/prose/TOC/CTA render on the shop DS; no teal leak.

## Notable

- **Latent source bug caught + fixed:** all 12 `<ResearchCallout>` pass `title=` but the
  source component never rendered it — study citations were invisible on the live site.
  Now rendered (E-E-A-T improvement-over-live; intentional divergence).
- Analytics `EventName` was already `string`; the added `JournalEventName` union is
  documentation-only (harmless). Journal events route GA4-only (no Meta/Clarity fan-out).

## GATED ON ANTON (in order)

1. **Commit + deploy** the journal code (+ this session's `docs/`).
2. **Add `isrib-research.com` to this Vercel project** (DNS/domain move) — the 301s are
   host-gated to that domain and **cannot fire until it resolves here**. This is the SEO
   equity-preservation step; do it as part of/after deploy.
3. Optional: a **human pixel look** at `/journal` + an article before deploy (the
   headless visual gate couldn't run — agent-browser not installed, Chrome extension
   disconnected; structure verified via rendered HTML).

## Next content phases (post-deploy)

Write the roadmap articles in [`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md)
§4 (finish the TBI stub first; then the Phase-2 compares/guides), following
[`../journal/writing-rules.md`](../journal/writing-rules.md), and begin the promotion
plan (§6–7).

## Related
- [ADR 0015](../decisions/0015-journal-migration-and-organic-growth.md) ·
  [`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md) (build outcome)
- [`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md) ·
  [`../journal/writing-rules.md`](../journal/writing-rules.md) · [`../log.md`](../log.md)
