# ADR 0022 — One shared nootropics video channel (The Synthesis Lab) for ISRIB + NORA

**Status:** accepted (Anton) · 2026-10-21 · **cross-project**. This ADR is the canonical
record, mirrored as NORA ADR 0021 (`~/Documents/NORA/docs/wiki/decisions/0021-shared-nootropics-video-channel.md`).
It resolves fork F3 of [ADR 0021](./0021-organic-video-track-and-email-funnel.md).

## Decision

1. **There is one channel, not one per shop.** The organic video track (YouTube long-form
   plus Shorts / TikTok / Reels, per ADR 0021) runs as a single channel about **nootropics
   broadly**. It feeds leads to both **isrib.shop** (ISRIB A15 / Original, ZZL-7, MPEP,
   bromantane) and **NORA** (NeuroDrive, sublingual bromantane).
2. **The identity is The Synthesis Lab** *(working name. Anton, later the same day: the final channel name is **open**; something better may be chosen. The persona, voice and rules below hold whatever the name)*: "nootropics through a chemist's eyes", the same
   persona as @TheSynthesisLab on X/Reddit. One audience compounds across every surface.
3. **One email list, owned by the funnel.** The opt-in lives on the **neutral domain**
   (ADR 0021 F2); its name is now unblocked and should be Synthesis-Lab-branded. The list
   sits outside both shops' databases. Every subscriber is **tagged by interest** (e.g.
   `isr-cognition` and `dopamine-drive`), taken from the lead magnet and the video/surface
   source. Soft CTAs route by tag to the matching shop, with an occasional cross-sell.
   Neither shop's link appears on any video platform.

## Non-negotiables

1. **Disclose the connection.** The channel About and every email carrying a shop CTA
   state that The Synthesis Lab is affiliated with both shops. A neutral-looking review
   channel that quietly sells its owner's products is deceptive under endorsement-
   disclosure rules. With this audience it would also destroy the trust moat once found.
2. **Not every video sells.** The mix includes compounds and topics neither shop carries.
   Comparisons are honest, including where a competitor compound or "neither" wins.
3. **Per-compound guardrails stack.** For ISRIB, apply isrib-next `journal/writing-rules.md`
   and CLAUDE.md (no dementia claims, never assert cancer risk). For bromantane, apply NORA
   rules: no Soviet/Russian origin as the *primary* hook (NORA ADR 0003), **no
   sports-performance angle** (it is banned in competitive sports), and "restore, don't
   stimulate" positioning. Across all compounds: no medical claims, no dosing protocols on
   platforms, no money-back language.
4. **Marks.** The channel has its own watermark (Synthesis Lab mark). A product mark (the
   ISRIB hexagon per ADR 0021 F1, or NORA's "N") appears, if at all, only inside the
   segment about that compound. A shop domain is never shown.
5. **Consent names both shops.** The signup consent/privacy text says subscribers receive
   research content plus recommendations from isrib.shop and NORA. This is an AI-drafted
   template; legal review is required before launch.

## Context

- A single-compound channel runs out of topics and reads as an ad. A broad channel stays
  credible and is less exposed to YouTube's "inauthentic/mass-produced" monetisation rule.
- The chemist proof-of-work spans both catalogues (bromantane NMR spectra already exist in
  the NORA project). NORA's journal persona ("epistemic authority, peer-to-peer, specific")
  is compatible with the channel voice. The channel adds first-hand synthesis on top. NORA's
  own site and journal voice are **unchanged**.
- Platform rules from ADR 0021 apply unchanged: no shop links or shop domains on any
  surface, and synthetic-content disclosure only for realistic AI scenes.

## Consequences

- **Open technical items (with Anton, in-session):**
  - channel name/handles availability on all four surfaces;
  - choice and registration of the neutral domain;
  - where the opt-in site lives: a small separate repo/deploy, **not** inside isrib-next
    or NORA;
  - list infra: a Resend audience on the neutral sending domain, which needs warm-up per
    the deliverability playbook;
  - one lead magnet per interest tag;
  - UTM/`source` convention so each shop's `trackEvent()` stack attributes orders to
    video → list.
- **Catalogue overlap: bromantane is sold by both shops.** isrib.shop sells Bromantane and
  N-Acetyl-Bromantane; NORA sells the sublingual NeuroDrive drops. The `dopamine-drive`
  segment needs an explicit routing rule (product decision, Anton). An obvious split:
  consumer-format seekers → NORA; research-grade powder buyers → isrib.shop.
- Each shop only receives tagged, UTM'd traffic from the emails. No new shop-side feature
  is required, so NORA ADR 0004 (platform scope discipline) is not touched.
- The emails' soft CTAs follow each shop's own copy rules and payment-flow constraints.

## Revisit if

- A platform strike is tied to the cross-promotion.
- One shop's segment cannibalises the other's.
- The disclosure measurably hurts trust/CTR, in which case reconsider the channel
  structure, never the disclosure itself.

## Moved — 2026-10-22

The channel now lives in its own project, `~/Documents/NeuroBench` (its ADR 0006); this ADR is mirrored there as NeuroBench ADR 0002. **Channel name: NeuroBench** (NeuroBench ADR 0005), replacing the working name "The Synthesis Lab".
