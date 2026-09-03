import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";

// About page — faithful port of the live about.html on the locked design system.
// Header/Footer are global (root layout); this page renders only the page body.
//
// Compliance: the Certificate of Analysis card is reframed from the live
// "COA included with every order" to the site-wide "on request" framing (variant A;
// see ADR 0008 / task brief). All other copy is verbatim from about.html.
const HERO_SUBTITLE =
  "In-house synthesis since 2020. First to make ISRIB A15 available as a research compound. Every batch characterized and documented before it ships.";

export function generateMetadata(): Metadata {
  return {
    title: "About | ISRIB A15",
    description: HERO_SUBTITLE,
  };
}

// Quality-commitment cards — verbatim EXCEPT the COA card (reframed "on request").
const QUALITY: { icon: string; title: string; body: string }[] = [
  {
    icon: "🧪",
    title: "In-House Synthesis",
    body: "Every compound is synthesized in our own lab — not sourced from a bulk supplier and repackaged. We control the entire process from reaction to final product.",
  },
  {
    icon: "📋",
    title: "Certificate of Analysis",
    // Reframed per variant A — COA is "on request", never "included".
    body: "Batch-specific COA available on request; purity confirmed by NMR before any batch ships.",
  },
  {
    icon: "🔬",
    title: "NMR Verification",
    body: "¹H and ¹³C NMR spectra available on request for every batch. Raw FID data downloadable — independently verifiable in MestReNova or TopSpin.",
  },
  {
    icon: "⚗️",
    title: "Independent QC",
    body: "NMR characterization performed by an independent third-party spectroscopist. Not self-reported — externally confirmed on every batch.",
  },
  {
    icon: "📦",
    title: "Discreet Packaging",
    body: "Every order ships in secure, discreet packaging with tracking. Delivered to 50+ countries, average 7–12 business days.",
  },
  {
    icon: "💬",
    title: "Direct Support",
    body: "Support via Email, Telegram, or Signal — directly from the synthesis team. No call centers, no automated responses.",
  },
];

// Values — verbatim.
const VALUES: { icon: string; title: string; body: string }[] = [
  {
    icon: "🎯",
    title: "Scientific Integrity",
    body: "We maintain the highest ethical standards in all our operations, from synthesis to personal customer interactions.",
  },
  {
    icon: "🔍",
    title: "Transparency",
    body: "Complete documentation and open communication about our processes, quality standards, and pricing.",
  },
  {
    icon: "🚀",
    title: "Innovation Support",
    body: "Empowering researchers to push the boundaries of scientific knowledge through quality compounds and personal support.",
  },
];

// Why researchers choose us — verbatim numbered reasons.
const REASONS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "First to Synthesize ISRIB A15",
    body: "In 2023, ISRIB A15 existed only in academic literature. We were the first to synthesize it as a DTC research compound — and remain the only source for it today.",
  },
  {
    n: "2",
    title: "Full Traceability",
    body: "Every batch has a COA, NMR spectra, and downloadable raw FID data. You can verify what you receive independently — not just take our word for it.",
  },
  {
    n: "3",
    title: "Direct Line",
    body: "Support comes directly from the person who synthesized the compound. Questions about the chemistry get answered by someone who actually knows the chemistry.",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"About ISRIB Shop"}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{HERO_SUBTITLE}</p>
        </div>
      </section>

      {/* Our Mission — 2-col */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-h2 font-bold text-text">{"Our Mission"}</h2>
            <p className="mb-4 text-body text-text-muted">
              {"ISRIB Shop exists to make hard-to-source research compounds accessible — synthesized in-house, characterized by NMR, and shipped with full documentation. No intermediaries, no repackaged bulk material."}
            </p>
            <p className="text-body text-text-muted">
              {"Every compound we sell is made from scratch in our own lab. Identity and purity are confirmed before any batch ships. That's the standard we hold ourselves to on every order."}
            </p>
          </div>
          <Card accent className="text-center">
            <div className="mb-4 text-[44px] leading-none">{"🧪"}</div>
            <h3 className="mb-2 text-h3 font-semibold text-text">{"In-House Synthesis"}</h3>
            <p className="text-body text-text-muted">
              {"Every compound synthesized and characterized in our own lab. Not sourced — made from scratch."}
            </p>
          </Card>
        </div>
      </section>

      {/* Our Story — narrow centered, surface-soft */}
      <section className="border-y border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-[90px]">
          <div className="mx-auto max-w-[70ch] text-center">
            <h2 className="mb-6 text-h2 font-bold text-text">{"Our Story"}</h2>
            <p className="mb-4 text-body text-text-muted">
              {"ISRIB Shop launched in 2020 as one of the first vendors to make trans-ISRIB available direct-to-consumer at accessible prices — at a time when the compound was either unavailable or priced for institutional budgets only."}
            </p>
            <p className="mb-4 text-body text-text-muted">
              {"In 2023, we went further. ISRIB A15 existed only in academic literature — referenced in SAR studies as the highest-potency eIF2B activator in the series, but unavailable as a research compound anywhere. We identified it through computational modeling, synthesized it, and confirmed identity by ¹H/¹³C NMR. We remain the only DTC source for ISRIB A15."}
            </p>
            <p className="text-body text-text-muted">
              {"Every compound we sell is synthesized in-house. Not sourced, not repackaged — made from scratch and characterized before it ships."}
            </p>
          </div>
        </div>
      </section>

      {/* Our Quality Commitment — 6-card grid */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <h2 className="mb-12 text-center text-h2 font-bold text-text">
          {"Our Quality Commitment"}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {QUALITY.map((c) => (
            <Card key={c.title} className="flex flex-col">
              <h3 className="mb-2 text-h3 font-semibold text-text">
                <span className="mr-2">{c.icon}</span>
                {c.title}
              </h3>
              <p className="text-small leading-[1.6] text-text-muted">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Our Values — 3 cards */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[--container-page] px-8 py-[90px]">
          <h2 className="mb-12 text-center text-h2 font-bold text-text">{"Our Values"}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <Card key={v.title} className="flex flex-col text-center">
                <div className="mb-4 text-[32px] leading-none">{v.icon}</div>
                <h3 className="mb-2 text-h3 font-semibold text-text">{v.title}</h3>
                <p className="text-small leading-[1.6] text-text-muted">{v.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Researchers Choose ISRIB Shop — 3 numbered reasons, surface-soft */}
      <section className="border-y border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-[90px]">
          <h2 className="mb-12 text-center text-h2 font-bold text-text">
            {"Why Researchers Choose ISRIB Shop"}
          </h2>
          <div className="mx-auto flex max-w-[820px] flex-col gap-8">
            {REASONS.map((r) => (
              <div key={r.n} className="flex items-start gap-5">
                <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] bg-primary font-mono text-[17px] font-semibold text-white">
                  {r.n}
                </span>
                <div>
                  <h3 className="mb-1.5 text-h3 font-semibold text-text">{r.title}</h3>
                  <p className="text-body text-text-muted">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band — dark (inverse Card) */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <Card inverse className="p-[52px] text-center">
          <h2 className="text-h2 font-bold text-white">{"Browse the Catalog"}</h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-body text-slate-300">
            {"All compounds in stock, synthesized in-house, shipped with full documentation."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/products">
              <Button variant="secondary">{"Browse Products"}</Button>
            </a>
            <a href="/contact">
              <Button variant="primary">{"Get in Touch"}</Button>
            </a>
          </div>
        </Card>
      </section>
    </main>
  );
}
