# ISRIB A15 — Engineering Handoff Spec

Next.js (App Router) + Tailwind v4. All values extracted from `Design System.dc.html` and `ISRIB A15 Landing.dc.html`. Fonts: **Geist** (sans) + **Geist Mono** (scientific-value voice).

---

## 1. The `@theme` block — `app/globals.css`

```css
@import "tailwindcss";

@theme {
  /* ---------- Font families ---------- */
  --font-sans: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", Menlo, monospace;

  /* ---------- Blue — primary ---------- */
  --color-blue-50:  #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-200: #bfdbfe;
  --color-blue-300: #93c5fd;
  --color-blue-400: #60a5fa;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;
  --color-blue-950: #172554;

  /* ---------- Cyan — precision accent ---------- */
  --color-cyan-50:  #f0f9ff;
  --color-cyan-100: #e0f2fe;
  --color-cyan-200: #bae6fd;
  --color-cyan-300: #7dd3fc;
  --color-cyan-400: #38bdf8;
  --color-cyan-500: #0ea5e9;
  --color-cyan-600: #0284c7;
  --color-cyan-700: #0369a1;
  --color-cyan-800: #075985;
  --color-cyan-900: #0c4a6e;

  /* ---------- Slate — text & structure ---------- */
  --color-slate-50:  #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;

  /* ---------- Semantic alias layer ---------- */
  --color-primary:        var(--color-blue-600);   /* #2563eb — primary action  */
  --color-primary-hover:  var(--color-blue-700);   /* #1d4ed8                    */
  --color-primary-deep:   var(--color-blue-800);   /* #1e40af — anchor           */
  --color-accent:         var(--color-cyan-500);   /* #0ea5e9 — signal fill      */
  --color-accent-strong:  var(--color-cyan-600);   /* #0284c7 — mono labels      */

  --color-surface:         #ffffff;
  --color-surface-soft:    var(--color-slate-50);  /* #f8fafc                    */
  --color-surface-inverse: var(--color-slate-900); /* #0f172a — dark sections    */
  --color-surface-inverse-card: var(--color-slate-800); /* #1e293b               */

  --color-border:      var(--color-slate-200);     /* #e2e8f0 — hairline         */
  --color-border-soft: var(--color-slate-100);     /* #f1f5f9 — inner dividers   */
  --color-border-inverse: var(--color-slate-700);  /* #334155 — on dark          */

  --color-text:        var(--color-slate-900);     /* #0f172a                    */
  --color-text-muted:  var(--color-slate-600);     /* #475569                    */
  --color-text-subtle: var(--color-slate-500);     /* #64748b                    */
  --color-text-faint:  var(--color-slate-400);     /* #94a3b8                    */

  --color-danger:  #dc2626;
  --color-success: #059669;
  --color-warning: #d97706;

  /* ---------- Type scale (size / line-height / tracking) ---------- */
  --text-display: 3.625rem;            /* 58px — hero H1        */
  --text-display--line-height: 1.02;
  --text-display--letter-spacing: -0.035em;

  --text-h1: 2.75rem;                  /* 44px — identity CTA   */
  --text-h1--line-height: 1.1;
  --text-h1--letter-spacing: -0.03em;

  --text-h2: 2.375rem;                 /* 38px — section titles */
  --text-h2--line-height: 1.12;
  --text-h2--letter-spacing: -0.025em;

  --text-h3: 1.375rem;                 /* 22px                  */
  --text-h3--line-height: 1.25;
  --text-h3--letter-spacing: -0.01em;

  --text-body-lg: 1.1875rem;           /* 19px                  */
  --text-body-lg--line-height: 1.6;

  --text-body: 1.0625rem;              /* 17px                  */
  --text-body--line-height: 1.7;

  --text-small: 0.875rem;              /* 14px                  */
  --text-small--line-height: 1.6;

  --text-caption: 0.75rem;             /* 12px                  */
  --text-caption--line-height: 1.4;

  --text-mono-value: 0.9375rem;        /* 15px — inline sci val */
  --text-mono-value--line-height: 1.3;

  --text-mono-label: 0.75rem;          /* 12px — uppercase kicker */
  --text-mono-label--line-height: 1.2;
  --text-mono-label--letter-spacing: 0.16em;

  /* ---------- Radius ---------- */
  --radius-md:  0.75rem;   /* 12px — buttons, inputs        */
  --radius-lg:  0.875rem;  /* 14px — small cards, spectra   */
  --radius-xl:  1rem;      /* 16px — standard cards         */
  --radius-2xl: 1.125rem;  /* 18px — hero card, order panel */

  /* ---------- Elevation ---------- */
  --shadow-xs: 0 1px 2px rgba(15,23,42,.04);
  --shadow-sm: 0 1px 3px rgba(2,6,23,.06);
  --shadow-md: 0 12px 30px rgba(2,6,23,.08);
  --shadow-btn: 0 1px 2px rgba(37,99,235,.35), inset 0 1px 0 rgba(255,255,255,.15);

  /* ---------- Layout ---------- */
  --container-page: 1160px;
}
```

