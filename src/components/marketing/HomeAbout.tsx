// Homepage "In-house synthesis" About section — bespoke 2-col on the locked tokens.
// Copy (2 paragraphs + 5 feature bullets) and the NMR proof card (header / meta / key
// signals / footer link) are ported VERBATIM from the live index.html #about block.

// Feature bullets — verbatim from the live features-list.
const FEATURES: string[] = [
  "In-house synthesis — not resold bulk material",
  "NMR spectra available on request (per batch)",
  "Certificate of Analysis with every order",
  "Worldwide discreet shipping, 50+ countries",
  "Direct support from the synthesis team",
];

export function HomeAbout() {
  return (
    <section id="about" className="mx-auto max-w-[--container-page] px-8 py-[90px]">
      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2">
        {/* Left — copy + verbatim feature list. */}
        <div>
          <h2 className="mb-6 text-h2 font-bold text-text">
            {"In-house synthesis. Real chemist. Verified purity."}
          </h2>
          <p className="mb-4 text-body text-text-muted">
            {"ISRIB Shop is run by a synthetic chemist with a background in medicinal chemistry. Every compound is synthesized in our own lab, not sourced from a bulk supplier and repackaged. Identity and purity are confirmed by ¹H/¹³C NMR before any batch ships."}
          </p>
          <p className="mb-7 text-body text-text-muted">
            {"This is the difference between a lab operation and a white-label vendor: you get the actual compound, characterized, documented, and shipped by the person who made it."}
          </p>
          <ul className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-body text-text">
                <span className="mt-0.5 shrink-0 font-mono text-[15px] font-semibold text-success">
                  {"✓"}
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — NMR proof card (token Card structure). */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          {/* Header. */}
          <div className="flex items-center justify-between border-b border-border-soft bg-surface-soft px-[18px] py-3.5">
            <div>
              <span className="font-mono text-mono-label font-semibold uppercase tracking-[0.06em] text-success">
                {"¹H NMR · ISRIB A15"}
              </span>
              <p className="mt-0.5 text-caption text-text-faint">{"400 MHz · DMSO-d₆ · Batch 2"}</p>
            </div>
            <span className="shrink-0 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-success">
              {"≥98% HPLC"}
            </span>
          </div>

          {/* Spectrum image. */}
          <div className="bg-surface p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- static PNG asset */}
            <img
              src="/images/isrib-a15-nmr-h1.png"
              alt="¹H NMR spectrum of ISRIB A15 — Batch 2"
              className="block h-auto w-full rounded-md"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Key signals — verbatim, mono. */}
          <div className="border-t border-border-soft px-[18px] py-3.5">
            <p className="font-mono text-caption leading-[1.6] text-text-subtle">
              {"δ 7.54 (d, ArH, 2H), 7.24 (d, ArH, 2H), 6.99 (d, ArH, 2H), 4.51 (s, OCH₂, 4H), 3.60 (m, CH, 2H), 1.79 (m, CH₂, 4H), 1.35 (m, CH₂/CH₃, 4H)"}
            </p>
          </div>

          {/* Footer + link. */}
          <div className="flex items-center justify-between border-t border-border-soft bg-surface-soft px-[18px] py-3.5">
            <span className="text-small text-text-subtle">{"¹H + ¹³C · Raw FID available"}</span>
            <a
              href="/products/isrib-a15"
              className="text-small font-semibold text-primary-deep transition hover:text-primary"
            >
              {"View full spectra →"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
