import { Button, HeroStat } from "@/components/ui";

// Homepage hero — bespoke, built on the locked design tokens (the generic ProductHero
// is a single-product layout; the homepage hero needs a free-shipping banner, a
// gradient-clip headline, a stat trio, and a 4-row benefit card). Copy ported verbatim
// from the live index.html except where the task overrides (see below).
//
// Compliance: COA framed "on request" (never "Included") in the benefit card — this
// corrects the live homepage's "COA Included" label per ADR 0008.

// Benefit-card rows (right column). Icon + bold label + sub.
const BENEFITS: { icon: string; label: string; sub: string }[] = [
  { icon: "🧪", label: "98%+ purity", sub: "NMR verified" },
  { icon: "📦", label: "Fast worldwide", sub: "Discreet packaging" },
  { icon: "📄", label: "COA", sub: "on request per batch" },
  { icon: "🛡️", label: "QC protocol", sub: "Batch-level control" },
];

// Hero stat trio — mono figure + label (HeroStat recipe).
const STATS: { figure: string; label: string }[] = [
  { figure: "50+", label: "Countries shipped" },
  { figure: "98%+", label: "Purity · NMR verified" },
  { figure: "Since 2020", label: "In operation" },
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-soft">
      {/* Corners-only radial wash — the ONLY gradient background in the system. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(14,165,233,.08),transparent_42%),radial-gradient(circle_at_6%_90%,rgba(30,64,175,.07),transparent_45%)]" />
      <div className="relative mx-auto grid max-w-[--container-page] grid-cols-1 items-center gap-14 px-8 py-[72px] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {/* Free-shipping banner (small, top). */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-success px-4 py-2 text-small font-semibold text-white shadow-sm ring-1 ring-success/30">
            <span>{"🚚"}</span>
            {"Free worldwide shipping on all orders"}
          </span>

          {/* Headline — "Research Chemicals" as blue→cyan gradient clip-text. */}
          <h1 className="mb-[22px] text-display font-extrabold tracking-tight text-text">
            {"Advanced "}
            <span className="bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
              {"Research Chemicals"}
            </span>
            {" for Scientific Innovation"}
          </h1>

          {/* Subtext — verbatim. */}
          <p className="mb-8 max-w-[52ch] text-body-lg text-text-muted">
            {"Access cutting-edge compounds like ISRIB, ZZL-7, and MPEP with guaranteed purity and worldwide shipping. Trusted by researchers globally."}
          </p>

          {/* Stat trio. */}
          <div className="mb-8 flex flex-wrap gap-x-10 gap-y-4">
            {STATS.map((s) => (
              <HeroStat key={s.label} figure={s.figure} label={s.label} />
            ))}
          </div>

          {/* Primary CTA. */}
          <a href="/products">
            <Button variant="primary">{"🧬 Browse products"}</Button>
          </a>
        </div>

        {/* Benefit card (right column) — 4 rows, 2-col within the card. */}
        <div className="rounded-2xl border border-border bg-surface p-[26px] shadow-md">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.label}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-3.5"
              >
                <span className="text-[22px] leading-none">{b.icon}</span>
                <span>
                  <span className="block text-[15px] font-semibold text-text">{b.label}</span>
                  <span className="block text-small text-text-subtle">{b.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
