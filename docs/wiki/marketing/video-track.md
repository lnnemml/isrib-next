# Marketing — Organic Video Track (YouTube long-form + Shorts / TikTok / Reels)

> **MOVED 2026-10-22 → `~/Documents/NeuroBench` (own project + wiki; see its ADR 0006).** This page is kept as history; the live version is split across NeuroBench `docs/wiki/strategy/`, `production/`, `brand/`. Channel name decided: **NeuroBench** (NeuroBench ADR 0005).


> **Status: ACTIVE** since 2026-10-21 per
> [ADR 0021](../decisions/0021-organic-video-track-and-email-funnel.md).
> **F1 resolved:** the hexagon icon only, no "ISRIB.shop" text on screen.
> **F2 resolved:** a neutral, Synthesis-Lab-branded domain. **F3 resolved:** one
> **shared nootropics channel for ISRIB + NORA** under The Synthesis Lab
> ([ADR 0022](../decisions/0022-shared-nootropics-video-channel.md), cross-project). §8 has
> the rules.
> This page is the operating doc; the ADR holds the decision and its reasons.

## 1. The shape

```
YouTube long-form (8–20 min, hub)
  ├─ cut-downs / spin-offs ─→ YouTube Shorts · TikTok · Instagram Reels
  └─ all surfaces: CTA = "get the <lead magnet> → email"   (no shop link)
        → opt-in page (F2) → welcome + nurture emails (Resend, ADR 0017)
              → soft CTA to isrib.shop  ← the ONLY place the shop is linked
```

- **Faceless.** TTS narration (Anton records neither voice nor face). The visuals are
  **mostly infographics, reviews, diagrams, paper/screen captures and editing**. Generated
  AI scenes are rare.
- **Identity:** the **@TheSynthesisLab** strict-scientific lane
  ([`organic-social-playbook.md`](./organic-social-playbook.md) §2A). The moat is first-hand
  synthesis expertise.
- **Job:** authority + recall + **list growth**. The list is the asset; sales happen in
  email.

## 2. Content scope

| Journal cluster | On video? | Why |
|---|---|---|
| `science/` (ISR / eIF2B mechanism) | **Yes, primary** | Educational/scientific context is the exception platforms carve out. It is also the E-E-A-T anchor. |
| compare (A15 vs Original, vs other categories) | **Yes, carefully** | Educational comparison per [`../journal/writing-rules.md`](../journal/writing-rules.md). Comparison compounds are named editorially only. |
| ISR/ISRIB story (Walter lab, Calico) | **Yes** | Narrative; strong hooks; good Shorts material. |
| `guide/` (how to use, dosing, protocol) | **No** | Dosing for an unapproved compound is the highest-risk content on every platform. Keep it on the journal and in email. |

**Never on any surface:** packshots of the product for sale, prices, discount codes,
"buy"/"order" language, or a shop URL (spoken, typed, or in the description, pinned
comment or bio).

Pilot candidates: **"What is the Integrated Stress Response?"**, or **"The ISRIB story"**.
Check claims against [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md);
make no dementia or human-efficacy claims.

## 3. Platform rules (researched 2026-10-21 — re-verify before each surface launches)

### 3.1 YouTube (long-form + Shorts)
- **Regulated goods:** YouTube forbids content that sells pharmaceuticals without a
  prescription, **and facilitating the sale "by posting links, email, phone number or other
  means to contact a provider."** Secondary summaries say this covers descriptions and
  comments. There is an exception for educational/scientific context. Precedent: nootropics
  channels were mass-removed in 2018, and some were restored later.
- **Monetisation:** the "inauthentic content" rule (YPP, since 2025-07-15) targets
  mass-produced, template-identical videos. An AI voice alone is fine. Vary formats and
  carry real substance.
- **Synthetic disclosure:** turn on the Studio toggle only for **realistic** generated
  scenes. Diagrams and animation are exempt. With a low-AI style this rarely applies.
  Never show a synthetic "scientist/doctor" giving advice.
- **Shorts:** description links are not clickable. The CTA is spoken or on-screen
  ("link on the channel") and points to the opt-in page, never the shop.

### 3.2 TikTok
- The strictest surface. TikTok describes **zero tolerance** for the sale, promotion and
  depiction of drugs. The conditional "regulated goods" route for business accounts almost
  certainly doesn't cover unapproved research compounds. Don't rely on it.
