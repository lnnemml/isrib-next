# Architecture — Track A Runbook (Day 0–4, orchestrator prompts)

> Ready-to-paste prompts for the main Claude Code session (the **orchestrator** —
> Opus 4.8). Each runs under the standing orchestrator protocol in
> [`agent-roles.md`](./agent-roles.md): the orchestrator decomposes the task to
> explorer/implementer/prober/verifier, names risks, and pauses at forks with
> options + its own lean. So these prompts state *what the session must achieve* —
> they don't re-specify delegation each time.
>
> Strategy context: [`migration-plan.md`](./migration-plan.md) ·
> Gates + cutover: bottom of this page.
>
> **Dependency note:** Track A is a sequential chain — run one deep session at a
> time. Parallelize only (a) explorer recon and (b) the Day-3 content port. Do not
> fork the dependent build chain into parallel worktrees.

---

## Session 0.1 — Scaffold + design tokens  ·  Plan Mode

**Goal:** Next.js 16 App Router skeleton with the locked design tokens wired, empty
site deploying to a Vercel preview.
**Main risks:** Next 16 API drift vs training data · `.next/`/`node_modules` leaking
into git · font CSS-var names in `@theme` not matching `next/font` var names.

```
Plan Mode. Scaffold a Next.js 16 (App Router, TypeScript strict, Tailwind v4)
project in this repo, then wire the locked design system.

Read node_modules/next/dist/docs/ FIRST — Next 16 has breaking changes vs your
training data. Do not write App Router code from memory.

Scope:
- create-next-app with src/ dir, App Router, TS strict, Tailwind v4.
- Route-group skeleton (empty placeholder pages, no logic):
  src/app/(marketing)/, (shop)/products/[slug]/, (shop)/isrib-a15/,
  (shop)/checkout/, go/ ; src/lib/{db,auth,analytics,copy,email}/ ;
  src/components/{ui,layout,shop,marketing}/.
- Paste the @theme block from docs/wiki/design/handoff-spec.md §1 into
  app/globals.css verbatim. Paste the next/font setup from §2 into app/layout.tsx.
- VERIFY the CSS variable names referenced by --font-sans/--font-mono in @theme
  exactly match the variable names next/font exposes in layout.tsx. This is the one
  place a silent mismatch breaks all fonts — check it explicitly.

Constraints:
- Do NOT build components or product pages yet — skeleton only.
- Before any commit, confirm .gitignore excludes .next/, node_modules/, .vercel/,
  and `git status` shows no generated files.
- No payment/card fields anywhere.

Verify: `npx tsc --noEmit` passes, `next build` succeeds. Then I deploy to a Vercel
preview manually. Report the exact file tree you created.
```
**Gate G0:** `next build` ok; empty site live on preview; git clean; fonts render.

---

## Session 0.2 — Analytics layer skeleton

**Goal:** the single analytics abstraction exists (no call sites yet), IDs wired
from env, documented.
**Main risks:** hardcoding IDs instead of env · creating a second tracking path that
components could call directly.

```
Build the analytics abstraction only — no call sites in components yet.

Have explorer first read how lnnemml/nootropics structures src/lib/analytics/ and
return the shape (functions, signatures, how client vs server split). Then build for
this repo:
- src/lib/analytics/client.ts — trackEvent(name, props?) fanning out to GTM
  dataLayer + Meta Pixel (fbq) + Clarity.
- src/lib/analytics/server.ts — trackServerEvent(name, props) to Meta CAPI + GA4
  Measurement Protocol.
- src/lib/analytics/types.ts — Window typings.
IDs come from env vars (document them in .env.example), values per
docs/wiki/architecture/analytics.md: GA4 G-LJEBV5NPCT, Meta Pixel 1228338595957402,
Reddit a2_hz77nm0joupm, Clarity wci5xmxfnu. Do NOT hardcode IDs in source.

Constraint (from CLAUDE.md): this must be the ONLY tracking API. Add a one-line
comment at the top of each file forbidding direct fbq/dataLayer/clarity calls
elsewhere. Preserve order_submitted as the future primary conversion (note it).

Verify: `npx tsc --noEmit`. Do not modify design tokens or scaffold files.
```
**Gate:** module compiles; `.env.example` lists every analytics var; no component
call sites yet.

---

## Session 1.1 — Component library from handoff spec  ·  Plan Mode

