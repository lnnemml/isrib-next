# Book-Skills Session Summary — NORA /go Rewrite

A working record of how we built and used the skill pipeline, written so it can be
re-run for **ISRIB A15** and extended to **organic strategy** and **creatives**.

---

## 1. What we built

Five **book-skills** in Claude Code (via `book-to-skill`), each covering one zone.
Together they form a pipeline: **who → what → structure → words → voice.**

| Skill | Book / source | Zone | The question it answers |
|---|---|---|---|
| `breakthrough-advertising` | Schwartz, *Breakthrough Advertising* | Strategy | **Who** to talk to (awareness, sophistication, mass desire) and **which idea** |
| `100m-offers` | Hormozi, *$100M Offers* | Offer | **What** to sell (value equation, guarantee, price, bonuses) |
| `dr-swipe-file` | Your DTC swipe PDFs | Execution | **How a section looks** (layout, copy-moves) |
| `100m-leads` | Hormozi, *$100M Leads* | Channels | **Where** to get people (leads, traffic) — stands apart from the landing page |
| `boron-letters` | Halbert, *Boron Letters* (25 web chapters) | Voice | **The words** — living, readable voice; the LAST polish layer |

All five are universal — reusable across NORA, ISRIB, and any DTC project.
**Nothing new needs building for ISRIB** — only a new wiki and the same process.

---

## 2. What makes a skill work (not a book report)

Three things separate a working skill from a summary. Apply all three to every new skill.

### a. Description = your real tasks, not a description of the book
The description line is the ONLY thing Claude sees when deciding whether to pull the
skill off the shelf.

- ❌ "knowledge from $100M Offers" → ignored
- ✅ "Main job: build a Grand Slam Offer… Use whenever someone says: build my offer,
  what should I charge, my offer isn't converting…" → triggered

### b. Workflow with modes
Turns a book into a working loop, not a lecture. Examples we used:
- `breakthrough-advertising`: **DIAGNOSE** (before writing) / **REWRITE** (on existing copy)
- `100m-offers`: **BUILD** (new offer) / **SCORE** (grade existing)

Without modes the skill paraphrases; with modes it *applies* to your page.

### c. Boundaries baked into the description
So skills don't fight each other when used together. Each description says what it
owns and what it defers:
> "…strategy (awareness/desire/sophistication) → breakthrough-advertising;
> the offer → 100m-offers; section layout → dr-swipe-file."

`boron-letters` explicitly declares itself the **LAST** layer:
*never apply first — polishing copy aimed at the wrong audience is beautifully-written failure.*

---

## 3. The boundary test (run this every time you add a skill)

Six prompts, each must pull **its** skill, and an unrelated one must pull none:

| Prompt | Should trigger |
|---|---|
| "build me a guarantee for [product]" | `100m-offers` |
| "who is my customer and what awareness stage" | `breakthrough-advertising` |
| "show me a comparison swipe" | `dr-swipe-file` |
| "how do I get traffic without Google Ads" | `100m-leads` |
| "this copy sounds like an ad, make it human" | `boron-letters` |
| a domain question (e.g. ORCA / chemistry) | none |

The critical check is **strategy vs voice** ("who is my customer" must stay with
Schwartz, not get grabbed by Halbert) and **offer vs awareness** (both can react to
"not converting" — make sure the right one leads). If routing is wrong, fix the
trigger phrases in the description.

---

## 4. Technical gotchas (all will recur on ISRIB)

- **The converter puts skills in the wrong root.** It kept landing in
  `Documents/.claude/skills/` — which Claude Code does **not** discover from.
  Live personal root is `~/.claude/skills/` (works in every project) or a project's
  own `.claude/skills/` (that project only). **After every conversion, confirm ALL
  skills live in one discovered root**; consolidate if split. This cost us the most time.
- **Restart the Claude Code session** after adding a skill — they load at startup.
- **Web sources** (Boron = 25 URLs): the converter can't take URLs directly. Fetch to
  a folder first (strip nav/masthead, keep body + source URL), then build.
- **Visual PDFs** (swipe files): the converter only reads *text*. For image collages,
  use a direct prompt that makes Claude **look at** the images and transcribe the
  specifics (the exact comparison rows, numbers, brand examples) — otherwise you get a
  generic layout description.

---

## 5. The core lesson — carries straight to ISRIB and MORE so to ads

**Skills gave the method. The boundary was held by your wiki and by you — not the skill.**

The most valuable thing this session produced wasn't the new page. It was that the
skills, working against your wiki constraints, **caught claims that broke the
regulatory line**:

- Refused to write a money-back guarantee (wiki bans it) — reframed to real trust
  (authenticity, NMR/COA, shipping integrity).
