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

## [2026-08-31] lint | Cart persistence runtime-verified (reported 1.4 bug was stale server)

- A "cart doesn't persist across reload" bug was reported before the 1.5 gate. Verified
  AT RUNTIME (real Chrome, dev :3000 + prod `next start` :3100, not curl/review):
  add → reload → cart persists in every path tried (product page, checkout page, clean
  slate, add+reload same tick). Console clean (no hydration mismatch). Committed code
  (4efb9c9) persists correctly — Anton confirmed the earlier loss was a stale dev server
  before the 1.4 fix applied. No code change.
- Real finding kept for later (not blocking): in PRODUCTION, an Add click fired BEFORE
  React hydrates the button is dropped (SSR-rendered button, onClick not yet wired) — no
  add, no feedback. Invisible to curl/dev/review. Consider gating Add-to-Cart until
  hydrated + surfacing saveCart/loadCart failures (currently silently swallowed) when the
  A15 order block is built.

## [2026-09-03] lint | A15 port design-regression fix + mandatory visual gate

- Fixed design regressions in the A15 port (7e1f744): it computed correctly but had
  DROPPED live-page elements and under-used the locked component library. Brought each
  section up to the live page's richness THROUGH the handoff-spec §4 components (no
  hand-rolled blocks where a component exists):
  - **Order block** (`OrderBlock.tsx`): now the accent `Card` (top cyan rule, matching the
    live card's gradient rule). Restored the order-card header (name + subtitle + purity/COA
    line — COA framed "available per batch (on request)", NOT the live's "Included", per
    variant A), the perks list (from `trustBullets`), and a free-shipping/trust strip beside
    the CTA. Format options gained icons; capsule cards route through the same highlighted-
    card pattern (popular = accent).
  - **Price breakdown** (`PerGramCalculator.tsx`): restored the full Total / Quantity /
    price-per-gram / You-save / tier-label rows as a prominent dark panel via the locked
    `Card inverse` variant (mirrors the live dark Total Price card). A default 1g result is
    computed on mount so the breakdown + a prominent, always-visible Add-to-Cart (label
    reflects selection) show immediately — the live page's persistent-CTA behaviour.
  - **Tier grid**: restored hierarchy — tier-name badges (Trial/Standard/Popular/Serious
    Users/Bulk), the Popular tier accent-highlighted (cyan, star), save-badges in accent
    green. Kept the design-system tokens (cyan accent + green success) rather than copying
    the live's amber — design system is locked.
  - **Research applications** (`page.tsx`): plain base cards → accent `Card`s with icon
    chips (live's icon-card treatment).
  - **Technical specifications**: single flat `<dl>` → the live's 3-part treatment
    (Chemical properties / Storage & handling / **Documentation** column) as three `Card`s;
    Documentation COA framed "On request" (compliance-safe), NMR "Available", Safety
    "Provided". Hero + dark mechanism section left as-is.
- Data: added optional `Trial.badge`, `PerGramTier.tierName`/`popular` (A15 only); threaded
  `tierName` through `computeTieredPrice` result for the breakdown label. Prices UNCHANGED.
- **Mandatory NEW gate — VISUAL side-by-side in a real browser** (Chrome, dev on :3000 vs
  the live page served on :8080): confirmed nothing dropped and no element reads flatter
  than the live one. Popular-tier click verified live: 2g → $360, per-gram $180/g, You save
  $40 (10%), POPULAR TIER label, CTA "Add to cart — 2g for $360" (matches live math to the
  cent). `tsc` clean; `next build` all 15 routes. Code-review fidelity alone is NOT
  sufficient for future ports — the browser side-by-side is now required.
- **Roles run:** orchestrator (inline: read live page + port + handoff-spec §4, edited,
  ran the browser visual gate directly). No subagents — single-file-cluster fix.

## [2026-08-31] setup | A15 faithful port (reference product port, ADR 0008)

- Ported the live A15 product page onto the new stack — the reference every other product
  follows. `src/lib/copy/pricing.ts`: pure `computeTieredPrice` faithfully reproduces the
  live per-gram calculator (trials 100mg $60 / 500mg $130; tiers 1g $200 · 2–4g $180 −10%
  · 5–9g $170 −15% · 10–30g $160 −20% per g; savings vs $200/g; min 100mg / max 30g).
  `OrderBlock` + `PerGramCalculator` (client) = format selector + calculator + capsule
  selector; all adds go through `useCart` (sole API) with a mounted-guard (closes the
  pre-hydration dropped-click found this session).
- products.ts: A15 `fixed → per-gram-tiered` (data-model.md ¹ correction applied) —
  prices UNCHANGED, verified to the cent; added machine-readable calculator bounds
  (`Trial.mg`, `PerGramTier.minMg/maxMg`) so display + calculator share one source. Added
  optional `mechanism`/`education` rich content (ported verbatim). Other 5 products +
  Original's display path untouched (OrderBlock gated on per-gram-tiered w/ `trials[].mg`).
- **Anton rulings (2026-08-31):** (1) calculator replicates the live `findTier` exactly —
  quantities between tier ranges (1.5g/4.5g/9.5g) are "invalid", NOT smoothed. (2) research
  copy ported VERBATIM incl. cited animal-study efficacy (eLife 2020 aged-mice; Rosi/Walter
  2017 TBI) — a deliberate override of the default "no efficacy" posture, logged here for
  the record. rx-brand/cancer/guarantee remain absent (hard-blocked). COA variant A: no
  "COA included" assertion — NMR framed as independent ¹H/¹³C verification + "COA available
  per batch on request" (shared trust bullet reworded).
- **Verified at RUNTIME** (real Chrome, dev): calculator to the cent across 100mg/500mg/1g/
  3g/7g/15g + gap-invalid (1.5g) + bulk (35g) + below-min (50mg); format switch → caps;
  Add-to-Cart powder (3g→$540) + capsule (→$170) produce correct line items; checkout lists
  both, subtotal $710; **reload persists**. `tsc` clean; `next build` all 15 routes.
  Fresh-context verifier APPROVE (6/6, re-ran the calculator math independently).

## [2026-09-03] gate | A15 port — inventory-driven anti-amputation pass → G1 (A15) closed

- Root cause of the recurring "sections keep disappearing": the deep **"Understanding
  ISRIB A15"** mechanism section was silently AMPUTATED. Prior passes rendered only the
  dark 3-step `MechanismSection` (live block 4D) + a thin 4-item `education` grid — a
  compression of the live page's 5 rich sub-blocks (12+ cards, a 7-row properties table,
  and the Walter-Lab callout) down to ~4 cards. Also: `(shop)/isrib-a15/page.tsx` was a
  dead 7-line placeholder (never the real route — the canonical A15 page is the dynamic
  `products/[slug]` route, slug `isrib-a15`, which the footer links to).
- **New method applied (agent-roles, ADR 0006):** explorer produced a COMPLETE ordered
  inventory of the live page (`product_isrib_A15.html`, 8 top-level blocks; block 4 =
  4A–4E). LEAD reconciled it line-by-line into a port contract (keep / restyle /
  deliberate-change per item). Implementer rebuilt to the checklist; verifier (fresh
  context) counted every block in the rendered DOM; LEAD ran the mandatory browser
  side-by-side (dev :3000 vs live :8080) top-to-bottom.
- **Restored (no amputation), via a bespoke `UnderstandingSection.tsx` on locked tokens:**
  4A "What is ISRIB A15?" (2 paras + 7-row properties table), 4B "The ISR Window" (2 paras
  + 3 cards + Walter-Lab green callout), 4C "Translational restoration" (2 paras + 3 cards),
  4D dark 3-step `MechanismSection` (locked component, in live position), 4E "Key research
  applications" (6 cards). Plus hero enrich (3 stats / Most-Popular + In-stock badges /
  formula caption / Order + Learn-More CTAs), NMR enrich (per-spectrum 400/100 MHz · DMSO-d₆
  + Batch-2 badge + verbatim ¹H/¹³C key-signals + dark "Download raw FID data" banner),
  specs enrich (Storage Light/Moisture rows), and capsule-card detail lines.
- **Design discipline held:** the live rainbow (green/amber/cyan/purple/magenta/red) is
  collapsed onto the locked palette (success/accent/primary/cyan/blue/slate) — NO invented
  colors. Compliance held: COA "on request / per batch" everywhere (never "Included");
  cited animal-study efficacy ported verbatim (ratified 2026-08-31, organic page); no
  rx brand names / cancer / guarantee. Prices UNCHANGED; calculator + cart untouched.
- Dead `/isrib-a15` placeholder → now `redirect("/products/isrib-a15")`. `tsc` clean;
  `next build` all 15 routes. **Roles run:** LEAD (orchestrator) → explorer (live inventory)
  → LEAD reconcile (port contract) → implementer → verifier (fresh context, APPROVE) →
  LEAD browser visual side-by-side (PASS). Work is uncommitted on
  `fix/a15-port-design-regressions` (no commit — Anton commits/deploys).
- **Lesson filed:** a faithful port must be driven by a COMPLETE section inventory of the
  source + an explicit per-item contract, not "improve what's there" — otherwise rich
  sections compress into a component that's too small and the loss is invisible to code
  review. The browser side-by-side is the backstop that catches it.

## [2026-09-03] lint | A15 hero + mechanism-band visual refinement (owner-requested)

