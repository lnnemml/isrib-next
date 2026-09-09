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
- [`marketing/organic-content-strategy.md`](./marketing/organic-content-strategy.md) —
  **the `/journal` organic-growth engine** — topic clusters, content roadmap,
  promotion + acquisition channels, KPIs, compliance guardrails
- [`marketing/relaunch-announcement-email.md`](./marketing/relaunch-announcement-email.md) —
  **the relaunch/announce email draft** (audience, subject lines, body, RELAUNCH10 offer,
  Resend + gating). Send only after the promo code is verified live.
- [`marketing/go-rewrite.md`](./marketing/go-rewrite.md) —
  **the skill-driven `/go` landing rewrite** (Breakthrough Advertising DIAGNOSE + ratified
  "stuck-brake high-performer" identity + belief-gate copy deck). Boundary-first; mechanism,
  never a health-outcome promise. S1–S6 drafted; offer (100m-offers) + FAQ passes pending.

## Journal / SEO hub

- [`journal/writing-rules.md`](./journal/writing-rules.md) — voice, article formula,
  frontmatter + MDX component rules, compliance (read before writing any article)

## Architecture knowledge

- [`architecture/migration-plan.md`](./architecture/migration-plan.md) —
  **the master Track A / Track B migration runbook (read before building)**
- [`architecture/journal-migration-plan.md`](./architecture/journal-migration-plan.md) —
  **the `isrib-research.com` → `/journal` port spec** (source inventory, target shape,
  301 redirect map, build gates) — read before the journal build session
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
  IDs to preserve, 2-event conversion model, `trackEvent` layer (**built 2026-09-06:
  hybrid dataLayer + CAPI dedup**)
- [`architecture/analytics-gtm-runbook.md`](./architecture/analytics-gtm-runbook.md) —
  **the env vars + GTM container config Anton must set up** to activate analytics
  (GA4/Clarity tags, dedup, synthetic E2E test plan)
- [`architecture/data-model.md`](./architecture/data-model.md) — `orders` schema
  intent *(stub — grows with Drizzle schema)*
- [`architecture/checkout-architecture.md`](./architecture/checkout-architecture.md) —
  **the G2 checkout backend mechanism spec** (Neon-only core + QStash for nurture;
  order flow, HMAC webhook, idempotency, transactions). Read before Day-2.
- [`architecture/admin-panel.md`](./architecture/admin-panel.md) — **the BI admin panel spec
  (task 1.7)** — minimal cookie auth (NORA-lesson applied), BI queries, order actions, schema deltas.

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
- [`decisions/0010-frictionless-dr-checkout.md`](./decisions/0010-frictionless-dr-checkout.md)
- [`decisions/0011-admin-panel-and-auth.md`](./decisions/0011-admin-panel-and-auth.md)
- [`decisions/0012-legacy-orders-import-and-customers.md`](./decisions/0012-legacy-orders-import-and-customers.md)
- [`decisions/0013-customer-accounts-auth.md`](./decisions/0013-customer-accounts-auth.md)
- [`decisions/0014-referral-discount.md`](./decisions/0014-referral-discount.md)
- [`decisions/0015-journal-migration-and-organic-growth.md`](./decisions/0015-journal-migration-and-organic-growth.md)
- [`decisions/0016-launch-promo-codes.md`](./decisions/0016-launch-promo-codes.md)
- [`decisions/0017-email-campaign-broadcasts-and-marketing-list.md`](./decisions/0017-email-campaign-broadcasts-and-marketing-list.md)
- [`decisions/0018-shipping-cost-and-september-orders.md`](./decisions/0018-shipping-cost-and-september-orders.md)
- [`decisions/0019-partial-payment-tolerance.md`](./decisions/0019-partial-payment-tolerance.md)

## Planning

- [`roadmap.md`](./roadmap.md) — Track A (safe storefront replacement) + Track B
  (platform fast-follow), phase-by-phase

## Session summaries (read before continuing multi-session work)

- [`sessions_summary/2026-09-03-day1-tail-and-content-migration.md`](./sessions_summary/2026-09-03-day1-tail-and-content-migration.md)
  — full content migration: all 6 product pages + `/products` + home + About/FAQ/Contact/legal.
  Decisions, current state, known gaps, next steps.
- [`sessions_summary/2026-09-04-g2-checkout-backend-and-admin-panel.md`](./sessions_summary/2026-09-04-g2-checkout-backend-and-admin-panel.md)
  — **G2 checkout backend (all 5 steps) + friction-less DR checkout (ADR 0010) + admin BI panel
  (task 1.7).** ADRs 0009–0011. Pre-cutover gaps + Anton's next-tasks roadmap.
- [`sessions_summary/2026-09-05-crypto-flow-fixes-and-legacy-import.md`](./sessions_summary/2026-09-05-crypto-flow-fixes-and-legacy-import.md)
  — **Crypto flow live + hardened** (auto-redirect, success page, cart, QStash cancel) + **legacy order
  import** (ADR 0012: 212 customers / 223 orders / $43.6k into Neon) + unified admin customer view.
  Commit/deploy checklist inside. **Next: customer accounts.**
- [`sessions_summary/2026-09-05-customer-accounts-v1.md`](./sessions_summary/2026-09-05-customer-accounts-v1.md)
  — **Customer accounts v1** (ADR 0013): bespoke auth (jose+scrypt, cookie `isrib_customer_session`) on
  the promoted `customers` anchor + guarded `(account)` cabinet w/ unified live+legacy history. Built +
  build-green + routing/proxy runtime-verified. **GATED on Anton: `db:push` + `CUSTOMER_AUTH_SECRET`.**
  **Next: referral discount (phase 2).** _(accounts v1 since shipped + runtime-verified; header account
  widget added — see log.)_
