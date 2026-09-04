# Wiki Index

Content catalog of `docs/wiki/`. Updated on every ingest/edit. Read this first
when answering a question or starting a session — drill into pages from here
rather than scanning the whole directory.

> **New architect (web) session? Start with**
> [`architect-brief.md`](./architect-brief.md) — the bootstrap primer.

## Product knowledge

- [`product/overview.md`](./product/overview.md) — what ISRIB A15 is, big idea,
  positioning, UMP/UMS, discovery story, product specs & pricing
- [`product/avatar.md`](./product/avatar.md) — buyer demographics, psychographics,
  emotional journey, voice-of-customer phrases
- [`product/beliefs-and-objections.md`](./product/beliefs-and-objections.md) —
  the 6 beliefs required to buy + ranked objection→response map (**check before
  any copy**)
- [`product/mechanism-and-science.md`](./product/mechanism-and-science.md) —
  ISR / eIF2B mechanism, research evidence *(stub — expand on ingest of research PDFs)*

## Marketing knowledge

- [`marketing/messaging-angles.md`](./marketing/messaging-angles.md) — headline
  angles, page structure, campaign naming, creative compliance rules
- [`marketing/voice-of-customer.md`](./marketing/voice-of-customer.md) —
  ready-to-use VOC quote bank *(stub — expand on ingest)*
- [`marketing/competitive-landscape.md`](./marketing/competitive-landscape.md) —
  reagent-supplier competitors vs. the positioning gap isrib.shop owns

## Architecture knowledge

- [`architecture/migration-plan.md`](./architecture/migration-plan.md) —
  **the master Track A / Track B migration runbook (read before building)**
- [`architecture/track-a-runbook.md`](./architecture/track-a-runbook.md) —
  **Day 0–4 ready-to-paste orchestrator prompts + gates + cutover checklist**
- [`architecture/agent-roles.md`](./architecture/agent-roles.md) —
  **the Claude Code agent team (explorer/implementer/prober/verifier) + orchestrator
  protocol.** Configs in `.claude/agents/`.
- [`architecture/tech-stack.md`](./architecture/tech-stack.md) — stack choices
- [`architecture/folder-structure.md`](./architecture/folder-structure.md) —
  route groups, `src/lib` layout
- [`architecture/manual-payment-flow.md`](./architecture/manual-payment-flow.md) —
  order lifecycle, checkout fields, emails (no gateway in code)
- [`architecture/analytics.md`](./architecture/analytics.md) — analytics stack,
  IDs to preserve, 2-event conversion model, `trackEvent` layer
- [`architecture/data-model.md`](./architecture/data-model.md) — `orders` schema
  intent *(stub — grows with Drizzle schema)*
- [`architecture/checkout-architecture.md`](./architecture/checkout-architecture.md) —
  **the G2 checkout backend mechanism spec** (Neon-only core + QStash for nurture;
  order flow, HMAC webhook, idempotency, transactions). Read before Day-2.

## Design knowledge

- [`design/design-system.md`](./design/design-system.md) — **locked design system**
  — direction, rationale, brand constraints
- [`design/handoff-spec.md`](./design/handoff-spec.md) — **exact engineering spec**
  (Tailwind v4 @theme tokens, next/font, typography recipes, per-component class
  strings). Implementation source of truth.

## Decisions (ADR-style, append-only — never delete, supersede)

- [`decisions/0001-fork-not-rebuild.md`](./decisions/0001-fork-not-rebuild.md)
- [`decisions/0002-domain-collapse.md`](./decisions/0002-domain-collapse.md)
- [`decisions/0003-order-storage-neon.md`](./decisions/0003-order-storage-neon.md)
- [`decisions/0004-blue-green-cutover.md`](./decisions/0004-blue-green-cutover.md)
- [`decisions/0005-analytics-preservation.md`](./decisions/0005-analytics-preservation.md)
- [`decisions/0006-delegation-discipline.md`](./decisions/0006-delegation-discipline.md)
- [`decisions/0007-pricing-model-shape.md`](./decisions/0007-pricing-model-shape.md)
- [`decisions/0008-full-migration-and-cart.md`](./decisions/0008-full-migration-and-cart.md)
- [`decisions/0009-checkout-backend-neon-qstash.md`](./decisions/0009-checkout-backend-neon-qstash.md)

## Planning

- [`roadmap.md`](./roadmap.md) — Track A (safe storefront replacement) + Track B
  (platform fast-follow), phase-by-phase

## Session summaries (read before continuing multi-session work)

- [`sessions_summary/2026-09-03-day1-tail-and-content-migration.md`](./sessions_summary/2026-09-03-day1-tail-and-content-migration.md)
  — full content migration: all 6 product pages + `/products` + home + About/FAQ/Contact/legal.
  Decisions, current state, known gaps, next steps.

## Backlog (sources not yet fully ingested)

- Full research-evidence ingest → flesh out `product/mechanism-and-science.md`
- Full VOC phrase bank → `marketing/voice-of-customer.md`
- Email lead-gen system → `architecture/email-leadgen.md` (Track B)
- Journal writing rules → `journal/writing-rules.md` (Track B, when SEO hub migrates)

See [`log.md`](./log.md) for the chronological record.
