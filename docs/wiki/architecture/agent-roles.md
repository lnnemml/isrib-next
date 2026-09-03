# Architecture — Agent Roles & Orchestrator Protocol

> The Claude Code agent team for this project and how the main session runs it.
> Config files live in [`.claude/agents/`](../../../.claude/agents/) at repo root;
> this page is the human-readable spec. Task prompts are in
> [`track-a-runbook.md`](./track-a-runbook.md).

## Topology (single-instance LEAD model)

Everything runs inside one Claude Code instance, two levels deep (subagents are leaf
workers — they don't spawn their own subagents). The main session you type into is the
**LEAD** = **architect + orchestrator merged**: it holds altitude (decisions, wiki,
scope, port inventories, gates, side-by-side review) AND orchestrates the build by
delegating to the four subagents below. The earlier two-session model (a separate web
architect coordinating only through the wiki) is **retired** — the LEAD now has direct
local sight and uses it.

**Hard boundary that keeps the LEAD at altitude:** the LEAD writes **only `docs/`**.
Every `src/` change goes through the **implementer**. The LEAD reads code, runs the app,
screenshots, greps, inspects git — but never hand-edits source. Local sight without
hand-coding.

## The team

| Agent | Model | Writes code? | Role |
|---|---|---|---|
| **LEAD** (architect + orchestrator) | Opus | `docs/` only | The main Claude Code session — it IS the session, not a subagent. Holds altitude (decisions, wiki, port inventories, gates) + orchestrates: plans, decomposes, delegates, integrates, does side-by-side review itself, holds the human gate. Writes only `docs/`; all `src/` via the implementer. |
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

**When roles are MANDATORY vs. when solo is allowed** (see [ADR 0006](../decisions/0006-delegation-discipline.md)).
Track A is a sequential, dependent chain — so the orchestrator does NOT run the full
explorer→implementer→verifier→prober loop on *every* task. But delegation is **not
discretionary** for the task classes below — the orchestrator may not "just do it"
solo on these:
- **explorer** — REQUIRED before any build that mirrors `nootropics` or needs a
  call-site/shape map. (Keeps the orchestrator's context lean on a long ephemeral
  chain; a solo read bloats it.)
- **implementer** — any non-trivial real code change (multiple files or logic).
- **verifier** — REQUIRED after any change touching a hard-constraint area:
  checkout, analytics, forbidden/live files, compliance copy, design tokens. This is
  the only *independent* check; self-authored + self-attested constraint code has no
  guardrail. The architect's gate-time drift check is a backstop at a different
  altitude (built-vs-intended), NOT a substitute for the in-session line-by-line
  verifier.
- **prober** — REQUIRED after checkout, analytics wiring, and at QA (G2/G3/G4).

**Solo ("just do it") is allowed ONLY for genuinely trivial/mechanical work** —
empty placeholder pages, a single class-string edit, a config one-liner — and even
then the orchestrator must *declare* it soloed and why (see the report format in §6).
Do not manufacture ceremony on trivial work; but do not solo a constraint task to
save a turn. This is calibration, not "full pipeline on everything" — that would
bottleneck the 4-day build and is an explicit anti-goal.

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

### 6. Session report format — make the loop observable
Every report the orchestrator returns to Anton **opens with a `Roles run:` line** —
which subagents actually ran, plus the verifier verdict and prober evidence where
they applied. Examples:
- `Roles run: explorer (nootropics analytics shape) → implementer → verifier: approve → prober: n/a (no call sites)`
- `Roles run: soloed — trivial (empty placeholder pages only)`

A report without this line is **incomplete** — Anton should push back and ask which
roles ran before accepting the gate. This is the forcing function that makes
delegation drift visible at gate time instead of invisible: without it, a solo run on
a constraint task looks identical to a properly-reviewed one. If a mandated role (§3
above) was skipped, say so explicitly and why — don't omit it.

## Guardrails that bind every agent
Inherited from [`../../../CLAUDE.md`](../../../CLAUDE.md): don't touch the live repo;
no card fields; analytics only via trackEvent/trackServerEvent; double-quoted JSX
copy; Drizzle only; read `node_modules/next/dist/docs/` before App Router code;
`tsc --noEmit` before done; never invent a real price; legal pages are drafts.

## Related
- [`track-a-runbook.md`](./track-a-runbook.md) · [`migration-plan.md`](./migration-plan.md)