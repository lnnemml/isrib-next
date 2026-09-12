# Marketing — Organic Content Strategy (the Journal / SEO engine)

> The plan for growing `isrib.shop` through owned, organic content — the `/journal`
> hub migrated from `isrib-research.com` (see
> [`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md)
> and [ADR 0015](../decisions/0015-journal-migration-and-organic-growth.md)).
> Grounded in [`../product/avatar.md`](../product/avatar.md),
> [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md), and
> [`competitive-landscape.md`](./competitive-landscape.md). Compliance rules are
> non-negotiable — see the guardrails section.

## 1. The bet, in one line

We win organic because **every ISRIB A15 vendor writes for lab-procurement teams
(CAS numbers, quote forms) and nobody writes for the actual end-user.** The journal
is the only technically-rigorous, honest, end-user-facing resource on ISRIB / the ISR
pathway. That is a durable moat: reagent suppliers structurally cannot copy an
editorial voice, and the topic is niche enough that a focused hub can own the SERP.

**Model:** hub-and-spoke authority site → soft + hard CTAs → `/products/isrib-a15`.
Slow-burn: a domain migrating its equity needs ~3–6 months to restabilise on
competitive queries (the old domain already ranks + shows People-Also-Ask — we
protect that with per-article 301s, we do not restart from zero).

## 2. Positioning & E-E-A-T (the moat)

- **Independent-research posture.** The journal reads as a research resource, not a
  shop blog — that is what earned the rankings. Post-collapse it lives on
  `isrib.shop/journal` but keeps a distinct editorial treatment + the **"The
  Synthesis Lab"** author byline (sub-brand within the locked shop design system —
  ADR 0015 / ADR 0002).
- **Author = "The Synthesis Lab"** — pseudonymous pharmaceutical chemist, small-
  molecule synthesis, first-hand ISRIB A15 experience. Never reveal real identity.
  The `/journal/author` page carries the E-E-A-T (Experience, Expertise) signal.
- **Honest-skeptic voice is the trust asset.** "Research is promising, human data is
  limited." Banned words: *revolutionary, breakthrough, game-changer, miracle,
  Limitless*. Use *notable, significant, worth examining*. This voice is why the
  content converts a skeptical, paper-reading avatar — see
  [`../journal/writing-rules.md`](../journal/writing-rules.md).

## 3. Topic-cluster architecture (hub & spoke)

Five clusters, each an index page + articles. Pillars are broad/evergreen; spokes are
specific and interlink up to their pillar and across to the highest-commercial-intent
compare pages.

| Cluster | Role | Funnel stage | Primary intent |
|---|---|---|---|
| `science/` | **Pillar** — ISR / eIF2B mechanism | Top → Mid | Informational, E-E-A-T anchor |
| `guide/` | **Pillar** — how to use, dosing, protocol, what to expect | Mid → Bottom | Commercial-investigation |
| `compare/` | Spokes — ISRIB vs X | **Bottom** | High commercial intent — closest to purchase |
| `blog/` | Spokes — symptom-led (brain fog, burnout) | **Top** | High-volume, wide net |
| `tbi/` (→ conditions) | Spokes — condition/use-case + research | Mid | E-E-A-T + long-tail research queries |

**Internal-linking rule:** every article links (a) up to its pillar, (b) sideways to
2–3 `relatedSlugs`, and (c) at least once to the highest-intent compare or guide page
in its funnel path. Compare + guide pages carry the strongest CTA to the product.

## 4. Content plan — editorial roadmap

Existing = 7 real articles (~1,700–2,060 words) + 1 TBI stub (46 words, needs writing).
Each planned article maps to a target keyword, a funnel stage, and the **belief or
objection it opens** (from [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md)).

### Phase 1 — LIVE (migrate as-is with 301s)

| Article | New URL | Cluster | Target keyword | Belief/objection |
|---|---|---|---|---|
| ISRIB A15 vs Modafinil | `/journal/compare/isrib-vs-modafinil` | compare | "ISRIB vs modafinil", "modafinil alternative" | Belief 3 (categorically different) |
| ISRIB A15 Complete Guide | `/journal/guide/isrib-a15-complete-guide` | guide | "ISRIB A15 dosing/protocol" | Beliefs 5, 6; Obj 7 (prep) |
| What Is the Integrated Stress Response | `/journal/science/what-is-integrated-stress-response` | science | "integrated stress response", "eIF2B" | Beliefs 1, 2 (biological + reversible) |
| ISRIB A15 vs Noopept | `/journal/compare/isrib-vs-noopept` | compare | "ISRIB vs noopept" | Belief 3 |
| ISRIB A15 vs Racetams | `/journal/compare/isrib-vs-racetams` | compare | "ISRIB vs racetams", "beyond racetams" | Belief 3 |
| How to Fix Brain Fog | `/journal/blog/how-to-fix-brain-fog` | blog | "how to fix brain fog" | Belief 1 |
| Best Nootropic for Burnout | `/journal/blog/best-nootropic-for-burnout` | blog | "best nootropic for burnout" | Beliefs 1, 5 |

### Phase 2 — finish + first new (near-term)

| Article | Cluster | Target keyword | Funnel | Belief/objection | Notes |
|---|---|---|---|---|---|
| ISRIB & Traumatic Brain Injury (finish the stub) | tbi | "ISRIB traumatic brain injury", "ISRIB TBI research" | Mid | Belief 4 (real-world), Obj 8 (it IS studied) | 46-word stub → ~1,800 words from research PDFs |
| ISRIB A15 vs Adderall / amphetamines | compare | "ISRIB vs adderall", "non-stimulant adderall alternative" | Bottom | Beliefs 3, 5 | High intent; **body may name the drug educationally — never in ad copy** |
| Is ISRIB A15 safe? Honest side-effect review | guide | "ISRIB side effects", "is ISRIB safe" | Bottom | Belief 5; Obj 3, 5 | Answers cancer/CV objections **honestly, never asserts risk** |
| eIF2B and memory formation | science | "eIF2B memory", "eIF2B function" | Mid | Belief 2 | Deepens the science pillar |

### Phase 3 — expand the net

| Article | Cluster | Target keyword | Funnel | Belief/objection |
|---|---|---|---|---|
| ISRIB A15 vs Lion's Mane / Qualia / Alpha Brain | compare | "ISRIB vs qualia", "ISRIB vs lion's mane" | Bottom | Belief 3 |
| ISRIB A15 vs Semax / Selank / peptides | compare | "ISRIB vs semax" | Bottom | Belief 3 |
| ISRIB A15 dosage & protocol (deep) | guide | "ISRIB A15 dosage", "ISRIB protocol" | Bottom | Belief 5; Obj 7 |
| Brain fog after COVID — the cellular-stress angle | blog | "long covid brain fog", "post covid brain fog treatment" | Top | Belief 1 |
| ADHD, dopamine, and cognitive friction | blog | "adhd meds stopped working", "non-stimulant focus" | Top | Beliefs 1, 3 |
| Where to buy ISRIB A15 (purity/COA buyer's guide) | guide | "buy ISRIB A15", "ISRIB A15 for sale" | **Bottom** | Obj 1, 6 (purity, legal) — strongest CTA |

### Phase 4 — authority + long-tail

| Article | Cluster | Angle |
|---|---|---|
| Peter Walter, Calico & the ISR story | science | Narrative science; link-bait for HN / science readers |
| Age-related cognitive decline & the reversible-brake hypothesis | science | Longevity audience; Belief 2 proof (aged-mice result) |
| A chemist reads the ISRIB literature: what the papers actually say | science | E-E-A-T flagship; cite the real studies via ResearchCallout |
| ISRIB A15 capsules vs powder (why we killed DMSO) | guide | Obj 7; product-adjacent |

**Cadence:** 1–2 articles/week once infra is live (post-migration). Refresh existing
top pages quarterly (update `updatedAt`, add new research, expand PAA answers).

> **Dated execution:** [`publication-calendar.md`](./publication-calendar.md) sequences
> this roadmap into a ROI-ordered 12-week ship schedule (bottom-funnel converters +
> science link-bait first) with the quarterly refresh + migration-watch cycle.

## 5. On-page SEO conventions

- **Frontmatter** drives title/description/canonical/schema — see
  [`../journal/writing-rules.md`](../journal/writing-rules.md) for the schema.
- **Structured data:** Article/BlogPosting schema (author = The Synthesis Lab,
  publisher = ISRIB.shop) + FAQ schema on the objection Q&A blocks. Port the source
  `lib/schema.ts`.
- **Target People-Also-Ask:** every article answers 3–5 real PAA questions in `<h2>`
  question form (this is already surfacing PAA on the old domain — keep doing it).
- **Titles:** keyword-first, human second ("ISRIB A15 vs Modafinil: A Chemist's
  Honest Comparison"). **Descriptions:** open the belief-gate, not a spec dump.
- **Sitemap + robots** ported and merged into the app's sitemap so `/journal/*` is
  discoverable from `isrib.shop/sitemap.xml`.

## 6. Promotion channels (how content earns distribution + links)

Value-first, never spam. Every touch respects the compliance guardrails (§8).

| Channel | Play | Notes / cadence |
|---|---|---|
| **Reddit** (r/Nootropics, r/StackAdvice, r/Biohackers, r/longevity, r/ISRIB) | Answer real questions with genuine expertise; link the specific article only when it directly answers. Occasional "chemist's take" long-form post. | Highest-fit — the avatar already seeks peer validation here. Build karma/credibility first; disclose vendor affiliation where subs require it. |
| **LongeCity** | Long-form technical threads; the audience reads papers. | Deep, low-volume, high-trust. |
| **Discord** (nootropics/biohacker/longevity servers) | Presence + linking articles in relevant threads. | Community trust play. |
| **Hacker News** | Submit the *science* narrative pieces (Walter/Calico, ISR story) — not the commercial pages. | Link-bait for science readers; drives authority backlinks. |
| **Quora / Biology StackExchange** | Answer "what is the ISR / eIF2B / brain fog cause" questions, cite the science pillar. | Evergreen long-tail referral. |
| **X/Twitter** | Threads summarising each science/compare article; engage longevity/biohacker accounts. | Repurpose, don't originate. |
| **Email (owned list)** | New-article digest to the lead-gen list. | Ties to [`../architecture/email-leadgen.md`](../architecture/email-leadgen.md) (Track B). Owned channel = compounding. |
| **YouTube / creators** (later) | Script/sponsor longevity-nootropic creators; embed articles as references. | Higher cost; Phase 4+. |
| **Digital PR / backlinks** | Pitch the "independent chemist reviews the ISRIB literature" angle to nootropic/longevity blogs & newsletters. | Editorial backlinks are the ranking lever on a young domain. |

> **Operational detail** for the two highest-effort channels lives in
> [`organic-social-playbook.md`](./organic-social-playbook.md) — Reddit + X/Twitter
> accounts, cold-start ramp, per-sub rules, content types, and the weekly cadence.

## 7. Acquisition channels (how readers arrive)

| Channel | Priority | Notes |
|---|---|---|
| **Organic search** | **Primary** | Compare + symptom articles = the volume. The whole strategy optimizes this. |
| **Referral** (Reddit/forum/HN threads) | High | Spikes from good threads; also feeds backlink profile. |
| **Direct / brand** | Growing | Returning readers + brand searches ("ISRIB A15 review"). |
| **Email** | Owned | Digest → returning readers → conversions. |
| **Social** | Support | X/Discord amplification. |
| **Paid** | **Separate track** | Cold paid traffic runs to the DR landing (`/go`), **not** the journal — the journal is an organic/mid-funnel asset. Now that it's on-domain, paid *retargeting* of journal readers becomes possible (Track B). |

## 8. Compliance guardrails (hard — from CLAUDE.md)

- **Article body may name comparison compounds** (modafinil, Adderall, racetams,
  noopept) educationally — that is the compare cluster's job. The prohibition is on
  **ad copy**: never name prescription drugs in paid creative (use category terms).
- **No dementia claims. Never assert cancer risk as fact** — the cancer *objection*
  is answered honestly in-article (Obj 3), never claimed. **No money-back-guarantee
  language anywhere.**
- **Research-use framing** consistent with the shop's Research-Use page.
- **No medical/therapeutic claims** (YMYL scrutiny) — honest-skeptic voice covers this
  ("research is promising, human data is limited").
- **Analytics:** use `trackEvent()` / GTM only; preserve existing IDs on migration
  (source uses GTM-W5QH2NR5 / GA4 G-LJEBV5NPCT — reconcile with the shop's IDs at
  build time; see [`../architecture/analytics.md`](../architecture/analytics.md)).

## 9. Conversion path

Reader lands (organic) → reads (honest voice builds trust; author bio + ResearchCallout
= credibility) → **soft CTA** mid-article (contextual link to `/products/isrib-a15`) →
**hard CTA** (CTABlock) at the end → RelatedArticles (dwell time + next-hop) →
secondary conversion = **email capture** for non-buyers. All journal CTAs point to
**`/products/isrib-a15`** (ADR 0015), on-domain — no cross-domain break.

## 10. Measurement & KPIs

- **Tools:** Google Search Console (impressions, avg position, CTR by query/page),
  GA4 (sessions by landing page, article→product CTR, assisted conversions).
- **Leading indicators (weeks):** indexation of migrated URLs, 301s resolving with no
  equity loss, PAA presence retained, impressions trend.
- **Lagging (months):** avg position on target keywords, organic sessions to `/journal`,
  **journal-assisted conversions** (the real number), email signups from journal.
- **Per-article scorecard:** target keyword position, CTR, article→CTA click rate,
  time-on-page. Refresh the losers quarterly.
- **Migration watch (first 30–60 days):** confirm no ranking cliff after the domain
  move; monitor 404s and fix redirect gaps immediately.

## 11. Risks

- **Migration equity loss** — mitigated by per-article 301s + keeping URL slugs stable
  ([`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md)).
  This is the #1 risk; do it carefully, one mapping at a time, verify each.
- **YMYL / medical-claim scrutiny** — mitigated by honest-skeptic voice + research-use
  framing + E-E-A-T author.
- **Losing the "independent" trust signal** by folding into the shop — mitigated by the
  sub-brand editorial treatment (ADR 0015).
- **Reddit/forum backlash** if promotion reads as spam — mitigated by value-first rules.
- **Young-domain ramp** — organic is slow; set expectations at 3–6 months.

## Related
- [`organic-social-playbook.md`](./organic-social-playbook.md) — the Reddit + X/Twitter operational layer
- [`publication-calendar.md`](./publication-calendar.md) — the dated 12-week ship schedule
- [`../architecture/journal-migration-plan.md`](../architecture/journal-migration-plan.md) — the build spec
- [`../journal/writing-rules.md`](../journal/writing-rules.md) — voice, formula, frontmatter
- [`../decisions/0015-journal-migration-and-organic-growth.md`](../decisions/0015-journal-migration-and-organic-growth.md)
- [`messaging-angles.md`](./messaging-angles.md) · [`competitive-landscape.md`](./competitive-landscape.md)
- [`../product/avatar.md`](../product/avatar.md) · [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md)