- Run it as a **creator (personal) account**, science-only. The bio link needs **1,000+
  followers** on personal accounts (per 2026 guides; verify). Until then the CTA is
  "subscribe on YouTube / search The Synthesis Lab".
- Label realistic AI content with TikTok's AI-generated label (rare for us).

### 3.3 Instagram (Reels)
- Meta bans buying, selling or trading **pharmaceutical and non-medical drugs**, organic
  posts included. Educational context is judged case by case, and enforcement is
  inconsistent.
- The bio link points to the opt-in page (F2), never the shop. Don't tag products, and use
  no shoppable features.
- Keep it **separate from the paid Meta ad account's risk**. If the organic IG profile is
  linked to the ad Page/Business, a strike can spill over. Decide account linkage before
  launch (technical, with Anton).

### 3.4 Music
Check that the AI-music licence (Flow Music / Lyria) is **Content ID**-clean before the
first upload. On TikTok/IG, trending platform audio is safer for short-form.

## 4. Brand mark in video (soft hook) — F1 resolved: hexagon only
The current logo is the wordmark **"ISRIB.shop"** (hexagon + domain text). Because it *is*
a domain, it sits close to YouTube's "other means to contact a provider" clause, and it is
riskier on TikTok/IG. **Decided (Anton, 2026-10-21): show the hexagon icon only, never the "ISRIB.shop"
text.** A domain isn't needed for the hook:
videos about ISRIB/A15 already drive *"ISRIB"* searches, and `isrib.shop` ranks for them.

## 5. Email funnel — neutral Synthesis Lab domain, one interest-tagged list (ADR 0022)
- **Lead magnet:** something a viewer of a science video actually wants. Examples: a
  one-page "ISR/eIF2B explained" visual guide, a curated paper reading list, or an "A15 vs
  Original research summary". It's content; draft via the copy skills and compliance-read
  it.
- **Opt-in page:** must not be on `isrib.shop` (vendor-domain link). Lean: a neutral domain
  we own, no shop links on the page, and a form writing into the existing marketing list
  with a new `source` value (ADR 0017 data model). Options are in ADR 0021 F2.
- **Sequence:** welcome (deliver the magnet) → 3–5 value emails → soft CTA to `isrib.shop`
  (A15 product page, crypto-10% framing). Follow the deliverability playbook: one idea per
  email, no click tracking, plain send, invite replies.
- **Measurement:** the opt-in is a tracked event via `trackEvent()` with per-surface
  source/UTM. Then video → subscriber → `order_submitted` attribution through the list.

## 6. Production pipeline (lives outside this repo)
Proven in `~/at-commerce` on 2026-10-21. Ad videos are 9:16, ~50 s, ~1 h per video. Built
from skill `.claude/skills/ad-video/` and kit `kits/ad-video/` (`compose.py`, `flat.py`,
`words.py`, `sfx.sh`, `mix_music.sh`) on HyperFrames + Parakeet. The **9:16 preset already
serves Shorts/TikTok/Reels.** What long-form still needs:

1. **TTS engine — DECIDED 2026-10-21 (Anton): Chatterbox, local** (Resemble AI, MIT
   licence, free, no account). Test results (60 s pilot-hook script, measured with
   Parakeet against the script):
   - **Chatterbox** has the best intelligibility: WER 0.6%, 5/5 hard terms (ISRIB, eIF2B,
     phosphorylated). It is also the most expressive by ear.
   - **But it speaks at 210–223 wpm raw**, so it needs slowing to about 160 wpm.
     **Never time-stretch** (atempo etc.): Anton heard a metallic artefact that ruins the
     voice. A lower `cfg_weight` alone barely helps (0.3 → 196 wpm).
   - **PRODUCTION DEFAULT (Anton, 2026-10-21):** the **standard Chatterbox voice**,
     **one `generate()` per sentence**, with **real silence inserted: 0.45 s between
     sentences and 0.8 s between paragraphs**. Settings: `cfg_weight 0.3`,
     `exaggeration 0.5`. Result: **167 wpm, 0% WER, 5/5 terms**, no artefacts. If the
     voice needs to come down to ~160 wpm, lengthen the pauses rather than stretching.
     Per-sentence generation also keeps long scripts stable. Script:
     `~/video-research/tts-test/cbx_gen3.py`.
   - **Alternative voice: "Michael"** = Chatterbox cloning a 15 s Kokoro `am_michael`
     reference. Anton rated it good, not best. At ref speed 0.85 plus the same pauses it
     ran too slow (131 wpm), so re-make the reference at speed 1.0 and shorten the pauses
     if it is ever used. The Fenrir reference was rejected.
   - **Runtime:** the 4 GB RTX 3050 runs out of memory, so it renders on **CPU at about
     3 min per 45 s** of audio (≈40 min for a 10-min video, run in the background).
     Generation is chunked at ≤35 words to avoid drift on long scripts.
   - **Every output carries an inaudible Perth watermark** (marks it as AI audio). That
     does not affect YouTube: a synthetic narrator voice needs no altered-content label.
   - **Runner-up:** Kokoro-82M (Apache-2.0). Anton liked `am_michael` and `am_fenrir`;
     ~96–98% intelligibility; fast on CPU.
   - **Cloud (ElevenLabs, Gemini) skipped:** they cost extra, and Anton's earlier
     ElevenLabs output sounded worse than both local engines.
   - Setup lives in `~/video-research/tts-test/` (`cbx-venv`, `cbx_gen.py`,
     `eval.py`). Chatterbox needs `setuptools<81` (Perth imports `pkg_resources`).
