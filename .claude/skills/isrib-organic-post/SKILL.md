---
name: isrib-organic-post
description: Drafts isrib.shop organic posts for Reddit and X/Twitter in "The Synthesis Lab" pseudonymous-chemist voice, with a hard compliance gate and a human review step — never auto-posts. DRAFT mode turns a raw Reddit question, X reply target, or thread idea into an on-voice, rule-compliant draft plus a link decision and a human-gate checklist to edit and post by hand. REVIEW mode scores a draft you already wrote before you post it. Routes to a strict-scientific or personified voice. Use when someone says: draft a reddit reply, answer this nootropics or ISRIB question, write a post for r/ISRIB or r/Nootropics, turn this journal article into a twitter thread, write a thread about the ISR pathway, reply to this tweet, can I link the journal here, is this post compliant, or review my draft before I post — or is drafting anything for the isrib.shop organic-social channels. Defers copywriting technique to breakthrough-advertising, boron-letters, and dr-swipe-file. Use even when not named.
---

<!-- argument-hint: [reddit | twitter] [account: synthesis-lab | brother] + the question/opportunity/idea, or a draft to review -->
<!-- skill version: v4 — two-account voice model (strict-scientific + personified) -->

# ISRIB Organic Post

The working tool for the daily Engage habit in
`docs/wiki/marketing/organic-social-playbook.md`. It turns a raw opportunity into a
compliant, on-voice draft — and **stops at a human gate**. It never posts anything.

**This skill carries only the ISRIB-specific operational layer** — persona, channel
rules, the compliance gate, the belief/objection + voice material. For *how to persuade*
(headline logic, awareness/sophistication, plain-talk copy), it defers:

| Need | Defer to |
|---|---|
| Awareness level, mass desire, sophistication stage, mechanism-led angle | `breakthrough-advertising` |
| Plain, spoken, you-oriented sentence-level copy (esp. threads, long replies) | `boron-letters` |
| DR section structure, if drafting a landing-adjacent block | `dr-swipe-file` |
| Offer/guarantee framing (rarely needed organically — usually skip) | `100m-offers` |

Master source of truth is the wiki, not this skill — see [sources.md](sources.md).

## Workflow — two modes

Pick by whether a draft already exists.

### DRAFT — before posting (the default)

Inputs: (1) the raw material — a Reddit question/thread, an X reply target, or a thread
idea; (2) the **channel** (reddit | twitter); (3) the **account / voice** — `synthesis-lab`
→ strict-scientific, or `brother` → personified (**default: strict-scientific** if
unspecified); (4) optionally, the relevant journal article.

Steps — do in order, cite the chapter each rule comes from:

1. **Classify the opportunity** — Reddit answer / Reddit original post / X thread / X
   reply. (This sets structure + link posture.)
2. **Route the voice** — [chapters/voices.md](chapters/voices.md). Pick the profile from the
   `account` input (default **strict-scientific**). If **personified**, the hard no-claims
   rule is in force for the whole draft and the citation gate (step 7) is **N/A** — but a
   draft that *needs* a factual/mechanism point means it belongs on the chemist account, not
   laundered through this voice.
3. **Load the channel rules** — [chapters/reddit.md](chapters/reddit.md) or
   [chapters/twitter.md](chapters/twitter.md).
4. **Find the belief/objection this opens or answers** —
   [chapters/beliefs-and-objections.md](chapters/beliefs-and-objections.md). A good post
   moves exactly one belief or answers exactly one objection. (Personified: express it as
   lived experience — mirror the before/after *feeling*, never assert the mechanism behind it.)
5. **Draft in voice** — for **strict-scientific**, [chapters/voice-and-voc.md](chapters/voice-and-voc.md)
   (honest-skeptic; banned words hard-blocked); for **personified**,
   [chapters/voices.md](chapters/voices.md) (first-person n=1, warm, zero claims). For a
   persuasive thread or long post, pull the angle from `breakthrough-advertising` and the
   sentence craft from `boron-letters` first, then write.
6. **Make the link decision** — run the decision tree in
   [chapters/reddit.md](chapters/reddit.md) (Reddit default = **no link**; journal link =
   vendor-domain link) or [chapters/twitter.md](chapters/twitter.md) (link is fine).
