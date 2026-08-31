import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  Button,
  Card,
  Quote,
  ProductHero,
  HeroStat,
  NmrSection,
  MechanismSection,
  ComparisonTable,
  FaqAccordion,
  CheckoutStepper,
  PaymentSelector,
} from "@/components/ui";

// Dev-only preview. Render nothing on the production domain — VERCEL_ENV, NOT NODE_ENV:
// preview builds run NODE_ENV=production, so a NODE_ENV check would 404 previews too.
// This guard is what keeps the page off the live site after cutover; robots.ts is only
// a courtesy signal.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border-soft py-14">
      <h2 className="mb-6 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-accent-strong">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function KitchenSinkPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-[--container-page] px-8 py-16">
      <header className="mb-8">
        <h1 className="text-h1 font-bold">{"Kitchen sink — UI component library"}</h1>
        <p className="mt-3 text-body text-text-muted">
          {"Every component from handoff-spec §4, all states. Dev-only preview."}
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">{"Order ISRIB A15"}</Button>
          <Button variant="secondary">{"Read the mechanism"}</Button>
          <Button variant="ghost">{"Ghost link →"}</Button>
          <Button disabled>{"Disabled"}</Button>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <h3 className="text-h3 font-semibold">{"Base card"}</h3>
            <p className="mt-2 text-body text-text-muted">{"Hairline border, soft shadow."}</p>
          </Card>
          <Card accent>
            <h3 className="text-h3 font-semibold">{"Accent card"}</h3>
            <p className="mt-2 text-body text-text-muted">{"Cyan precision rule on top."}</p>
          </Card>
          <Card inverse>
            <h3 className="text-h3 font-semibold">{"Inverted card"}</h3>
            <p className="mt-2 text-slate-400">{"For dark sections."}</p>
          </Card>
        </div>
      </Section>

      <Section title="Quote / testimonial (card + editorial)">
        <div className="grid gap-6 sm:grid-cols-2">
          <Quote author="D. Reyes" role="ML researcher · 100mg protocol">
            {"Three weeks in, the 3pm wall is gone."}
          </Quote>
          <Quote author="A. Novak" role="Neuroscience PhD" editorial>
            {"The mechanism is the honest part — no hand-waving."}
          </Quote>
        </div>
      </Section>

      <Section title="Product hero (formula SVG slot)">
        <ProductHero
          kicker="Research compound · not a supplement"
          title={
            <>
              {"Your brain isn't broken."}
              <br />
              <span className="text-primary">{"It's stuck."}</span>
            </>
          }
          body="A15 is an eIF2B-stabilising ISR inhibitor built for sustained cognitive output."
          cta={
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">{"Order ISRIB A15"}</Button>
              <Button variant="secondary">{"Read the mechanism"}</Button>
            </div>
          }
          stats={
            <div className="mt-8 flex gap-10">
              <HeroStat figure="EC₅₀ 0.8 nM" label="Potency" />
              <HeroStat figure="≥98%" label="HPLC purity" />
            </div>
          }
          formula={
            <div className="flex aspect-video items-center justify-center font-mono text-[13px] text-text-faint">
              {"[ formula SVG slot — /images/isrib-a15-formula.svg ]"}
            </div>
          }
        />
      </Section>

      <Section title="NMR section (click a spectrum → lightbox)">
        <NmrSection
          spectra={[
            {
              label: "¹H NMR",
              hint: "DMSO-d₆ · click to zoom",
              src: "/images/isrib-a15-nmr-h1.png",
              alt: "1H NMR spectrum of ISRIB A15",
            },
            {
              label: "¹³C NMR",
              hint: "DMSO-d₆ · click to zoom",
              src: "/images/isrib-a15-nmr-c13.png",
              alt: "13C NMR spectrum of ISRIB A15",
            },
          ]}
          downloads={[
            { href: "/files/isrib-a15_1H_dmso.fid", filename: "isrib-a15_1H_dmso.fid", label: "↓ FID" },
            { href: "/files/isrib-a15_coa.pdf", filename: "isrib-a15_coa.pdf", label: "↓ COA" },
          ]}
        />
      </Section>

      <Section title="Mechanism (five-block, dark)">
        <MechanismSection
          kicker="The mechanism · the brake"
          title="A15 is a molecular staple for eIF2B."
          body="Five steps from stress to sustained output."
          steps={[
            { title: "Stress hits", body: "The integrated stress response fires." },
            { title: "eIF2 phosphorylated", body: "Translation initiation stalls." },
            { title: "eIF2B slows", body: "The exchange factor is inhibited." },
            { title: "A15 stabilises", body: "The staple holds eIF2B together." },
            { title: "Output restored", body: "Protein synthesis resumes." },
          ]}
          quote="The brake comes off — without flooring the accelerator."
        />
      </Section>

      <Section title="Comparison table (highlighted ISRIB column)">
        <ComparisonTable
          columns={[
            { label: "Modafinil" },
            { label: "Racetams" },
            { label: "Peptides / Qualia" },
            { label: "ISRIB A15", highlight: true },
          ]}
          rows={[
            {
              label: "Mechanism",
              cells: [
                { value: "↑ dopamine/histamine" },
                { value: "Cholinergic modulation" },
                { value: "Broad, diffuse stack" },
                { value: "Stabilizes eIF2B" },
              ],
            },
            {
              label: "Potency",
              cells: [
                { value: "µM range", mono: true },
                { value: "mM range", mono: true },
                { value: "Varies", mono: true },
                { value: "EC₅₀ 0.8 nM", mono: true },
              ],
            },
          ]}
        />
      </Section>

      <Section title="FAQ accordion (click to toggle)">
        <FaqAccordion
          items={[
            { q: "Is this a supplement?", a: "No. It's a research compound, sold for research use." },
            { q: "How is it shipped?", a: "Discreetly, with a certificate of analysis." },
            { q: "What is the mechanism?", a: "A15 stabilises eIF2B to dampen the integrated stress response." },
          ]}
        />
      </Section>

      <Section title="Checkout stepper (complete / active / upcoming)">
        <CheckoutStepper
          steps={[
            { label: "Details", status: "complete" },
            { label: "Payment", status: "active" },
            { label: "Confirm", status: "upcoming" },
          ]}
        />
      </Section>

      <Section title="Payment-method selector (crypto default · manual · card disabled)">
        <div className="max-w-[520px]">
          <PaymentSelector />
        </div>
      </Section>
    </main>
  );
}
