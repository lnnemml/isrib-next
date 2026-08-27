# Design — Design System

> **STATUS: LOCKED (2026-08-27).** This page records the *direction and rationale*.
> The exact, copy-paste engineering spec (Tailwind v4 `@theme` tokens, `next/font`
> wiring, typography recipes, and per-component class strings) is in
> **[`handoff-spec.md`](./handoff-spec.md)** — that is the source of truth for
> implementation. Don't invent colors/radii/spacing per page; use the tokens.
>
> **Day 0 action:** paste the `@theme` block from `handoff-spec.md` §1 into
> `app/globals.css`, and the `next/font` setup from §2 into `app/layout.tsx`.
> Fonts are Geist Sans + Geist Mono (mono = the scientific-value voice).

## Direction decision (2026-08-27)

**Preserve the current `isrib.shop` storefront identity — light, blue/cyan, white,
lab-grade — and elevate it to premium.** The amber-on-near-black direction from the
`isrib-a15.com` landing redesign is a *diverged* branch and is NOT adopted for the
unified site; the storefront palette (5 years, 500+ buyers, established recognition)
is canonical.

Known risk to design against: a light blue/white palette reads as generic tech/SaaS
by default (this is exactly what the landing redesign fled). The premium quality must
come from typography, restraint, spacing/rhythm, data-visualization craft, and
micro-detail — not from the colors. Target feeling: **premium scientific instrument /
lab-grade**, not supplement store, not SaaS dashboard.

## Color tokens (current storefront — baseline to refine into ramps)

| Token | Value | Role |
|---|---|---|
| brand-900 | `#1e40af` | deep blue — hover/emphasis |
| brand-700 | `#2563eb` | primary action blue |
| brand-500 | `#3b82f6` | lighter blue |
| accent-600 | `#0284c7` | cyan/sky accent (deep) |
| accent-500 | `#0ea5e9` | cyan/sky accent |
| bg / panel | `#ffffff` | white base + cards |
| bg-soft | `#f8fafc` | soft section background |
| text | `#0f172a` | slate-900 primary text |
| muted / muted-strong | `#64748b` / `#475569` | secondary text |
| ring | `#e2e8f0` / `#e5e7eb` | hairline borders |

Type: Inter (keep, or a refined pairing from the design pass). Radius 14px / 18px.
Soft shadow `0 12px 30px rgba(2,6,23,.08)`. Light mode primary.

## Motif

Molecular / formula graphics, NMR spectra, data timelines, mechanism diagrams,
comparison tables are first-class, precision-rendered design elements —
evidence-over-lifestyle (this audience trusts graphs over stock photography). The
cyan accent is a precision highlight, used sparingly, not a fill.

## Delivered by the design pass (now in handoff-spec.md)

- Full token scale (blue + cyan ramps, slate text, spacing, radii, elevation,
  typography scale incl. a mono voice for scientific values) as Tailwind v4 values.
- Component specs: buttons, cards, quote block, product hero (formula SVG), NMR
  section (spectrum + lightbox + FID downloads), mechanism 5-block, comparison table,
  FAQ accordion, checkout steps, payment-method selector.
- Key page templates: home, product page (generic + A15 flagship), checkout, `/go`.

## Brand constraints for design

- Research-compound credibility, not wellness. Chemist-founder trust signals
  foregrounded (in-house synthesis, 98%+ purity, NMR COA). No card-payment UI. No
  money-back-guarantee badges.
- Copy voice per [`../marketing/messaging-angles.md`](../marketing/messaging-angles.md);
  belief order per [`../product/beliefs-and-objections.md`](../product/beliefs-and-objections.md).

## Related
- [`../marketing/messaging-angles.md`](../marketing/messaging-angles.md)
- [`../architecture/folder-structure.md`](../architecture/folder-structure.md)