7. **Verify every citation** — if the draft names any study/author/year/journal/result,
   confirm it against a real source (web/PubMed) and that it says what the draft claims.
   Never cite from memory. Unverified → tag **[VERIFY]** and don't call the draft post-ready.
   (compliance.md — this is the persona's one unrecoverable failure mode.) **N/A for the
   personified voice** — it makes no citation-bearing claims by rule; if it did, that content
   belongs on the chemist account.
8. **Run the compliance gate** — [chapters/compliance.md](chapters/compliance.md). Any
   hit = fix before output, or flag if unfixable.
9. **Output** exactly this shape:
   - **The draft** (ready to paste, in the persona's voice).
   - **Link decision** — link / no link, and why (which rule).
   - **Human-gate checklist** — the 6 boxes from [cheatsheet.md](cheatsheet.md), each
     ticked or flagged.
   - **One-line risk note** — "safe to post" or the specific risk to weigh.

**Never post. Never suggest posting for the user. Output the draft only.**

### REVIEW — Anton wrote it, grade before he posts

Input: Anton's own draft + the channel + the **account / voice** (`synthesis-lab` →
strict-scientific, or `brother` → personified; **default strict-scientific**). Score it —
do not silently rewrite. First route the voice ([chapters/voices.md](chapters/voices.md)),
then score against that profile:
- **Voice** — matches the routed profile? For **strict-scientific**: honest-skeptic, any
  banned word, any hype creep? (voice-and-voc.md) For **personified**: first-person n=1 and
  warm — **and does it stay off every factual/mechanism/citation claim?** Any expert-sounding
  assertion is a hard fail for this account. (voices.md)
- **Compliance** — medical/dementia/cancer/guarantee claim? research-use framing intact?
  identity protected? disclosure present where the sub needs it? (compliance.md)
- **Citations** — **strict-scientific:** every named study/author/year/result verified real +
  accurately attributed? Flag any unverified or conflated cite. **Personified:** N/A — but any
  cite that snuck in is itself the violation (this voice must carry none). (compliance.md)
- **Link** — is the link allowed *in this exact sub/thread*, and disclosed? (reddit.md)
- **No-sockpuppet** — if both accounts touch this thread, no fake-independent mutual
  endorsement / coordinated ring? (voices.md)
- **Value** — does it help a real person before it mentions anything of ours? (the 9:1 test)

Output: **PASS**, or a numbered fix list naming each problem + the chapter rule it breaks.
Only rewrite if Anton asks.

## Routing table

| Working on… | Open |
|---|---|
| A Reddit answer, original post, subreddit rules, or the link decision | [chapters/reddit.md](chapters/reddit.md) |
| An X thread, reply, persona, or the article→thread recipe | [chapters/twitter.md](chapters/twitter.md) |
| Which account / voice profile a draft routes to (two-account model) | [chapters/voices.md](chapters/voices.md) |
| Whether anything is safe to say (the hard gate) | [chapters/compliance.md](chapters/compliance.md) |
| Getting the strict-scientific voice right / pulling a VOC phrase | [chapters/voice-and-voc.md](chapters/voice-and-voc.md) |
| Which belief to move / which objection to answer | [chapters/beliefs-and-objections.md](chapters/beliefs-and-objections.md) |
| Fast decision rules + the human-gate checklist | [cheatsheet.md](cheatsheet.md) |

## The four rules that never bend

1. **Never reveal Anton's real identity.** The strict-scientific persona is a pseudonymous
   chemist. (compliance.md)
2. **Disclose vendor affiliation on Reddit** wherever a link or product mention appears —
   concealment is the actual violation and gets the account banned. (reddit.md)
3. **The personified voice makes ZERO factual / mechanism / citation claims.** Experiential
   n=1 only. A fake-expert take there fails instantly *and* drags the chemist account down —
   both point to the same products. No sockpuppet cross-promo between the two accounts.
   (voices.md)
4. **The skill never posts.** It drafts; the human gate decides. (Workflow)

## Supporting files
- [chapters/voices.md](chapters/voices.md) — the two voice profiles (strict-scientific + personified) and the account router
- [cheatsheet.md](cheatsheet.md) — decision trees, disclosure snippets, the gate checklist
- [sources.md](sources.md) — what this was built from; the wiki is the master
