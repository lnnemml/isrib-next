# Session summary — 2026-09-03 · Day-1 tail + full content migration

> Written for the NEXT session's context. Read this + `log.md` (tail) + `roadmap.md`
> before starting. This session ported the **entire public site content** onto the new
> stack. All work is committed to `main` and pushed to `origin/main`.

## What this session accomplished

Took the project from "1.5 A15 port stuck / regressing" to **the entire storefront
content migrated**. Every page a visitor sees is now a faithful port on the new design
system, committed and pushed.

**Pages shipped (all on `main`, SSG, verified in a real browser):**
- **6 product pages** (`/products/[slug]`): `isrib-a15`, `isrib` (ISRIB Original —
  slug shortened from `isrib-original`), `mpep-oxalate`, `bromantane`,
  `n-acetyl-bromantane`, `zzl-7`.
- **`/products`** catalog (rich inline-purchase cards).
- **`/`** homepage (6-section marketing page).
- **`/about`**, **`/faq`** (18 Q&A accordion), **`/contact`**, **`/terms`**,
  **`/privacy`**, **`/research`**, **`/disclaimer`**.

**Still 404 (not yet ported):** `/quality` (Quality Control), `/safety` (Safety
Guidelines). These are the only remaining nav/footer dead-links.

## The method that worked (use it next time)

Inventory-driven faithful port, per ADR 0006 + the two memories
([[visual-gate-mandatory-for-ports]], [[inventory-driven-port-contract]]):

1. **explorer** → COMPLETE ordered section inventory of the live page (every
   section/card/table/row/callout, verbatim copy, compliance scan). Not a summary.
2. **LEAD** reconciles inventory → a per-item port contract (keep / restyle /
   deliberate-change). This is where amputation gets caught.
3. **implementer** builds to the checklist; bespoke section on locked tokens where a
   generic component is too small (never amputate).
4. **verifier** (fresh context) — counts every block in the rendered DOM, spot-checks
   verbatim copy, greps for invented colors.
5. **LEAD** runs the **browser side-by-side + interaction test** (calculators, cart,
   accordion) himself before closing the gate. Mandatory.

The original A15 regression was a bare placeholder `page.tsx` + an amputated deep
mechanism section; this method surfaced both immediately.

## Key components / architecture added this session

- `OrderBlock.tsx` — now handles BOTH per-gram-tiered (calculator) AND `fixed`
  products (via new `FixedSizeSelector.tsx`, a single-card size selector). page.tsx
  routes ALL products with formats through OrderBlock. The dark "Total Price" panel
  was later REMOVED from the fixed path (owner request).
- `UnderstandingSection.tsx` — the deep A15-style "Understanding X" section, reused by
  A15/MPEP/Bromantane/N-Acetyl via the `understanding` data field. Extended with
  optional `whatIs.paragraphs2`/`table2` for N-Acetyl's **two-table** What-is block.
- `ComparisonTable` (locked) reused for ISRIB-Original ("ISRIB vs A15") and ZZL-7
  ("ZZL-7 vs Traditional Antidepressants"), via optional `comparison` data field.
- `findings` optional field + render (ZZL-7 "Key research findings").
- `catalog.ts` `getCatalogOptions()` — per-gram products generate the preset size
  ladder via `computeTieredPrice`; fixed products map their formats. Powers `/products`
  `ProductCard.tsx` (inline add-to-cart) + the homepage "From $X".
- Marketing: `HomeHero`, `HomeProductCard`, `HomeAbout`, `LegalPage`, `ContactForm`.
- `FaqAccordion` (locked) extended: optional per-item `id` + hash auto-open (deep-links).
- `getAllProducts()` (explicit `CATALOG_ORDER`) + exported `specValue()` in products.ts.

## Standing DECISIONS made this session (carry forward)

**Design (owner-approved; several touch LOCKED components — reconcile `handoff-spec §4`
on the next design-doc pass):**
- Blue→cyan gradient headings (`from-blue-800 to-cyan-500` clip-text) = the old-site
  signature; used on `/products` H1, homepage hero highlight, and all content-page titles.
- Product-page hero H1 → **Geist Mono** 46px/500 (calmer than the harsh 58px bold sans).
- Hero stat figures → old-site blue `#1e40af` (`text-primary-deep`).
- NMR-characterization header + the trust-bullets line under Technical-specs → **centered**
  site-wide. Mechanism dark band → centered (grid cols = step count).
- Homepage featured section → **3 cards + "See all products →"** (not the full catalog).
- Free-shipping badge → bright filled `bg-success` green pill.
- Design system stays LOCKED — everything maps to `@theme` tokens; the gradient colors
  are locked blue-800/cyan-500. No invented colors anywhere.