- [`sessions_summary/2026-09-05-referral-discount-phase2.md`](./sessions_summary/2026-09-05-referral-discount-phase2.md)
  — **Referral discount (ADR 0014, phase 2):** two-sided (referee 10% + referrer credit), non-stacking
  with crypto, `?ref` link. Built + verifier-approved (a reward-credit double-spend TOCTOU was caught +
  fixed). **GATED on Anton: `db:push` (BEFORE deploy) + `backfill:referral-codes`.**
- [`sessions_summary/2026-09-05-session-accounts-widget-referral.md`](./sessions_summary/2026-09-05-session-accounts-widget-referral.md)
  — **Session wrap:** customer accounts v1 + header account widget + referral phase 2 — all built +
  full-E2E runtime-verified. Deploy state + pending commit/deploy bundle inside. **Next: journal
  migration (301s).**
- [`sessions_summary/2026-09-06-journal-migration-plan-and-organic-strategy.md`](./sessions_summary/2026-09-06-journal-migration-plan-and-organic-strategy.md)
  — **Docs-only:** agreed the `isrib-research.com` → `/journal` port approach (ADR 0015: sub-brand
  identity, CTA → `/products/isrib-a15`, infra+7-articles+301s scope, point-domain-at-app 301s) +
  wrote the organic-content strategy, journal migration plan (with 301 map), and writing rules.
  **Next: journal BUILD.**
- [`sessions_summary/2026-09-06-journal-build.md`](./sessions_summary/2026-09-06-journal-build.md)
  — **Journal BUILD:** `isrib-research.com` ported into `/journal` (infra + 7 articles + host-gated
  301s), restyled onto the shop DS. Verifier-APPROVE + prober ALL-PASS + build-green. **GATED: commit +
  deploy + add `isrib-research.com` to Vercel** (activates the 301s). Latent source bug (unrendered
  ResearchCallout citations) caught + fixed.
- [`sessions_summary/2026-09-06-analytics-full-datalayer-capi.md`](./sessions_summary/2026-09-06-analytics-full-datalayer-capi.md)
  — **Analytics: full dataLayer + CAPI.** Hybrid model (Pixel direct, GA4/Clarity via GTM), client↔server
  `order_submitted` dedup (shared eventId + `orders.event_id`), webhook Purchase dedup, CAPI match quality,
  product_viewed/page_view/email_subscribed/scroll_depth coverage. Verifier-APPROVE + prober-PASS +
  **deployed + E2E verified (GTM Preview + Meta Test Events, server CAPI confirmed) + cleaned up. DONE.**
  Pre-cutover blocker closed. Next: cutover.
- [`sessions_summary/2026-09-08-email-campaign-relaunch-and-shipping-hotfix.md`](./sessions_summary/2026-09-08-email-campaign-relaunch-and-shipping-hotfix.md)
  — **Relaunch email SENT (607/607, 0 failed, lands in Gmail Important)** + email-campaign infra (ADR 0017,
  marketing_contacts + `/admin/campaigns`) + list consolidation & opt-out recovery + Sep-orders backfill &
  $10 shipping-cost BI (ADR 0018) + Path-B send/unsubscribe/promo-auto-apply + shipping→admin hotfix. Next: Email 2.
- [`sessions_summary/2026-09-09-go-landing-port-and-skill-rewrite.md`](./sessions_summary/2026-09-09-go-landing-port-and-skill-rewrite.md)
  — **`/go` landing: faithful port → full skill-driven rewrite** (breakthrough-advertising →
  100m-offers → dr-swipe-file → boron-letters) into a compliant mechanism-led DR funnel +
  "Get the research" opt-in. Merged to `main` (not pushed). Decisions, boundary discipline,
  open items (opt-in runtime-verify, research email sequence). Read with `marketing/go-rewrite.md`.
- [`sessions_summary/2026-09-09-nowpayments-hardening-and-crypto-ux.md`](./sessions_summary/2026-09-09-nowpayments-hardening-and-crypto-ux.md)
  — **NowPayments hardening (3 fixes) + crypto-payment UX.** Fix 1 floating-rate invoices + Fix 2 `webhook_logs`
  audit / non-finished ops alert / crypto duplicate-invoice dedup (both LIVE) + Fix 3 partial-payment tolerance
  (ADR 0019, ≤2% auto-accept — built, not committed) + expandable "How does crypto payment work?" checkout hint
  (built, visual-PASS). Deploy state + 2-commit plan + first-real-order verification checklist inside.
- [`sessions_summary/2026-09-06-cutover-complete-and-relaunch-prep.md`](./sessions_summary/2026-09-06-cutover-complete-and-relaunch-prep.md)
  — **CUTOVER COMPLETE** (isrib.shop serves the new app; G2 manual+crypto verified live; crypto-webhook
  308 bug fixed via non-www-apex canonical flip) + **journal domain migrated** (isrib-research.com 301s
  live; TBI article written, last /journal 404 closed) + **launch promo-code built** (ADR 0016,
  verifier-APPROVE) + **relaunch email drafted**. Email send **deferred to 2026-09-07** (deliverability
  work). `db:push` done; promo not yet seeded/committed/deployed. **Read before continuing.**

## Backlog (sources not yet fully ingested)

- Full research-evidence ingest → flesh out `product/mechanism-and-science.md`
- Full VOC phrase bank → `marketing/voice-of-customer.md`
- Email lead-gen system → `architecture/email-leadgen.md` (Track B)
- Journal content phases → write the roadmap articles in
  [`marketing/organic-content-strategy.md`](./marketing/organic-content-strategy.md) §4
  (journal infra is BUILT; all 8 launch articles incl. the TBI piece are written —
  see the 2026-09-06 build + TBI-article log entries)

See [`log.md`](./log.md) for the chronological record.
