# Influencer outreach — affiliate partnership + free samples

> Drafted 2026-10-28 with Anton. A cold-outreach template for nootropic creators
> (YouTube, X, Reddit, Instagram, newsletters). The offer is a partnership on affiliate
> terms, with free samples sent first and no obligation to post. Facts are taken from
> [`product/overview.md`](../product/overview.md). Compliance rules are in
> [`messaging-angles.md`](./messaging-angles.md) and CLAUDE.md hard constraints.

## Status

Template only, and nothing has been sent yet. **Commission terms are decided in
[ADR 0025](../decisions/0025-affiliate-program.md):** 35% commission, 15% buyer discount that does
not stack with the 10% crypto discount, manual crypto payouts twice a month. Item 1 under "Open
decisions" below is kept for history; items 2 and 3 are still open.

## Why it is written this way

- **English.** The nootropics creator audience is mostly English-speaking.
- **Plain prose, no bullet lists.** A bulleted pitch reads like a mass mailing. See the
  "no bullets in public copy" rule in memory and [`organic-social-playbook.md`](./organic-social-playbook.md).
- **Samples first, ask second.** The creator gets the product and the batch NMR before anyone
  talks money. This is the cheapest way to prove the quality claim
  (in-house synthesis, 98%+, NMR per batch).
- **Open on format.** We name a commission link and an audience discount code as options,
  but leave the format open. That way we don't commit to a rate we haven't set.
- **Personal first line is mandatory.** Name a specific post or video. Without it the reply
  rate collapses.

## Version 1 — Email

**Subject:** Samples for you + a partnership idea (isrib.shop)

Hi [Name],

I've been following your content on [specific video/post/topic], and I liked how you
[specific detail: e.g. break down mechanisms instead of just hyping compounds]. That's why
I'm writing to you specifically.

I'm Anton from isrib.shop. We've been running since 2020, and over that time more than 500
researchers have ordered from us. Our flagship is ISRIB A15, a more potent analog of the
original ISRIB molecule from UCSF. We also carry ISRIB Original, ZZL-7, MPEP Oxalate,
Bromantane and N-Acetyl-Bromantane. Everything is synthesized in-house by a pharmaceutical
chemist, tested to 98%+ purity, and comes with NMR data for each batch, so you can check
what you're getting.

We'd like to work with people in the space who actually know the subject, and your channel
is a good fit. We're open on format. It could be a personal link that pays you a commission
on every sale, a discount code for your audience, or whatever works best for how you create
content. We're happy to talk it through.

Before any of that, I'd like to send you free samples so you can look at the product and the
documentation first. There are no strings attached and no obligation to post anything. If you
like it, we'll talk. If not, no hard feelings.

If you're interested, just reply with which compounds you'd like to try and where to ship them.

Best,
Anton
isrib.shop

## Version 2 — Short DM (X / Instagram / Reddit)

Hey [Name], I really liked your [post/video on X]. I run isrib.shop. We've been around since
2020, with 500+ buyers, and we make ISRIB A15, ISRIB Original, ZZL-7, MPEP, Bromantane and
NA-Bromantane in-house, at 98%+ purity with NMR for each batch. We're looking for creators to
partner with: commission link, audience discount code, or whatever suits you. Happy to send
you free samples first, no obligation to post. Interested?

## Open decisions (Anton)

1. **Commission rate and payout.** Right now the only referral mechanism is the customer referral
   ([ADR 0014](../decisions/0014-referral-discount.md)). It gives the buyer 10% off and the
   referrer a 10% credit on their next order. It does **not** stack with the crypto discount,
   so on crypto orders the buyer gets no extra discount from it. That is not a creator affiliate
   program. We still need:
   - a % per sale (the niche norm is roughly 10–20%),
   - tracking (a `?ref=` link vs. a promo code),
   - a payout method and cadence.
   If this becomes a real program (creator accounts, payouts, a new discount type), it is a
   WHAT-level decision. It needs an `escalate` entry and then an ADR.
2. **Sample budget.** Which compounds and sizes go out by default, and how many creators per
   month we sample.
3. **Shipping the samples.** Ship by hand through the normal fulfilment flow. Do not create a
   fake paid order in Neon, because it would inflate the admin revenue figures.

## Compliance

There are no medical or outcome claims, no prescription drug names, no dementia or cancer
claims, and no money-back language. Creators should be told the same rules apply to their content
about us. If they post a sponsored review, they should disclose it as sponsored, and our own
voice must never pose as a neutral reviewer (see the affiliation note in
[`organic-social-playbook.md`](./organic-social-playbook.md)).
