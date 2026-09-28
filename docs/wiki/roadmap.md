# Roadmap — Track A / Track B

> The full task-level runbook lives in
> [`architecture/migration-plan.md`](./architecture/migration-plan.md). This page
> is the phase overview.

## ⭐ Crypto-conversion recovery — BUILT *(2026-09-28)*

**Status:** all 3 parts built + verifier-APPROVE + build-green + LEAD visual. See the
[2026-09-28 log entry](./log.md). Card-on-invoice (NowPayments fiat on-ramp) was
evaluated and **rejected** (requires KYB — the same review that banned PayPal); all
fiat→crypto conversion stays buyer-side. New `/how-to-pay-crypto` guide (wallet path
leads with Litecoin, not USDT-TRC20, to avoid the TRX-gas trap), louder 10% at
checkout + emails, and guide/10% links added to the abandoned-checkout nurture.
The manual-payment email's coin framing was also flipped: no single "RECOMMENDED"
coin — USDT/BTC/LTC read as equal options with a one-line orienting hint; XMR
mentioned in the guide for the auto-invoice path only.

**Why (original brief):** PayPal was removed 2026-09-25 (account blocked again — see
[`architecture/manual-payment-flow.md`](./architecture/manual-payment-flow.md) and
[log](./log.md)). PayPal was the **main revenue stream**. Crypto is now the durable
spine — the one rail that can't be pulled — and USDT converts to cash on demand.
The mission this session: **recover the PayPal-buyer conversion on crypto** — most of
them didn't avoid crypto, they just didn't know how. Make it effortless.

Scope (delegate the `src/` edits per usual LEAD protocol; verify at runtime):
1. **Accessible "how to pay in crypto" guide** — in the manual-payment email (and
   ideally a linked page): how to *buy* USDT and how to *transfer* it, step-by-step,
   for someone who has never touched crypto. Lowering this knowledge barrier is the
   single biggest lever.
2. **Make the 10% crypto discount louder** — it's currently underplayed; surface it
   prominently at checkout and in the payment email so it actively pulls buyers to
   crypto.
3. **More active unpaid-order recovery** — re-send / strengthen the abandoned-checkout
   nurture with a **repeat link to the crypto invoice** so a pending order is one tap
   from paying. (Respect the existing QStash T+2h / T+24h suppression-once-paid flow.)

Compliance stays intact: no card fields / Pay-Now / Stripe; no money-back language.

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
  empty site on preview. *(done)*
- **Day 1** — Component library + product model + generic `products/[slug]`. *(done —
  1.1, 1.2)* **Reshaped by [ADR 0008](./decisions/0008-full-migration-and-cart.md):**
  the generic render is a fallback, not the flagship. Faithful ports of the live pages
  now drive Day 1's tail:
  - **1.3 — PARKED** (long-form belief landing; not the A15 page; maybe the paid
    `isrib-a15.com` landing later, Track B).
  - **1.4 — Site chrome + cart foundation:** real header (nav, mobile menu, **cart
    badge**) + footer + client cart state (line items, count, persist, cart→checkout).
  - **1.5 — A15 faithful port (reference):** the full live A15 page ported onto the
    new design system — commerce core (format selector + per-gram calculator + Add to
    Cart) + rich sections — lightly design-lifted, not redesigned.
  - **1.6 — Other 5 product ports** (same pattern; Original also has a calculator).
  Gate G1: every product page is a faithful, cart-wired port; parity vs the live site.
- **Day 2** — **Multi-line** checkout (Neon + Drizzle `orders` + `order_items`,
  `submitOrder` from the cart, payment-method selector, Resend emails, NowPayments
  invoice + webhook). **Gate G2:** real **multi-item** test order → Neon → 2 emails →
  invoice → status. No DNS/domain move until green.
- **Day 3** — Analytics end-to-end (preserve IDs, `order_submitted` primary) +
  legal templates + deep product content port (incl. the deferred rx-name/efficacy
  copy — architect compliance pass first). Gate: funnel fires; analytics parity.
- **Day 4** — QA (desktop + mobile + Clarity), sitemap/robots, 301 redirects from
  old URLs, **parity audit vs the live site (nothing dropped)**, **cutover** (Vercel
  domain reassignment), 48h monitoring.

## Track B — Platform fast-follow *(week 2, no live pressure)*

Order = ROI, not nootropics phase order:
1. Admin panel (orders list + status + shipping).
2. Journal / SEO hub — migrate `isrib-research.com` articles into
   `content/journal/*.mdx` **one at a time with 301s**; write pending articles;
   add `journal/writing-rules.md`. Dated ship plan:
   [`marketing/publication-calendar.md`](./marketing/publication-calendar.md).
3. `/go` DR landing (17-section standalone, from Master Report copy).
4. Email lead-gen (port the 4-email nurture, or keep the existing serverless
   system and point forms at it).
5. Customer accounts + referrals (lowest priority; pure growth).

## Related
- [`architecture/migration-plan.md`](./architecture/migration-plan.md)
- [`decisions/0004-blue-green-cutover.md`](./decisions/0004-blue-green-cutover.md)
