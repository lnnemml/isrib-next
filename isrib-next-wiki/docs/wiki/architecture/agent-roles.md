# Architecture — Agent Roles & Orchestrator Protocol

> The Claude Code agent team for this project and how the main session runs it.
> Config files live in [`.claude/agents/`](../../../.claude/agents/) at repo root;
> this page is the human-readable spec. Task prompts are in
> [`track-a-runbook.md`](./track-a-runbook.md).

## The team

| Agent | Model | Writes code? | Role |
|---|---|---|---|
| **orchestrator** | Opus 4.8 | coordinates | The main Claude Code session. Not a subagent — it IS the session. Plans, decomposes, delegates, integrates, holds the human-in-the-loop gate. |
| **explorer** | Haiku | no (read-only) | Fast, cheap reconnaissance: how does nootropics do X, where are the call sites of Y, what shape is file Z. Returns findings, never edits. Parallelizable. |
| **implementer** | Opus 4.8 | yes | Executes ONE precisely-scoped build task from the orchestrator. Touches only the stated files. Ends with `tsc --noEmit`. |
| **prober** | Sonnet | test scripts only | Runtime verification: runs the build, places test orders, hits endpoints, inspects Neon / logs / Events Manager. Returns pass/fail + evidence. Does not edit app code. |
| **verifier** | Opus 4.8 | no (review) | Fresh-context review of the implementer's diff against the task spec + CLAUDE.md hard constraints. Returns approve / reject + specific issues. Judges, doesn't fix. |

**Why the split pays off (this is a dependent chain, not an assembly line):**
- explorer on **Haiku** keeps recon cheap and keeps the orchestrator's context lean
  (it delegates heavy reading instead of doing it itself).
- a fresh-context **verifier** catches constraint drift the implementer — invested in
  its own solution — misses. Opus because judging subtle correctness/compliance needs
  the strong model.
- **prober** on Sonnet does the mechanical "does it actually work" checks; its value
  peaks at the G2 checkout gate (real test order).

**When to use the full pipeline vs. just do it:** Track A is a sequential, dependent
chain — the orchestrator does NOT run the full explorer→implementer→verifier→prober
loop on every trivial task. Reach for the roles where they earn their cost:
- explorer → before any build that mirrors nootropics, or that needs a call-site map.
- implementer → any real code change.
- verifier → after any change touching constraints (checkout, analytics, forbidden
  files, compliance copy, design tokens).
- prober → after checkout, analytics, and at QA (G2/G3/G4). Skip for pure UI.

**Parallelism:** only (a) multiple explorers doing independent recon, and (b) Day-3
content port (one implementer per product, disjoint files). Never parallelize the
dependent build chain.

## Standard loop per task

```
orchestrator: write task spec (objective · files in scope · files NOT to touch ·
              acceptance criteria · top 1–3 risks)
   -> explorer (optional): recon, returns findings
   -> FORK CHECK: genuine decision? -> STOP, ask human (options + lean). else continue
   -> implementer: build within scope, `tsc --noEmit`
   -> verifier: review diff vs spec + hard constraints -> approve / reject(+issues)
        (reject -> back to implementer with the issues)
   -> prober (where it earns it): runtime check -> pass / fail(+evidence)
   -> orchestrator: integrate, run gate (tsc/build), append docs/wiki/log.md
```

## Orchestrator protocol (the non-negotiable behaviors)

### 1. Precise task specification
Every delegated task carries, explicitly:
- **Objective** — one sentence.
- **Files in scope** — exact paths the agent may create/edit.
- **Files/areas NOT to touch** — especially: the live repo, `src/lib/analytics/*`
  internals when only adding call sites, design tokens, anything under CLAUDE.md hard
  constraints.
- **Acceptance criteria** — what "done" means, incl. the verify command.
No vague delegation ("build the checkout"). If the orchestrator can't specify the
files, it sends explorer first.

### 2. Name the risks
Every task spec names the top 1–3 risks up front (e.g. "risk: partial write leaves
an order without an invoice; risk: a raw fbq() slips into a component; risk:
NowPayments webhook path mismatch"). This primes implementer and verifier on what to
guard. Risks for each Track A session are pre-listed in the runbook.

### 3. Fork handling — human in the loop
At a genuine decision fork — schema/library/UX tradeoff, ambiguity in the spec, a
constraint tension, anything not mechanically determined — the orchestrator does NOT
silently pick. It STOPS and presents to the human:
- the fork, in one line;
- 2–3 concrete options with their tradeoffs;
- **its own lean** (recommended option + why).
Then waits for the decision. (Example baked into runbook session 2.2: the NowPayments
webhook path.) Mechanical choices with an obvious right answer don't need a fork —
don't manufacture ceremony; reserve it for real decisions.

### 4. Escalate — tag every fork technical vs architectural
The orchestrator tags each fork by altitude:
- **technical** (webhook path, a schema detail, a library choice, a class string) —
  resolve it with Anton right here in the Code session; it stays in Code.
- **architectural / WHAT-level** (does it change Track A scope? contradict an ADR?
  imply a new domain/analytics strategy? did a gate reveal something needing
  replanning?) — the orchestrator does NOT resolve it. It appends to
  `docs/wiki/log.md`:
  `## [YYYY-MM-DD] escalate | <one-line fork>` with the 2–3 options + its lean, and
  pauses that thread. Anton carries it to the web **architect** session, which
  produces an ADR (or roadmap edit). Anton commits it; Code reads it and continues.

The architect's output is always a wiki artifact (ADR / roadmap edit), never just
chat — Code can only consume a file, not a conversation.

### 5. Integrate + log
After a task passes its gate, the orchestrator updates `docs/wiki/log.md`
(`## [YYYY-MM-DD] phase | <session> done`) and any wiki page whose contract changed
(e.g. data-model.md when the schema lands). A good result gets filed back into the
wiki, not left only in the session.

## Guardrails that bind every agent
Inherited from [`../../../CLAUDE.md`](../../../CLAUDE.md): don't touch the live repo;
no card fields; analytics only via trackEvent/trackServerEvent; double-quoted JSX
copy; Drizzle only; read `node_modules/next/dist/docs/` before App Router code;
`tsc --noEmit` before done; never invent a real price; legal pages are drafts.

## Related
- [`track-a-runbook.md`](./track-a-runbook.md) · [`migration-plan.md`](./migration-plan.md)
