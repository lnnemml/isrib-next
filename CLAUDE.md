@AGENTS.md

# ISRIB A15 Platform — Project Schema

This file is the entry point Claude Code reads at the start of every session.
Keep it short and stable — anything that changes often or needs deep explanation
belongs in `docs/wiki/`, with a link from here.

## What this project is

A Next.js e-commerce platform for research nootropic compounds, migrating from a
live vanilla-HTML/JS site (`lnnemml/ISRIB`) to the platform architecture proven in
`lnnemml/nootropics`. Flagship product is **ISRIB A15** (eIF2B-stabilising ISR
inhibitor). Catalog also includes ISRIB Original, ZZL-7, MPEP Oxalate, Bromantane,
N-Acetyl-Bromantane. The business has run ~5 years with 500+ buyers — **the current
site is live and taking orders**, so migration is blue-green (see
[`architecture/migration-plan.md`](docs/wiki/architecture/migration-plan.md)).

Read [`docs/wiki/index.md`](docs/wiki/index.md) first, then
[`docs/wiki/roadmap.md`](docs/wiki/roadmap.md) to see what phase we're in.

## Operating model — you are the LEAD (architect + orchestrator)

You are the single top-level session: the **LEAD**. You hold architect altitude
(decisions, scope, sequencing, wiki, product/copy positioning, port inventories,
gates) AND orchestrate the build by delegating to subagents. You run locally, so you
have direct sight — use it. Full topology: [`architecture/agent-roles.md`](docs/wiki/architecture/agent-roles.md).

- **You write only `docs/`.** Every change under `src/` (or any app code/config) goes
  through the **implementer** subagent. You never hand-edit source — holding that line
  is what keeps you at altitude even with local access. You may freely read code, run
  the dev server, screenshot, grep, and inspect git.
- **Delegate the build — always (ADR 0006).** Never build solo. Spawn **explorer**
  (read-only recon; for a faithful port it returns a COMPLETE section inventory of the
  source page), **implementer** (sole writer of `src/`), **verifier** (fresh context;
  for a port a VISUAL side-by-side vs the live page, not just code review), **prober**
  (runtime; a green build/UI is not proof). Every report — and every summary to the
  human — opens with a `Roles run:` line.
- **Verify at runtime yourself.** Client behaviour (cart, calculators) and visual
  fidelity can't be judged from a build or code review. Run it, look at it, and for
  faithful ports do the side-by-side against the live site yourself before closing a
  gate.
- **State lives in the wiki, not this session.** Record decisions as ADRs; log each
  gate. Sessions are ephemeral; the wiki is the brain.

## How this repo's knowledge is organized (Karpathy LLM-wiki pattern)

Three layers:

1. **`docs/raw/`** — immutable primary sources (the ISRIB intelligence PDFs/docs,
   copywriting swipes, legacy HTML in `raw/legacy/`). Never edit. Read-only.
2. **`docs/wiki/`** — the layer you (Claude Code) own and maintain. Interlinked
   markdown synthesizing knowledge from `raw/` and from decisions made during the
   project. Start at [`docs/wiki/index.md`](docs/wiki/index.md).
3. **This file** — the schema. Conventions + workflow below.

## Wiki maintenance workflow

**Ingest** (new source in `docs/raw/`, or a new decision in conversation):
1. Read the source.
2. Find which existing wiki pages it touches (check `index.md` first).
3. Update those pages — integrate, don't just append. Revise summaries, add
   cross-references, flag contradictions with older claims rather than silently
   overwriting.
4. Update `index.md` if a new page was created.
5. Append to `log.md`: `## [YYYY-MM-DD] <type> | <short title>`
   (types: `setup`/`ingest`/`decision`/`lint`/`phase`/`escalate`).

**Decisions**: any non-trivial architecture/product/marketing decision gets its
own file `docs/wiki/decisions/NNNN-*.md` (ADR-style: Decision / Context /
Consequences / Revisit if). Number sequentially, never delete — supersede with a
new entry that links back.

**Query**: read `index.md` first to find the relevant page(s), then read those.
Don't re-derive from `raw/` PDFs if a wiki page already synthesizes it — but
cross-check against raw if something seems stale.

**Lint** (when asked, or proactively if something feels off): check for
contradictions between pages, stale claims, orphan pages, concepts mentioned but
lacking a page. Flag findings rather than silently changing product/marketing
positioning — those need Anton's sign-off.

**A good answer produced in conversation should usually be filed back into the
wiki**, not left only in chat.