- Anton flagged two visual issues on `/products/isrib-a15` (screenshots): the dark mechanism
  band read left-hugged with an empty right third, and the hero was sparse/"generic and dry".
- **Mechanism band centered** (`MechanismSection.tsx`): header block → `mx-auto text-center`;
  step grid was `lg:grid-cols-5` (5-block design) but A15 has 3 steps → left 3/5 with empty
  right. Now the large-screen column count = `min(steps.length, 3)` via a CSS-var + arbitrary
  `lg:[grid-template-columns:var(--mechanism-lg-cols)]`, grid `max-w-[1000px] mx-auto`; quote
  centered. Balanced 3-column row, no dead space. Adapts to other step counts.
- **Hero enriched** (`ProductHero.tsx` + page.tsx + products.ts): added an optional
  `subtitle` slot to ProductHero (mono formula subheading `C₂₂H₂₂Cl₄N₂O₄` under the H1, reusing
  the Formula spec) and an optional `heroHighlights?: string[]` (A15-only) rendered as a 4-item
  ✓ checklist below the stats — factual value props sourced from the ported properties table
  (6.25× potency / EC₅₀ 0.8 nM; BBB + ~8h half-life; ¹H/¹³C NMR per batch; free worldwide
  shipping). Fills the left column against the taller formula card. Both fields optional → the
  other 5 products render unchanged.
- **Two LOCKED components changed** (`MechanismSection`, `ProductHero`) — owner-approved design
  refinement, tokens only (no invented palette; arbitrary values are layout-only). handoff-spec
  §4 should be reconciled to match on the next design-doc pass (flagged, not yet done).
- Runtime-verified in Chrome (dev :3000): hero fills, mechanism band centered/balanced. `tsc`
  clean; `next build` all 15 routes. Minor open nit: the centered mechanism quote keeps its
  `border-l-2` accent bar (reads slightly off centered) — left as-is pending Anton's eye.
  **Roles run:** LEAD (orchestrator) → implementer → LEAD browser visual check (PASS).

## [2026-09-03] lint | Hero H1 typography — Geist Mono, lighter, smaller (owner-requested)

- Anton: the hero product name "ISRIB A15" was harsh on the eyes. Cause = `text-display`
  (58px) + `font-bold` (700) + tight `-0.035em` tracking on an all-caps compound name.
- Chosen (via options w/ previews): switch the shared hero `<h1>` to **Geist Mono, ~46px,
  weight 500, tracking normal** — a real in-system font change (Mono is one of the two
  locked faces), calmer and consistent with the mono formula subheading + mono stat labels.
  Final className: `mb-[22px] font-mono text-[46px] font-medium leading-[1.06] tracking-normal`
  (`ProductHero.tsx`). Geist Mono 500 confirmed loaded in layout.tsx (weights 400/500/600).
- Shared component → applies to all 6 product heroes by design (one consistent title style,
  not a per-page override). `tsc` clean; `next build` all 15 routes; runtime-verified in Chrome.
- **handoff-spec §4 reconciliation now covers three owner-approved locked-component changes**
  (MechanismSection centering; ProductHero `subtitle` slot + `heroHighlights`; hero H1 →
  mono/46px/500). Still flagged as pending on the next design-doc pass.
  **Roles run:** LEAD → AskUserQuestion (font direction) → implementer → LEAD browser check (PASS).

## [2026-09-03] gate | ISRIB Original faithful port (1.6) — inventory-driven, G1(Original) closed

- Ported the live ISRIB Original page (`product_isrib.html`) onto the new stack using the
  same inventory-driven method as A15 (branch `feat/isrib-original-port`). Prior state was
  the hollow generic render (display-only price cards, placeholder hero, no science/comparison/
  NMR). Explorer produced a 14-block inventory; LEAD reconciled to a per-item contract;
  implementer built; verifier REJECTED once (fixed); LEAD ran the browser side-by-side + a
  live calculator interaction.
- **Commerce core = A15 pattern, zero new logic:** Original's prices already matched to the
  cent, so wiring the calculator was pure data — added `mg`/`badge` to trials + `minMg/maxMg/
  tierName`/`popular` to tiers, and page.tsx's existing gate routes it through the shared
  `OrderBlock`/`PerGramCalculator`. Runtime-verified: default 1g→$100 (Standard); Popular
  2g→$180 ($90/g, save $20/10%). Capsules 25×20mg $100 / 50×20mg $140 (unchanged).
- **Ported what EXISTS (no A15-style over-build):** Original's science is one modest section,
  not A15's deep 5-block. Ported via the dark `MechanismSection` — "ISRIB — the original ISR
  inhibitor" + Discovery/Published-Research body + 3 "How ISRIB Works" steps (verbatim). NO
  fabricated `understanding` section.
- **New section type reused a locked component:** the live "ISRIB vs A15" table → locked
  `ComparisonTable` (new optional `comparison` field). CELL-COLOR fix after verifier REJECT:
  the live AMBER cells (ISRIB "50+ mg", "Moderate") are NEUTRAL/moderate, not bad — first pass
  mapped them to red (`text-danger`), which inverted the sell-ISRIB intent. Corrected to
  neutral (default text); only A15's "Higher" cost stays red (the one live-red cell). Favorable
  = success/green. Gold-standard callout on tokens (accent left border), NO amber.
- **Hero enrich (mirrors A15):** formula SVG (`isrib-original-formula.svg`, copied from legacy)
  + caption, 3 mini-stats, badges (Original Formula / In stock), mono subheading, Original-
  specific highlights, data-driven CTAs (Order→#order, The Science→#science). CTAs made
  data-driven on `Product.heroCtas` (A15 keeps its pair; no product hardcodes anymore).
- **Specs:** CAS/MW/Light/Moisture rows; COA "On request" (variant A, never "Included");
  ¹H/¹³C NMR "Available".
- **NMR section — OWNER-ADDED (assets provided), with a data gap:** the live Original page has
  NO NMR section, but Anton supplied ¹H/¹³C spectra PNGs + FID zips "for the Original port".
  Renamed the 4 stray files to `isrib-original-*` convention + wired `assets.spectra`/`downloads`
  → renders 2 spectra + dark FID banner. **FLAG (pre-ship gate):** we have NO source for
  Original's MHz / solvent / batch / key-signal δ values, so `meta`/`batch`/`signals` were
  OMITTED (not fabricated). Anton must supply these (like A15 has) before ship, or the spectra
  ship without peak-assignment footers.
- Tokens-only; efficacy copy ratified (organic page); no rx/cancer/guarantee. `tsc` clean;
  `next build` all routes. A15 + the other 4 products untouched (only optional fields added).
- **Roles run:** LEAD (orchestrator) → explorer (live inventory) → LEAD reconcile (contract) →
  implementer → verifier (REJECT: comparison cell colors) → implementer (fix) → LEAD browser
  side-by-side + live calculator check (PASS). Work uncommitted on `feat/isrib-original-port`.

## [2026-09-03] gate | MPEP Oxalate faithful port (1.6) — fixed-size order block + deep section, G1(MPEP) closed

- Ported the live MPEP Oxalate page (`product_MPEP.html`) to A15-level fidelity (branch
  `feat/mpep-port`). MPEP is an mGluR5 negative allosteric modulator — the science is
  ENTIRELY different from ISRIB (glutamate/addiction/Fragile-X), so all mechanism copy is
  MPEP-specific and ported verbatim. Explorer produced a 15-block inventory (compliance
  scan CLEAN); LEAD reconciled; implementer built; verifier APPROVED; LEAD ran the browser
  side-by-side + live order-block interaction.
- **New reusable component — fixed-size rich order block:** the live MPEP order block is a
  SINGLE rich card with a size selector (100mg/500mg/1g, updating price + per-mg, one
  Add-to-cart), NOT our 3 separate PriceCards. Built `FixedSizeSelector.tsx` + extended
  `OrderBlock.tsx` to a fixed path (shares the card chrome: header, purity/COA line, perks,
  free-shipping strip). page.tsx now routes ALL `fixed` products through OrderBlock —
  so ZZL-7 / Bromantane / N-Acetyl-Bromantane also gained the richer order card (verified
  no regression: Bromantane 1g→$40.00/$0.04-mg renders correctly). A15/ISRIB keep the
  per-gram calculator (routing guard on `trials[].mg`). Runtime-verified: MPEP 100mg→$60.00
  ($0.60/mg), 1g→$200.00 ($0.20/mg); prices unchanged, exact.
- **Deep "Understanding MPEP" section reused the A15 machinery:** MPEP's structure is identical
  to A15's, so it maps onto the existing `UnderstandingContent` slots (whatIs / isrWindow /
  translational / applications) + the dark `MechanismSection` — pure DATA, no new component.
  All 5 blocks verbatim: What-is + 5-row properties table, anti-addictive mechanism (3 cards
  Alcohol/Nicotine/Stimulants + callout), cognitive research (3 cards LTP-LTD/Fragile-X/
  Anxiety), mechanism 3-step (Selective binding/Negative modulation/Cascade inhibition),
  6 application cards. NOTE (naming debt): the slot keys are A15-named (isrWindow/translational)
  but hold MPEP content — harmless (renders generically from data), worth a future rename.
- **NMR fully sourced (no gap, unlike ISRIB Original):** copied the live spectra + FID
  (`mpep-*`), real meta (400/100 MHz · CDCl₃), Batch-2 badges, verbatim ¹H/¹³C key-signals.
