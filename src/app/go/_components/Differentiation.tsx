"use client";

import { Button } from "@/components/ui";

// S4 · Differentiation (comparison · ch12) [B3]. Anonymized competitor columns (no rx
// brand names) — beat them on the one axis the buyer cares about: mechanism/target.
// The A15 column is highlighted (bg-blue-50 header, bg-[#f8faff] body cells per
// handoff-spec). Mechanism/target cells use font-mono. Repeated CTA after the table
// (deck: plant a CTA after Differentiation). Copy verbatim from S4 + FINAL VOICED LINES.

type Row = {
  label: string;
  stimulants: string;
  racetams: string;
  adaptogens: string;
  a15: string;
  mono?: boolean;
};

const ROWS: Row[] = [
  {
    label: "Mechanism",
    stimulants: "↑ dopamine / histamine",
    racetams: "cholinergic modulation",
    adaptogens: "broad, diffuse support",
    a15: "stabilizes eIF2B",
    mono: true,
  },
  {
    label: "What it touches",
    stimulants: "neurotransmitter levels",
    racetams: "neurotransmitter levels",
    adaptogens: 'general "support"',
    a15: "the protein-synthesis switch",
    mono: true,
  },
  {
    label: "Feel",
    stimulants: "stimulation + comedown",
    racetams: "subtle",
    adaptogens: "variable",
    a15: "quiet, non-stimulant",
  },
  {
    label: "Category",
    stimulants: "drug",
    racetams: "nootropic",
    adaptogens: "supplement",
    a15: "research compound",
  },
];

export default function Differentiation() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-surface py-[90px]">
      <div className="mx-auto max-w-[--container-page] px-8">
        <div className="mb-10 max-w-[720px]">
          <p className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-accent-strong">
            Why It's Different
          </p>
          <h2 className="text-h2 font-bold">
            You've tried what moves your neurotransmitters. You haven't tried what releases the
            brake.
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px] overflow-hidden rounded-xl border border-border shadow-sm">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-[22%] px-6 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint" />
                  <th className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">
                    Prescription stimulants
                  </th>
                  <th className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">
                    Racetams
                  </th>
                  <th className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">
                    Adaptogen stacks
                  </th>
                  <th className="bg-blue-50 px-6 py-4 text-left text-[14px] font-bold text-primary-deep">
                    ISRIB A15
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border-soft last:border-b-0">
                    <td className="px-6 py-4 font-medium text-slate-700">{row.label}</td>
                    <td className="px-5 py-4 text-text-subtle">{row.stimulants}</td>
                    <td className="px-5 py-4 text-text-subtle">{row.racetams}</td>
                    <td className="px-5 py-4 text-text-subtle">{row.adaptogens}</td>
                    <td
                      className={`bg-[#f8faff] px-6 py-4 font-semibold text-text ${
                        row.mono ? "font-mono" : ""
                      }`}
                    >
                      {row.a15}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => scrollTo("offer")}>
            Order ISRIB A15 →
          </Button>
        </div>
      </div>
    </section>
  );
}
