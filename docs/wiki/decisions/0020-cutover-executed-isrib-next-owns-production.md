# ADR 0020 — Cutover executed: isrib-next owns production `isrib.shop`

**Status:** accepted · 2026-09-23 · completes/supersedes the pre-cutover posture of
[ADR 0004](./0004-blue-green-cutover.md)

## Decision

The production domain `isrib.shop` + `www.isrib.shop` is owned by the **`isrib-next`**
Vercel project. Anton ratified this on 2026-09-23. This completes the blue-green
cutover defined in [ADR 0004](./0004-blue-green-cutover.md). The old `isrib` project is
**retained as rollback** (it still holds `isrib.vercel.app`) — not deleted.

## Context

- Surfaced during the 2026-09-23 apex-DNS outage (see
  [`log.md` 2026-09-23`](../log.md)). `vercel domains inspect isrib.shop` (CLI) displayed
  `isrib.shop`/`www` under **both** projects (`isrib` and `isrib-next`), which was flagged
  as a possible domain conflict and escalated as a WHAT-level fork.
- **Reconciliation via the Vercel API** (`list_project_domains`) shows the domains are
  bound **only to `isrib-next`**; the old `isrib` project holds only `isrib.vercel.app`
  (`count:1`). The apex is served by the isrib-next app (webhook `POST` → `401` sig-check;
  `/checkout` → `200`). The CLI "Projects" table listing both is a **stale/aggregate
  display artifact**, not an active dual-binding. So there was no live conflict to fix.
- Anton's call resolves the escalated fork: `isrib-next` is the production owner.

## Consequences

- **No domain-removal action was required** — bindings are already clean (isrib-next only).
- ADR 0004's precondition ("cutover only after gates G2+G3+G4 green") is now moot because
  prod is live on isrib-next. **G2 (checkout) is confirmed green** — the end-to-end flow
  (order → IPN → `paid`) has run on many real orders (Anton, 2026-09-23). Note this is
  separate from the outage-window IPN risk below.
- **Keep the old `isrib` project + deploy live as rollback** for at least the ADR 0004
  ≥7-day window; do not delete. Rollback = reassign `isrib.shop` back to `isrib`.
- The NowPayments IPN callback already targets apex `isrib.shop/api/webhooks/nowpayments`
  (isrib-next route) and responds **without a redirect** — ADR 0004's "repoint the webhook
  URL at cutover" requirement is satisfied.
- Any future apex DNS change must use an **ALIAS → `cname.vercel-dns.com`** record (Vercel
  static apex IPs `76.76.21.21` / `216.198.79.1` do **not** serve this domain — see
  `log.md` 2026-09-23) and should **lower TTL first** (3600 → 300).

## Revisit if

Rollback to the old site is needed (reassign the domain back to `isrib`), or a future
re-platform requires another cutover.
