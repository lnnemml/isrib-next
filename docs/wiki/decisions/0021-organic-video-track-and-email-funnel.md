# ADR 0021 — Organic video track (long-form + short-form) via an email funnel

**Status:** accepted (Anton, in-session) · 2026-10-21 · resolves the
[2026-10-21 escalate](../log.md) · supersedes the YouTube deferral in
[`organic-content-strategy.md`](../marketing/organic-content-strategy.md) §6 · two
sub-forks still **open** (§Open, below)

## Decision

1. **Active now.** Faceless organic video is on the current agenda. It is no longer
   deferred to Phase 4+.
2. **Four surfaces in parallel.** The hub is **YouTube long-form** (8–20 min). **YouTube
   Shorts, TikTok and Instagram Reels** run alongside it, mostly as cut-downs and spin-offs
   of the long-form material.
3. **Funnel = video → email opt-in → nurture → soft CTA.** Platforms carry **no shop links**.
   Viewers are invited to subscribe to an email list (lead magnet). The soft CTA to
   `isrib.shop` lives **only inside the emails**.
4. **Brand mark in video as a soft hook.** A logo/brand mark appears in the videos for
   recall. *Which* mark is open fork F1.
5. **Low-AI production.** Visuals are mostly infographics, reviews, diagrams, paper/screen
   captures and editing. Generated AI scenes are the exception. Narration is TTS (Anton
   records neither voice nor face).
6. **Content scope = science / compare / story.** The dosing/protocol (`guide/`) cluster
   stays on the journal. Show no packshots, prices or "buy" language on any platform.

## Context

- The production pipeline already exists in `~/at-commerce` (ad-video kit, proven
  2026-10-21). See [`marketing/video-track.md`](../marketing/video-track.md) §5.
- All three platform owners restrict selling or facilitating the sale of unapproved
  pharmaceuticals. YouTube explicitly names **links and "other means to contact a
  provider"**. Meta bans buying/selling pharmaceutical and non-medical drugs in organic
  posts too. TikTok describes a near-zero-tolerance stance on drug promotion. The email
  hop puts the sales moment on our own channel (Resend list, ADR 0017). That channel
  already runs soft CTAs well (see the email-deliverability playbook memory).
- With low AI usage, YouTube's synthetic-content disclosure rarely triggers. It also
  lowers the YPP "inauthentic (mass-produced) content" risk.

## Open (Anton to decide; not blocking the pilot script)

- **F1 — which mark goes on screen.** The current logo is the wordmark **"ISRIB.shop"**,
  which is a domain name a viewer can type in. That makes it close to the "other means to
  contact a provider" clause. Options:
  (a) full ISRIB.shop wordmark on every surface;
  (b) **hexagon icon only + "The Synthesis Lab" wordmark, no domain on screen** ← lean;
  (c) wordmark on YouTube long-form only, icon-only on Shorts/TikTok/Reels (where moderation
  is stricter).
  Note that a strong soft hook exists without the domain. Every video about ISRIB/A15
  drives *"ISRIB"* searches, and `isrib.shop` ranks for those.
- **F2 — where the opt-in page lives.** A link to `isrib.shop/<anything>` is a vendor-domain
  link, the same trap as the journal. Options:
  (a) `isrib.shop/subscribe`: **not viable** on these platforms;
  (b) **a neutral domain we own** (Synthesis-Lab-branded) with the lead magnet and a signup
  form that writes into the existing marketing list with a new `source` value ← lean. This
  is the "separate funnel needs its own domain" revisit condition of
  [ADR 0002](./0002-domain-collapse.md). The page itself carries no shop links and is not a
  redirect to the shop;
  (c) a third-party hosted form (beehiiv/Kit) synced to Resend. It is fast, but it makes a
  second list to keep in sync, and our Resend sync is one-directional.

## Consequences

- New work items: lead magnet (content) + opt-in page + welcome/nurture sequence with soft
  CTA (build, delegated per ADR 0006) + 16:9/9:16 video kit generalisation (outside this
  repo).
- Analytics: the opt-in becomes a tracked event via `trackEvent()` (ADR 0005), with
  per-platform `source`/UTM, so video → subscriber → order is measurable.
  `order_submitted` stays the primary Meta conversion.
- Each platform account follows the persona rules in
  [`organic-social-playbook.md`](../marketing/organic-social-playbook.md) §2/§2A. There are
  no sockpuppets, and the channels do not stage cross-promotion with each other.

## Amendment — 2026-10-21 (same day, Anton)

- **F1 → resolved: option (b) minus the wordmark.** Videos show **only the hexagon icon**
  from the logo. The "ISRIB.shop" text never appears on screen.
- **F2 → resolved in principle: a neutral domain** for the opt-in page (≈1 h build). The
  **name is on hold** until F3 is settled, because the domain is the channel's home.
- **F3 → resolved 2026-10-21: (b) shared channel under The Synthesis Lab — see [ADR 0022](./0022-shared-nootropics-video-channel.md).** Original fork as framed: Anton is considering
  one channel covering nootropics broadly. It would feed leads to both `isrib.shop` and
  NORA (Nootropics Research Alliance, sublingual bromantane / NeuroDrive,
  `~/Documents/NORA`). Options:
  (a) two separate channels (one per project);
  (b) **one shared channel under The Synthesis Lab persona** ("nootropics through a
  chemist's eyes"), with one list tagged by interest and soft CTAs routed to the matching
  shop ← lean;
  (c) one shared channel under a brand-new neutral media name.
  Analysis: [`video-track.md`](../marketing/video-track.md) §8. This is a cross-project
  decision. When it lands, it must be mirrored into NORA's wiki (`docs/wiki/decisions/`).

## Revisit if

- Any surface issues a strike/removal over the mark or the opt-in link. Then drop to the
  next-safer F1/F2 option on that surface.
- After ~90 days the email funnel converts below the direct-link baseline seen on X. Then
  reconsider the link policy per surface.

## Moved — 2026-10-22

The channel now lives in its own project, `~/Documents/NeuroBench` (its ADR 0006); this ADR is mirrored there as NeuroBench ADR 0001. **Channel name: NeuroBench** (NeuroBench ADR 0005), replacing the working name "The Synthesis Lab".
