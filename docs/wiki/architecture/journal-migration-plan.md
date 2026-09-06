# Architecture — Journal Migration Plan (`isrib-research.com` → `/journal`)

> The build spec for porting the SEO content hub into this app. **STATUS: BUILT
> 2026-09-06** (infra + 7 articles + 301s) — verifier-approved + prober/LEAD
> runtime-verified; **not yet committed/deployed, and the `isrib-research.com` domain
> move is still pending** (see the "Build outcome" section below).
> Follows the inventory-driven port contract ([[inventory-driven-port-contract]]) and
> ADR 0002 (domain collapse). Strategy context:
> [`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md).

## Build outcome (2026-09-06)

Built in 4 sequential implementer slices + fresh-context verifier + prober runtime +
LEAD structural gate. All build-green (`tsc` + `next build`; 7 articles + 4 cluster
indexes + `/journal` + `/journal/author` prerendered SSG).

- **Deps added:** `next-mdx-remote@6`, `gray-matter@4`, `reading-time@1.5`,
  `rehype-slug@6`, `github-slugger@2`. Renderer confirmed on Next 16.3.3 / React 19.2.8.
- **Shipped:** `content/journal/{cluster}/*.mdx` (7 real articles, byte-identical
  bodies) · `src/lib/journal/{mdx,toc,schema}.ts` · `src/components/journal/*` (all 11
  article/layout components, restyled onto the shop DS) · `src/app/(journal)/journal/*`
  (layout masthead + home + `[cluster]` + `[cluster]/[slug]` + `author`) ·
  `src/app/sitemap.ts` (new) · `src/app/robots.ts` (sitemap ref + private disallows) ·
  `next.config.ts` (host-gated 301/308 redirects) · additive `src/lib/analytics/*`
  (journal GA4 events).
- **Deviations from a pure faithful port (intentional):** (1) restyled onto shop DS —
  no teal/serif (ADR 0015); (2) **ResearchCallout now renders its `title`** — the
  source silently dropped it, so all 12 study citations were invisible on the live
  site; rendering it is an E-E-A-T improvement-over-live; (3) redirects emit **308**
  (Next's `permanent:true`) — SEO-permanent, Google treats as 301; (4) a slim journal
  sub-nav masthead added for the sub-brand feel; (5) `sitemap.ts` also covers core
  commercial/marketing routes (none existed before).
- **GATED ON ANTON:** (1) commit + deploy the journal code; (2) **the DNS/Vercel move —
  add `isrib-research.com` to this project** — until then the 301s exist but can't fire
  (they're host-gated to that domain). (3) One gate not run headless: a **human pixel
  look** at the restyled pages (structure/styling verified via rendered HTML; no teal
  leak) — eyeball `/journal` + an article before deploy.

## Locked decisions (this session, with Anton — ADR 0015)

1. **Identity:** *sub-brand within the shop design system.* Implement on the locked
   shop DS (cyan, shop fonts — [`../design/design-system.md`](../design/design-system.md)),
   but keep a distinct **"Journal / The Synthesis Lab"** editorial treatment + author
   byline. One coherent site; the journal still reads as editorial. **Do NOT** port the
   source's teal/DM-Serif tokens.
2. **CTA target:** all article CTAs (CTABlock + soft in-body links) point to
   **`/products/isrib-a15`** — internal, on-domain. Replace every source
   `https://isrib.shop/product_isrib_A15.html`.
3. **Scope of the build session:** MDX infra + port the **7 real articles** + author
   page + sitemap/robots merge + the 301 redirect wiring. **Defer:** the 46-word TBI
   stub (needs ~1,800 words written) and all *new* articles → content phases (strategy §4).
4. **301 mechanism:** *point `isrib-research.com` at this Vercel project.* Host-based
   301s (in `next.config.ts` redirects or `src/proxy.ts`) map every old path →
   `isrib.shop/journal/...`. One deploy owns the redirects. (DNS/Vercel domain move is
   Anton's to execute; the code ships the redirect logic.)

## Source inventory (complete — `/home/laptop/Documents/ISRIB/isrib-research-seo-hub`)

**Stack:** Next 14 App Router · `next-mdx-remote/rsc` + `gray-matter` · Tailwind + CSS
vars · next/font (DM Serif Display, Source Serif 4, DM Sans, JetBrains Mono).

### Content — 8 MDX files (5 clusters)

| File | Slug | Words | Status |
|---|---|---|---|
| `content/compare/isrib-vs-modafinil.mdx` | isrib-vs-modafinil | 1,737 | port |
| `content/compare/isrib-vs-noopept.mdx` | isrib-vs-noopept | 1,864 | port |
| `content/compare/isrib-vs-racetams.mdx` | isrib-vs-racetams | 2,060 | port |
| `content/guide/isrib-a15-complete-guide.mdx` | isrib-a15-complete-guide | 1,939 | port |
| `content/science/what-is-integrated-stress-response.mdx` | what-is-integrated-stress-response | 1,846 | port |
| `content/blog/how-to-fix-brain-fog.mdx` | how-to-fix-brain-fog | 2,000 | port |
| `content/blog/best-nootropic-for-burnout.mdx` | best-nootropic-for-burnout | 2,039 | port |
| `content/tbi/isrib-traumatic-brain-injury-research.mdx` | isrib-traumatic-brain-injury-research | 46 | **DEFER** (stub) |

**Frontmatter schema:** `title, description, slug, cluster, publishedAt, updatedAt,
keywords[], relatedSlugs[]`. `readingTime` auto-calculated — do not set.

### Routes (source `app/`)

`page.tsx` (homepage) · `author/page.tsx` · `sitemap.ts` · `robots.ts` · per cluster:
`{compare,guide,science,blog,tbi}/page.tsx` (index) + `{cluster}/[slug]/page.tsx` (article).

### Components (source)

- `layout/`: `Header.tsx` (burger menu), `ArticleLayout.tsx` (sidebar+content grid),
  `GoogleTagManager.tsx`.
- `article/`: `TOC.tsx`, `MobileTOC.tsx`, `ReadingProgress.tsx`, `ArticleReadTracker.tsx`,
  `CTABlock.tsx` (**rewrite target URL**), `AuthorBio.tsx`, `DoseProtocol.tsx`
  (props: starting/standard/frequency/form/notes), `ResearchCallout.tsx`
  (props: title/source/children), `UserQuote.tsx` (children; source/year optional),
  `RelatedArticles.tsx`.
- `lib/`: `mdx.ts`, `schema.ts` (Article/FAQ JSON-LD), `toc.ts`, `analytics.ts`.
  `hooks/`: `useReadingProgress.ts`, `useScrollHeader.ts`.

**MDX component contract (keep):** tables via native `<table>` (markdown tables don't
render); `UserQuote` without source/year unless needed; `DoseProtocol` via props only.

## Target build shape (proposed — confirm at build time)

- **Route group:** `src/app/(journal)/journal/...` — index `page.tsx`, `author/page.tsx`,
  and cluster routes `[cluster]/[slug]` (see URL decision below).
- **Content:** `content/journal/{cluster}/*.mdx` (roadmap Track B path) — or `src/content`;
  confirm against how the shop already reads files. Add MDX deps.
- **Next 16 caveat (AGENTS.md):** the source uses `next-mdx-remote/rsc` on Next 14.
  **Read `node_modules/next/dist/docs/` before writing App Router / MDX code** — Next 16
  MDX handling and `proxy.ts` redirects differ from training data. Confirm
  `next-mdx-remote` compatibility or use the native `@next/mdx` / `next-mdx-remote`
  successor per the installed docs.
- **Design:** port structure + components, **restyle to the shop DS** (Belief: the
  editorial *feel* comes from layout + author byline + typography hierarchy, not the
  teal palette). Author byline "The Synthesis Lab" preserved.
- **Analytics:** drop the source's standalone GTM; route through the shop's
  `trackEvent()` layer + existing IDs ([`analytics.md`](./analytics.md)). Add an
  article-read event.
- **Schema/sitemap:** port `lib/schema.ts`; merge journal URLs into the shop sitemap;
  ensure canonical = `https://isrib.shop/journal/...`.

## URL mapping + 301 redirect map

**Decision:** keep the cluster path segment (cleanest 301 = prefix `/journal`, and it
preserves the topical taxonomy). Old `isrib-research.com/{cluster}/{slug}` →
`isrib.shop/journal/{cluster}/{slug}`.

| Old URL (isrib-research.com) | New URL (isrib.shop) | Code |
|---|---|---|
| `/` | `/journal` | 301 |
| `/author` | `/journal/author` | 301 |
| `/compare` | `/journal/compare` | 301 |
| `/guide` | `/journal/guide` | 301 |
| `/science` | `/journal/science` | 301 |
| `/blog` | `/journal/blog` | 301 |
| `/tbi` | `/journal/tbi` | 301 |
| `/compare/isrib-vs-modafinil` | `/journal/compare/isrib-vs-modafinil` | 301 |
| `/compare/isrib-vs-noopept` | `/journal/compare/isrib-vs-noopept` | 301 |
| `/compare/isrib-vs-racetams` | `/journal/compare/isrib-vs-racetams` | 301 |
| `/guide/isrib-a15-complete-guide` | `/journal/guide/isrib-a15-complete-guide` | 301 |
| `/science/what-is-integrated-stress-response` | `/journal/science/what-is-integrated-stress-response` | 301 |
| `/blog/how-to-fix-brain-fog` | `/journal/blog/how-to-fix-brain-fog` | 301 |
| `/blog/best-nootropic-for-burnout` | `/journal/blog/best-nootropic-for-burnout` | 301 |
| `/tbi/isrib-traumatic-brain-injury-research` | `/journal/tbi/isrib-traumatic-brain-injury-research` | 301 |
| `/sitemap.xml` | `/sitemap.xml` (app sitemap now includes `/journal/*`) | 301 |
| `/robots.txt` | `/robots.txt` | 301 |
| `/*` (catch-all fallback) | `/journal` | 301 |

**General rule:** `isrib-research.com/{path}` → `isrib.shop/journal/{path}`, with the
homepage and unmapped paths falling back to `/journal`. Because it's a cross-host
redirect, gate on the `host` header (`isrib-research.com`) — the same slugs must NOT
redirect when already served under `isrib.shop/journal`.

## Build gates (next session)

1. **explorer** — re-confirm this inventory + read the source components/`lib` in full
   for a faithful structural port; confirm the Next-16 MDX approach from installed docs.
2. **implementer** — MDX infra → components (restyled) → content port (CTA rewrite) →
   author page → sitemap/schema → 301 redirects. One logical slice at a time.
3. **verifier** — fresh context: CTA points to `/products/isrib-a15` (not legacy URL);
   no teal tokens leaked; no medical/cancer/guarantee copy introduced; analytics via
   `trackEvent()`; 301 map complete + host-gated.
4. **prober / LEAD runtime** — build green; **visual side-by-side** of each ported
   article vs the live `isrib-research.com` page ([[visual-gate-mandatory-for-ports]]);
   curl each old→new path and assert `301` + correct `Location`.

## Related
- [ADR 0015](../decisions/0015-journal-migration-and-organic-growth.md) · [ADR 0002](../decisions/0002-domain-collapse.md)
- [`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md)
- [`../journal/writing-rules.md`](../journal/writing-rules.md)
- [`../roadmap.md`](../roadmap.md) (Track B)