**Compliance (LEAD calls + owner rulings; the guardrails held):**
- **COA is framed "on request / per batch" EVERYWHERE — never "Included"** (ADR 0008
  variant A). This overrides the live site's "COA Included" on every page.
- **rx/brand names kept VERBATIM on organic product pages** (Anton ruling): Bromantane
  names "Ladasten"; N-Acetyl names "phenamin"/"sydnocarb" (Morozov comparative data).
  Permitted on organic pages; the standing rule keeps them off `/go` (paid) + Meta targets.
- **Efficacy copy kept** where the live page has it (A15 animal studies eLife2020 /
  Rosi-Walter; FAQ "potentially restoring cognitive function"). Owner: keep.
- **Compliance-CONSERVATIVE on catalog/home cards + ZZL-7:** cards pull the clean
  `product.description`/`categorySubtitle` DATA, so ZZL-7 shows "Fast-Onset Research
  Compound" (NOT the live "Antidepressant") and the homepage cards avoid the live's
  "cognitive enhancement"/"outperforms phenamin" card copy.
- **PayPal omitted** from payment mentions (new flow = crypto NowPayments + manual
  arrangement). No card fields / Stripe / Pay-Now anywhere (contact payment band is
  informational only).
- **Legal pages (`/terms /privacy /research /disclaimer`) are AI-DRAFTED TEMPLATES** —
  ported verbatim, each carries a top-of-file flag comment, **NOT launch-ready without
  real legal review** (CLAUDE.md hard constraint).

## Prices — all verified to the cent (unchanged from data)

Calculator (A15/ISRIB) via `computeTieredPrice`; fixed via `formats`. Catalog "From $X"
+ homepage prices computed from the same helpers, not re-typed. Runtime cart tests
confirmed correct line items (e.g. catalog A15 "2g $360" → cart "2g · powder · $360").

## KNOWN GAPS / explicit follow-ups (do these before launch)

1. **`/quality` + `/safety` pages** — not ported yet (still 404). Next content work.
2. **Contact form is a mailto INTERIM.** Day-2: build `POST /api/contact` + Resend and
   swap the submit handler. **Tawk.to live-chat** is unbuilt (rendered "coming soon").
3. **Legal pages need REAL legal review** before cutover (AI-draft).
4. **ISRIB Original NMR metadata gap** — its NMR section renders spectra + FID but has
   NO MHz/solvent/batch/δ-peak data (the live Original page had no NMR section; Anton
   supplied only the images/FID). Needs Anton to supply peak assignments to match A15.
5. **Nested-`<main>` a11y nit** — the root layout renders `<main>` AND each marketing
   page also renders `<main>`. Pre-existing across `/`, `/products`, and all new content
   pages. Small site-wide cleanup: drop the per-page `<main>`.
6. **`handoff-spec §4` reconciliation** — several locked components changed this session
   (MechanismSection centering, ProductHero subtitle/heroStats/mono-H1, FaqAccordion
   ids, OrderBlock fixed path). The design handoff-spec should be updated to match.
7. **`/isrib-a15` route** is a `redirect()` to `/products/isrib-a15` (the dedicated route
   was a dead placeholder; canonical A15 = `/products/isrib-a15`).

## Git / housekeeping state

- `main` is clean and synced with `origin/main`. All session work is pushed.
- All feature branches created this session were merged (fast-forward) and deleted,
  including the stale `origin/fix/a15-port-design-regressions` (deleted on the remote).
  `origin` has only `main`.
- Assets: all product formula SVGs + NMR PNGs + FID zips are in `public/{images,files}`
  under the `<slug>-*` / `isrib-a15-*` etc. naming convention.

## What's next (roadmap)

1. Finish content parity: **`/quality` + `/safety`** ports.
2. **G1 parity audit** — systematic "nothing dropped vs the live site" pass across every
   page + chrome + cart (the roadmap's Day-1 gate G1).
3. **Day 2 — checkout (G2, highest risk):** Neon + Drizzle `orders` + `order_items`,
   `submitOrder` from the client cart, payment-method selector, Resend emails,
   NowPayments invoice + webhook. **Do NOT move DNS/domain until a real multi-item test
   order is green** (ADR 0003/0004). This is also where the Contact `/api/contact` +
   Resend infra lands.

## Related

- [`../log.md`](../log.md) — full chronological gate-by-gate record for this session.
- [`../roadmap.md`](../roadmap.md), [`../decisions/0008-full-migration-and-cart.md`](../decisions/0008-full-migration-and-cart.md).