2. **16:9 preset** in `compose.py` (1920×1080, render at 4K): positions, type sizes, safe
   zones.
3. **Chapters:** one composition per chapter, segmented render, then concatenation.
4. **Diagram/infographic beats** are the main visual vocabulary (low-AI). Extend
   `compose.py` beat types for charts, pathway diagrams and paper call-outs.
5. **Retention:** a hook in ≤30 s with an open loop paid off later, chapters, a new visual
   every few seconds, a density check per 90 s.
6. **Thumbnails** as their own step.
7. **Cut-down step:** long-form chapters → 30–60 s vertical clips (re-framed, re-captioned,
   own hook).

The generalised kit lives in `at-commerce/kits/` or a shared `~/video-kits`. It does **not**
go in `isrib-next`. Scripts and storyboards may be kept here as content.

## 6A. Production pipeline v1: WeAreNoCode youtube-edit + our ad-video kit (fit-gap 2026-10-21)

**Decision (Anton):** build on the **WeAreNoCode `youtube-edit` skill** (16:9 composer,
checks, assembly) together with **our `ad-video` kit** (SFX, music mix, 9:16
composer). We do not write a new kit from scratch.

**Licence facts:**
- Only two cut-stage `.mjs` files are marked MIT (© Nate Herk starter kit).
- DM Sans is OFL.
- SKILL.md, compose.py and the rest state **no licence** ("the skill itself is free").

So: use it privately, keep it as an unmodified `vendor/` copy with our changes alongside,
and **never push it to a public repo**.

**Workspace:** `~/video-research/`, outside all repos. It holds:
- `vendor/wanc/` (untouched)
- `_fitgap/` (smoke test)
- `tts-test/`
- `teardown/`
- `tools/`

**Fit-gap results:**
- Kit 1 tests pass: 31/31.
- A 6 s faceless smoke render worked (1080p in 7 s, 4K + NVENC in 14 s).
- `beat-check` passed.
- `verify-render` passed, except bitrate, which is expected on still graphics.

**What we drop from Kit 1:**
- the whole talking-head cut stage: paper-cut, tighten, edge-audit, Tella and so on;
- Kit 2's `flat.py`.

