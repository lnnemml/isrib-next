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

## [2026-08-27] setup | Analytics abstraction (src/lib/analytics)
- Built the single mandatory tracking API (no call sites yet), mirroring the
  nootropics reference (local: NORA/src/lib/analytics): `client.ts` `trackEvent(name,
  props?, eventId?)` → dataLayer + fbq + Clarity; `server.ts` `trackServerEvent(name,
  props)` → Meta CAPI + GA4 MP via Promise.allSettled (never throws, SHA-256 email);
  `types.ts` Window augmentation + shared types. Each file banner-forbids direct
  fbq/dataLayer/clarity (ADR 0005).
- IDs read from env only (no hardcoding). `order_submitted → InitiateCheckout` kept
  as PRIMARY Meta conversion. Reddit fired via GTM tag, not a direct client call.
- `.env.example` (new): public IDs w/ values (GA4/Meta/Clarity/Reddit/GTM) + the two
  server SECRETS as bare names (META_CAPI_ACCESS_TOKEN, GA4_API_SECRET) — flagged as
  required or trackServerEvent/G3 fails silently. Only Clarity wci5xmxfnu wired;
  wci589fgdr retired per ADR 0002 (documented as do-not-wire).
- Added `!.env.example` negation to scaffold `.gitignore` (user-approved) so the
  template is tracked. `npx tsc --noEmit` passes. No commit.

## [2026-08-27] decision | Delegation discipline + session-report observability (ADR 0006)

- Architect escalation from Anton at G0.2: the orchestrator executed 0.1/0.2 largely
  solo. 0.2 (analytics) is a named constraint area; its prompt ordered an explorer
  pass on nootropics, but the report showed neither explorer nor verifier — so
  constraint code (dedup, no-raw-fbq, env-only IDs) was self-authored and
  self-attested with no independent review.
- Recorded ADR 0006: subagent roles are MANDATORY for named classes (explorer before
  nootropics-mirroring builds; verifier after constraint-touching changes; prober
  after checkout/analytics/QA; implementer for non-trivial code). Solo allowed only
  for genuinely trivial work, and must be declared.
- Tightened `architecture/agent-roles.md` §3 (mandatory-not-discretionary) and added
  §6 (every report opens with a `Roles run:` line — the forcing function that makes
  delegation drift visible at gate time). Wired ADR into index.md.
- NOT a move to full-pipeline-on-everything — calibration, per architect-brief
  anti-over-rev. Immediate remedy: fresh verifier pass on committed 0.2 diff
  (d8133e8) before Session 1.1 is released.

## [2026-08-31] setup | UI component library from handoff-spec §4 + kitchen-sink

