# Reddit — rules, subreddit map, link decision, answer patterns

Condensed from `docs/wiki/marketing/organic-social-playbook.md` §1–3. The wiki is the
master; if they disagree, the wiki wins and this file should be re-synced.

## The governing rules (never bend)

- **9:1 value ratio.** ≥90% of the account's activity is pure help, no product mention.
- **Disclose affiliation the first time, every time** a product/journal/shop appears.
  Format: *"Full disclosure: I synthesise and sell A15 — so weigh that."* Concealment (a
  "neutral happy customer") is the violation that gets accounts called out and banned.
- **Per-sub rules always win.** Verify the target sub's *current* rules every time. A sub
  can ban promo entirely, confine it to a weekly thread, or allow it. A perfect ratio does
  not save a link in the wrong thread.
- **No blasts.** Never the same content across multiple subs in a day — the anti-spam ML
  flags it in minutes → shadowban.
- **Fresh accounts don't link.** New persona = 4–6 weeks comments-only before any link.

## The migration consequence (the rule people forget)

The journal lives on `isrib.shop/journal`. **A journal link is a vendor-domain link.** So
on Reddit the default is: **answer with the substance in the comment, no link.** Only link
where the sub's rules clearly allow it, it directly answers the question, and it's disclosed.

## Subreddit matrix

| Sub | Posture | What's allowed | Default move |
|---|---|---|---|
| **r/ISRIB** | Most open (niche, small) | Expertise, original posts, careful disclosed links | Be the de-facto expert; answer everything |
| **r/Nootropics** (~2M) | Strict; vendor rules; approval often required | Expertise in comments; **no shop links** | Substance only; apply via any vendor process before linking |
| **r/StackAdvice** | Personal-stack Q&A | Answers where ISR/A15 genuinely fits | Answer, don't pitch |
| **r/DrugNerds** | High bar, no promo | Mechanism/paper discussion only | Pure science; never link the shop |
| **r/Biohackers, r/longevity** | Varies | Value-first; reversible-brake/aged-mice angle | Educate; link only if rules allow + disclosed |
| **r/afinil & afinil-adjacent** | Varies | Only where modafinil-alternative is on-topic | Answer the specific question |

Rule of thumb: **most direct in r/ISRIB, most disciplined in r/Nootropics.**

## Link decision tree (run every time before including any URL)

1. Does a link *directly answer* the stated question? No → **no link**, answer in-comment.
2. Do *this sub's current rules* allow a link *in this thread* (not just a weekly thread)?
   No → **no link**.
3. Is the account past its 4–6 week ramp with a healthy 9:1 ratio? No → **no link**.
4. Will the comment disclose affiliation right where the link sits? No → **add disclosure**.
5. All yes → link **one** journal article (never the shop checkout, never multiple), tagged
   `utm_source=reddit&utm_medium=post`.

Default output of this tree is **no link.** That is correct and expected.

## Answer patterns

- **Standard answer:** lead with the direct, useful answer to their question (mechanism,
  chemistry, honest "here's what the data does/doesn't show"). Add nuance a chemist would
  know. Stop. No CTA. This is 80% of Reddit output.
- **Answer where A15 is genuinely relevant:** answer fully first; *then* one disclosed
  sentence that A15 exists and why it fits — only if it truly answers them. Usually still
  no link (see tree).
- **Original "chemist's take" post** (occasional, r/ISRIB or where allowed): education-led,
  disclosed, opens one belief. Pull the angle from `breakthrough-advertising` and the plain
  voice from `boron-letters`. Never reads as an ad.
- **AMA** (later, once credible): disclosed, mod-coordinated.

## Ban-avoidance checklist (mirror of the gate)

- Helping a real person with a real question? (no → don't post)
- 9:1 ratio still healthy this week?
- Link (if any): directly answers + sub allows in this thread + disclosed?
- Same content posted elsewhere today? (yes → don't)
