# ADR 0023 — Everyone who places an order auto-joins the marketing list

**Status:** accepted · 2026-10-25 · supersedes the "v1 seeds once" line of
[ADR 0017](0017-email-campaign-broadcasts-and-marketing-list.md)

## Decision

From now on, **every order submission** adds the buyer's email to `marketing_contacts`
(source `"orders"`) and, when that adds a new row, to the Resend "General" segment. This
holds for **paid and unpaid orders alike** (Anton's call, 2026-10-25). It is done through
one shared helper, which is also used for a one-time **backfill** of the order emails that
went missing between the 2026-09-08 seed and now.

Rules the helper keeps:
- **Insert-only** (`onConflictDoNothing` on email). An existing row is never touched, so an
  opt-out (`unsubscribed_at`) always wins and is never reset.
- **Resend only on a new row.** A contact that is already in Neon, and in particular an
  opted-out one, is never pushed to Resend again.
- **QA addresses are skipped** (`*.test` domains, e.g. `@isrib-qa.test`), because local dev
  writes to prod Neon (see the QA memory / [`architecture/`](../architecture/)).
- **It never breaks checkout.** It runs after the order is committed, every error is
  caught and logged, and nothing about it can change the order result or the redirect.

Out of scope: signups without an order (27 at decision time) and abandoned-checkout
emails. Neither placed an order or gave marketing consent.

## Context

ADR 0017 seeded `marketing_contacts` once (customers + legacy JSON, 2026-09-08) and
listed "new buyers should auto-join" under *Revisit if*. Nothing wrote to the list after
that, so on 2026-10-25 the 21 distinct order emails since the seed were missing: 16 with
paid/fulfilled orders, 5 with only pending/cancelled ones. Path-B sends
(`send-email2.ts`, `send-video001.ts`) read Neon rather than Resend, so those buyers, the
warmest on the list, would have been skipped by the video-001 email.

## Consequences

- Each new order costs one extra DB insert. Each new contact costs one Resend
  `contacts.create`, which runs after the order and outside its critical path.
- Unpaid orders bring more typo'd or throwaway emails, so expect a few more bounces. The
  known-bounce handling in `consolidate-marketing-list.ts` stays the cleanup path.
- Resend → Neon unsubscribe reconciliation is still not done (ADR 0017, Track B). Neon
  stays the list the Path-B sends read.

## Revisit if

- Bounce or complaint rates rise from unpaid-order emails. Then restrict to paid or
  fulfilled orders (hook into the NowPayments webhook + admin mark-paid instead).
- Checkout gains an explicit marketing-consent checkbox. Then gate on it.
