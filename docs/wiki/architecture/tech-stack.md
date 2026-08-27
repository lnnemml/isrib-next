# Architecture — Tech Stack

> Mirrors the stack proven in `lnnemml/nootropics`. See
> [ADR 0001](../decisions/0001-fork-not-rebuild.md).

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript strict | SSR/RSC for SEO on marketing + product pages. **Breaking changes vs training data — read `node_modules/next/dist/docs/`.** |
| Styling | Tailwind v4 | Matches locked design system (`design/design-system.md`). Tokens map to the Claude Design output. |
| Database | Postgres via Neon | Serverless, branch-per-preview on Vercel. Order source of truth (ADR 0003). |
| ORM | Drizzle | TS-first, edge-friendly, explicit — no raw SQL outside `src/lib/db/`. |
| Auth | Auth.js (NextAuth v5), Drizzle adapter | Guest checkout + optional accounts. Admin + customer instances (Track B). |
| Payments | Manual + NowPayments crypto | No Stripe / no card fields (ADR / manual-payment-flow). |
| Email | Resend | order-received (customer) + new-order (ops); templates. |
| Content | MDX in-repo (`content/journal`) | Journal / SEO hub (Track B). |
| Hosting | Vercel | Native Next.js + Neon branching. Domain reassignment = cutover step (ADR 0004). |
| Analytics | GTM + Clarity + Meta Pixel (client) + Meta CAPI + GA4 MP (server) via `src/lib/analytics/` | Preserve existing IDs; `order_submitted` primary (ADR 0005). |

## Principle for new dependencies

Before adding a SaaS/package: does an existing stack piece already solve it? Is it
justified by the *current* phase, or an anticipated future one? Future
justifications need Anton's sign-off.

## Related
- [`folder-structure.md`](./folder-structure.md) · [`data-model.md`](./data-model.md)
- [`migration-plan.md`](./migration-plan.md)
