# Journal — Writing Rules

> The voice, formula, and structural rules for `/journal` articles. Ported from the
> `isrib-research.com` playbook (its `PLAN.md` + `CLAUDE.md`) and reconciled with this
> repo's compliance constraints. Read before writing or editing any journal article.
> Strategy context: [`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md).

## Author & positioning

- **Author:** "The Synthesis Lab" — pseudonymous pharmaceutical chemist, small-molecule
  synthesis, first-hand ISRIB A15 experience. **Never reveal a real identity.**
- **Frame:** the most technically rigorous *independent* resource on ISRIB A15 —
  written by a chemist with hands-on experience, not a marketer paraphrasing PubMed.
- **Byline credential line:** *"Pharmaceutical chemist · Small-molecule synthesis ·
  Independent ISRIB A15 researcher."*

## Tone of voice

Peer-to-peer between two technically literate people.

| Parameter | Rule |
|---|---|
| Register | Technically precise but accessible |
| Person | First person where there is genuine synthesis/use experience |
| Skepticism | Always present: "Research is promising, human data is limited." |
| **Banned words** | revolutionary, breakthrough, game-changer, miracle, Limitless |
| Use instead | notable, significant, worth examining |

The honest-skeptic voice **is** the conversion asset for a paper-reading, hype-fatigued
avatar — do not trade it for hype.

## Article formula (section order)

1. **Hook** — mirror the reader's pain.
2. **Reframe** — the ISR as a biological block, not a behavioural/willpower problem.
3. **Mechanism** — eIF2B, Peter Walter, how A15 addresses it.
4. **Evidence** — key studies via `<ResearchCallout>` (cite real sources).
5. **Comparison** — how A15 differs from the alternatives.
6. **User reports** — Reddit/LongeCity-style quotes via `<UserQuote>`.
7. **Objections** — Safe? Legal? Placebo? (answer honestly — see guardrails).
8. **Protocol** — `<DoseProtocol>` if relevant.
9. **CTABlock** — → **`/products/isrib-a15`** (internal; ADR 0015).
10. **RelatedArticles** — 3 related slugs.
11. **AuthorBio**.

Every article ends: **CTABlock → RelatedArticles → AuthorBio.**

## Frontmatter schema

```yaml
---
title: "..."            # keyword-first, human second
description: "..."      # opens the belief-gate, not a spec dump
slug: "..."
cluster: compare | guide | science | blog | tbi
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD"
keywords: []
relatedSlugs: []
---
```

`readingTime` — do NOT set; auto-calculated.

## MDX component rules

- **Tables:** native `<table>` tags only — markdown table syntax does not render in MDX.
- **`<UserQuote>`:** children only; `source`/`year` are optional — omit unless needed.
- **`<DoseProtocol>`:** props only (`starting`, `standard`, `frequency`, `form`,
  `notes?`), never children.
- **`<ResearchCallout title="" source="">`:** wrap real evidence; cite the source.

## SEO conventions

- Answer 3–5 real **People-Also-Ask** questions in `<h2>` question form per article.
- Every article links up to its pillar (science/guide), sideways to 2–3 related, and to
  the nearest high-intent compare/guide page.
- Article/BlogPosting + FAQ JSON-LD (author = The Synthesis Lab, publisher = ISRIB.shop);
  canonical = `https://isrib.shop/journal/...`.

## Compliance guardrails (hard — CLAUDE.md)

- Article body **may** name comparison compounds (modafinil, Adderall, racetams,
  noopept) educationally. The ban on naming prescription drugs applies to **ad copy**,
  not editorial comparison.
- **No dementia claims. Never assert cancer risk as fact** — answer the cancer
  *objection* honestly, never claim it. **No money-back-guarantee language.**
- **No medical/therapeutic claims** — research-use framing; honest-skeptic hedging.
- Every belief chain traces back to the six beliefs in
  [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md).

## Related
- [`../marketing/organic-content-strategy.md`](../marketing/organic-content-strategy.md)
- [`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md)
- [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md) · [`../product/avatar.md`](../product/avatar.md)