- Caught "anxiolytic" and disease-treatment framing (S12, FAQ) and stripped them.
- Removed **fabricated testimonials** on a pre-revenue page (FTC exposure) — replaced
  with honest "we lead with lab work, not invented reviews."
- Found claims **baked into images** (before-after.png, comparison-table.png,
  dual-mechanism.png) that text guardrails can't see — flagged for regeneration.
- Caught the "728-patient trial": real study, but a **drug-trial against a diagnosis**
  (ladasten / asthenia) — citing it as efficacy proof reclassifies the product as an
  unapproved drug. Kept as *human-tolerability* signal only, never efficacy.

### The rule to bake into every ISRIB skill and every REWRITE prompt
> **Support via mechanism + identification. Never a promise of a health outcome.**

Plus, specific to this category:
- No results/timeframe claims ("feel X in Y days"), no "users report" on a pre-revenue page.
- Watch claims **in images** (invisible to text guardrails).
- Legal claims scoped to reality ("legal where we ship", never "worldwide").
- A real clinical trial is a **safety/tolerability** asset, not an **efficacy** claim —
  the distinction is the whole game.

---

## 6. Reusing this for ISRIB A15

Nothing new to build. The five skills are on the shelf. To run ISRIB:

1. **Write the ISRIB wiki first** — `avatar.md`, `beliefs-and-objections.md`,
   `constraints` (the same wiki that held the line for NORA). The skills are only as
   safe as the constraints they read.
2. **`isrib-v2` as a draft copy** of the live landing route — never edit the live page
   while rewriting (Next.js: new route, `robots: noindex`, canonical to itself).
3. **DIAGNOSE first** (awareness stage, sophistication, the real vs written audience),
   then **REWRITE section by section**, in the pipeline order:
   breakthrough (strategy) → 100m-offers (offer, if a trust element) →
   dr-swipe-file (layout) → boron-letters (voice, last).
4. **Per section, check in this order:** boundary (did a claim leak?) → does it advance
   the argument → is the voice alive. Boundary first — good voice on a broken claim is a fail.
5. **Keep a tracking file** for image claims and a **claims-to-confirm** list (facts only
   you can verify: cGMP, evidence basis, primary-source checks).

---

## 7. Next directions — organic, creatives, new skills

Honest filter for any new skill: **build it only if the book's value is a PROCESS**
(named steps you run), not general principles Claude already knows. Principle books
(Cialdini's *Influence*, *StoryBrand*) duplicate what's already in Schwartz + swipe-file
→ they produce book reports. Skip them.

### Organic strategy (your MAIN channel, not a side one)
Paid platforms restrict this category, so distribution comes from content + community.
`100m-leads` already covers channels. Add process resources for:
- **Content SEO / topical authority** — your buyer googles "bromantane vs modafinil",
  "dopamine fog". Own those queries with mechanism-explainers. Compounding, ad-policy-proof.
- **Community-led growth** (Reddit / forums) — this audience "smells marketing instantly";
  needs the value-add-first playbook, not selling.

### Creatives (short-form / UGC)
Skills apply, but this is a different layer from Halbert (he's text voice; this is
*video attention retention*).
- **Hook-writing + retention for short-form** (Shorts / TikTok / Reels) — first-3-seconds
  mechanics, the "I tried X for 30 days" format.
- **Constraint is HARDER here:** claims in video can't be pixel-scanned, and platforms
  moderate more aggressively. The mechanism-not-outcome guardrail must be *explicit* in
  the creative skill.

### Email / lifecycle
You flagged interest and Resend is already connected. Email is a channel no one can ban.
An email-lifecycle **process** resource is a good skill candidate (onboarding, nurture,
win-back as named sequences).

### Build / don't build
- **Build:** process resources for SEO workflow, short-form hook frameworks, email lifecycle.
- **Don't build:** general-principle marketing books — they duplicate the existing shelf.

---

## 8. Where NORA go-v2 stands (open, non-urgent)

- Full copy rewrite **complete end-to-end**, hero → final CTA. Boundary held throughout.
- Live `/go` is **not taking traffic** — so the old page's fabricated claims are a
  *must-not-carry-over* list at launch, **not** a same-day emergency. go-v2 replaces it
  cleanly when ready.
- Remaining, in your own time:
  - Sweep two bars (S00 TopBar still says blanket "Legal in US/CA/EU/AU"; S11 TrustBar
    cGMP / third-party-testing) — a consistency hole, quick.
  - `docs/go-v2-claims-to-confirm.md` — your pre-launch fact checklist (cGMP, tolerance
    evidence basis, TH-upregulation primary-source check, etc.).
  - Image regeneration — separate session (six claim-bearing images + hero graph wording).