**Goal:** the reusable UI components exist, matching the locked spec exactly.
**Main risks:** re-inventing class strings instead of using handoff-spec §4 ·
components drifting from tokens · JSX copy using single quotes.

```
Plan Mode. Build the component library in src/components/ui/ from the exact class
strings in docs/wiki/design/handoff-spec.md §4. Use the tokens — do not invent
colors/radii/spacing.

Build each with all states from the spec (hover / focus-visible / disabled) and the
mobile variant where it differs:
buttons (primary, secondary, disabled), Card + accent card, Quote/testimonial block,
product hero (formula SVG slot), NMR section (spectrum + lightbox + FID download
buttons), five-block mechanism section, comparison table, FAQ accordion, checkout
stepper, payment-method selector radio cards (crypto default + 10%-discount
treatment, manual, permanently-disabled "card — coming soon" slot).

Constraints:
- All JSX copy strings double-quoted (single quotes break on apostrophes).
- Components are presentational — no data fetching, no analytics calls here.
- The NMR lightbox <img> must only render when open (compute src to null when
  closed) so no unresolved-hole fetch fires — this exact bug was caught in the
  design pass.

Verify: `npx tsc --noEmit`. Build a /_kitchen-sink dev page rendering every component
so I can eyeball them, then tell me what to review before we use them in pages.
```
**Gate G1a:** kitchen-sink page renders all components on desktop + mobile.

---

## Session 1.2 — Product data model + generic product page

**Goal:** 6 products as typed data + the generic `products/[slug]` template.
**Main risks:** inventing prices/SKUs · capsules-vs-powder mg logic · slug drift from
future redirects.

```
Create src/lib/copy/products.ts as typed data for 6 products, then build
(shop)/products/[slug] to render from it.

Products (slugs are canonical — redirects will target these):
isrib-a15 (flagship), isrib-original, zzl-7, mpep-oxalate, bromantane,
n-acetyl-bromantane.
Per product: slug, name, formats[] (each: format 'powder'|'capsules', sku, sizeLabel,
priceCents), shortDescription, mechanismSummary.
ISRIB A15 prices are authoritative (docs/wiki/product/overview.md): 500mg $130,
1g $200, 25 caps 20mg $170, 50 caps 20mg $240. For other products, if a real price
is missing use priceCents: 0 and add a // TODO: real price — flag it. NEVER invent a
real price.

The generic template uses the ui components from session 1.1. Carry `format`
explicitly through the model (capsules vs powder changes mg math — legacy bug).

Verify: `npx tsc --noEmit`; all 6 slugs resolve and render; flag every placeholder
price in your report.
```
**Gate G1b:** all 6 product pages render; prices correct or explicitly flagged.

---

## Session 1.3 — ISRIB A15 flagship landing

> **PARKED (ADR 0008).** Not the A15 page — the live A15 product page is ported
> faithfully instead (see roadmap 1.5). May return as the paid isrib-a15.com landing
> (Track B). Prompt kept below for reference only.

**Goal:** the long-form flagship page in belief-gate order.
**Main risks:** copy compliance (prescription names / cancer claims) · belief order
· page too heavy / not using ui components.

```
Build (shop)/isrib-a15 — the long-form flagship landing — from the handoff-spec
landing layout and the copy knowledge in the wiki.

Section order (belief gates, per docs/wiki/marketing/messaging-angles.md):
hook ("Your Brain Isn't Broken. It's Stuck.") -> agitation (name the fog, VOC) ->
mechanism (the biological brake, ISR/eIF2B in ~4 sentences) -> differentiation
(neurotransmitter drugs vs ISR comparison table) -> proof (specific testimonials
with days/hours) -> trust/safety (in-house synthesis, 98%+ purity, NMR COA) ->
identity CTA -> product/order block -> FAQ (incl. cancer objection ANSWERED, never
asserted).

Compliance (hard, from CLAUDE.md + beliefs-and-objections.md):
- Never name prescription drugs in body copy meant for ads; category terms only.
- Never assert cancer risk as fact — the FAQ answers the objection honestly.
- No money-back-guarantee language.
Use ui components; all copy double-quoted. Pull real VOC lines from
docs/wiki/product/avatar.md and marketing pages — do not fabricate testimonials.

Verify: `npx tsc --noEmit`. List any copy you were unsure was compliant for my review.
```
**Gate G1c:** flagship renders full belief flow; compliance self-flagged.

