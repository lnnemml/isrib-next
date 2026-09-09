import { FaqAccordion } from "@/components/ui";

// S8 · FAQ (objection pass). The 8 voiced Q&As from the deck, boundary-clean:
// tolerability not efficacy, no results/timeframe claims, legal scoped (never a blanket
// "worldwide"/country list). The cancer question is intentionally OMITTED on /go (Anton,
// 2026-09-09 — a Meta ad-destination page shouldn't introduce a fear the reader didn't
// arrive with). Copy verbatim from S8. Server component.
const FAQS = [
  {
    q: "Is it safe?",
    a: "ISRIB A15 is non-stimulant: it doesn't act on heart rate, blood pressure, or sleep. In animal research the ISRIB scaffold showed no toxicity at effective doses. It works by releasing a cellular stress response, not by stimulating or sedating. If you take prescription medication, talk to your doctor first.",
  },
  {
    q: "Will it interact with my medications?",
    a: "A15 doesn't work through dopamine, serotonin, or adrenergic pathways, so interactions with most common medications are unlikely. We can't account for every case — if you're on prescription medication, check with your doctor before starting.",
  },
  {
    q: "What should I expect? How fast?",
    a: "We don't make results or timeframe claims — it's a research compound. What we can tell you is the mechanism: A15 stabilizes eIF2B to release the ISR brake on protein synthesis. Individual experiences vary; the research describes the mechanism and a clean tolerability profile, not a guaranteed outcome.",
  },
  {
    q: "What exactly is ISRIB A15?",
    a: "A research compound: an analog of ISRIB, the molecule discovered at UCSF in 2013. It stabilizes eIF2B, which regulates protein synthesis in the brain. Not a supplement, not a stimulant, not a drug — sold as a research compound.",
  },
  {
    q: "Is it legal?",
    a: "ISRIB A15 is not a scheduled/controlled substance in most jurisdictions we ship to, and is sold as a research compound. Rules vary — check your local regulations.",
  },
  {
    q: "How do I take it?",
    a: "Capsules: one 20 mg capsule daily with food, on a 5-days-on / 2-off cycle. Powder: measure carefully with a milligram-accurate scale. Full dosing protocol ships with every order.",
  },
  {
    q: "I've been disappointed by supplements before.",
    a: "Fair — most act on neurotransmitter levels. A15 works on a different target entirely: the cellular stress response, via eIF2B. We lead with the mechanism and the lab work, not promises; individual responses vary.",
  },
  {
    q: "How do I know it's pure?",
    a: "In-house synthesis by an ex-Enamine pharmaceutical chemist (10+ yrs). NMR-verified every batch. 98%+ HPLC purity. Certificate of Analysis with every order — and you can request the current batch's COA before you buy.",
  },
];

export default function Faq() {
  return (
    <section className="bg-surface py-[90px]">
      <div className="mx-auto max-w-[820px] px-8">
        <h2 className="mb-4 text-center text-h2 font-bold">Common questions</h2>
        <p className="mb-12 text-center text-body-lg text-text-muted">
          Everything you need to know before starting with ISRIB A15.
        </p>

        <FaqAccordion items={FAQS} />

        <div className="mt-12 rounded-xl border border-border border-t-[3px] border-t-accent bg-surface-soft p-8 text-center shadow-sm">
          <p className="mb-6 text-body-lg font-semibold text-text">Still have questions?</p>
          <div className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:isrib.shop@protonmail.com"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 max-sm:w-full"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Support
            </a>
          </div>
          <p className="text-small text-text-muted">
            Email:{" "}
            <a href="mailto:isrib.shop@protonmail.com" className="text-primary hover:underline">
              isrib.shop@protonmail.com
            </a>
            <br />
            We read and respond to every message within 12 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