| # | Step | Tool | Status |
|---|---|---|---|
| 1 | Script: chapters, loops (planted/payoff), CTA marker | `script.md` schema + checker (150–165 wpm, hook ≤ 30 s) | **NEW** |
| 2 | TTS | Chatterbox one sentence per call + pauses (§6.1) → `tts_chapter.py`: chapter WAV at −16 LUFS + exact `sentence-times.json` | **NEW** (wraps `cbx_gen3.py`) |
| 3 | Word timings | Parakeet → Kit 2 `words.py`; map the script's own spelling onto Parakeet timings (ISRIB/eIF2B) | **NEW** aligner |
| 4 | Base track | Brand-colour 1920×1080 video muxed with the TTS WAV. compose.py *always* expects an input video; this trick is proven | **NEW** 1-liner |
| 5 | Storyboard per chapter | Kit 1 `compose.py` (35 beat types; `doc` = paper card with verbatim highlights; `bars`/`growth`/`flow`/`pipeline`/`hub`/`world`) + `phrase-times.py` | **ADAPT**: add beats `kenburns` (pan/zoom rect + parallax, for flat-vector scenes; the biggest gap), axis/line chart (dose-response, time course), pathway diagram, opt-in CTA card. Swap house colours/font for our style guide; bundle GSAP locally |
| 6 | Pre-render gate | `hyperframes check`, `beat-check`, `gap-scan` (adapt: entrances/90 s ≥ 15, 15 s ceiling), `teardown --storyboard`, `snap-beats` (fix HF 0.8.184 snapshot path), hook-gate loops | ADAPT ×2 |
| 7 | Render per chapter, 4K | `hyperframes render --resolution 4k --gpu`; segmented capture for chapters > 5 min; `window-patch.py` for fixes | as-is |
| 8 | Assemble | `assemble.py` → master + `chapters.txt` | ADAPT: `--gpu` is Mac-only; switch to NVENC/CPU |
| 9 | Music + SFX | Kit 2 `sfx.sh` + `mix_music.sh` (duck under voice, −14 LUFS, BT.709) | as-is (long-form defaults) |
| 10 | Verify | `verify-render.py` + ebur128 | as-is |
| 11 | Self-measure | `teardown.py --video` vs the reference teardowns (§10) | as-is |
| 12 | 9:16 cut-downs | `cutdown.py`: sentence span → re-timed 1080×1920 spec → Kit 2 `compose.py` (word captions) + Kit 1 Shorts rules | **NEW** |

**Rules that carry over from Kit 1's SKILL.md:**
- **Hook gate:** meaningful first frame; works muted; first word untouched; loops with
  planted/payoff times; close the lesson before any CTA.
- **Long-form doctrine:** one persistent world; a chapter fixture at each boundary;
  ~20 on-screen words per section; compose per section. Kit 1's "40% full-frame" target
  becomes **100%** for us.
- **Format-choice rules.**
- **Sound, glass and traps:** a heavy-overlay budget of ~40 blur/clip elements, or the
  render produces black frames; segmented render with `--workers 1` on long renders.
- **Shorts:** a separate 1080×1920 composition, never a centre crop; 88–110 px type.

## 7. Sequence
1. ~~F3~~ decided: a shared channel ([ADR 0022](../decisions/0022-shared-nootropics-video-channel.md)).
   Next comes setup with Anton: check handle availability on all four surfaces, pick and
   register the neutral domain, set the bromantane routing rule (both shops sell it), and
   decide the interest tags and lead magnets.
2. Niche teardown: 2–3 winning science-explainer / neuro / longevity channels, long and
   short. Measure cut frequency, graphics density, words per minute and structure.
3. TTS blind test (60 s).
4. Lead magnet + opt-in page + welcome sequence (build delegated per ADR 0006). They must
   be live before the first video ships, or the funnel leaks.
5. Pilot long-form (8–10 min): script → compliance read → assets → voice → flat edit →
   per-chapter storyboard → frame sheet → render → review. Then 3–5 cut-downs.
6. Generalise the kit (9:16 / 16:9 presets + chapters, plus a `yt-video` skill).

## 8. F3 — shared nootropics channel (ISRIB + NORA) — DECIDED: option (b), [ADR 0022](../decisions/0022-shared-nootropics-video-channel.md)

**The idea (Anton):** one channel about nootropics broadly. It would always have topics,
it would serve both projects, and leads would route to `isrib.shop` *and* NORA (sublingual
bromantane / NeuroDrive).

| | (a) Two channels | (b) **Shared, The Synthesis Lab** ← lean | (c) Shared, new neutral brand |
|---|---|---|---|
| Topic breadth | Narrow ×2 | Broad | Broad |
| Production load | ×2 | ×1 | ×1 |
| Persona | Two to build | **One persona across X / Reddit / YT / email**; the chemist proof-of-work covers both compounds (bromantane NMR already exists) | Starts from zero; splits from the X/Reddit persona |
| Tie to a shop | Each channel = one shop | Synthesis Lab is already the public isrib.shop journal byline, so the NORA tie must be disclosed | Cleanest separation |

**Why (b):** a single-compound channel runs out of topics, and it reads as an ad.
A broad channel can also cover compounds **neither shop sells**, which is what makes it
credible. That also protects against YouTube's "inauthentic/mass-produced" rule.
Reusing The Synthesis Lab means one audience compounds across every surface instead of
two half-audiences.

