import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";

// Quality Control page — faithful port of the live quality page on the locked
// design system. Header/Footer are global (root layout); this page renders only
// the page body. Static server component — no analytics, forms, or client code.
const HERO_SUBTITLE =
  "High-purity compounds for laboratory research. Each batch is verified and traceable.";

export function generateMetadata(): Metadata {
  return {
    title: "Quality Control | ISRIB A15",
    description:
      "How we ensure compound quality and purity: LC-MS, NMR, retention samples, secure packaging. Research use only.",
  };
}

export default function QualityPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"Quality Control"}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{HERO_SUBTITLE}</p>
        </div>
      </section>

      {/* 3-card grid */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <h3 className="mb-3 text-h3 font-semibold text-text">{"Batch Testing"}</h3>
            <ul className="list-disc space-y-2 pl-5 text-small text-text-muted">
              <li>
                <strong className="font-semibold text-text">{"LC-MS"}</strong>
                {" (Liquid Chromatography–Mass Spectrometry)"}
              </li>
              <li>
                <strong className="font-semibold text-text">{"NMR"}</strong>
                {" (Nuclear Magnetic Resonance)"}
              </li>
              <li>
                <strong className="font-semibold text-text">{"Melting point"}</strong>
                {" where applicable"}
              </li>
              <li>
                <strong className="font-semibold text-text">{"Visual inspection"}</strong>
                {" under lab lighting"}
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 text-h3 font-semibold text-text">
              {"Retention & Documentation"}
            </h3>
            <p className="text-small text-text-muted">
              {"Reference samples retained per batch; internal records for traceability; climate-controlled storage with desiccant."}
            </p>
          </Card>

          <Card>
            <h3 className="mb-3 text-h3 font-semibold text-text">{"Packaging & Handling"}</h3>
            <p className="text-small text-text-muted">
              {"Inert, UV-protective containers; vacuum-sealed where needed; clear labels and documentation (CoA or batch ID)."}
            </p>
          </Card>
        </div>
      </section>

      {/* Research-Use-Only callout */}
      <section className="mx-auto max-w-[--container-page] px-8 pb-[90px]">
        <Card className="border-l-4 border-l-primary bg-surface-soft">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-small font-semibold text-primary-deep">
            {"Research Use Only"}
          </span>
          <p className="mt-3 text-small text-text-muted">
            {"We do not authorize any substance for human/animal consumption, diagnostic or therapeutic use."}
          </p>
        </Card>
      </section>

      {/* CTA button row */}
      <section className="mx-auto max-w-[--container-page] px-8 pb-[90px]">
        <div className="flex flex-wrap gap-4">
          <a href="/products">
            <Button variant="secondary">{"← Back to Products"}</Button>
          </a>
          <a href="/contact">
            <Button variant="primary">{"Request CoA"}</Button>
          </a>
        </div>
      </section>
    </main>
  );
}
