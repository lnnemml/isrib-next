# Product — Overview

> Synthesized from Offer Brief, A15 Master Intelligence Report (Part 3), and
> analytics summaries. Source of truth for positioning; check
> [`beliefs-and-objections.md`](./beliefs-and-objections.md) before writing copy.

## What ISRIB A15 is

A potent, orally bioavailable analog of ISRIB — a small molecule that inhibits the
Integrated Stress Response (ISR) by stabilizing eIF2B, the master regulator of
protein synthesis. Discovered at UCSF (2013, Peter Walter / Carmela Sidrauski).
A15 replaces certain chlorophenyl groups with dichlorophenoxy groups → more potent,
better pharmacokinetics, effective at ~5–15 mg oral doses. The brand differentiator
is **in-house synthesis by a pharmaceutical chemist (ex-Enamine), 98%+ purity,
NMR-verified.**

## Big idea

Reboot your brain's memory and clarity by releasing the biological brake that
blocks cognition under stress — ISRIB A15 restores baseline cognitive potential
even when nothing else worked. Core metaphor: **Ctrl+Alt+Del for your brain.**

## Unique mechanisms

- **UMP (problem):** The ISR blocks protein synthesis in brain cells under chronic
  stress, aging, or injury — cutting the supply chain for memory formation. Not a
  neurotransmitter deficiency; a cellular shutdown that persists even after rest.
- **UMS (solution):** ISRIB A15 binds eIF2B, stabilizes its active form, overrides
  the ISR shutdown. Protein synthesis resumes, memory pathways reactivate. Not
  stimulation — restoration at the cellular level.

## Positioning

- **Awareness:** problem-aware, often solution-aware. They know cognitive fatigue,
  have tried stacks/modafinil.
- **Sophistication:** Stage 3–4. Jaded by racetams and adaptogens. Want the "next
  level" / something that actually works.
- **Authority anchor:** Peter Walter (UCSF); Google/Calico funding; Science + eLife
  papers; 2024 Calico ALS trial.

## Product catalog & pricing

Flagship is ISRIB A15. Full catalog (each becomes a `products/[slug]` entry;
prices/SKUs are authoritative from analytics summaries — never invent):

| Product | Slug | Notes |
|---|---|---|
| ISRIB A15 | `isrib-a15` | flagship; powder 500mg/1g + capsules 25/50 (20mg) |
| ISRIB Original | `isrib-original` | parent molecule |
| ZZL-7 | `zzl-7` | — |
| MPEP Oxalate | `mpep-oxalate` | proven product-page template (hero formula SVG, 5-block mechanism, NMR + FID) |
| Bromantane | `bromantane` | (NORA angle: bromantane in MCT oil, Track B) |
| N-Acetyl-Bromantane | `n-acetyl-bromantane` | — |

ISRIB A15 pricing (from `ISRIB_Analytics_Summary`): 500mg $130, 1g $200,
25 caps (20mg) $170, 50 caps (20mg) $240. ~50–100 doses/gram. Price context:
AMSBIO charges $415 for 50mg — isrib.shop 1g at $200 is ~20× better value/dose.

### Full authoritative price table (from live isrib.shop product pages, 2026-08-27)

Source of truth for the other five SKUs; integer cents. **Never invent — sourced
from the live pages Anton provided.** All powder unless noted.

| Product | Format | Size | Price | cents |
|---|---|---|---|---|
| ISRIB A15 | powder | 500mg | $130 | 13000 |
| ISRIB A15 | powder | 1g | $200 | 20000 |
| ISRIB A15 | capsules | 25×20mg | $170 | 17000 |
| ISRIB A15 | capsules | 50×20mg | $240 | 24000 |
| MPEP Oxalate | powder | 100mg / 500mg / 1g | $60 / $130 / $200 | 6000 / 13000 / 20000 |
| N-Acetyl-Bromantane | powder | 500mg / 1g / 2g | $40 / $70 / $130 | 4000 / 7000 / 13000 |
| Bromantane | powder | 1g / 2g / 5g | $40 / $70 / $160 | 4000 / 7000 / 16000 |
| ZZL-7 | powder | 100mg | $50 | 5000 |

**ISRIB Original — distinct pricing shape (NOT fixed size→price).** Per-gram tiered
with a custom-quantity calculator (min 100mg, max 30g):
- Trials (fixed): 100mg $27 (2700), 500mg $60 (6000).
- Per-gram tiers: 1g $100/g (10000/g) · 2–4g $90/g, −10% (9000/g) · 5–9g $85/g,
  −15% (8500/g) · 10–30g $80/g, −20% (8000/g).

**Data-model consequence:** the product model must NOT assume one uniform pricing
form. Use a discriminated union — `pricing.kind: "fixed"` (formats[] with priceCents,
the five above) vs `pricing.kind: "per-gram-tiered"` (trials[] + tiers[] with
perGramCents + range, ISRIB Original). The interactive custom-quantity calculator is
NOT part of 1.2 (checkout/interactive logic) — model the data, render the discrete
tiers as display cards, defer the live calculator.

### Product copy — preserve, don't regenerate

Existing live product-page copy is **validated and kept** (Anton's call). Page-building
sessions **port it verbatim** from the local old site
(`/home/laptop/Documents/ISRIB/isrib shop website/ISRIB`) rather than writing new
descriptions. New copy only where the old site has none. A compliance scan **flags**
(never silently rewrites) any rx-drug brand name, asserted cancer benefit, or
guarantee language for Anton to decide. Category descriptors carry over, e.g. MPEP
"mGluR5 Negative Allosteric Modulator", N-Acetyl-Bromantane "Acylated Dopaminergic
Actoprotector", Bromantane "Dopaminergic Actoprotector", ZZL-7 "Fast-Onset Research
Compound". Common trust block: ≥98% (HPLC), COA included, worldwide shipping, secure
packaging, support via Email/Telegram/Signal, payments arranged individually.

## Product-page template convention (from legacy MPEP)

Hero with formula SVG → five-block mechanism section → NMR section with lightbox +
FID downloads (dash naming) → order block. ISRIB A15 NMR reference: DMSO-d6,
400 MHz (1H) / 100 MHz (13C); signals at delta 1.79 and 1.35 are cyclohexane ring
protons (not impurities).

## Related
- [`avatar.md`](./avatar.md) · [`beliefs-and-objections.md`](./beliefs-and-objections.md)
- [`../marketing/messaging-angles.md`](../marketing/messaging-angles.md)
