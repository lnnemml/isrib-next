# Roadmap — Track A / Track B

> The full task-level runbook lives in
> [`architecture/migration-plan.md`](./architecture/migration-plan.md). This page
> is the phase overview.

## Pre-build — Design pass *(current)*

Claude Design produces the premium design system (tokens, typography, components,
key page templates) evolving the existing amber-on-near-black underground-lab
direction. Output is filed into [`design/design-system.md`](./design/design-system.md)
before any component is built. See design-system.md status note.

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