**Non-negotiables if shared (any of b/c):**
1. **Disclose the connection.** State the affiliation with both shops in the channel About
   and in every email that carries a CTA. A "neutral" review channel that quietly sells
   its owner's products is deceptive (endorsement-disclosure rules). This audience also
   finds out, and once they do, the moat is gone.
2. **Not every video sells.** Mix in compounds and topics neither shop carries.
3. **One list, owned by the funnel**, not inside either shop's DB. Tag each subscriber by
   interest (ISR/cognition ↔ dopamine/drive) from the lead magnet and video source. Route
   soft CTAs by tag, with an occasional cross-sell. The consent text at signup names both
   shops as partners. The sending domain is the neutral domain, so it needs warm-up (see
   the deliverability playbook).
4. **Per-compound guardrails stack.** ISRIB follows its writing-rules (no dementia /
   cancer claims). Bromantane follows NORA's rules: no Soviet origin as the *primary*
   hook (NORA ADR 0003), and **no sports-performance angle** because it is banned in
   competitive sports.
5. **On-screen marks.** The channel needs its own watermark. A product mark (ISRIB
   hexagon / NORA "N") appears only inside the segment about that compound, if at all.

**Recorded:** ADR 0022 here (canonical), mirrored as NORA ADR 0021.

## 8A. Channel name — candidates (2026-10-22, decision pending, Anton)

**Criteria:**
- covers nootropics broadly;
- carries the chemist persona;
- is **not a shop name**;
- has no claim/drug words ("limitless", "smart drugs", "hack", "dose");
- doesn't collide with existing brands (e.g. *Mind Lab Pro*, *Compound Interest* =
  compoundchem.com, *Ligand*).

Availability was checked 2026-10-22: `.com` via Verisign RDAP, and the YouTube handle via
`youtube.com/@handle` (404 = free). TikTok and IG can't be checked without logging in.

