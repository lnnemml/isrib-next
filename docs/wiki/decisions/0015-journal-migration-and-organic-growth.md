# ADR 0015 — Journal migration & organic-growth strategy

**Status:** accepted · 2026-09-06 · refines [ADR 0002](./0002-domain-collapse.md)

## Decision

Migrate the `isrib-research.com` SEO content hub into this app under `/journal`, and
adopt an organic-content growth engine built on it. Four locked choices (agreed with
Anton):

1. **Identity — sub-brand within the shop design system.** Implement on the locked shop
   DS (cyan, shop fonts), but keep a distinct **"Journal / The Synthesis Lab"** editorial
   treatment + pseudonymous-chemist author byline. One coherent site; the journal still
   reads as editorial. The source's teal/DM-Serif tokens are **not** ported.
2. **CTA target — `/products/isrib-a15`.** All journal CTAs (CTABlock + in-body) point
   to the internal product page, replacing the legacy `isrib.shop/product_isrib_A15.html`.
3. **Build scope (first build session) — infra + 7 real articles + 301s.** MDX infra,
   the 7 real articles, author page, sitemap/robots merge, and the 301 redirect wiring.
   The 46-word TBI stub and all *new* articles are deferred to content phases.
4. **301 mechanism — point `isrib-research.com` at this Vercel project.** Host-gated 301s
   map every old path → `isrib.shop/journal/...`. One deploy owns the redirects.

Growth model: hub-and-spoke topic clusters (science/guide = pillars; compare/blog/tbi =
spokes) → soft + hard CTA → `/products/isrib-a15`, promoted organically (Reddit,
LongeCity, HN for science pieces, email digest, digital PR). Details:
[`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md).

## Context

`isrib-research.com` already ranks and shows People-Also-Ask — real organic equity from
a niche the reagent-suppliers structurally can't serve (they write for procurement, not
end-users — [`../marketing/competitive-landscape.md`](../marketing/competitive-landscape.md)).
ADR 0002 committed to folding it into `/journal` with per-article 301s, in Track B, "not
rushed." This ADR makes the specific how-decisions so the build session has a spec.

The tension: the content's SEO value partly came from *reading as independent*, not as
the vendor's blog. The sub-brand treatment (choice 1) preserves the editorial signal
while resolving the cross-domain trust break ADR 0002 removed.

## Consequences

- Journal traffic stays on-domain (no cross-domain hop); CTAs feed `/products/isrib-a15`.
- Old URLs' equity is preserved **only if** the 301 map is complete + slugs stay stable —
  the #1 migration risk; verify each mapping ([[visual-gate-mandatory-for-ports]]).
- A second design system is avoided (choice 1) — journal restyles onto the shop DS.
- Analytics must reconcile the source's standalone GTM/GA4 with the shop's
  `trackEvent()` layer + existing IDs ([`../architecture/analytics.md`](../architecture/analytics.md)).
- Organic is slow (3–6 mo to restabilise) — set expectations accordingly.
- Compliance: article bodies may name comparison drugs educationally, but the ad-copy
  drug-name ban, no-cancer-claim, no-dementia-claim, and no-guarantee rules still bind.

## Revisit if

- Post-migration rankings drop and the on-domain fold is implicated (would reconsider
  keeping a separate domain — contradicts ADR 0002, so escalate).
- Cluster URL structure (`/journal/{cluster}/{slug}`) proves worse than a flat
  `/journal/{slug}` for rankings.

## Related
- [`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md) — build spec + 301 map
- [`../journal/writing-rules.md`](../journal/writing-rules.md)
- [ADR 0002](./0002-domain-collapse.md)
