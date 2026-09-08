# ADR 0017 — Email-campaign infrastructure (Resend Broadcasts + Neon marketing list)

**Status:** accepted · 2026-09-08

## Decision

Send the relaunch email (and future bulk mail) via **Resend Broadcasts** against a
**consolidated Neon marketing list**, triggered from an **admin-gated** page — rather than
porting the old site's `batch-splitter.html` / `campaign.html` + custom `/api/send-campaign`
loop. We keep the old tools' *intent* (slice the list → send the relaunch mail); we replace
their *mechanism*.

- **Canonical list = a new `marketing_contacts` table** (Drizzle): `email` (unique,
  lowercased), `firstName` (nullable), `source` (`"customers" | "legacy-json"`),
  `unsubscribedAt` (nullable), `createdAt`. Kept **separate from `customers`** (the NOT-NULL
  `name`/`clientType` LTV/BI anchor, ADR 0012) so never-ordered marketing leads never
  pollute repeat/LTV metrics.
- **The list is fragmented and must be unioned:** Neon `customers` (213 unique) ∪ the legacy
  `customers.json` (555 unique; **396 net-new**, 159 overlap, 54 Neon-only) = **609 unique**.
  Neither source alone is the audience.
- **Send engine = Resend Broadcasts**, targeting the existing "General" segment
  (`d8632a0a-7b29-4d20-9118-28c3c9c007b7`, verified sender domain `isrib.shop`). Chosen for
  **managed unsubscribe + a real `List-Unsubscribe` header** — the deliverability fix, which
  is the exact reason the send was deferred. Resend owns unsubscribe status after send.
- **Opt-out recovery is a hard prerequisite.** The old opt-out list lived ONLY in the old
  Upstash Redis (`unsub:<email>` keys) and was **never synced to Resend** (which has 5
  auto-bounce suppressions only). It must be exported (via the old Vercel project's KV creds)
  and applied before any send. Re-mailing opt-outs is the single worst thing for the domain
  reputation already blocking this email.
- **Auth:** the tooling lives under `/admin/campaigns`, gated by the existing
  `isrib_admin_session` cookie + per-action `isAdminAuthed()` re-check (ADR 0011) — no new
  `CAMPAIGN_SECRET`.
- **The batch-splitter is retired** for its original purpose: 609 < Resend's 1000/batch, so
  no splitting is needed. Batching survives only as a possible future cold-domain warm-up.

## Context

Anton asked to port `batch-splitter.html` + `campaign.html` from the old vanilla site to
send the relaunch email (which advertises `RELAUNCH10`, ADR 0016). Recon found the old flow
depended on a Redis unsubscribe store that has **no equivalent** in the new stack, and that
the recipient list is split across Neon and a `customers.json` file that partially overlap.
A faithful port would therefore either miss ~65% of the audience or re-mail opt-outs — the
deliverability failure mode that deferred this email in the first place. Resend Broadcasts
solves suppression + `List-Unsubscribe` natively, so it supersedes the port.

## Consequences

- **Three Anton-gated scripts** (run in order): `export:legacy-unsubscribes` (needs the OLD
  Vercel `LEGACY_KV_REST_API_URL`/`_TOKEN`), `consolidate:marketing-list` (needs
  `data/customers.json` staged), `sync:resend-audience`. They hit prod Neon / old Upstash /
  Resend, so they are NOT run during the build.
- `db:push` (adds `marketing_contacts`) is an Anton gate **before** the campaigns page can
  render (the page queries that table) or the scripts run.
- **Email content is deliberately deferred** — no relaunch HTML/broadcast is authored in
  code. The admin page reads broadcasts from Resend dynamically, so the finalized copy (which
  Anton will revise) drops in as a Resend broadcast with no code change.
- The consolidation is additive and idempotent: re-running never resets an existing opt-out;
  the sync excludes opted-out contacts from the Resend push.
- Resend becomes the source of truth for unsubscribe status after the first send; syncing
  Resend unsubscribes back to Neon is out of scope for v1 (Track B).

## Revisit if

- We want a cold-domain **warm-up** ramp — reintroduce segment-splitting / throttled batches
  (the batch-splitter's only remaining use).
- We need **Resend → Neon unsubscribe reconciliation** (a Resend webhook writing
  `marketing_contacts.unsubscribedAt`) so Neon stays authoritative.
- New buyers should auto-join the marketing list — add a hook on order/customer creation
  (v1 seeds once).

## Related
- [ADR 0016](0016-launch-promo-codes.md) (the `RELAUNCH10` code the email advertises) ·
  [ADR 0012](0012-legacy-orders-import-and-customers.md) (the `customers` LTV anchor kept pure) ·
  [ADR 0011](0011-admin-panel-and-auth.md) (admin session auth) ·
  [ADR 0005](0005-analytics-preservation.md) ·
  `marketing/relaunch-announcement-email.md`