> **Focus ring** (not a `@theme` token — apply via utility): `ring-3 ring-blue-600/35` → `0 0 0 3px rgba(37,99,235,.35)`.
> `radius-sm` (8px) is available from Tailwind's default `--radius-sm`; the design only adds md→2xl above.

---

## 2. `next/font` wiring — `app/layout.tsx`

```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-surface font-sans text-text antialiased">{children}</body>
    </html>
  );
}
```

The two `variable`s (`--font-geist-sans`, `--font-geist-mono`) are consumed by `--font-sans` / `--font-mono` in the `@theme` block, so `font-sans` and `font-mono` utilities resolve to Geist / Geist Mono automatically.

---

## 3. Typography recipes

| Role | Utility string |
| --- | --- |
| Display (hero H1) | `font-sans text-display font-bold` |
| H1 (identity CTA) | `font-sans text-h1 font-bold text-balance` |
| H2 (section title) | `font-sans text-h2 font-bold` |
| H3 (card / block head) | `font-sans text-h3 font-semibold` |
| Body large | `font-sans text-body-lg text-text-muted` |
| Body | `font-sans text-body text-text-muted` |
| Small | `font-sans text-small text-text-subtle` |
| Caption | `font-sans text-caption text-text-faint` |
| **Mono kicker / label** | `font-mono text-mono-label font-medium uppercase text-accent-strong` |
| **Mono value (inline)** | `font-mono text-mono-value font-medium text-text` |
| **Mono value chip** | `font-mono text-mono-value font-medium text-text bg-surface-soft border border-border rounded-md px-3 py-1.5` |

**Mono font is mandatory** on every scientific value: molecular formula (`C₂₂H₂₂Cl₄N₂O₄`), purity (`≥98% HPLC`), potency (`EC₅₀ 0.8 nM`), MW (`520.24 g/mol`), NMR shifts (`δ 4.51 ppm`), CAS, filenames, prices, stat figures, and all uppercase section kickers.

---

## 4. Component specs

### Buttons

```tsx
/* Primary */
<button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 disabled:pointer-events-none max-sm:w-full">
  Order ISRIB A15
</button>

/* Secondary (outline) */
<button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-surface px-[22px] py-3 text-[15px] font-semibold text-primary-deep transition hover:border-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 max-sm:w-full">
  Read the mechanism
</button>

/* Ghost */
<button className="inline-flex items-center gap-1.5 rounded-md px-4 py-3 text-[15px] font-semibold text-slate-700 transition hover:text-primary">
  Ghost link →
</button>

/* Disabled — "card — coming soon" */
<button disabled className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-slate-100 px-[22px] py-3 text-[15px] font-semibold text-slate-400 cursor-not-allowed">
  Disabled
</button>
```

### Card & accent card

