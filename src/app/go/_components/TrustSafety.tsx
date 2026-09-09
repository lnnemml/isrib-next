"use client";

import { Button } from "@/components/ui";

// S5 · Trust / Safety [B5] — doubles as the proof section. Stacks 4 INDEPENDENT proof
// types so no single source carries belief: (1) expert/authority (Dr. Peter Walter,
// UCSF, tolerability-scoped quote — NOT efficacy), (2) published research (Science /
// eLife), (3) lab artifact (NMR + COA every batch, ex-Enamine chemist, 98%+ purity),
// (4) institutional (Calico/Alphabet trial = legitimacy, not efficacy). No customer
// voices. Repeated CTA after the proof stack. Copy verbatim from S5.
export default function TrustSafety() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-surface-soft py-[90px]">
      <div className="mx-auto max-w-[--container-page] px-8">
        <div className="mb-10 max-w-[720px]">
          <p className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-accent-strong">
            Source & Safety
          </p>
          <h2 className="text-h2 font-bold">
            Synthesized by a chemist. Verified before it ships.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* (1) Expert / authority — tolerability-scoped, not efficacy */}
          <figure className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[30px] shadow-sm">
            <div className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              Expert authority
            </div>
            <blockquote className="mb-4 text-[17px] font-medium leading-[1.55] tracking-[-0.01em] text-text">
              "We have never seen any relevant side effects. None."
            </blockquote>
            <figcaption className="text-small text-text-muted">
              ISRIB's co-discoverer Dr. Peter Walter, on the molecule in their research — a
              statement about tolerability in the lab, not a promise of results.
            </figcaption>
          </figure>

          {/* (2) Published research */}
          <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[30px] shadow-sm">
            <div className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              Published research
            </div>
            <p className="text-body text-text-muted">
              The ISRIB molecule was discovered in Dr. Peter Walter's lab at UCSF and published in
              Science and eLife — peer-reviewed, not marketing.
            </p>
          </div>

          {/* (3) Lab artifact — the batch you receive */}
          <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[30px] shadow-sm">
            <div className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              In every batch
            </div>
            <ul className="space-y-2 text-small text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>In-house synthesis by an ex-Enamine
                pharmaceutical chemist (10+ yrs)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>NMR-verified every batch
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>
                  <span className="font-mono">98%+</span> HPLC purity
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>Certificate of Analysis with every order
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>Capsule format = no solvents, pre-dosed{" "}
                <span className="font-mono">20&nbsp;mg</span>
              </li>
            </ul>
          </div>

          {/* (4) Institutional legitimacy — not efficacy */}
          <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[30px] shadow-sm">
            <div className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.14em] text-accent-strong">
              Institutional legitimacy
            </div>
            <p className="text-body text-text-muted">
              The ISRIB scaffold is now in human clinical trials at Calico (Alphabet) — a measure
              of how seriously the research is taken, not a claim about what it will do for you.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => scrollTo("offer")}>
            See the offer ↓
          </Button>
        </div>
      </div>
    </section>
  );
}
