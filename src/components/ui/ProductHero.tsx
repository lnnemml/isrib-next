import type { ReactNode } from "react";

// Class strings verbatim from handoff-spec.md §4 "Product hero with formula SVG"
// (lines 250–274). `formula` is the SVG/img slot (the only gradient in the system is
// the corners-only radial wash below).
interface ProductHeroProps {
  kicker: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode; // optional molecular-formula subheading under the title (A15)
  body: ReactNode;
  cta?: ReactNode;
  stats?: ReactNode;
  formula: ReactNode;
}

export function ProductHero({ kicker, title, subtitle, body, cta, stats, formula }: ProductHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-soft">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(14,165,233,.08),transparent_42%),radial-gradient(circle_at_6%_90%,rgba(30,64,175,.07),transparent_45%)]" />
      <div className="relative mx-auto grid max-w-[--container-page] grid-cols-1 items-center gap-14 px-8 py-[72px] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="mb-[26px] inline-flex items-center gap-2 rounded-full border border-border bg-surface px-[13px] py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
            <span className="size-[7px] animate-pulse rounded-full bg-accent" />
            {kicker}
          </span>
          <h1 className="mb-[22px] font-mono text-[46px] font-medium leading-[1.06] tracking-normal">{title}</h1>
          {subtitle && (
            <p className="-mt-3 mb-[22px] font-mono text-[13px] tracking-[0.02em] text-text-subtle">{subtitle}</p>
          )}
          <p className="mb-8 max-w-[52ch] text-body-lg text-text-muted">{body}</p>
          {cta}
          {stats}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-[30px] shadow-md">
          <div className="rounded-md border border-border-soft bg-surface-soft p-3.5">{formula}</div>
        </div>
      </div>
    </section>
  );
}

// Hero stat figure + label recipe (handoff-spec.md line 274).
interface HeroStatProps {
  figure: ReactNode;
  label: ReactNode;
}

export function HeroStat({ figure, label }: HeroStatProps) {
  return (
    <div>
      <div className="font-mono text-[26px] font-semibold tracking-[-0.02em] text-primary-deep">{figure}</div>
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-subtle">{label}</div>
    </div>
  );
}