- Built `src/components/ui/` (Button, Card, Quote, ProductHero/HeroStat, NmrSection,
  MechanismSection, ComparisonTable, FaqAccordion, CheckoutStepper,
  PaymentSelector/RadioCard) from the exact class strings in `design/handoff-spec.md`
  §4 — no invented tokens; every utility resolves to the locked `@theme` block in
  `globals.css`. Variant-prop API for Button/Card; minimal `cn()` join helper (no
  tailwind-merge, so spec classes can't be dropped/reordered).
- NmrSection lightbox mounts its `<img>` only when `src !== null` — closes the
  unresolved-hole fetch bug caught in the design pass.
- Dev-only `/kitchen-sink` preview (route group `(dev)`, exposed at `/kitchen-sink`)
  renders every component in all states. Hard guard
  `if (process.env.VERCEL_ENV === "production") notFound();` keeps it off the live
  domain after cutover (VERCEL_ENV, not NODE_ENV — preview builds run
  NODE_ENV=production); `robots.ts` adds a `/kitchen-sink` disallow as a courtesy.
- Roles run: orchestrator → 2× explore (spec + repo map) → implementer → verifier
  (G1a, fresh context) APPROVE; `npx tsc --noEmit` clean. Presentational only — no
  data fetch, no analytics calls.
- Flagged for Anton before use in real pages: spec asset paths (formula SVG, NMR PNGs,
  FID/COA files) not yet in `public/`; all preview copy/values are placeholders (real
  numbers/prices from `raw/`); completed-stepper-label colour is an undocumented spec
  gap (reuses active treatment for now).

## [2026-08-27] gate | Session 1.1 verifier: APPROVE — G1a closed

- Component library (11 UI files + barrel + cn.ts) from handoff-spec §4, plus guarded
  (dev)/kitchen-sink + robots.ts. Committed 9db0d19. Report opened with `Roles run:`
  (orchestrator → 2× explore → implementer → verifier: approve). ADR 0006 working.
- Architect spot-check on committed code (not trusting the report): VERCEL_ENV guard
  present (line 34, correct — not NODE_ENV); PaymentSelector card slot aria-disabled +
  disabled, no live value path ("No card checkout — by design"); NmrSection lightbox
  <img> mounted only under `{src !== null && …}`. All confirmed.
- Resolved micro-fork (design call, architect): stepper completed-step label color is
  unspecified in §4. Decision — completed labels use a MUTED treatment
  (`text-text-subtle`) so the ACTIVE step stands out as "where you are"; upcoming stay
  faint. Not worth rebuilding kitchen-sink; apply when the stepper lands in the real
  checkout page (Day 2 checkout session prompt to carry this).
- Recorded local donor paths in migration-plan.md (old site + NORA/nootropics) and
  reconciled the raw/legacy gap: read legacy from the local path, copy assets to
  public/ at content-port, enumerate old URLs there for 4.1 redirects.

## Note on copy/prices (carry to every page-building session)
- All kitchen-sink copy is placeholder. Real prices come ONLY from the analytics
  summaries / raw sources (never invented); page copy must trace to the six beliefs
  (product/beliefs-and-objections.md) before shipping. This is a standing gate on
  every page session, not a one-off.

## [2026-08-27] data | Full product price table + copy-preservation rule (pre-1.2)

- Anton supplied live-page prices for the other 5 SKUs; catalog now fully priced in
  overview.md (integer cents). No more TODO prices for 1.2.
- Structural finding: ISRIB Original is NOT fixed size→price — it's a per-gram tiered
  model with a custom-qty calculator. Recorded discriminated-union requirement
  (fixed vs per-gram-tiered) in overview.md so the 1.2 data model doesn't assume one
  shape. Live calculator deferred (not 1.2 scope).
- Copy decision (Anton): existing product-page copy is validated and PRESERVED —
  page sessions port it verbatim from the local old site, not regenerate. Standing
  copy gate updated: port verbatim + compliance-scan-and-FLAG (never silent rewrite);
  new copy only where the old site has none; prices only from source, never invented.

## [2026-08-31] setup | Product data (products.ts) + (shop)/products/[slug] template

- Built `src/lib/copy/products.ts` (6 products, typed) + the dynamic product page
  rendering from it via the 1.1 UI components (ProductHero/HeroStat, NmrSection, Button
  + token-only pricing cells). Explorer pass first (ADR 0006): legacy pages + NORA
  pattern. `getProduct` / `getAllProductSlugs` / `formatCents` helpers; async params,
  generateStaticParams, generateMetadata, notFound. `next build` pre-renders all 6
  slugs as SSG; `tsc --noEmit` clean. Presentational only — no analytics, no checkout.
- Prices ported as integer cents, verified to the cent vs the authoritative table AND
  the legacy pages (incl. Anton's extras). `format` carried explicitly; tiered NOT
  flattened. Shape recorded in `architecture/data-model.md`.
- Source-data conflict resolved: the legacy A15 page contradicts itself on the 100mg
  powder (JSON-LD $50 vs tier grid $60). Anton confirmed **$60 (6000¢)** — set in
  products.ts.
- Copy ported verbatim (subtitle/description/trust bullets/specs). Compliance: the
  ported SHORT descriptions are clean (no rx-brand/cancer/guarantee). FLAGGED for the
  later deep-copy port: legacy mechanism sections (NOT ported this session) name
  `phenamin`/`sydnocarb` (N-Acetyl-Brom) and `Ladasten` (Bromantane) + carry strong
  efficacy figures — Anton's call before that copy ships.
- Assets: copied A15's real formula SVG + H1/C13 NMR + two FID zips into
  `public/{images,files}`. COA does not exist in the legacy site (page asserts "COA
  ✓ Included" but no file) → flagged, not fabricated. Other 5 products' formula/NMR/FID
  exist in legacy but are out of scope this session (hero shows placeholder).

## [2026-08-31] escalate | Pricing union extended beyond overview.md (A15 tiers, Original caps)

- overview.md scopes A15 to `fixed` and ISRIB Original to `per-gram-tiered`-only. Legacy
  pages show A15 ALSO sells a 100mg + per-gram bulk tiers, and Original ALSO sells
  capsules. Anton ruled in-session (WHAT-level) to include both.
- Interim model (approved-plan): keep the discriminated union on `pricing.kind`, add
  OPTIONAL secondary fields — `tiers?` on `PricingFixed`, `formats?` on
  `PricingPerGramTiered`. Nothing flattened; still a union.
- Options for the architect to ratify: (A) accept the optional-secondary-field
  refinement and update overview.md; (B) promote A15/Original to a distinct
  `fixed+tiers` shape; (C) revert to the strict union and drop the extra SKUs (contra
  Anton's product call). **Lean: (A)** — minimal, matches the live catalog, preserves
  the union's intent. Needs overview.md reconciliation or a new ADR. Not positioning.

## [2026-08-31] decision | ADR 0007 ratifies pricing shape (option A) — G1b closed

- Ratified the 1.2 escalate: discriminated union on `pricing.kind` + optional secondary
  fields (`tiers?` on fixed, `formats?` on per-gram-tiered). Verified committed
  products.ts: A15 bulk tiers = 10/15/20% off the $200/g base (consistent); Original
  matches live to the cent; A15 100mg = $60 (visible grid over JSON-LD). Reconciled
  overview.md; wired ADR into index. Rejected (B) flatten-to-one-shape and (C) drop
  extras.
- G1b CLOSED: 6 slugs SSG-render, prices to the cent, union not flattened, ported
  short copy compliance-clean.
- Open punch-list items (NOT blocking 1.2, gated before their ship points):
  * COA claim: A15 page asserts "COA Included" but no COA file exists → must not assert
    an unverifiable cert. Reword to the real artifact (¹H/¹³C NMR verification, which IS
    attached) + "COA on request per batch", OR drop in a real COA PDF. Architect call
    pending Anton on which. Pre-A15-ship gate.
  * Deep-copy port (later session): legacy mechanism copy names phenamin/sydnocarb
    (N-Acetyl-Brom) and Ladasten (Bromantane) + strong efficacy figures → HARD compliance
    gate; my pass required before that copy ships (rx brand names + claim risk).
  * Other 5 products' formula/NMR/FID exist in legacy (placeholder shown now) → port
    into public/ before cutover.
- Added `*.patch` to .gitignore (architect transfer patches were landing untracked).

## [2026-08-31] decision | Punch-list resolutions: COA (variant A) + deep-copy compliance scope

- COA claim → **variant A**: the A15 trust block reworks "COA Included" to the real
  attached artifact — third-party ¹H/¹³C NMR verification (DMSO-d6) — plus "COA
  available per batch on request". No fabricated cert. Applied when the A15 trust
  block is finalized (bespoke A15-page session).
- Deep-copy compliance → **Anton accepts, keep legacy copy as written**, scoped by
  surface (recorded in marketing/messaging-angles.md): named research compounds +
  legacy efficacy copy are fine on ORGANIC product pages; the PAID-traffic destination
  (A15 landing / any Meta ad target) stays clean of rx brand names + asserted efficacy.
  Rationale: Meta reviews the ad's destination page, not just the creative.
- Both open punch-list items from the G1b entry are now closed.

## [2026-08-31] decision | ADR 0008 — full migration (not MVP) + multi-item cart

- Anton's ruling on reviewing the hollow generic A15 page: (1) this is a FULL
  migration — preserve everything the live site does, improve in places, never reduce;
  "MVP" retired. (2) Real multi-item cart (header badge → checkout); customers buy A15
  with other SKUs.
- Recorded ADR 0008. Reconciled data-model.md: single-order/MVP model → multi-line
  `orders` + `order_items`; client cart state; G2 test order is now multi-item.
- Drift fixes in data-model.md: the stale "pending ratification" escalate note →
  marked ratified (ADR 0007); A15 `kind` corrected `fixed` → `per-gram-tiered` (the
  live A15 page is a per-gram calculator like Original) — products.ts still says fixed,
  to be corrected in the A15 port. Prices unchanged.
- 1.3 (long-form belief landing) PARKED — not the A15 page. Product pages become
  faithful ports of the live pages (commerce core intact), lightly design-lifted.
- Parity principle: every gate now includes "did we drop anything the old site had?"
  Early old-site inventory (explorer over the local path) recommended.
- Reshaped sequence (roadmap to follow): site chrome + cart foundation → A15 faithful
  port → other 5 ports → Day-2 multi-line orders schema + checkout + payment (G2).

## [2026-08-31] setup | Site chrome + client cart foundation (ADR 0008)

- Explorer pass first: reverse-engineered the live cart (localStorage "isrib_cart";
  badge=Σcount; add merges sku+format+grams+price; update min-1; remove-by-index;
  checkout reads storage → subtotal → POST /api/checkout → clear) + NORA's
  hydration-safe pattern.
- Built the site chrome in the ROOT layout so every route inherits it: `Header`
  ("use client" — wordmark, nav, mobile menu, live cart badge → /checkout) + `Footer`
  (server — 4-col legacy structure, product links resolve to real /products/[slug]).
  Tokens-only light lift; legacy 🧺 emoji → SVG.
- Built the client cart as the SOLE API (`src/lib/cart/`): Context + useReducer,
  `useCart()` → { lines, count, subtotalCents, addLine, updateQuantity, removeLine,
  clear }. Storage/read/write live only in `CartProvider`; verifier grep-confirmed no
  other consumer touches storage. Hydration guard (empty SSR state, load in mount
  effect, persist guarded by `hydrated`) — no mismatch, no empty-state clobber.
- `AddToCartButton` wired on every discrete purchasable (fixed formats + tiered trials)
  across product pages; per-gram tiers stay display-only. `/checkout` replaced with a
  cart shell (lists lines, qty stepper/remove, subtotal) — NO card fields, NO
  submission (Day 2). `tsc` clean; `next build` all 15 routes; verifier APPROVE (7/7).
- **Parity deltas (intentional, flagged):** line-item shape → ADR 0008
  { productSlug, format, quantity, sizeLabel, linePriceCents } (drops legacy mg-in-grams
  bug + dollar prices); storage key → `isrib_cart_v2` (legacy shape not forward-compat,
  garbage filtered on load); promo codes + per-gram calculator + capsule mg display
  deferred to the ports/Day-2. Not-yet-built linked routes (About/FAQ/Contact/Quality/
  Safety/Terms/Privacy/Research/Disclaimer + /products index) 404 until their sessions.
  Chrome also renders on /go (DR landing) — NORA hides chrome there; a pathname
  exclusion is worth considering later.
