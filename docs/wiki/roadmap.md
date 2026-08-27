# Roadmap — Track A / Track B

> The full task-level runbook lives in
> [`architecture/migration-plan.md`](./architecture/migration-plan.md). This page
> is the phase overview.

## Pre-build — Design pass *(done — LOCKED 2026-08-27)*

Claude Design produced the premium design system (tokens, typography, components,
key page templates), **preserving the current `isrib.shop` light blue/cyan/white
lab-grade identity and elevating it to premium** — NOT the amber-on-near-black
landing branch (diverged, not adopted). Output is locked in
[`design/design-system.md`](./design/design-system.md) (direction + rationale) and
[`design/handoff-spec.md`](./design/handoff-spec.md) (exact Tailwind v4 `@theme`
tokens + `next/font` — the implementation source of truth).

**Current phase: ready for Track A Day 0.**

## Track A — Safe storefront replacement *(build target: a few days)*

Goal: a live-ready single-domain Next.js site that can replace `isrib.shop`
without breaking orders. Cutover (Vercel domain reassignment) only after the
checkout gate is green; old deploy stays as instant rollback.

- **Day 0** — Scaffold + wiki + analytics layer skeleton. Gate: `next build` ok,
  empty site on preview.
- **Day 1** — Design system + product model (`src/lib/copy/products.ts`, 6 products)
  + `(shop)/products/[slug]` + ISRIB A15 landing. Gate: all 6 render, prices correct.
- **Day 2** — Checkout (Neon + Drizzle orders, `submitOrder` action, payment-method
  selector, Resend emails, NowPayments invoice + webhook route). **Gate G2:** real
  test order → Neon → 2 emails → invoice → status. No DNS/domain move until green.
- **Day 3** — Analytics end-to-end (preserve IDs, `order_submitted` primary) +
  legal templates + port 6 product content pages (parallelizable). Gate: funnel
  fires; analytics parity.
- **Day 4** — QA (desktop + mobile + Clarity), sitemap/robots, 301 redirects from
  old URLs, **cutover** (Vercel domain reassignment), 48h monitoring.

## Track B — Platform fast-follow *(week 2, no live pressure)*

Order = ROI, not nootropics phase order:
1. Admin panel (orders list + status + shipping).
2. Journal / SEO hub — migrate `isrib-research.com` articles into
   `content/journal/*.mdx` **one at a time with 301s**; write pending articles;
   add `journal/writing-rules.md`.
3. `/go` DR landing (17-section standalone, from Master Report copy).
4. Email lead-gen (port the 4-email nurture, or keep the existing serverless
   system and point forms at it).
5. Customer accounts + referrals (lowest priority; pure growth).

## Related
- [`architecture/migration-plan.md`](./architecture/migration-plan.md)
- [`decisions/0004-blue-green-cutover.md`](./decisions/0004-blue-green-cutover.md)
