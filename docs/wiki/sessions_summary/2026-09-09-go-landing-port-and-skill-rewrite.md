# Session Summary — 2026-09-09 · `/go` landing: port → skill-driven rewrite → merge

**Roles run:** LEAD (orchestration + 4 book-skills + 4× AskUserQuestion + catalog/wiring recon
+ visual gates + git + wiki) → explorer ×2 · implementer ×3 · verifier ×2.

One-line: took `/go` from an off-strategy ported lander to a compliant, mechanism-led
direct-response funnel built through the five book-skills pipeline, added a compliant email
opt-in, and merged it to `main`. Full copy/strategy detail lives in
[`marketing/go-rewrite.md`](../marketing/go-rewrite.md) — read that for the deck; this is the
narrative + state.

---

## What happened, in two phases

### Phase 1 — faithful PORT (later superseded)
Ported the standalone `/home/laptop/Documents/ISRIB/isrib-a15-lander` (a dark/gold Tailwind-v3
funnel) onto `src/app/go/`, restyled onto our light DS, content kept verbatim. Wired buy CTAs
to the real cart/checkout (lander sale prices exactly matched the catalog), hid site chrome on
`/go`, set `robots: noindex`. Built + verifier-APPROVE + visual-gate PASS. **Then Anton said the
lander would be reworked entirely → Phase 2.**

### Phase 2 — skill-driven REWRITE (what shipped)
Rebuilt `/go` from scratch using the book-skills pipeline per
[`docs/raw/skills-session-summary.md`](../../raw/skills-session-summary.md) (the NORA method,
reused for ISRIB). **who → what → structure → words:**

1. **breakthrough-advertising (DIAGNOSE):** Awareness = Problem→Solution-aware; Sophistication =
   Stage 3→4 → **lead with the mechanism** (ISR/eIF2B "biological brake"), claim in the subhead.
   Dominant desire = "get my edge back / stop losing it."
2. **100m-offers (S7 offer):** under the ban on outcome-promises + money-back guarantee, WIN ON
   THE BOTTOM of the value equation (capsules = no scale/solvents/prep → near-zero effort/time);
   replace the guarantee by reversing the *real* fear (purity) with proof (COA/NMR/request-COA).
3. **dr-swipe-file (layout):** belief-gate order; borrowed-authority proof stack instead of
   testimonials; caught a missing **Final CTA** (added). Comparison stays high + anonymized.
4. **boron-letters (voice, LAST):** slippery-slide/you-orientation polish; boundary held through
   every line (e.g. resisted "…so you think clearly again" — kept mechanism-only).

Then implementer REBUILT `/go` into 11 belief-gate section islands + a compliant soft opt-in.

---

## Decisions Anton ratified (4× AskUserQuestion)
1. **Lead identity = "stuck-brake high-performer," NOT "55+ aging-decline."** ch08 identification —
   attach the role they long for (capped high-performer), never the one they flee (declining
   patient). This reversed the ported draft's premise.
2. **Keep the lander's real prices verbatim** (they match the catalog exactly).
3. **Cancer FAQ OMITTED** from `/go` — a cancer mention on a Meta destination can introduce a
   fear; keep it for organic/product pages.
4. **CTA/form wiring → this site** (real cart/checkout; opt-in → `marketing_contacts`).

## The core value: boundary held (this is a Meta ad destination)
The recurring win — **Schwartz's Stage-3 "sell the how, not the what" and the Meta/FTC guardrail
point the same way**, so mechanism-first is both the higher-converting and the compliant move.
Cut/reframed from the ported draft: the "aging decline" spine, "reverse cognitive decline"
(efficacy), fabricated testimonials (FTC), the "days 3–7" results timeline, and the guarantee
line. Walter quote scoped to *tolerability*; Calico trial = *legitimacy*, not efficacy. Legal
scoped to "most jurisdictions we ship to." Verifier's rendered-HTML claim scan: clean.

## Soft opt-in (S8.5) — real persistence, honest promise
"Get the research" section between FAQ and Final CTA. Lead magnet is research/education ONLY.
New `subscribeResearch` server action inserts into `marketingContacts` (ADR 0017) with
`source: "go_research"`, idempotent (`onConflictDoNothing`); client fires `email_subscribed`.
Anton broadcasts to the `go_research` segment via `/admin/campaigns`; Resend's one-directional
sync picks up the contact.

---

## Current state
- **Merged to `main`** (merge commit `e8c81b4`; branch `feat/go-landing-rewrite` still exists,
  fully merged). `npx tsc --noEmit` clean on main.
- **NOT pushed** — `main` is 4 commits ahead of `origin/main`. Not deployed.
- `/go` is chromeless, `robots: noindex`, buy CTAs use real catalog SKUs (17000/24000/13000/20000),
  no analytics on the page itself (cart/checkout owns conversion).
- Gates passed: implementer builds → verifier APPROVE (claim-boundary + money path + structure +
  analytics + DS) → LEAD visual gates PASS (headless full-page).

## Known gaps / open items
- **Opt-in insert not runtime-verified** — dev writes to prod Neon, so the form was NOT submitted.
  Verify once with a synthetic `@isrib-qa.test` email against prod, confirm the `go_research` row
  lands + syncs to Resend. See [[qa-use-synthetic-not-real-customers]].
- **Not pushed / not deployed** — awaiting Anton's push (Vercel builds from `main`).
- **Research emails don't exist yet** — the opt-in promises "we'll send the research"; Anton needs
  to author + broadcast the research sequence to the `go_research` segment for the promise to be
  real. (Persistence is in place; content isn't.)
- **Merged branch** `feat/go-landing-rewrite` can be deleted after push.
- **NMR quote sanity** — the Walter tolerability quote is a quoted third-party claim; worth a final
  human read before wide ad spend.

## Next steps
1. Anton: read `/go`, then **push `main`** (+ delete the merged branch).
2. Safe runtime-verify the opt-in insert (synthetic email).
3. Author the `go_research` research email sequence (Resend / `/admin/campaigns`).
4. Optional reuse of this diagnosis/copy: ad creatives + organic angles (the skill pipeline's
   next directions — see `docs/raw/skills-session-summary.md` §7).

## Related
- [`marketing/go-rewrite.md`](../marketing/go-rewrite.md) — the full copy deck + diagnosis (source of truth)
- [`product/beliefs-and-objections.md`](../product/beliefs-and-objections.md) · [`product/avatar.md`](../product/avatar.md) · [`marketing/messaging-angles.md`](../marketing/messaging-angles.md)
- [`docs/raw/skills-session-summary.md`](../../raw/skills-session-summary.md) — the book-skills method
