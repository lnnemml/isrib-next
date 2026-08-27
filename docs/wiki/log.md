# Wiki Log

Append-only chronological record. Each entry starts with
`## [YYYY-MM-DD] <type> | <short title>` so it stays parseable:
`grep "^## \[" docs/wiki/log.md | tail -5`.

Types: `setup`, `ingest`, `decision`, `lint`, `phase`, `escalate`.

---

## [2026-08-27] setup | Wiki initialization + migration plan

- Bootstrapped `docs/raw/` + `docs/wiki/` + root `CLAUDE.md` following the
  Karpathy LLM-wiki pattern (raw → wiki → schema), modeled on the mature
  `lnnemml/nootropics` wiki.
- Seeded product knowledge (`overview`, `avatar`, `beliefs-and-objections`) from
  the ISRIB intelligence set: Avatar Sheet, Necessary Beliefs, Offer Brief, and
  the A15 Master Intelligence Report (itself a 5-source synthesis).
- Seeded marketing (`messaging-angles`, `competitive-landscape`), architecture
  (`migration-plan`, `tech-stack`, `folder-structure`, `manual-payment-flow`,
  `analytics`), and design (`design-system`) pages.
- Recorded ADRs 0001–0005 (fork-not-rebuild; domain collapse; order storage
  Redis→Neon; blue-green cutover; analytics preservation).
- **Status:** wiki seeded, pending Claude Design premium pass (design-system.md
  will be updated from its output) before Track A build begins.

## Backlog for next ingest session

- Ingest the research PDFs (`Isrib_Research_Document.pdf`, `ISRIB_Report.pdf`)
  into `product/mechanism-and-science.md`.
- Ingest the full VOC quote bank from the Master Report into
  `marketing/voice-of-customer.md`.
- Ingest the analytics summaries v2–v4 in full detail into
  `architecture/analytics.md` once the new analytics layer is wired.

## [2026-08-27] decision | Design direction — preserve storefront blue/white, elevate to premium

- Locked the design direction: keep the current `isrib.shop` light blue/cyan/white
  lab-grade identity (canonical — established storefront), NOT the amber-on-dark
  landing-redesign branch (diverged, not adopted for the unified site).
- Recorded the "light blue/white reads as generic SaaS" risk and the mitigation
  (premium via typography/restraint/data-viz craft, not color) in
  `design/design-system.md`. Extracted real token values from the legacy
  `css/styles.css`. Claude Design premium pass pending; its output updates
  `design-system.md`.

## [2026-08-27] ingest | Design handoff spec locked

- Filed the Claude Design engineering handoff into
  `design/handoff-spec.md` (Tailwind v4 @theme tokens, next/font [Geist Sans+Mono],
  typography recipes, per-component class strings incl. payment selector, layout
  tokens). 465 lines.
- Flipped `design/design-system.md` STATUS to LOCKED; it now links handoff-spec as
  the implementation source of truth. Day 0: @theme -> globals.css, next/font ->
  layout.tsx.
- Design is now locked. Ready for Track A Day 0.

## [2026-08-27] phase | Track A runbook + agent team specified

- Wrote `architecture/track-a-runbook.md`: Day 0–4 as ready-to-paste orchestrator
  prompts (11 sessions), each with goal + named risks + verify + gate; plus the
  cutover ops checklist and gate summary. The 2.2 checkout session carries the
  NowPayments-webhook fork for human decision.
- Wrote `architecture/agent-roles.md` + `.claude/agents/{explorer,implementer,
  prober,verifier}.md`: team (orchestrator Opus 4.8 = main session; explorer Haiku
  read-only; implementer Opus 4.8; prober Sonnet runtime; verifier Opus 4.8 review),
  standard loop, and the orchestrator protocol (precise task specs, risk-naming,
  fork→human with options+lean, integrate+log).
- Wired both into index.md + CLAUDE.md. Track A is ready to execute.

## [2026-08-27] setup | Escalation protocol + architect-brief

- Added the technical-vs-architectural escalation protocol to `agent-roles.md` §4
  (orchestrator logs `escalate` forks with options+lean; architect returns an ADR);
  wired the rule into `CLAUDE.md` and added `escalate` to the log types.
- Wrote `architect-brief.md` — the bootstrap primer for the web architect session
  (role, current state, two-session operating model, first moves, owned constraints).
- Everything is now in place to begin Track A Day 0.

## [2026-08-27] lint | Drift fix — align stale amber refs to locked light design

- Architect fresh-eyes drift check before Track A Day 0. Found two pages still
  describing the *diverged* amber-on-dark landing branch as the locked design
  system, contradicting the 2026-08-27 `decision` (light blue/cyan/white
  storefront identity locked; `design-system.md` STATUS: LOCKED; `handoff-spec.md`
  §1 = blue/cyan/slate light-mode @theme).
- Fixed `architecture/migration-plan.md` §4 Day 1 point 1 (it instructed writing
  the amber `#0D0D12`/`#E8A427` palette into `design-system.md` — would have
  overwritten the locked light palette) → now points to `handoff-spec.md` as the
  source of truth.
- Fixed `roadmap.md` Pre-build: flipped status from *(current)* to
  *(done — LOCKED)*, corrected the "amber-on-near-black" direction line, set the
  current phase to "ready for Track A Day 0".
- No positioning change — this aligns stale pages to an already-accepted decision.
- Flagged (not fixed): `docs/raw/` holds only README; the intelligence PDFs and
  `raw/legacy/` HTML donor are not yet in the repo. Day 0 step 3 needs the PDFs;
  Sessions 3.2 (content port) + 4.1 (301 redirects read the old URL list from
  `raw/legacy/`) are blocked until the legacy HTML lands. Must be in before Day 3.

## [2026-08-27] setup | Next.js 16 scaffold + design-system wiring
- Scaffolded Next 16.3.3 (App Router, TS strict, Tailwind v4, React 19.2.8) via
  create-next-app into a temp dir, then merged into the repo root (create-next-app
  refuses to run in the non-empty repo). Preserved existing CLAUDE.md/AGENTS.md/docs.
- Route-group skeleton: `(marketing)/` (home at `/`), `(shop)/{products/[slug],
  isrib-a15,checkout}`, `go/`. Placeholder pages only — no logic. Checkout carries
  an explicit "no card/Pay Now/Stripe" comment; scan confirms zero payment fields.
- `src/lib/{db,auth,analytics,copy,email}` and `src/components/{ui,layout,shop,
  marketing}` stubbed with `.gitkeep`.
- Pasted `@theme` (§1) into `globals.css` and `next/font` Geist setup (§2) into
  `layout.tsx` verbatim from `design/handoff-spec.md`. Verified the `--font-geist-
  sans`/`--font-geist-mono` variable names match on both sides (the one silent-fail
  point). §2's explicit `weight` arrays on the variable fonts build fine on Next 16
  — no fallback needed.
- `npx tsc --noEmit` passes; `next build` succeeds (all 5 routes emit). No commit —
  Anton deploys the Vercel preview manually. `.gitignore` confirmed excluding
  `.next/`, `node_modules/`, `.vercel`.