- Hero: formula SVG + caption, 3 stats (3rd = mGluR5/Selective NAM), single "In stock" badge,
  chemical-name subheading via new optional `heroSubtitle`, highlights, CTAs (#order/#understanding).
  Specs +Light/Moisture; COA "On request". No comparison table (MPEP has none).
- Tokens-only (live amber/purple/red → cyan/blue/success); compliance CLEAN (no rx brand
  names, no cancer, no guarantee; research-substance/disease-model terms are verbatim
  preclinical framing). `tsc` clean; `next build` all 6 product routes.
- **Minor flag (non-blocking):** the fixed order block shows two-decimal prices ("$60.00",
  matching the live) via a local `usd()`, while the calculator products use `formatCents`
  ("$60"). Cross-product cosmetic inconsistency — the fixed block is MORE faithful to its
  live source; consider normalizing later.
- **Roles run:** LEAD (orchestrator) → explorer (inventory + compliance scan) → LEAD reconcile
  (contract) → implementer → verifier (fresh context, APPROVE) → LEAD browser side-by-side +
  live order-block interaction + no-regression check on Bromantane (PASS). Work uncommitted
  on `feat/mpep-port`.

## [2026-09-03] gate | Bromantane faithful port (1.6) — data-only reuse, G1(Bromantane) closed

- Ported the live Bromantane page (`product_bromantane.html`) to A15/MPEP-level fidelity
  (branch `feat/bromantane-port`). Bromantane is a dopaminergic-noradrenergic actoprotector —
  its deep section maps EXACTLY onto the existing `UnderstandingContent` machinery, so the
  port was PURE DATA + assets (no new components; the fixed rich order block already existed
  from the MPEP work). Explorer produced a 9-block inventory + compliance scan; LEAD ruled
  compliance; implementer populated data; verifier APPROVED; LEAD ran the browser gate.
- **Reused everything:** `understanding` (whatIs = What-is + 5-row table; isrWindow =
  Actoprotective mechanism + 3 cards + callout; translational = Neurochemical profile + 3
  cards; applications = 6 cards) + dark `MechanismSection` (3 steps: Enzymatic upregulation /
  Sustained monoaminergic tone / Multi-system resilience). All verbatim. NMR fully sourced
  from the live page (real spectra + FID `bromantane-*`, 400/100 MHz · CDCl₃, **Batch 1**,
  verbatim ¹H/¹³C key-signals). Hero: formula SVG + caption (C₁₆H₂₀BrN), 3 stats, single
  "In stock" badge, chem-name subheading, highlights, CTAs. Specs +Light/Moisture. No
  comparison table. Order block (fixed 1g $40 / 2g $70 / 5g $160) untouched.
- **COMPLIANCE (LEAD ruling):** the copy names **"Ladasten"** once, in "What is Bromantane?"
  ("...evaluated in multiple clinical trials … under the trade name Ladasten."). Ladasten is
  the rx brand of bromantane itself. Per the ratified 2026-08-31 policy, rx/brand names are
  PERMITTED on organic product pages (forbidden only on paid-traffic destinations) — kept
  VERBATIM. `memantine`/`amantadine` also appear (verbatim scaffold-family mention in the
  neurochemical block) — generic, non-ad body copy, fine. No cancer/guarantee. COA framed
  "on request" (never "Included"). Standing rule keeps this page off `/go` + Meta ad targets.
- **Faithful-port tension flagged (copy decision for Anton, NOT fixed):** the live hero 3rd
  stat is "DA+NE / Reuptake", but the mechanism copy explicitly says bromantane does NOT block
  reuptake (it upregulates catecholamine SYNTHESIS). Ported the live stat verbatim (faithful);
  if Anton wants it corrected for accuracy (e.g. "DA+NE / Synthesis"), that's a one-line copy
  change. Same posture as A15's efficacy-copy override — port what the live page shows, surface
  the tension.
- Tokens-only (live amber/purple/red/indigo/rose → cyan/blue/success via the locked
  components); `tsc` clean; `next build` all 6 product routes. Other products unchanged
  (only optional fields on `bromantane`).
- **Roles run:** LEAD (orchestrator) → explorer (inventory + compliance scan) → LEAD reconcile
  + compliance ruling → implementer → verifier (fresh context, APPROVE) → LEAD browser gate
  (hero + deep section + Ladasten present) PASS. Work uncommitted on `feat/bromantane-port`.

## [2026-09-03] gate | N-Acetyl-Bromantane faithful port (1.6) — whatIs 2-table extension, G1(N-Acetyl) closed

- Ported the live N-Acetyl-Bromantane page to A15-level fidelity (branch
  `feat/n-acetyl-bromantane-port`). `fixed` product, already had the rich order block — mostly
  DATA + assets, PLUS one small ADDITIVE component extension. Explorer inventory (compliance
  scan); implementer built; verifier APPROVED (esp. no-regression on the shared component);
  LEAD ran the browser gate.
- **Component extension (additive, backward-compatible):** N-Acetyl's "What is" block is richer
  than the others — it has TWO tables (properties + a safety/toxicity LD₅₀ table) with the
  Morozov efficacy paragraph between them. Extended `UnderstandingContent.whatIs` with optional
  `paragraphs2?` + `table2?`, and `UnderstandingSection.tsx` renders heading → paragraphs →
  table → paragraphs2 → table2 (both guarded). A15/MPEP/Bromantane don't set the new fields →
  verifier confirmed via Playwright DOM count: 1 table each on those, 2 on N-Acetyl, zero
  console errors. No amputation of the toxicity table.
- Deep section verbatim: whatIs (2 tables + Morozov LD₅₀ data), isrWindow (Why-the-acetyl +
  3 cards + Morozov green callout w/ attribution), translational (dopaminergic mechanism + 3
  cards), applications (6 cards), mechanism 3-step. NMR fully sourced (n-acetyl-* assets,
  400/100 MHz · CDCl₃, Batch 1, verbatim key-signals incl. the amide C=O δ 174.77 marker).
  Hero: formula SVG + caption (C₁₈H₂₂BrNO), 3 stats (3rd = Amide/Tertiary N), "In stock" badge,
  chem-name subheading, highlights, CTAs. Specs +Light/Moisture; COA "on request".
- **COMPLIANCE (Anton pre-ruled: port AS-IS, organic page):** copy names **phenamin** (many)
  and **sydnocarb** (2×) — reference stimulants in comparative Morozov-1998 LD₅₀/efficacy data.
  Kept VERBATIM (permitted on organic product pages per the 2026-08-31 policy). Explorer +
  verifier confirmed NO cancer/guarantee/dementia (hard blocks even on organic pages). COA
  framed "On request" in both order block + Documentation column — an INTENTIONAL divergence
  from the live source's "Included" (variant A). Standing rule keeps this page off `/go` +
  Meta ad targets.
- Tokens-only; `tsc` clean; `next build` all 6 product routes. Other products unchanged
  (only optional fields + the additive whatIs extension).
- **Roles run:** LEAD (orchestrator) → explorer (inventory + compliance scan) → LEAD reconcile
  → implementer → verifier (fresh context, APPROVE — no-regression confirmed) → LEAD browser
  gate (hero + 2-table whatIs) PASS. Work uncommitted on `feat/n-acetyl-bromantane-port`.
- **Catalog milestone: 5 of 6 products fully ported** (A15, ISRIB, MPEP, Bromantane,
  N-Acetyl-Bromantane). Only **ZZL-7** remains for Day-1 tail (1.6).

## [2026-09-03] gate | ZZL-7 faithful port — CATALOG COMPLETE (6/6), G1(ZZL-7) closed

- Ported the live ZZL-7 page (`product_zzl_7.html`) — the LAST product. ZZL-7 is a
  SERT–nNOS-interaction fast-onset research compound; its live page is SIMPLER than
  A15/MPEP (like ISRIB Original): no deep "Understanding" section, no NMR. Explorer
  inventory + compliance scan; implementer built; verifier APPROVED; LEAD browser gate.
- **What was ported:** single-size order block (100mg $50, unchanged — the live HTML renders
  only 100mg despite stale JS for 500/1000mg); hero (formula SVG + caption C₁₁H₂₀N₂O₄, 3 stats
  incl. Fast/Onset, TWO badges "Fast Onset"+"In stock", highlights, CTAs); science via the dark
  `mechanism` 3-step (SERT-nNOS binding / Rapid BBB crossing / Fast-onset response) + the
  "Fast-Acting Breakthrough" intro as body; a new lightweight **`findings`** section ("Key
  research findings", 3 icon-cards ⚡/🧠/🔬) — verbatim; the `comparison` table "ZZL-7 vs
  Traditional Antidepressants" (reused ComparisonTable). Specs +Light/Moisture.
- **New optional field:** `Product.findings?` + a minimal token render in page.tsx (gated on
  presence; verifier confirmed the other 5 products show zero findings sections). This is the
  simpler-page counterpart to the deep `understanding` machinery.
- **NMR correctly ABSENT:** ZZL-7 has no spectra assets, so no NMR section renders AND the
  Documentation column omits the ¹H/¹³C NMR rows — the live page CLAIMS "¹H NMR Available /
  Mass Spec Available" but we have no files, so we do NOT assert them (compliance-safe default,
  same principle as COA variant A). COA "On request".
- **⚠️ COMPLIANCE — flagged for Anton (ported as-is, awaiting veto):** the comparison table is
  titled "ZZL-7 vs Traditional Antidepressants" and the copy uses "serotonergic signaling"
  language — explorer rated this HIGH CONTEXTUAL RISK (positions ZZL-7 near depression
  treatment). Ported AS-IS per Anton's N-Acetyl "organic-page port-as-is" stance because: it
  uses a CATEGORY term (not a brand — CLAUDE.md-compliant), carries "research use only" /
  "research models" framing throughout, makes NO human cure/efficacy claim, and is an ORGANIC
  product page (not a paid-traffic/Meta destination). NO cancer/guarantee/dementia. **If Anton
  wants the antidepressant comparison softened or removed, it's a one-line change** (drop the
  `comparison` field from the zzl-7 object). Standing rule keeps this page off `/go` + Meta.