```tsx
/* Base card */
<div className="rounded-xl border border-border bg-surface p-[26px] shadow-sm" />

/* Accent card — cyan precision rule */
<div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[26px] shadow-sm" />

/* Inverted card (dark sections) */
<div className="rounded-xl border border-slate-800 bg-surface-inverse p-[26px] text-white" />
```

### Quote / testimonial block

```tsx
<figure className="rounded-xl border border-border bg-surface p-[30px] shadow-sm">
  <blockquote className="mb-5 text-[17px] font-medium leading-[1.55] tracking-[-0.01em] text-text">
    Three weeks in, the 3pm wall is gone…
  </blockquote>
  <figcaption className="flex items-center gap-[11px]">
    <span className="size-9 shrink-0 rounded-full bg-slate-200" />{/* avatar slot */}
    <span>
      <span className="block text-[13px] font-semibold text-text">D. Reyes</span>
      <span className="block font-mono text-[11px] text-text-subtle">ML researcher · 100mg protocol</span>
    </span>
  </figcaption>
</figure>
```

Editorial variant (design-system page) uses a left rule instead of a card border: `border-l-2 border-accent pl-6`.

### Product hero with formula SVG

```tsx
<section className="relative overflow-hidden border-b border-border bg-surface-soft">
  {/* radial wash — the ONLY gradient in the system, low opacity, corners only */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(14,165,233,.08),transparent_42%),radial-gradient(circle_at_6%_90%,rgba(30,64,175,.07),transparent_45%)]" />
  <div className="relative mx-auto grid max-w-[--container-page] grid-cols-1 items-center gap-14 px-8 py-[72px] lg:grid-cols-[1.05fr_0.95fr]">
    <div>
      <span className="mb-[26px] inline-flex items-center gap-2 rounded-full border border-border bg-surface px-[13px] py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
        <span className="size-[7px] animate-pulse rounded-full bg-accent" />
        Research compound · not a supplement
      </span>
      <h1 className="mb-[22px] text-display font-bold">Your brain isn't broken.<br/><span className="text-primary">It's stuck.</span></h1>
      <p className="mb-8 max-w-[52ch] text-body-lg text-text-muted">…</p>
      {/* CTA row + stat row (mono figures) */}
    </div>
    {/* Structure card */}
    <div className="rounded-2xl border border-border bg-surface p-[30px] shadow-md">
      <div className="rounded-md border border-border-soft bg-surface-soft p-3.5">
        <img src="/images/isrib-a15-formula.svg" alt="ISRIB A15 molecular structure" className="block h-auto w-full" />
      </div>
    </div>
  </div>
</section>
```

Hero stat figure: `font-mono text-[26px] font-semibold tracking-[-0.02em] text-text` + label `font-mono text-[11px] uppercase tracking-[0.06em] text-text-subtle`.

### NMR section

```tsx
/* Spectrum container (lightbox trigger) */
<figure
  onClick={() => openLightbox("/images/isrib-a15-nmr-h1.png")}
  className="cursor-zoom-in overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition hover:border-blue-300"
>
  <figcaption className="flex items-center justify-between border-b border-border-soft px-4 py-3">
    <span className="font-mono text-[12px] font-medium text-text">¹H NMR</span>
    <span className="font-mono text-[10px] text-text-faint">DMSO-d₆ · click to zoom</span>
  </figcaption>
  <img src="/images/isrib-a15-nmr-h1.png" alt="1H NMR spectrum of ISRIB A15" className="block w-full bg-white" />
</figure>

/* Lightbox overlay — render only when open (no img until src is real) */
<div onClick={close} className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-slate-950/90 p-8">
  <img src={src} alt="NMR spectrum" className="max-h-[92vh] max-w-full rounded-md bg-white shadow-[0_24px_60px_rgba(0,0,0,.5)]" />
  <button className="absolute right-[26px] top-[22px] flex size-[42px] items-center justify-center rounded-full border-none bg-white/15 text-[22px] text-white">✕</button>
</div>

/* FID / COA download button */
<a href={fileUrl} download className="flex items-center justify-between rounded-md border border-border bg-surface px-[18px] py-3.5 transition hover:border-primary hover:bg-surface-soft">
  <span className="font-mono text-[13px] text-text">isrib-a15_1H_dmso.fid</span>
  <span className="font-mono text-[11px] font-semibold text-accent-strong">↓ FID</span>
</a>
```

