# Session summary — 2026-09-06 · Journal migration plan + organic-content strategy

> **Docs-only session** (Anton's scope call). Agreed the `isrib-research.com` → `/journal`
> port approach and wrote the organic-growth strategy. **No `src/` touched.** Next
> session = the journal BUILD.

## What this session delivered

1. **[ADR 0015](../decisions/0015-journal-migration-and-organic-growth.md)** — locks four
   forks (agreed with Anton via AskUserQuestion), refining ADR 0002:
   - **Identity:** sub-brand within the shop design system (editorial "The Synthesis Lab"
     byline kept; source teal/DM-Serif tokens dropped).
   - **CTA target:** `/products/isrib-a15` (internal), replacing the legacy absolute URL.
   - **Build scope:** infra + the 7 real articles + 301s (defer the 46-word TBI stub + new
     articles).
   - **301 mechanism:** point `isrib-research.com` at this Vercel project; host-gated 301s
     → `isrib.shop/journal/...`.
2. **[`architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md)** —
   the build spec: complete source inventory (Next 14, next-mdx-remote/rsc; 8 MDX files across
   5 clusters; 11 components; author page; sitemap/schema), target build shape (Next-16 MDX
   caveat flagged), and the **full old→new 301 redirect map**, + build gates.
3. **[`marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md)** —
   the growth engine: hub-and-spoke topic clusters, a 4-phase content roadmap mapped to the six
   beliefs/objections, promotion channels (Reddit/LongeCity/HN/email/digital-PR), acquisition
   channels, conversion path, KPIs, and compliance guardrails.
4. **[`journal/writing-rules.md`](../journal/writing-rules.md)** — voice, article formula,
   frontmatter + MDX component rules, compliance (backlog item cleared).

## Method

LEAD recon (full source inventory of `isrib-research-seo-hub` + target structure/proxy/DS) →
grounded in avatar/beliefs/competitive-landscape → 4 WHAT-level forks agreed with Anton → ADR +
3 wiki pages + session summary. Held the LEAD line: docs only, no code. The auto-suggested
`investigation-mode`/`auth`/`next-forge` skills were lexical false positives and correctly skipped.

## Key compliance note

Article **bodies** may name comparison compounds (modafinil, Adderall, racetams, noopept)
educationally — the prescription-drug-name ban is **ad-copy-only**. No cancer-risk assertions,
no dementia claims, no money-back-guarantee language. Research-use framing throughout.

## Next session — JOURNAL BUILD

Execute [`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md)
under [`../architecture/agent-roles.md`](../architecture/agent-roles.md): explorer (re-confirm
inventory + Next-16 MDX approach from `node_modules/next/dist/docs/`) → implementer (MDX infra →
restyled components → 7-article port w/ CTA rewrite → author/sitemap/schema → host-gated 301s) →
verifier (CTA correct, no teal leak, no forbidden copy, analytics via `trackEvent()`, 301 map
complete) → prober/LEAD runtime (build green + **visual side-by-side vs live** + curl 301 checks).
Anton executes the DNS/Vercel domain move for `isrib-research.com`.

## Related
- [ADR 0015](../decisions/0015-journal-migration-and-organic-growth.md) · [ADR 0002](../decisions/0002-domain-collapse.md)
- [`../log.md`](../log.md)
