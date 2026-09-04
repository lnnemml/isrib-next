import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";

// Safety Guidelines page — faithful port of the live safety page on the locked
// design system. Header/Footer are global (root layout); this page renders only
// the page body. Static server component — no analytics, forms, or client code.
const HERO_SUBTITLE =
  "Compounds are intended strictly for laboratory/in vitro research use. Handle by trained personnel only.";

export function generateMetadata(): Metadata {
  return {
    title: "Safety Guidelines | ISRIB A15",
    description:
      "Basic safety recommendations for handling research compounds purchased from ISRIB Shop. Research use only.",
  };
}

export default function SafetyPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"Safety Guidelines"}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{HERO_SUBTITLE}</p>
        </div>
      </section>

      {/* Stacked content cards */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <div className="mx-auto flex max-w-[820px] flex-col gap-6">
          <Card>
            <h2 className="mb-3 text-h3 font-semibold text-text">
              {"General Laboratory Safety"}
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-body text-text-muted">
              <li>
                {"Wear appropriate "}
                <strong className="font-semibold text-text">{"PPE"}</strong>
                {": lab coat, gloves, protective eyewear."}
              </li>
              <li>{"Work in a well-ventilated area or fume hood."}</li>
              <li>
                {"Store materials in clearly labeled containers, away from incompatible substances."}
              </li>
              <li>
                {"Follow good laboratory practices (GLP) during handling, storage, and disposal."}
              </li>
            </ul>
            <div className="mt-4 rounded-lg border-l-4 border-l-primary bg-surface-soft p-4">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-small font-semibold text-primary-deep">
                {"Research Use Only"}
              </span>
              <p className="mt-2 text-small text-text-muted">
                {"Not for human or animal consumption, diagnostic or therapeutic use."}
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-h3 font-semibold text-text">{"Spill & Exposure"}</h2>
            <p className="text-body leading-[1.7] text-text-muted">
              {"If a spill occurs, contain and clean it immediately using appropriate absorbents and lab safety protocols. In case of accidental exposure, rinse the affected area with water and seek professional medical assistance. Provide safety data sheets if available."}
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-h3 font-semibold text-text">{"Storage Conditions"}</h2>
            <p className="text-body leading-[1.7] text-text-muted">
              {"Store compounds in a cool, dry place, away from light and moisture. Use desiccators or sealed containers when necessary. Avoid repeated opening of bulk containers — aliquot smaller quantities for routine use."}
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-h3 font-semibold text-text">{"Responsibility"}</h2>
            <p className="text-body leading-[1.7] text-text-muted">
              {"ISRIB.shop is not responsible for improper handling or misuse of any compound sold. Buyers assume full responsibility for complying with all local regulations, laboratory protocols, and institutional safety requirements."}
            </p>
          </Card>

          {/* CTA button row */}
          <div className="flex flex-wrap gap-4">
            <a href="/products">
              <Button variant="secondary">{"← Back to Products"}</Button>
            </a>
            <a href="/quality">
              <Button variant="secondary">{"Quality & CoA"}</Button>
            </a>
            <a href="/disclaimer">
              <Button variant="secondary">{"Disclaimer"}</Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