### Five-block mechanism section (dark)

```tsx
<section className="bg-surface-inverse py-24 text-white">
  <div className="mx-auto max-w-[--container-page] px-8">
    <div className="mb-14 max-w-[720px]">
      <p className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-cyan-400">The mechanism · the brake</p>
      <h2 className="mb-5 text-h2 font-bold text-white">A15 is a molecular staple for eIF2B.</h2>
      <p className="text-body-lg text-slate-400">…</p>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* one card per step */}
      <div className="rounded-lg border border-slate-800 bg-surface-inverse-card p-6">
        <div className="mb-4 flex size-[34px] items-center justify-center rounded-[9px] bg-accent font-mono text-[15px] font-semibold text-[#062a3d]">1</div>
        <h3 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-white">Stress hits</h3>
        <p className="text-[13px] leading-[1.6] text-slate-400">…</p>
      </div>
      {/* Step number chip fills, in order: bg-cyan-500 / bg-cyan-400 / bg-blue-400 / bg-blue-600 / bg-success */}
    </div>
    <blockquote className="mt-11 max-w-[820px] border-l-2 border-accent pl-6 text-[16px] italic leading-[1.7] text-slate-300">…</blockquote>
  </div>
</section>
```

### Comparison table (neurotransmitter drugs vs ISR)

```tsx
<div className="overflow-hidden rounded-xl border border-border shadow-sm">
  <table className="w-full border-collapse text-[15px]">
    <thead>
      <tr className="border-b border-border">
        <th className="w-[24%] px-6 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint" />
        <th className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">Modafinil</th>
        <th className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">Racetams</th>
        <th className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">Peptides / Qualia</th>
        {/* highlighted ISRIB column */}
        <th className="bg-blue-50 px-6 py-4 text-left text-[14px] font-bold text-primary-deep">ISRIB A15</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border-soft">
        <td className="px-6 py-4 font-medium text-slate-700">Mechanism</td>
        <td className="px-5 py-4 text-text-subtle">↑ dopamine/histamine</td>
        <td className="px-5 py-4 text-text-subtle">Cholinergic modulation</td>
        <td className="px-5 py-4 text-text-subtle">Broad, diffuse stack</td>
        {/* highlighted cell: bg #f8faff */}
        <td className="bg-[#f8faff] px-6 py-4 text-text">Stabilizes eIF2B</td>
      </tr>
      {/* potency row values use font-mono */}
    </tbody>
  </table>
</div>
```

The ISRIB column header is `bg-blue-50`; its body cells are `bg-[#f8faff]` (a 1-step-lighter tint used only inside this table). Numeric cells (`EC₅₀ 0.8 nM`, `mM range`) add `font-mono`.

### FAQ accordion

```tsx
<div className="border-t border-border">
  {items.map((f, i) => (
    <div key={i} className="border-b border-border">
      <button onClick={() => toggle(i)} className="flex w-full items-center justify-between gap-5 py-[22px] text-left">
        <span className="text-[18px] font-semibold tracking-[-0.01em] text-text">{f.q}</span>
        <span className="shrink-0 font-mono text-[20px] leading-none text-primary">{open === i ? "−" : "+"}</span>
      </button>
      {open === i && (
        <p className="m-0 pb-[26px] pr-10 text-[16px] leading-[1.7] text-text-muted">{f.a}</p>
      )}
    </div>
  ))}
</div>
```

### Checkout steps (stepper)

