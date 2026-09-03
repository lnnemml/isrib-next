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