- Tokens-only (live purple/red/amber → success/accent/danger/neutral); `tsc` clean;
  `next build` all 6 product routes. Other products unchanged (optional fields only).
- **Roles run:** LEAD (orchestrator) → explorer (inventory + compliance scan) → LEAD reconcile
  + compliance call → implementer → verifier (fresh context, APPROVE — no-regression + NMR-
  absent confirmed) → implementer (distinct findings icons) → LEAD browser gate (hero +
  single-size order + science + findings + comparison) PASS.
- **🎯 CATALOG COMPLETE — all 6 products faithfully ported** (ISRIB A15, ISRIB, MPEP Oxalate,
  Bromantane, N-Acetyl-Bromantane, ZZL-7). Day-1 tail (1.5/1.6, ADR 0008) DONE. Next: the G1
  parity audit (nothing dropped vs the live site) + Day-2 multi-line checkout (Neon/Drizzle
  orders + order_items, submitOrder, payment selector, Resend, NowPayments) → gate G2.

## [2026-09-03] gate | /products catalog page — faithful port, rich inline-purchase cards

- Built the `/products` catalog/listing page (branch `feat/products-page`) — it previously 404'd
  (only `[slug]` existed) while the footer linked to it. Faithful port of the live `products.html`
  (hero + FLAT 6-card grid; no categories/filters). Explorer inventory; **Anton chose (via
  AskUserQuestion) the RICH inline-purchase card** (mini order block per card) over a lighter
  browse→detail card, per ADR 0008 "never reduce".