| Name | .com | YT handle | Note |
|---|---|---|---|
| **The Nootropic Chemist** | free | `@thenootropicchemist` and `@nootropicchemist` both free | Searchable niche word plus the persona in the name; promise is clear. Would narrow a later move into longevity |
| **Chemist of the Mind** | free | free | Brandable and broad (brain chemistry); slightly long |
| **Compound & Cortex** | free (`compoundandcortex`) | free | Compounds + brain; distinctive; "&" makes handles longer |
| **The Synthesis Lab** (working name) | `thesynthesislab.com` free | `@thesynthesislab` **taken** (a 5-sub "Synthesis Lab"; check whether it is Anton's); `@synthesislabs` free | Continuity with X/journal; a bit generic |
| Mechanism Over Hype | free | free | Strong positioning, but reads as a slogan, so better as the **tagline** |
| Nootropics Decoded / Unpacked | free | free | SEO-descriptive, but generic |
| NeuroCompound | free | free | Short, a bit corporate |

Taken or rejected: Mode of Action (.com), Small Molecule(s), Bench to Brain (YT), Molecular
Mind, Mind Chemist, Cognitive Chemistry (YT), Isomer (.com), Lab Notebook, Evidence Over
Hype.

**Round 2 (2026-10-22).** Anton: no names starting with "The". He liked *Compound & Cortex*.
Brainstormed 45 more and kept those with **both .com and the YT handle free** (`&` written
as `and`):

| Style | Candidates |
|---|---|
| X & Y pairs | **Compound & Cortex**, **Molecules & Minds**, **Atom & Axon**, **Carbon & Cortex**, **Bond & Brain**, Bench & Brain, Catalyst & Cortex, Lab & Lobe |
| Two-word | **Receptor Theory**, Synapse Chemistry, Cortex Chemistry, Axon Chemistry |
| Concept | Crossing the Barrier (the blood-brain barrier as metaphor) |

Avoided:
- claim-implying words: *Flask & Focus* implies a benefit;
- research-chem connotations: *Reagent & Reason*;
- names with only one of the two free: Molecule & Mind, NeuroBench, Binding Affinity,
  Across the Barrier.

**Front-runner (Anton, 2026-10-22): NeuroBench.** "Neuro" plus the lab bench, which fits the
chemist persona; no "The"; short.

**Availability:**
- YouTube: `@neurobench`, `@neurobenchlab` and `@neurobenchhq` are all free.
- `neurobench.com`: **taken**.
- Free `.com` alternatives (Verisign check): `neurobenchlab.com`, `neurobenchhq.com`,
  `neurobenchtv.com`.
- `.co`, `.io`, `.tv`, `.net`, `.org`, `.science`: no RDAP record via rdap.org. That
  probably means free, but confirm at the registrar.

**Collision:** *NeuroBench* is also an academic **neuromorphic-computing benchmark
framework** (`neurobench.ai`, "Collaborative Benchmarking for Neuromorphic Computing").
- Different field, no YouTube channel, low trademark risk.
- But Google results for the bare name will be theirs at first.

Decision pending Anton's confirmation.

## 9. Niche scan (2026-10-21) — input to the teardown

These are recent-upload medians (last ~10 uploads, read from the channel /videos pages
on 2026-10-21). Subscriber counts are as displayed.

| Channel | Format | Subs | Median views | Typical length | Take |
|---|---|---|---|---|---|
| **What I've Learned** | Health-science investigations. **Host on camera** (corrected after teardown) between dense B-roll: news clips, headlines, custom diagrams | 2.37M | **~758K** | 15–45 min | **Long-form reference**: the retention/structure model |
| **Physionic** | Multi-study analysis. **Talking head most of the time** (corrected after teardown), with paper cards + animated graph reveals | 411K | **~119K** | 7–17 min | **Closest to our content**: study → mechanism → takeaway |
| **iluli by Mike Lamb** | Animated explainers, very consistent | 737K | **~191K** | ~5.5 min | **Visual-style reference** (dopamine video ~1.2M) |
| After Skool | Whiteboard animation over narration | 3.79M | ~345K | 8–20 min | Animation density; much of the audio is reused from other speakers, so it is less relevant |
| The Bioneer | Face on camera, fitness/cognition | 960K | ~112K | 5–20 min | Not faceless; skip |
| Neuroscientifically Challenged | 2-/10-min neuroscience explainers | 715K | ~9.5K | 2 / 12 min | Declining; format idea only |
| TheNootropicReviewer | Face on camera, nootropic reviews | 88.5K | ~3K | 5–12 min | The **nootropics-specific** niche |
| Your Inception / Cortex Labs / Holistic Nootropics | Nootropic/biohacking reviews | 4–47K | 1–3K | — | Same |

**Teardown correction (2026-10-21):** only **iluli** is truly faceless. WIL and Physionic
keep a host on screen, so we borrow their *evidence grammar*, not their structure. See §10.

**The read:** channels about specific nootropics are **small and low-production**
(median views in the low thousands, mostly a face on camera). Nobody runs a high-production
faceless nootropics channel. The demand proof lives in adjacent **health-science /
neuroscience explainer** formats with 100K–750K medians. The strategy follows from that:
take the production grammar from WIL / Physionic / iluli, and the topic edge from the
compounds nobody explains well (ISR, bromantane, etc.). On search, the existing
bromantane videos (5–40K views each) and ISRIB videos (2–16K) are almost all face-on
reviews or low-budget, so the topic is open.

## 10. Teardown results → our editing grammar (2026-10-21)

The tool is `~/video-research/tools/teardown.py` (our own code; calibrated by eye on frame
pairs). Reports are in `~/video-research/teardown/<name>/` plus `COMPARE.md`. The 6 videos
were deleted after analysis; reports, sheets and transcripts are kept.

| | iluli ×2 (faceless, animated) | Physionic ×2 (face + graphs) | WIL ×2 (face + heavy B-roll) |
|---|---|---|---|
| Length | 5.5 min | 7–10 min | 16–34 min |
| Hard cuts / min | **9.5–9.7** | 0.6–1.6 (one take, slow zoom) | **14–21** |
| Median shot | **4.4–4.6 s** | 22–108 s | **2.0–2.4 s** |
| Animated entrances / 90 s | 15–16 | 7–14 | 18–24 |
| Words / min | 148–156 | 158–167 | 180–203 |
| Loudness | −15.4 to −15.8 LUFS | −16.4 to −16.7 | −13.4 to −14.1 |

**What each one teaches us:**
- **iluli → the base layer (fully faceless).** Flat-vector illustration, one bold colour
  field per scene (pink / yellow / cyan / black), kinetic type for key terms ("FAIR
  ENOUGH", "NEUROSTIMULATION"), and a visual metaphor for every sentence. There is no
  static stretch anywhere: even the quietest window moves at ~1× its own median. **Without a
  face, 100% of screen time must be designed visuals.** This is the bar.
- **Physionic → the evidence beat.** Paper title card (journal + title) → **an animated
  graph built step by step** (axes → curve → confidence band → highlighted region).
  Physionic also runs a **mid-roll membership plug at ~4:00** ("Physionic Insiders — link
  in the description"). That is the exact precedent for our **opt-in CTA card**: after the
  first payoff, never before it.
- **WIL → density and the contrarian frame.** Headline screenshots with highlighted
  phrases, big-number callouts ("25 MILLION", "$150,000,000"), custom molecule/organ
  animations (Na⁺ → blood bag), and paper excerpts with the key phrase marked in yellow.
  His news-clip montages are **someone else's footage**, which we skip (copyright).
  Headlines/papers get **redrawn or quoted in our own type**, never screenshotted
  wholesale.

**Hook patterns seen (first 30 s):**
1. *Question to the viewer → relatable framing → twist + promise* (iluli: "How would you
   like an electric shock? … what if … it might even make you smarter").
2. *Two-sided conflict → "only the data matters" → promise of multiple studies*
   (Physionic oats).
3. *Stunt/claim + "the official story" montage → "we didn't get the full story"*
   (WIL salt).

All three state the promise inside 30 s, with ~80–100 words in the first 30 s.

**Our grammar (targets for the pilot; re-measure our own render with the same tool):**
- **Pace:** median shot **3–5 s** (≈ 10–14 cuts/min) and **≥ 15 animated entrances per
  90 s**. No 15 s window may sit below ~0.5× the video's median change. Motion *inside* a
  card (graph build, highlight sweep) counts as change.
- **Voice:** TTS at **150–165 wpm**, which is the faceless/explainer band. Don't copy WIL's
  200 wpm without a face to carry it. Write **80–100 words for the first 30 s**.
- **Hook:** pattern 1 or 2 (pattern 3 leans on footage we can't use). Example: *"In 2013 a
  molecule restored memory in old mice within days. So why can't you buy it at a
  pharmacy?"* The promise is made in ≤ 30 s, and its payoff timestamp is planned in the
  storyboard.
- **Visual vocabulary, in order of use:** (1) our own diagrams/graph builds (compose.py
  beats); (2) flat-vector illustration in one fixed channel style. These are
  image-generated but clearly unrealistic, so **no synthetic disclosure is needed**;
  (3) kinetic type for key terms and numbers; (4) paper title cards with highlighted
  phrases, redrawn; (5) stock sparingly.
- **CTA:** one opt-in card after the first payoff (~3–5 min in a 10 min video), plus one at
  the end. Never in the hook.
- **Loudness:** master at −14 LUFS (YouTube's reference; the refs sit at −13.4 to −16.7).

## Sources
- [YouTube — Illegal or regulated goods or services policies](https://support.google.com/youtube/answer/9229611)
- [Monolith Law — YouTube guidelines scope (descriptions/comments)](https://monolith.law/en/internet/youtube-community-guidelines-prohibitions)
- [Vice — YouTube removing nootropics channels (2018)](https://www.vice.com/en/article/youtube-is-removing-nootropics-channels)
- [Quartz — YouTube takes aim at mass-produced AI videos](https://qz.com/youtube-takes-aim-at-mass-produced-ai-videos)
- [YouTube — Disclosing altered or synthetic content](https://support.google.com/youtube/answer/14328491)
- [Meta — Restricted goods and services enforcement report](https://transparency.meta.com/reports/community-standards-enforcement/regulated-goods/)
- [TikTok letter to WV AG (zero-tolerance drug policy, 2022)](https://ago.wv.gov/Documents/2022.12.05%20Letter%20from%20TikTok.pdf)
- [ConductAtlas — TikTok regulated goods, business-account conditional permission](https://conductatlas.com/platform/tiktok/tiktok-community-guidelines/regulated-goods-conditional-permission-for-business-accounts/)
- [Unilink — TikTok link-in-bio rules (2026)](https://www.unilink.us/blog/tiktok-link-in-bio-rules)

## Related
[ADR 0021](../decisions/0021-organic-video-track-and-email-funnel.md) ·
[`organic-content-strategy.md`](./organic-content-strategy.md) ·
[`organic-social-playbook.md`](./organic-social-playbook.md) ·
[`../journal/writing-rules.md`](../journal/writing-rules.md) ·
[`../decisions/0017-email-campaign-broadcasts-and-marketing-list.md`](../decisions/0017-email-campaign-broadcasts-and-marketing-list.md)
