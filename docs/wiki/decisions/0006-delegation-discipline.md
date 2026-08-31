# ADR 0006 — Delegation discipline + session-report observability

**Status:** accepted · 2026-08-27

## Decision

Subagent delegation is **mandatory** for named task classes, not left to the
orchestrator's discretion:

- **explorer** before any build mirroring `lnnemml/nootropics` or needing a
  call-site/shape map.
- **verifier** (fresh context) after any change touching a hard-constraint area:
  checkout, analytics, forbidden/live files, compliance copy, design tokens.
- **prober** after checkout, analytics wiring, and at QA gates (G2/G3/G4).
- **implementer** for any non-trivial real code change.

Solo ("just do it") execution by the orchestrator is permitted **only** for
genuinely trivial/mechanical work (empty placeholder pages, a single class-string
edit, a config one-liner), and even then it must be *declared*.

Every session report to Anton **opens with a `Roles run:` line** naming the
subagents that ran + the verifier verdict + prober evidence (or `soloed — <why
trivial>`). A report lacking this line is incomplete; Anton pushes back before
accepting the gate.

This is captured operationally in
[`../architecture/agent-roles.md`](../architecture/agent-roles.md) §3 (mandatory
roles) and §6 (report format).

## Context

Sessions 0.1 (scaffold, touched design tokens) and 0.2 (analytics abstraction) were
executed largely solo. 0.2 is a named constraint area whose runbook prompt explicitly
ordered an explorer pass on nootropics — yet the report showed neither explorer nor
verifier. Constraint-critical code (browser↔CAPI dedup, the ban on raw
`fbq`/`dataLayer`/`clarity`, IDs sourced only from env) was thus self-authored and
self-attested by the same context that wrote it, with no independent review.

The two mechanical reasons the role split exists (from `agent-roles.md`) are exactly
what solo execution forfeits: explorer on Haiku keeps the orchestrator's context lean
on a long ephemeral chain; a fresh-context verifier catches the constraint drift an
author invested in their own solution misses. The failure was invisible because the
report format did not require stating which roles ran — so a solo run looked identical
to a reviewed one.

The architect's gate-time drift check (built-vs-intended) is a backstop at a
different altitude and does **not** substitute for the in-session, line-by-line
verifier.

## Consequences

- Slightly more subagent invocations on high-risk tasks. This is deliberately **not**
  "full pipeline on every task" — that would bottleneck the few-days build and
  contradicts the architect-brief ("earn your keep at gates, don't over-rev") and
  `agent-roles.md` ("don't manufacture ceremony"). Trivial work stays fast.
- Reports become observable: the architect can see at each gate whether the mandated
  loop ran, making delegation drift self-catching rather than discovered late.
- **Immediate remedy:** a fresh-context verifier pass runs on the committed 0.2
  analytics diff (`d8133e8`) against the 0.2 spec + CLAUDE.md analytics constraints
  **before** Session 1.1 is released.

## Revisit if

The `Roles run:` line proves to add noise without catching anything across several
gates → relax it to constraint-touching sessions only, keeping the mandatory-role
rule intact.

## Related

- [`../architecture/agent-roles.md`](../architecture/agent-roles.md)
- [`../architecture/track-a-runbook.md`](../architecture/track-a-runbook.md)