---

## Session 2.1 — DB + orders schema  ·  Plan Mode

**Goal:** Neon + Drizzle, `orders` table, clean `db:push`.
**Main risks:** schema drift from the manual-payment lifecycle · missing UTM/tracking
columns needed later · guest-checkout (nullable user_id) forgotten.

```
Plan Mode. Set up Neon + Drizzle and the orders schema per
docs/wiki/architecture/data-model.md.

Have explorer read lnnemml/nootropics src/lib/db/ (schema + client) and return the
orders shape + status enum. Then adapt for ISRIB:
- src/lib/db/schema.ts + client. orders table with fields from data-model.md,
  status enum pending_payment_instructions -> awaiting_payment -> paid -> fulfilled
  (any -> cancelled), product_slug + format + quantity, payment_method,
  crypto_discount_pct, total_price cents, UTM columns, nowpayments_invoice_id /
  payment_url, order_number unique, user_id NULLABLE (guest checkout stays).

Constraints: Drizzle only, no raw SQL outside src/lib/db/. DATABASE_URL from env
(document in .env.example). This is a NEW Neon database — nothing to migrate from the
live Redis; do not touch the live site.

Verify: `npx drizzle-kit push` (or configured db:push) runs clean against a fresh
Neon branch; `npx tsc --noEmit`. Show me the final schema before I approve wiring
checkout to it.
```
**Gate G2a:** `db:push` clean; schema reviewed and approved by me.

---

## Session 2.2 — Checkout + submitOrder + emails + NowPayments  ·  Plan Mode  ·  ⚠ HIGHEST RISK

**Goal:** working self-contained checkout writing to Neon, with emails + crypto
invoice. This is gate **G2**.
**Main risks:** order not persisting / partial writes · email failure blocking the
order · NowPayments webhook path mismatch at cutover · accidentally adding a card
field.

```
Plan Mode. Build the self-contained checkout end to end.

- (shop)/checkout page using the payment-method selector + checkout stepper
  components. Fields per docs/wiki/architecture/manual-payment-flow.md
  (name, email, phone, address, city, postal, state/region optional, country,
  quantity, note). NO card/payment fields — manual + crypto only.
- src/app/actions/submitOrder.ts (server action): validate -> insert order (status
  pending_payment_instructions) into Neon -> send BOTH Resend emails (customer
  order-received + ops new-order) -> if crypto: create NowPayments invoice and store
  invoice_id + payment_url -> return result. Email/invoice failures must NOT lose the
  order (persist first, then side effects; surface failures to ops, not the buyer).
- src/app/api/webhooks/nowpayments/route.ts marking the order paid on IPN.

FORK — decide with me before building the webhook: the live NowPayments dashboard IPN
URL points at the legacy endpoint. Options: (A) match this route's path to the legacy
path so no dashboard change at cutover; (B) use /api/webhooks/nowpayments and update
the dashboard URL at cutover. State your lean and wait for my call.

Constraints: prices/discount from products.ts + crypto_discount_pct; double-quoted
copy; Resend + NowPayments keys from env. Do not add analytics call sites yet
(session 3.1). Do not touch the live repo.

Verify: `npx tsc --noEmit` + `next build`. Then hand to prober for the real test
order on preview — do not consider this done until prober confirms the full chain.
```
**Gate G2 (blocking):** prober places a **real test order** on the preview URL →
row appears in Neon → both emails arrive → NowPayments invoice generates → webhook
flips status to paid. **No domain reassignment until G2 is green.**

---

## Session 3.1 — Analytics wiring end-to-end

**Goal:** funnel events fire through the abstraction with dedup.
**Main risks:** raw fbq/dataLayer sneaking into components · event_id dedup broken ·
order_submitted not primary.

```
Wire analytics call sites through src/lib/analytics only (trackEvent /
trackServerEvent). No raw fbq/dataLayer/clarity anywhere.

Events + fire points (per docs/wiki/architecture/analytics.md):
product_view (product pages), begin_checkout (checkout mount),
order_submitted (post-successful submitOrder — PRIMARY Meta conversion, maps to
InitiateCheckout), order_confirmed (admin action — Track B, stub the call site now).
Dedup: browser pixel and server CAPI share one event_id (the order_number). Confirm
order_submitted fires from BOTH browser and server with the same id.

Verify: `npx tsc --noEmit`. Then prober checks Meta Events Manager receives
order_submitted from both integrations and dedups. Report match-quality caveats
(fbc absent on test traffic is expected).
```
**Gate G3:** funnel fires in GA4 + Meta; `order_submitted` dedups browser+server.