Human edits to the wiki are protected: if you regenerate a page, preserve
human-added corrections (re-check the claim against the new text; if a newer
source contradicts it, surface it rather than silently dropping it).

## Hard constraints (check before any relevant work)

- **The live `isrib.shop` site and its `api/checkout.js` are NOT in this repo and
  must not be touched until cutover.** All work happens in this new repo/deploy.
  See [ADR 0004](docs/wiki/decisions/0004-blue-green-cutover.md).
- **Order storage is Neon Postgres (Drizzle), not Redis.** Redis is cache only.
  The checkout gate (G2) is the highest-risk step — verify with a real test order
  before any domain reassignment. See
  [ADR 0003](docs/wiki/decisions/0003-order-storage-neon.md).
- **No card input fields, no "Pay Now" button, no Stripe.** Payment is manual
  arrangement + crypto (NowPayments) only. See
  [`architecture/manual-payment-flow.md`](docs/wiki/architecture/manual-payment-flow.md).
- **No money-back guarantee language** anywhere (research compounds; fraud risk).
- **Analytics: use `trackEvent()` / `trackServerEvent()`** from `src/lib/analytics/`
  only. Never raw `fbq()` / `dataLayer.push()` / `clarity()` in components. Preserve
  existing IDs and keep `order_submitted` as the primary Meta conversion. See
  [`architecture/analytics.md`](docs/wiki/architecture/analytics.md) and
  [ADR 0005](docs/wiki/decisions/0005-analytics-preservation.md).
- **Creative/copy compliance:** never name prescription drugs in ad copy (use
  category terms). No dementia claims. **Never make cancer-risk claims** — the
  cancer *objection* is answered honestly in FAQ, but is never asserted as fact.
  Every belief chain traces back to the six beliefs in
  [`product/beliefs-and-objections.md`](docs/wiki/product/beliefs-and-objections.md).
- **Design system is locked** — implement against
  [`design/design-system.md`](docs/wiki/design/design-system.md); don't invent
  colors/radii/spacing per page.
- **Never invent a real product price.** Prices come from `raw/` analytics
  summaries. If a real number is missing, use an obvious placeholder and flag it.
- **Legal pages (Terms/Privacy/Disclaimer/Research-use) are AI-drafted templates
  only** — not launch-ready without real legal review. Flag this in commits.
- **Escalate WHAT-level forks; don't decide them in-session.** Architectural / scope /
  ADR-contradicting decisions are logged as `escalate` in `log.md` (options + lean)
  and carried to the web architect session, which returns an ADR. Technical forks are
  resolved with Anton in-session. See
  [`agent-roles.md`](docs/wiki/architecture/agent-roles.md) §4.

## Coding conventions

- TypeScript strict; no `any` without a comment explaining why.
- Drizzle ORM for all DB access — no raw SQL outside `src/lib/db/`.
- JSX copy strings: **always double-quoted** (single quotes break on apostrophes
  in natural-language copy).
- One logical change per Claude Code session/commit where practical — keeps
  `log.md` and git history meaningful.
- **Verify `.gitignore` excludes `.next/`, `node_modules/`, `.vercel/` before the
  first commit** of any session.
- End every session with `npx tsc --noEmit` (and `next build` for structural work).
- For non-trivial tasks (3+ files, or anything architectural) use **Plan Mode**
  (`Shift+Tab` twice) before editing — review the plan, then implement.
- **Next 16 has breaking changes vs training data — read
  `node_modules/next/dist/docs/` before writing App Router code.**
- Track A tasks are sequential and dependent — one deep session at a time, not
  parallel worktrees. Parallelize only content-port (per-product pages) and
  read-only research subagents. Track B has independent branches — parallelize there.

## Where to go next

- Starting a session → [`docs/wiki/index.md`](docs/wiki/index.md) →
  [`docs/wiki/roadmap.md`](docs/wiki/roadmap.md).
- Executing Track A → [`docs/wiki/architecture/track-a-runbook.md`](docs/wiki/architecture/track-a-runbook.md)
  (per-session prompts) run under [`docs/wiki/architecture/agent-roles.md`](docs/wiki/architecture/agent-roles.md)
  (agent team + orchestrator protocol; configs in `.claude/agents/`).
- Copy/marketing work → [`docs/wiki/product/`](docs/wiki/product/) +
  [`docs/wiki/marketing/`](docs/wiki/marketing/).
- Infra/code work → [`docs/wiki/architecture/`](docs/wiki/architecture/).
- Design work → [`docs/wiki/design/design-system.md`](docs/wiki/design/design-system.md).