- **Built:** `(shop)/products/page.tsx` (server; hero "ISRIB Shop Products" + subtitle, flat
  `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), `ProductCard.tsx` (client mini order block:
  formula box, name + subtitle, purity/COA line, size `<select>`, price + savings line, inline
  Add-to-Cart via `useCart`, "View details" link, capsule note), `catalog.ts`
  (`getCatalogOptions` — fixed products map their formats; per-gram A15/ISRIB generate the live
  preset ladder 100mg/500mg/1g/2g/5g/10g via `computeTieredPrice`). Added `getAllProducts()`
  (explicit `CATALOG_ORDER` = live grid order, NOT the array order) + exported `specValue`.
- **Faithful + compliance-conservative transforms:** grid order matches live (A15, ISRIB, MPEP,
  N-Acetyl, Bromantane, ZZL-7); prices EXACT to the cent (A15 2g $360 / 5g $850 / 10g $1600 etc.,
  computed not re-typed); subtitles pulled from `product.categorySubtitle` so ZZL-7 shows
  "Fast-Onset Research Compound" (NOT the live catalog's "Fast-Onset Antidepressant") and N-Acetyl
  "Acylated Dopaminergic Actoprotector" (NOT "Premium…"); COA "On request" on every card (live
  says "Included"); capsule note only on A15/ISRIB. After the verifier flagged it, restored the
  A15/ISRIB "You save $X (Y%)" savings line + bulk-hint (ADR 0008 don't-reduce) — dynamic per
  selection, absent on fixed products.
- **Runtime-verified (LEAD, real Chrome):** grid renders in order; defaults preselected (A15/ISRIB
  2g "Most popular", MPEP/N-Acetyl/Bromantane 1g, ZZL-7 100mg); **inline Add-to-Cart writes the
  correct line item** — clicked A15 catalog "2g $360" → cart shows "ISRIB A15 · 2g · powder · $360",
  badge 2→3, subtotal correct. Savings line + bulk hint show on A15/ISRIB only. `tsc` clean;
  `next build` all routes incl. `/products` SSG.
- **Roles run:** LEAD → explorer (inventory) → LEAD reconcile + AskUserQuestion (card richness) →
  implementer → verifier (fresh context, APPROVE — order + exact prices) → implementer (savings
  line) → LEAD browser gate + live add-to-cart test (PASS). Work uncommitted on `feat/products-page`.
- Housekeeping: deleted the 5 merged per-product port branches + the merged `fix/a15-...` branch
  locally (a stale `origin/fix/a15-port-design-regressions` remains on the REMOTE — flagged, not
  deleted, since remote deletion is an outward push).

## [2026-09-03] gate | Homepage (/) faithful port — 6-section marketing page

- Built the homepage `/` (branch `feat/home-page`) — faithful port of the live `index.html`
  (was a placeholder). Explorer 8-block inventory; implementer built; verifier APPROVED
  (headless-Chrome side-by-side); LEAD browser gate. Also deleted the stale
  `origin/fix/a15-port-design-regressions` remote branch (Anton approved the outward push);
  origin is now just `main`.
- **6 sections (bespoke marketing components in `src/components/marketing/`):** HERO (gradient
  headline "Advanced [Research Chemicals] for Scientific Innovation" — blue→cyan clip-text like
  the old site; 3 stats 50+/98%+/Since-2020; benefit card 4 rows; Browse-products → /products) →
  FEATURED PRODUCTS (6 cards from `getAllProducts()`, "From $X" via `getCatalogOptions` min price,
  A15 "Most popular" + N-Acetyl "Premium" badges, → /products/[slug]) → ABOUT "In-house synthesis.
  Real chemist. Verified purity." (2 paras + 5 bullets verbatim + a real ¹H-NMR proof card) →
  TRUST (3 indicators verbatim) → HOW-TO-ORDER (3 steps + CTA) → FAQ (8 preview cards → /faq#…).
  Header/Footer stay global (root layout).
- **Compliance (LEAD call — homepage is ORGANIC, but conservative):** the live homepage's
  product-card descriptions carry efficacy/marketing language ("cognitive enhancement",
  "outperforms phenamin", "performance enhancement", "antidepressant"). Used the CLEAN
  `product.description`/`categorySubtitle` DATA on the cards instead (consistent with /products;
  ZZL-7 = "Fast-Onset Research Compound"). COA "on request" everywhere (never "Included").
  **PayPal omitted** from How-to-order (new flow = crypto + manual arrangement; kept
  Bitcoin/USDT/Wise/SWIFT). "guaranteed purity" (quality claim) kept verbatim. No
  cancer/guarantee/dementia/human-efficacy claim in any rendered sentence.
  **FLAG (opt-in):** if Anton wants the live homepage's richer efficacy card copy, it's a
  follow-up — I defaulted conservative.
- Tokens only (blue→cyan gradient = locked blue-800/cyan-500; the hero radial wash is the
  sanctioned handoff-spec gradient). `tsc` clean; `next build` — `/` now SSG (placeholder gone);
  all routes intact (no regression on /products or detail pages).
- **Known downstream gap (not a regression):** the FAQ preview `/faq#…` deep-links + nav/footer
  About/FAQ/Contact/Quality/Safety/legal links 404 until those static pages are ported.
- **Roles run:** LEAD (orchestrator) → explorer (inventory + compliance scan) → LEAD reconcile
  + compliance call → implementer → verifier (fresh context, APPROVE) → LEAD browser gate
  (all 6 sections) PASS. Work uncommitted on `feat/home-page`.
- **Progress:** all 6 product pages + `/products` catalog + `/` homepage ported. Remaining
  static pages for parity: About, FAQ, Contact, Quality, Safety, Terms, Privacy, Research-use,
  Disclaimer (mostly legal/templated — some are AI-draft-only per CLAUDE.md). Then G1 parity
  audit + Day-2 checkout (G2).

## [2026-09-03] lint | Homepage featured-products → 3 cards + "See all products"

- Owner tweak: the homepage no longer duplicates the full /products catalog — the featured
  section renders only the first 3 cards (A15, ISRIB, MPEP) + a centered "See all products →"
  link to /products. Also brightened the hero free-shipping badge to a filled success-green pill.

## [2026-09-03] gate | About + FAQ pages ported (/about, /faq)

- Ported the live `about.html` + `faq.html` (branch `feat/about-faq`) — both were 404 while
  nav/footer linked to them. Two explorers (parallel) inventoried; one implementer built both
  (avoid parallel-write conflicts); verifier APPROVED; LEAD browser gate.
- **/about** (`(marketing)/about/page.tsx`): 7 sections verbatim — hero (gradient "About ISRIB
  Shop"), Our Mission (2-col + accent card), Our Story (3 paras: 2020 launch / 2023 first ISRIB
  A15 synthesis / in-house), Our Quality Commitment (6 cards), Our Values (3 cards), Why
  Researchers Choose (3 numbered reasons), dark "Browse the catalog" CTA (→ /products, /contact).
  COA card reframed "included" → "on request" (variant A).
- **/faq** (`(marketing)/faq/page.tsx`): hero + 3 categories (Product / Ordering & Payment /
  Shipping) × 6 Q&A + an ADDED "Is there a Certificate of Analysis?" [id="coa"] so the homepage
  `#coa` deep-link resolves. Reused the locked `FaqAccordion` (extended with optional per-item
  `id` + hash auto-open — runtime-verified: `/faq#coa` scrolls to + opens the COA item; existing
  kitchen-sink caller unaffected). All 18 live answers verbatim; COA answer "on request". Homepage
  FAQ card anchor `shipping-times` → `shipping-time` (matches the live canonical id) so all 8
  deep-links resolve.
- **⚠️ COMPLIANCE — 2 items ported verbatim, FLAGGED for Anton (organic page, his call):**
  (a) the "What is ISRIB A15?" answer says "potentially restoring cognitive function that has
  been impaired by stress, aging, or injury" (+ "How does ISRIB work?" ends "…potentially restore
  cognitive abilities") — hedged efficacy, the strongest claim on the site; the safety Q keeps
  "not been approved for human consumption". (b) the "lost or damaged" answer promises "a
  replacement at no extra cost" — a RESHIPMENT policy (not money-back/refund), but adjacent to the
  no-guarantee rule. Both kept verbatim; **one-line removal each if Anton wants them softened.**
  No cancer/dementia/money-back-refund copy. COA "on request" throughout.
- **Known follow-ups (non-blocking):** `/contact` links (About + FAQ CTAs) 404 until the contact
  page is ported. **Nested-`<main>` a11y nit** — the root layout renders `<main>` AND each
  marketing page also renders `<main>` (pre-existing convention on /, /products, now /about+/faq);
  a small site-wide cleanup should drop the per-page `<main>` in favor of the layout's.
- Tokens only (blue→cyan gradient = locked); `tsc` clean; `next build` — /about + /faq SSG; no
  regression (all routes 200, kitchen-sink intact).
- **Roles run:** LEAD → 2× explorer (About + FAQ inventories, parallel) → LEAD reconcile +
  compliance call → implementer (both pages) → verifier (fresh context, APPROVE) → LEAD browser
  gate (About sections + FAQ accordion + #coa auto-open) PASS. Work uncommitted on `feat/about-faq`.
- **Static-page progress:** About + FAQ done. Remaining for parity: Contact, Quality, Safety +
  legal (Terms/Privacy/Research-use/Disclaimer — AI-draft-only per CLAUDE.md).

## [2026-09-03] gate | Contact + 4 legal pages ported (/contact, /terms, /privacy, /research, /disclaimer)

- Ported the live contact.html + the 4 legal pages (branch `feat/contact-legal`) — all were 404
  while nav/footer linked to them. Explorer inventoried contact.html (form/interactivity); the 4
  legal pages ported as verbatim linear text. Implementer built all 5; verifier APPROVED; LEAD
  browser gate.
- **/contact** (`(marketing)/contact/page.tsx` + `ContactForm.tsx` client): hero (gradient
  "Contact Our Research Team") + 3 method cards (Email / Live-chat / Place-an-order) + the message
  form + informational payment-methods band (crypto/bank/Wise; NO card/Stripe/Pay-Now). **Form
  submit = mailto interim:** validates Name/Email/Subject/Message + the REQUIRED "research use
  only" checkbox, then opens a `mailto:isrib.shop@protonmail.com` (no POST to a non-existent
  backend, no personal data sent anywhere). Live-chat "Start Chat" → static "Live chat — coming
  soon" (Tawk.to not wired). **Day-2 follow-ups:** POST /api/contact + Resend backend; Tawk
  live-chat integration.
- **/terms, /privacy, /research, /disclaimer** via a shared `LegalPage` prose layout (gradient
  title + "Last updated" + token prose). All sections VERBATIM from the live files (Terms 14
  sections, "Last updated 2025-09-22"; Privacy 13 sections, 2025-09-27; Research 5 sections;
  Disclaimer 7 sections). **AI-DRAFT FLAG (CLAUDE.md hard constraint):** each legal page carries a
  top-of-file `/* AI-DRAFTED TEMPLATE — not legal advice; requires real legal review before launch */`
  comment. **These 4 pages are NOT launch-ready without real legal review.**
- **Compliance:** no money-back/refund guarantee, no cancer/dementia/medical claim introduced.
  Terms "returns generally not accepted" (no-returns stance) + Terms §9 "No Warranties" + Disclaimer
  §6 "No guarantees of efficacy" are DISCLAIMERS (allowed, not asserted guarantees). Disclaimer
  disclaims medical use. Contact research-use checkbox required. Two live placeholder links (a
  Telegram `@your_handle`, `/unsubscribe`) rendered as plain text (no broken hrefs).
- Tokens only; `tsc` clean; `next build` — all 5 SSG; no regression.
- **Roles run:** LEAD → explorer (contact inventory) → LEAD reconcile (contact-form mailto interim
  decision) → implementer (5 pages) → verifier (fresh context, APPROVE) → LEAD browser gate
  (/contact + /terms) PASS. Work uncommitted on `feat/contact-legal`.
- **Site-map progress:** home, /products, all 6 product pages, About, FAQ, Contact, Terms, Privacy,
  Research-use, Disclaimer — DONE. Remaining static pages: **Quality Control (/quality)** +
  **Safety Guidelines (/safety)** (still 404). Then G1 parity audit + Day-2 checkout (G2).

## [2026-09-04] gate | Quality + Safety pages ported (/quality, /safety) — static site-map COMPLETE

- Ported the live `quality.html` + `safety.html` (the last two 404s in nav/footer) using the
  inventory-driven method. Two explorers (parallel) produced complete ordered inventories +
  compliance scans; LEAD reconciled to per-item contracts; ONE implementer built both pages
  (avoids parallel-write conflict, per the about+faq precedent); verifier (fresh context)
  APPROVED; LEAD ran the browser side-by-side (dev :3000 vs live :8080) on both.
- **/quality** (`(marketing)/quality/page.tsx`): gradient hero ("Quality Control" + subtitle) →
  3-card grid (Batch Testing w/ 4-item bullet list LC-MS/NMR/Melting-point/Visual-inspection;
  Retention & Documentation; Packaging & Handling) → Research-Use-Only callout → CTA row
  ("← Back to Products" → /products, "Request CoA" → /contact). All copy verbatim.
- **/safety** (`(marketing)/safety/page.tsx`): gradient hero → 4 stacked cards (General
  Laboratory Safety w/ 4 bullets + RUO notice; Spill & Exposure; Storage Conditions;
  Responsibility) → CTA row (→ /products, /quality, /disclaimer). All copy verbatim.
- **Design (locked-palette mapping):** the live pages use a blue "Research Use Only" pill
  (quality) and an ORANGE notice box (safety). Both reframed to ONE consistent site-wide RUO
  treatment — a `bg-blue-50` / `text-primary-deep` pill + `border-l-primary` left-border panel.
  NO invented amber (design system locked); gradient h1 = the locked blue-800→cyan-500 signature.
- **Compliance (LEAD ruling):** both pages clean. Explorer's one MEDIUM flag on safety — the
  Spill & Exposure line "In case of accidental exposure, rinse the affected area with water and
  seek professional medical assistance" — is standard OCCUPATIONAL lab-safety (GLP) language for
  trained personnel handling the substance as a hazardous lab material; it is the opposite of
  human-use positioning. No rx brand names, no cancer/dementia/efficacy/guarantee. Kept VERBATIM.
  COA framing safe: quality keeps the neutral live "CoA or batch ID" + a "Request CoA" CTA
  (never "Included").
- `tsc --noEmit` clean; `next build` — both prerender as static. Other routes untouched.
- **Roles run:** LEAD (orchestrator) → 2× explorer (quality + safety inventories, parallel) →
  LEAD reconcile + compliance ruling → implementer (both pages) → verifier (fresh context,
  APPROVE) → LEAD browser side-by-side (both pages, PASS). Work uncommitted on `main`
  (Anton commits/deploys).
- **🎯 STATIC SITE-MAP COMPLETE** — every page a visitor can reach from nav/footer is now
  ported (no remaining 404s). Next: **G1 parity audit** (nothing dropped vs the live site,
  across all pages + chrome + cart) → **Day-2 checkout (G2)**.
- Committed to `main` (933133f) + pushed to origin at Anton's request.

## [2026-09-04] gate | G1 parity audit — nothing dropped vs live → G1 CLOSED

- Ran the consolidated Track A gate G1 ("nothing dropped vs the live site"). Per-page CONTENT
  parity was already established by the browser side-by-side gate on every page during the
  migration; this pass is the consolidated route/link/asset integrity + scope ledger.
- **Live→new page ledger** (31 live `.html` files enumerated). All 18 visitor-facing pages ported:
  index→`/`, products→`/products`, 6 `product_*`→`/products/[slug]`, about/faq/contact/quality/
  safety/terms/privacy/research/disclaimer→`/[same]`, checkout→`/checkout` (cart shell; full flow
  = Day-2 G2). `/isrib-a15` 307-redirects → `/products/isrib-a15`.
- **Intentionally out of Track A content scope (NOT silent drops — verified none are linked from
  any ported page body or the chrome):** `buy-1g/500mg/25-capsules/50-capsules` + `campaign` +
  `campaign-tracker` (paid/DR landings → Track B `/go`); `admin-resubscribe`/`admin-unsubscribe`/
  `unsubscribe` (email lead-gen → Track B); `batch-splitter` (admin tool → Track B);
  `confirm-purchase`/`success` (post-order → Day-2 G2 checkout); `404.html` (Next default
  not-found; custom 404 port is a minor non-blocking follow-up).
- **prober runtime crawl (dev server):** all 19 visitor routes return 200 (redirect 307→200);
  **36 unique internal links all 200 — zero broken links** across header/footer chrome + every
  page body; all 8 `/faq#…` hash anchors have matching `id=`; all 26 referenced static assets
  (16 images + 10 FID zips) resolve 200.
- **prober-flagged "gap" — dismissed after LEAD check:** zzl-7 has no NMR spectra/FID. Confirmed
  this is CORRECT parity — the live `product_zzl_7.html` has NO NMR section either (grep: 1 stray
  "NMR" word = the live "¹H NMR Available" doc-claim, which we intentionally did NOT assert since
  no files exist — the port is the more compliant/conservative baseline, per the ZZL-7 port entry).
- **Minor non-blocking follow-ups (do NOT block G1):** (1) custom 404 page not ported (Next
  default in use); (2) scaffold-orphan SVGs in `public/` (`file/globe/next/vercel/window.svg`) —
  harmless leftovers, tidy anytime; (3) pre-existing nested-`<main>` a11y nit (root layout + per-
  page `<main>`) — carried from earlier sessions, site-wide cleanup.
- **Roles run:** LEAD (orchestrator) → LEAD live-page enumeration + scope ledger → prober
  (runtime route/link/asset crawl, PASS) → LEAD dismiss zzl-7 NMR flag (live-baseline check).
- **✅ G1 CLOSED** — full visitor site-map ported, faithful per-page (content gates) + zero broken
  links/assets (this audit). Next: **Day-2 checkout (G2, highest risk)** — Neon/Drizzle `orders`+
  `order_items`, `submitOrder` from cart, payment selector, Resend emails, NowPayments invoice +
  webhook. **No DNS/domain move until a real multi-item test order is green** (ADR 0003/0004).

## [2026-09-04] decision | ADR 0009 — checkout backend architecture audited + ratified (pre-G2)

- Audit-and-plan iteration before Day-2 (no code). Deep read-only audit of the two reference
  backends to decide whether the whole order mechanism fits in **Neon alone** (drop Upstash +
  QStash). **Roles run:** LEAD → 2× general-purpose audit agents (NORA + isrib-a15-lander,
  parallel) → LEAD verify (Vercel Hobby cron limits + Resend scheduling via WebFetch) →
  AskUserQuestion (nurture mechanism) → LEAD wiki.
- **Audit findings:** NORA (platform ref) runs its ENTIRE order backend on Neon alone — no Redis,
  no queue, no cron; neon-http driver (no transactions); single-product `orders`; async = an
  idempotent HMAC NowPayments webhook leaning on the provider's own retry + inline
  `Promise.allSettled`. isrib-a15-lander = same Neon+NowPayments+Resend spine, **uses QStash for
  exactly one job** (2 delayed abandoned-checkout emails T+2h/T+24h); **no Upstash Redis in either
  project**.
- **Verified externals (2026-09-04):** Vercel **Hobby cron = once/day, ±59 min** → inadequate for a
  T+2h nurture email, so "Neon + Vercel Cron" is NOT a viable QStash replacement on Anton's free
  plan. **Resend supports native scheduling** (`scheduledAt`, ≤30 days, cancel via
  `POST /emails/{id}/cancel`) → a zero-dependency alternative.
- **Verdict:** the core commerce backend fits in **Neon alone** (+ Resend/NowPayments/Meta CAPI,
  all already in stack). **Upstash Redis dropped entirely** (never used). QStash is technically
  replaceable by Resend scheduling, but **Anton chose to KEEP QStash** for the stronger send-time
  guard (consumer re-reads Neon `payment_status` + live crypto rates) — accepted as a small,
  isolated dependency for nurture only.
- **Ratified in [ADR 0009](decisions/0009-checkout-backend-neon-qstash.md):** (1) DB driver =
  `drizzle-orm/neon-serverless` (Pool/WebSocket) for **atomic** multi-line `orders`+`order_items`
  inserts (diverges from NORA's neon-http, which has no transactions); (2) two real tables
  (closes the data-model "or JSON column" hedge); (3) NowPayments HMAC-SHA512 IPN webhook,
  idempotent, always-200; (4) Resend inline emails; (5) QStash = the ONLY async piece (2 nurture
  emails, signature-verified consumer, Neon-side guards); (6) no Redis, no Vercel Cron. Plus **4
  hardening improvements** (all approved): idempotency key on submit, timing-safe webhook compare,
  actually stamp email timestamps, no app-rate-limit (WAF sufficient — documented non-need).
- **Wiki filed:** ADR 0009 (new); `architecture/checkout-architecture.md` (new — the full G2
  mechanism spec: schema deltas, submit flow, webhook, nurture, env surface, G2-green definition);
  reconciled `data-model.md` (two tables + driver + new columns), `manual-payment-flow.md` (nurture
  emails), ADR 0003 (forward-pointer: revisited/extended), `index.md`. **Direction fixed — ready to
  implement G2** (schema first, then submitOrder + webhook + emails + QStash, runtime-verified).

## [2026-09-04] gate | G2 Step 1 — DB foundation built + runtime-verified against real Neon

- Built the checkout DB foundation per ADR 0009 / `checkout-architecture.md`. **Roles run:** LEAD →
  explorer (NORA mirror-recon: exact schema/client/config/submitOrder/webhook/email source) → LEAD
  reconcile (spec) → implementer → LEAD direct schema review → Anton (created Neon DB + `.env.local`)
  → LEAD `db:push` → prober (runtime verification, PASS 5/5).
- **Built (`src/lib/db/schema.ts`, `index.ts`, `drizzle.config.ts`, `src/lib/order-number.ts`,
  package.json deps+scripts, `.env.example`):** `orders` + `order_items` two-table schema with 3
  enums (order_status / payment_method / item_format); all ADR 0009 columns (idempotency_key +
  order_number unique, abandoned_email1/2_sent_at, confirmation_email_sent_at, nowpayments_*,
  subtotal/total cents); `order_items` FK → orders.id ON DELETE CASCADE. **neon-serverless `Pool`
  driver** (NOT neon-http) — verified against installed @neondatabase/serverless v1.1.0 README;
  `ws` webSocketConstructor set for Node<22 portability. `ISR-`-prefixed order number.
- **Deps:** @neondatabase/serverless ^1.1.0, drizzle-orm ^0.45.2, nanoid ^5.1.16, ws ^8.21.3;
  dev drizzle-kit ^0.31.10, @types/ws. Scripts `db:push` / `db:studio` (node --env-file=.env.local).
- **Neon env:** Vercel Neon integration provisioned the full var set; we use `POSTGRES_URL` (pooled,
  runtime) + `POSTGRES_URL_NON_POOLING` (drizzle-kit push). QStash keys already in `.env.local`;
  Resend + NowPayments keys pending (their steps).
- **`db:push` → "Changes applied".** prober runtime verification (real Neon, all PASS): (1) schema
  shape — tables + enums + ADR 0009 columns + both unique indexes + cascade FK confirmed via
  information_schema; (2) **transactional atomic multi-line insert** (order + 2 items) works via
  `db.transaction()` — the whole reason for the driver choice; (3) **rollback** on in-callback throw
  leaves zero rows (real atomicity, not autocommit); (4) **idempotency** — duplicate idempotency_key
  rejected with PG `23505`; (5) cleanup + cascade-delete confirmed.
- **Flag for Step 2 (non-blocker):** `db.query.*` relational queries (`with: { orderItems }`) need a
  `relations()` export not yet defined. G2 needs only inserts + direct SELECTs (NORA's style), so
  optional; add `relations()` if we want join-loading in the webhook/emails/admin.
- `tsc` clean; `next build` all routes intact. **Next: G2 Step 2 — `submitOrder`** (transactional
  insert from the client cart, idempotency key, server-side price recompute) + checkout form +
  payment selector. No new creds needed; runtime order-lands-in-Neon test.

## [2026-09-04] gate | G2 Step 2 — submitOrder + checkout form built + runtime-verified (order lands in Neon)

- Built the checkout order-submission path per `checkout-architecture.md` §3 / ADR 0009. **Roles run:**
  LEAD → explorer (recon: cart API, pricing helpers, PaymentSelector, analytics, what's missing) →
  LEAD reconcile (spec + 2 Anton-approved technical calls: server-authoritative pricing; controlled
  PaymentSelector) → implementer → verifier (fresh context, APPROVE + 1 follow-up) → LEAD browser
  runtime order + prober DB verification (22/22 PASS) → implementer (TOCTOU hardening) .
- **Built:** `src/app/actions/submitOrder.ts` (server action, `useActionState` shape); refactored
  `src/components/ui/PaymentSelector.tsx` to CONTROLLED (optional `value`/`onChange`, backward-compatible
  — prop-less kitchen-sink unaffected); extended `src/app/(shop)/checkout/page.tsx` (cart shell → real
  form: shipping fields + payment selector + hidden cart JSON + client-generated idempotency key +
  crypto −10% preview); new `src/app/(shop)/checkout/success/page.tsx` (server component, fetches order
  + items from Neon by order_number, direct SELECTs) + `ClearCartOnMount.tsx` (clears client cart post-order).
- **Security core — server-authoritative price recompute (client price NEVER trusted):** the posted
  cart JSON carries only {productSlug, format, quantity, sizeLabel} (no price). Per line: capsules OR
  fixed-kind → `pricing.formats.find(format+sizeLabel).priceCents`; powder + per-gram-tiered →
  `sizeLabel`→mg → `computeTieredPrice` → `totalCents`, with below-min/gap/bulk REJECTING the whole
  order. Verifier tested tampering vectors (crafted sizeLabel → null/NaN → rejected; quantity guarded
  integer≥1). Crypto discount = subtotal − round(subtotal×10/100), integer cents.
- **Idempotency:** SELECT-by-key before insert (sequential double-submit → redirect to existing order).
  **TOCTOU race closed** (verifier follow-up applied): the transaction insert now catches PG 23505 on
  the idempotency-key unique constraint and re-resolves to the existing order's success page (gated on
  the re-SELECT result, not a fragile constraint-name check); `isRedirectError` re-thrown on both
  redirect paths.
- **RUNTIME GATE (LEAD, real Chrome + prober DB):** added A15 2g ($360, per-gram-tiered) + MPEP 1g
  ($200, fixed) to the cart via /products, filled the checkout form, crypto method, placed order →
  redirected to `/checkout/success?order=ISR-AG3N2BRS` showing both items, Subtotal $560, Crypto
  discount −$56, **Total $504**; header cart badge cleared. prober confirmed in Neon (22/22): order row
  subtotal_price=56000 / total_price=50400 / crypto_discount_pct=10 / status pending / all customer
  fields; **2 order_items with server-recomputed line_price (a15 36000, mpep 20000)** — NOT client
  values; exactly 1 order (no dup); Step 3/4 fields NULL; cascade-delete on cleanup. Test order deleted.
- **Scope boundaries (marked TODO in submitOrder.ts):** Resend emails = Step 3 (needs RESEND creds);
  NowPayments invoice + crypto redirect = Step 4 (needs NOWPAYMENTS creds). Both paths currently just
  create the order + fire `order_submitted` analytics + redirect to success.
- **Compliance held:** no card fields, card slot disabled ("coming soon"), no Pay-Now/Stripe, no
  money-back/guarantee copy; JSX double-quoted. `tsc` clean; `next build` all 26 routes (/checkout/success
  dynamic). **Next: G2 Step 3 — Resend order emails** (confirmation + ops alert, stamp
  confirmation_email_sent_at). Needs RESEND_API_KEY + FROM_EMAIL + ADMIN_EMAIL in `.env.local`.

## [2026-09-04] decision | ADR 0010 — friction-less DR checkout (minimal form + post-payment shipping)

- Anton's direction: adopt the live `isrib-a15-lander`'s friction-less conversion flow for paid
  traffic. **Roles run:** LEAD → general-purpose audit of the lander's customer-facing checkout +
  shipping-collection → LEAD report → AskUserQuestion (shipping mechanism + form fields) → LEAD wiki.
- **Lander audit:** checkout = 5 fields, only 3 typed (first name / email / country); NO address at
  checkout. Delivery address requested ONLY after payment confirmed, via a prefilled `mailto:` reply
  to ProtonMail (never stored in DB). Admin manually confirms manual-payment funds in `/admin` → that
  triggers the address-request email. Crypto auto-confirms via webhook.
- **Decisions (Anton, via AskUserQuestion):** (1) **checkout = first name + email + country + payment
  toggle** (cart supplies line items — we're multi-item, unlike the lander's single-SKU form); (2)
  **shipping collected post-payment via a form that writes to Neon** (chosen over the lander's
  inbox-only `mailto:` — structured address for the future admin panel, zero pre-payment friction).
- **Ratified in [ADR 0010](decisions/0010-frictionless-dr-checkout.md):** minimal checkout form;
  `/shipping/<token>` post-payment form (Full name/Address/City/Postal/Mobile) gated by an unguessable
  `shipping_token` (NOT the guessable order_number); lifecycle pending→paid→(address)→fulfilled (enum
  unchanged — address is data); emails redefined (submit: received+pay-instructions; paid: confirmed +
  /shipping link). Manual-payment details for the emails come verbatim from the lander.
- **Schema deltas (re-`db:push`):** shipping cols (`phone`,`address`,`city`,`postal_code`,`state_region`)
  → NULLABLE; add `shipping_token` (unique) + `shipping_details_at`. **Step-2 rework:** strip shipping
  from the checkout form + submitOrder; success page → "check your email"; the Step-2 **core is reused**
  (transactional insert, server price recompute, idempotency, cart). Wiki reconciled: manual-payment-flow,
  checkout-architecture (§3 + new §5b), data-model, index.
- **Next: implement** — (a) schema change + `db:push`; (b) rework checkout form/submitOrder/success to
  the short flow + `/shipping/<token>` route; then Steps 3/4/5 (emails/NowPayments/QStash) as planned.

## [2026-09-04] gate | ADR 0010 checkout rework built + runtime-verified (short form + /shipping token flow)

- Implemented the friction-less DR checkout (ADR 0010). **Roles run:** LEAD → implementer (schema
  deltas) → LEAD `db:push` → implementer (app rework) → verifier (fresh context, APPROVE) → LEAD
  browser runtime (short order + /shipping submit) + DB verification → cleanup.
- **Schema (re-`db:push`, applied to Neon):** shipping cols (`phone`/`address`/`city`/`postal_code`)
  → NULLABLE; added `shipping_token` (NOT NULL unique) + `shipping_details_at`. `name`/`email`/`country`
  stay NOT NULL.
- **App rework:** checkout form stripped to **First name + Email + Country + payment** (+ reassurance
  "Shipping details are collected after payment is confirmed"; note field removed); `submitOrder` reads
  only those, generates a `shippingToken` (plain 21-char `nanoid()` — unguessable, distinct from `ISR-`),
  omits the now-nullable shipping cols. **Price-recompute + idempotency + 23505 TOCTOU byte-for-byte
  unchanged** (verifier confirmed). success page reframed to "check your email / payment instructions".
  New `/shipping/[token]` route (server: fetch by `shipping_token`, `notFound()` on miss; read-only
  "received" panel if `shipping_details_at` set, else the form) + `ShippingForm` (Full name/Address/City/
  Postal/Mobile; country read-only) + `submitShipping` action (validates token, updates name/address/
  city/postal_code/phone + stamps `shipping_details_at`, redirects back to the token URL).
- **Token security (verifier APPROVE):** the shipping flow is gated ONLY by the 126-bit token — page
  lookup + update both `where(shipping_token = token)`; `order_number` is never a shipping key. No
  enumeration risk.
- **RUNTIME GATE (LEAD, real Chrome + DB):** added MPEP 1g, filled the 3-field form (Danylo / email /
  Ukraine), crypto → order `ISR-ZANGXRBG` created (Subtotal $200, Crypto −$20, Total $180), success page
  "check your email" copy, cart cleared. Fetched `shipping_token` from Neon (email not built yet),
  visited `/shipping/<token>` → filled address → submit → redirected to the read-only "received" panel.
  DB confirmed: `name` "Danylo"→"Danylo Tsymbaliuk", `address`/`city`/`postal_code`/`phone` populated,
  `shipping_details_at` stamped, `status` still pending (shipping doesn't change status). Test order
  deleted; 0 leftovers.
- `tsc` clean; `next build` all 27 routes (incl. dynamic `/shipping/[token]`). Compliance held (no
  card/Pay-Now/guarantee; double-quoted JSX). **Next: G2 Step 3 — Resend emails** (order-received +
  pay-instructions with real manual-payment details ported from the lander's `buyer-confirmation.ts`;
  payment-confirmed email carrying the `/shipping/<token>` link). Test now via `onboarding@resend.dev`
  (delivers only to Anton's account email); verify real `send.isrib.shop` domain pre-cutover.

## [2026-09-04] gate | G2 Step 3 — Resend order emails built + runtime-verified (send accepted + stamp)

- Built the transactional emails per ADR 0010. **Roles run:** LEAD → explorer (lander email templates
  + payment addresses) → implementer (email module + templates + submitOrder wiring) → verifier (APPROVE)
  → LEAD (Resend API probe → found the false-stamp latent bug) → implementer (throw-on-error fix) → LEAD
  browser runtime (manual order) + DB + dev-log verification.
- **Built `src/lib/email/`:** `send.ts` (Resend client; `sendToCustomer`/`sendToAdmin`; **throws on the
  Resend `{error}` response** so failures are real, not silently swallowed — the fix below); `payment-
  details.ts` (Anton's real PayPal/USDT/BTC/LTC ported verbatim from the lander); `rates.ts` (CoinGecko
  btc/ltc equivalents); `templates.ts` (LIGHT-theme, inline-styled, multi-item items-table; orderReceived
  Manual/Crypto, opsAlert, paymentConfirmed with the `/shipping/<token>` link — NOT a mailto). Wired the
  MANUAL submit path into submitOrder (customer order-received + ops alert, stamp confirmation_email_sent_at
  after a genuine send); crypto customer email left `// TODO(step 4)` (needs the invoice URL).
- **Latent bug found + fixed (LEAD probe):** the Resend SDK does NOT throw on API errors — it resolves
  `{ data, error }`. `sendToCustomer`/`sendToAdmin` originally ignored `error` (a faithful port of the
  lander's same issue) → `confirmation_email_sent_at` would stamp even on a failed send. Fix: both senders
  now `throw` when `error` is present → the caller's `Promise.allSettled` records the failure (non-fatal)
  and the stamp only lands on a real success.
- **VISUAL gate:** rendered all 4 templates (via `tsx`, sample multi-item A15 2g + MPEP 1g order) and
  reviewed in-browser — light theme (white/blue "ISRIB Shop", NOT the lander's dark/amber), multi-item
  table, PayPal/USDT(⚠TRC-20)/BTC/LTC blocks with exact addresses, payment-confirmed "Provide shipping
  details →" button → /shipping/<token>. Sent the 4 HTML renders to Anton.
- **RUNTIME gate (real Chrome + Resend + DB):** placed a MANUAL order (customer email `delivered@resend.dev`,
  Resend's test recipient) → order `ISR-LCA5QX9J` ($200) created; success page "check your email" copy.
  DB: `confirmation_email_sent_at` stamped (the customer email was **accepted by Resend** — `data.id`
  returned, `error:null`). dev log: the **ops alert threw** ("can only send testing emails to your own
  address isrib.shop@protonmail.com" — ADMIN_EMAIL is a non-owner while the domain is unverified) and was
  **caught non-fatally** ("Order email failed (non-fatal)") — order intact + redirected. The throw-on-error
  fix makes such failures visible instead of silent. Test order deleted.
- **Findings for pre-cutover:** the Resend account owner is `isrib.shop@protonmail.com` (revealed by the
  API error). Interim: set `ADMIN_EMAIL=isrib.shop@protonmail.com` (owner) → ops alerts deliver now.
  Full delivery to arbitrary customer emails requires verifying `send.isrib.shop` in Resend + swapping
  `FROM_EMAIL` (pre-cutover checklist item; email DNS is independent of the website cutover).
- `tsc` clean; `next build` all routes. **Next: G2 Step 4 — NowPayments** (invoice on crypto submit +
  the `// TODO(step 4)` crypto customer email with the invoice link; HMAC-SHA512 IPN webhook → status
  paid → payment-confirmed email with the /shipping link). Needs `NOWPAYMENTS_API_KEY` +
  `NOWPAYMENTS_IPN_SECRET` + `NEXT_PUBLIC_BASE_URL` in `.env.local`.

## [2026-09-04] gate | G2 Step 4 — NowPayments invoice + IPN webhook built + runtime-verified (crypto flow end-to-end)

- Built the crypto payment path per checkout-architecture.md §3–§4 / ADR 0009. **Roles run:** LEAD →
  implementer (nowpayments.ts + webhook + submitOrder crypto wiring) → verifier (fresh context, APPROVE,
  no blockers) → LEAD browser runtime (real crypto order → real invoice) + IPN simulation (valid/replay/
  forged) + DB verification.
- **Built `src/lib/nowpayments.ts`:** `createInvoice()` (POST /v1/invoice, x-api-key, order_id=orderNumber,
  is_fixed_rate) + `verifyIpnSignature()` (HMAC-SHA512 over recursively key-sorted JSON, **timing-safe
  compare** via `crypto.timingSafeEqual` with null/length guards — hardening over NORA's `!==`). Wired the
  crypto branch in submitOrder (createInvoice → update order invoice id/url → crypto order-received email w/
  invoice link + stamp confirmation_email_sent_at → redirect to invoice_url; on failure isRedirectError
  re-thrown, falls through to success). New `src/app/api/webhooks/nowpayments/route.ts` (idempotent,
  always-200, side effects in allSettled, never throws out of POST).
- **RUNTIME GATE (real Chrome + real NowPayments API + IPN simulation + DB):**
  - **Crypto invoice (real API):** placed a crypto order → redirected to a REAL NowPayments hosted invoice
    (`nowpayments.io/payment?iid=6087864889`). DB: order `ISR-2MH8DNZQ` got `nowpayments_invoice_id`
    6087864889 + `nowpayments_payment_url`; `confirmation_email_sent_at` stamped (crypto order-received
    email accepted by Resend).
  - **IPN webhook (signed simulation — computed valid HMAC with the real IPN secret):** valid `finished`
    IPN → **200**, status → **paid**; idempotent replay → **200**, still paid (no double-process); forged
    signature → **401**. The paid-side-effect email failure (ops alert → non-owner ADMIN_EMAIL, unverified
    domain) was **caught non-fatally**, webhook still returned 200 — proving robustness. Test order deleted.
- `tsc` clean; `next build` all 27 routes incl. `ƒ /api/webhooks/nowpayments`. Analytics: webhook fires
  `order_confirmed → Purchase` (server.ts map) as the paid conversion; `order_submitted` remains the
  primary at submit (ADR 0005).
- **G2 CORE ESSENTIALLY COMPLETE:** multi-item order → Neon (Step 2); confirmation + pay-instructions
  emails (Step 3); crypto invoice → webhook → paid → shipping-request email (Step 4); idempotency at both
  submit and webhook. **Remaining for full G2 close:**
  1. **Step 5 — QStash abandoned-checkout nurture** (2 delayed emails, Neon-guarded; QStash keys already set).
  2. **Manual-order "paid" transition** — currently only the crypto webhook flips `paid`; MANUAL orders need
     an admin-confirm action (mark paid + fire the payment-confirmed/shipping email) — a minimal
     `/api/admin/confirm-order` (lander parity) or the Track-B admin panel. FLAG: not yet built.
  3. **Real email delivery** — verify `send.isrib.shop` in Resend + swap `FROM_EMAIL` (pre-cutover; email
     DNS independent of the website cutover). Until then only `delivered@resend.dev` / the account owner
     receive; ops alerts to a non-owner ADMIN_EMAIL fail non-fatally (or set ADMIN_EMAIL=owner now).
  4. **Cutover:** point the NowPayments dashboard IPN URL (or rely on per-invoice callback) at the new
     `/api/webhooks/nowpayments`; set the production `NEXT_PUBLIC_BASE_URL`.

## [2026-09-04] gate | G2 Step 5 — QStash abandoned-checkout nurture built + runtime-verified (producer + 401 + template)

- Built the abandoned-checkout nurture per checkout-architecture.md §5 / ADR 0009. **Roles run:** LEAD
  (verified @upstash/qstash v2.11.3 API against the installed types) → implementer → verifier (APPROVE,
  2 non-blocking follow-ups) → LEAD runtime (publish + 401 + template render).
- **Built:** producer in `submitOrder.ts` (2 `qstash.publishJSON` to `{BASE_URL}/api/abandoned-checkout`,
  `delay: 7200`/`86400` SECONDS, emailNumber 1/2, wrapped non-fatal, fires for both payment methods,
  `baseUrl` hoisted/deduped); `abandonedCheckout` template in templates.ts (2 variants; crypto+invoiceUrl
  → "Complete crypto payment" button + manual blocks, else manual only; multi-item; light theme) + a
  refactor extracting `manualPaymentBlocks()` shared by orderReceivedManual + abandonedCheckout;
  consumer `src/app/api/abandoned-checkout/route.ts` (`Receiver.verify({signature,body,url})` → 401 on
  missing/invalid; Neon guards → 200 for not-found / paid / already-stamped; send then stamp
  `abandoned_emailN_sent_at`; robust — side-effect failure logs + still 200 so QStash doesn't hammer,
  and the un-stamped column lets a retry still deliver).
- **RUNTIME (localhost-feasible parts):** (1) **producer publish** — a direct `Client.publishJSON` with
  `QSTASH_TOKEN` returned a `messageId` (token + SDK + publish work); (2) **consumer 401** — unsigned POST
  → 401 (signature guard live); (3) **template render** — abandonedCheckout #1 (crypto) + #2 (manual)
  rendered + reviewed in-browser: light theme, multi-item table, crypto button + manual PayPal/USDT/BTC/LTC
  blocks, correct addresses.
- **Deferred to preview/pre-cutover (localhost limitation):** the full QStash→consumer round-trip
  (delayed delivery + verified signature + guarded send + stamp) can't run on localhost — QStash cloud
  can't reach it and the signed URL is the localhost BASE_URL. Verify on a Vercel preview (public URL)
  before cutover.
- `tsc` clean; `next build` all routes incl. `ƒ /api/abandoned-checkout`. Verifier's non-blocking
  follow-ups (cleanup pass): (a) templates.ts inlines the payment addresses instead of importing the
  `payment-details.ts` constants — single-source them (fund-safety) to prevent silent divergence; (b) the
  consumer's `JSON.parse` sits just outside the try/catch (a malformed-but-signed body → 500 not 200);
  (c) minor copy nit — abandoned #1 renders "Danylo, You placed…" (capital Y after the comma).
- **🎯 ALL 5 G2 BUILD STEPS DONE.** Full flows working (runtime-verified): short-form multi-item order →
  Neon; order-received + pay-instructions email (manual, delivery-tested to delivered@resend.dev); crypto
  invoice → IPN webhook → paid → payment-confirmed/shipping email; /shipping token flow; QStash nurture
  (producer + guard). **Remaining to CLOSE G2 (not code-complete):** manual-order admin-confirm (paid
  transition); real Resend domain (`send.isrib.shop`) for live delivery; QStash round-trip on preview;
  the small cleanup follow-ups; then a real end-to-end multi-item test order on a preview deploy → G2
  green → cutover (ADR 0003/0004: no DNS move until green).