---

## Session 3.2 — Legal templates + product content port  ·  PARALLELIZABLE

**Goal:** legal pages (drafts) + rich content ported into the 6 product pages.
**Main risks:** legal drafts mistaken for launch-ready · content-port sessions
colliding on shared files.

```
TWO independent workstreams — the content port is parallelizable across products.

A) Legal pages under (marketing): Terms, Privacy, Disclaimer, Research-Use. AI DRAFTS
   ONLY — put a visible "DRAFT — requires legal review, not launch-ready" banner in a
   code comment and in the wiki log. Do not present as final.

B) Content port — one implementer per product, safe to run in parallel since each
   touches only its own page/data:
   Port the rich content from docs/raw/legacy/<product>.html into the new product
   pages — mechanism copy, formula SVG, and for ISRIB A15 the NMR section + FID
   downloads (dash naming; DMSO-d6, 400/100 MHz; δ 1.79 & 1.35 are cyclohexane ring
   protons, label as such, not impurities). Each session: "port product X only, do
   not modify other product files or shared components."

Verify each: `npx tsc --noEmit`.
```
**Gate:** legal drafts present + flagged; all 6 product pages have final content.

---

## Session 4.1 — QA + redirects + sitemap

**Goal:** cutover-ready site.
**Main risks:** lost SEO from missing 301s · mobile breakage · orphan old URLs.

```
Make the site cutover-ready.
- Add next.config redirects: every legacy URL (old /product_*.html and the old
  vercel.json redirects) -> new slug, 301. Have explorer extract the full old URL
  list from docs/raw/legacy/ and the legacy vercel.json first.
- src/app/sitemap.ts + robots.ts.
- Full QA pass with prober: home -> product -> checkout -> submit (test order) ->
  email -> invoice, on desktop AND mobile viewport. Report any layout breakage.

Verify: `next build`; prober confirms the full flow + all 301s resolve.
```
**Gate G4:** QA clean desktop+mobile; 301s resolve; sitemap/robots present.

---

## CUTOVER (only after G2 + G3 + G4 green)

This is an ops checklist for you — not a single Claude Code session. Blue-green,
instantly reversible (see [ADR 0004](../decisions/0004-blue-green-cutover.md)).

1. **Env vars:** copy every var from `.env.example` into the new Vercel project
   (DATABASE_URL, Resend, NowPayments, all analytics IDs, UNSUBSCRIBE/CAMPAIGN
   secrets). Deliberate step — never `cp .env`.
2. **NowPayments webhook:** apply the fork decision from 2.2 — either the route path
   already matches the legacy IPN URL, or update the IPN URL in the NowPayments
   dashboard now.
3. **Pause paid traffic** for the cutover window (protects single-variable test
   integrity — cutover is itself a big change).
4. **Reassign the domain:** point `isrib.shop` to the new Vercel project.
   `isrib-a15.com` -> 301 to isrib.shop (or to /go in Track B). Keep the old project
   live as rollback.
5. **Smoke test on the real domain:** one real order end-to-end.
6. **Monitor 48h:** orders land in Neon, emails send, analytics intact. Rollback =
   reassign domain back to the old project.
7. Keep `isrib-research.com` untouched (Track B migrates it with per-article 301s).

## Gate summary

| Gate | Condition |
|---|---|
| G0 | `next build` ok, empty preview, git clean, fonts render |
| G1a/b/c | components render; 6 products render; flagship belief flow |
| G2a | orders schema `db:push` clean + approved |
| **G2** ⚠ | real test order -> Neon -> 2 emails -> invoice -> webhook paid |
| G3 | funnel fires GA4+Meta, order_submitted dedups |
| G4 | QA desktop+mobile, 301s, sitemap/robots |
| **CUTOVER** | only after G2+G3+G4; old deploy kept as rollback |

## Related
- [`agent-roles.md`](./agent-roles.md) · [`migration-plan.md`](./migration-plan.md)