```tsx
<ol className="flex items-center gap-3 font-mono text-[12px]">
  {/* active */}
  <li className="flex items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">1</span>
    <span className="font-semibold text-text">Details</span>
  </li>
  <span className="h-px w-8 bg-border" />
  {/* upcoming */}
  <li className="flex items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-text-faint">2</span>
    <span className="text-text-faint">Payment</span>
  </li>
  <span className="h-px w-8 bg-border" />
  <li className="flex items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-text-faint">3</span>
    <span className="text-text-faint">Confirm</span>
  </li>
</ol>
```

Completed step swaps the number chip for `bg-success text-white` with a `✓`.

### Payment-method selector — radio cards

No card fields. Crypto is the default and pre-selected; the card slot is permanently disabled.

```tsx
{/* CRYPTO — default selected + 10% discount treatment */}
<label className="relative flex cursor-pointer items-start gap-3 rounded-xl border-2 border-primary bg-blue-50 p-5 shadow-sm">
  <input type="radio" name="pay" value="crypto" defaultChecked className="mt-0.5 accent-blue-600" />
  <span className="flex-1">
    <span className="flex items-center gap-2">
      <span className="text-[16px] font-semibold text-text">Crypto</span>
      <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-success">Save 10%</span>
    </span>
    <span className="mt-1 block text-[14px] leading-[1.55] text-text-subtle">BTC, ETH, USDT, XMR. Address issued after you place the order.</span>
  </span>
</label>

{/* MANUAL arrangement */}
<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-5 transition hover:border-primary">
  <input type="radio" name="pay" value="manual" className="mt-0.5 accent-blue-600" />
  <span className="flex-1">
    <span className="block text-[16px] font-semibold text-text">Manual arrangement</span>
    <span className="mt-1 block text-[14px] leading-[1.55] text-text-subtle">Bank/wire arranged individually over Email, Telegram or Signal.</span>
  </span>
</label>

{/* CARD — permanently disabled */}
<label aria-disabled className="flex items-start gap-3 rounded-xl border border-border bg-slate-100 p-5 cursor-not-allowed opacity-70">
  <input type="radio" name="pay" value="card" disabled className="mt-0.5" />
  <span className="flex-1">
    <span className="flex items-center gap-2">
      <span className="text-[16px] font-semibold text-slate-400">Card</span>
      <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-text-faint">Coming soon</span>
    </span>
    <span className="mt-1 block text-[14px] leading-[1.55] text-text-faint">No card checkout at this time — by design.</span>
  </span>
</label>
```

Order-quantity selector (landing) reuses the same radio-card pattern: unselected `border-border bg-surface`, selected `border-primary bg-blue-50`.

---

## 5. Layout tokens

| Token | Value | Usage |
| --- | --- | --- |
| Page container | `max-w-[1160px]` (`--container-page`) with `px-8` (32px) | landing shell |
| Reading column | `max-w-[720px]` / `max-w-[820px]` | agitation copy, FAQ, order panel |
| Prose measure | `max-w-[52ch]`–`max-w-[62ch]` | body paragraphs |
| Section rhythm (light) | `py-[90px]` desktop | standard sections |
| Section rhythm (dark) | `py-24` (96px) | mechanism, trust |
| Grid gaps | `gap-4` (16px) cards · `gap-14` (56px) hero split | — |

**Breakpoints** (Tailwind v4 defaults, designed mobile-first):

| Prefix | Min-width | Key reflows |
| --- | --- | --- |
| (base) | 0 | single column; hero + trust stack; CTAs `w-full`; mechanism 1-col |
| `sm` | 640px | mechanism 2-col; testimonials begin to breathe |
| `lg` | 1024px | hero `1.05fr_0.95fr`; mechanism 5-col; comparison table full width; 3-col testimonials |

Mobile rules: buttons go `max-sm:w-full`; comparison table wrap in `overflow-x-auto`; hero/order/trust grids collapse to one column below `lg`; keep 32px (`px-8`) gutters throughout.
