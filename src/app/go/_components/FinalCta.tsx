"use client";

import { Button } from "@/components/ui";

// S9 · Final CTA (NEW — structural closer the dr-swipe-file pass caught). Full-width
// closer after the FAQ: restate the core promise outcome-free, no fake urgency/deadline.
// Primary CTA → #offer. Copy verbatim from the deck's FINAL VOICED LINES + S9.
export default function FinalCta() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="border-t border-border bg-surface-soft py-[90px]">
      <div className="mx-auto max-w-[720px] px-8 text-center">
        <h2 className="mb-6 text-h2 font-bold">
          Your brain isn't broken. It's stuck. Let's release the brake.
        </h2>
        <p className="mx-auto mb-10 max-w-[62ch] text-body-lg text-text-muted">
          One pathway has been quietly capping everything else. ISRIB A15 is the research compound
          built to release it — synthesized in-house, NMR-verified, with a COA in every order.
        </p>
        <div className="mb-6 flex justify-center">
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => scrollTo("offer")}>
            Order ISRIB A15
          </Button>
        </div>
        <p className="font-mono text-mono-label uppercase tracking-[0.06em] text-text-subtle">
          98%+ purity · NMR-verified · ships within 48h
        </p>
      </div>
    </section>
  );
}
