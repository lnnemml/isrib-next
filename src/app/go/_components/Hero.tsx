"use client";

import { Button } from "@/components/ui";

// S1 · Hero [B1] — problem reframe + mechanism lead. Proof-sandwich: mono kicker
// (proof beat #1) above the H1, three accent-top proof cards (beat #2) below. Both
// beats are borrowed lab authority, never customer reviews. CTAs scroll in-page:
// primary → #offer, secondary → #mechanism. Copy is verbatim from the go-rewrite
// deck's FINAL VOICED LINES block.
export default function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-soft">
      {/* radial wash — the ONLY gradient in the system, low opacity, corners only */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(14,165,233,.08),transparent_42%),radial-gradient(circle_at_6%_90%,rgba(30,64,175,.07),transparent_45%)]" />
      <div className="relative mx-auto max-w-[--container-page] px-8 py-[90px] text-center">
        {/* Proof beat #1 — mono kicker */}
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-[13px] py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
          <span className="size-[7px] animate-pulse rounded-full bg-accent" />
          UCSF-Discovered Mechanism · In-House Synthesis · NMR-Verified
        </span>

        {/* H1 — problem reframe */}
        <h1 className="mx-auto mb-6 max-w-[18ch] text-display font-bold">
          Your Brain Isn't Broken.
          <br />
          <span className="text-primary">It's Stuck.</span>
        </h1>

        {/* Subhead — mechanism reversal, no outcome promise */}
        <p className="mx-auto mb-10 max-w-[52ch] text-body-lg text-text-muted">
          Under chronic stress, your brain cells slam on a brake — a pathway called the
          Integrated Stress Response. And it doesn't always let go. ISRIB A15 is the research
          compound built to release it.
        </p>

        {/* CTAs */}
        <div className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => scrollTo("offer")}
          >
            Order ISRIB A15
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => scrollTo("mechanism")}
          >
            See how the brake works ↓
          </Button>
        </div>

        {/* FUD-reducer — directly under the primary button */}
        <p className="mb-16 font-mono text-mono-label uppercase tracking-[0.06em] text-text-subtle">
          COA with every order. Ships in 48 hours.
        </p>

        {/* Proof beat #2 — three accent-top proof cards (mechanism/credibility, not outcomes) */}
        <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
          <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[26px] shadow-sm">
            <div className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              A different target
            </div>
            <p className="text-small leading-relaxed text-text-muted">
              A15 stabilizes eIF2B, the master switch for protein synthesis in neurons. Not
              another dopamine or acetylcholine lever.
            </p>
          </div>
          <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[26px] shadow-sm">
            <div className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              Non-stimulant by design
            </div>
            <p className="text-small leading-relaxed text-text-muted">
              No heart-rate spike, no sleep disruption. It works by releasing a cellular brake,
              not by stimulating or sedating.
            </p>
          </div>
          <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[26px] shadow-sm">
            <div className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              Backed by published research
            </div>
            <p className="text-small leading-relaxed text-text-muted">
              The ISRIB molecule was discovered in Dr. Peter Walter's lab at UCSF and published
              in Science and eLife.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
