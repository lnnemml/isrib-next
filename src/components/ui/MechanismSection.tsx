import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Class strings verbatim from handoff-spec.md §4 "Five-block mechanism section (dark)"
// (lines 306–325). Step number chips fill, in order:
// bg-cyan-500 / bg-cyan-400 / bg-blue-400 / bg-blue-600 / bg-success (line 321).
const CHIP_COLORS = ["bg-cyan-500", "bg-cyan-400", "bg-blue-400", "bg-blue-600", "bg-success"];

interface MechanismStep {
  title: ReactNode;
  body: ReactNode;
}

interface MechanismSectionProps {
  kicker: ReactNode;
  title: ReactNode;
  body: ReactNode;
  steps: MechanismStep[];
  quote?: ReactNode;
}

export function MechanismSection({ kicker, title, body, steps, quote }: MechanismSectionProps) {
  return (
    <section className="bg-surface-inverse py-24 text-white">
      <div className="mx-auto max-w-[--container-page] px-8">
        <div className="mb-14 max-w-[720px]">
          <p className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-cyan-400">
            {kicker}
          </p>
          <h2 className="mb-5 text-h2 font-bold text-white">{title}</h2>
          <p className="text-body-lg text-slate-400">{body}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div key={i} className="rounded-lg border border-slate-800 bg-surface-inverse-card p-6">
              <div
                className={cn(
                  "mb-4 flex size-[34px] items-center justify-center rounded-[9px] font-mono text-[15px] font-semibold text-[#062a3d]",
                  CHIP_COLORS[i % CHIP_COLORS.length],
                )}
              >
                {i + 1}
              </div>
              <h3 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-white">{s.title}</h3>
              <p className="text-[13px] leading-[1.6] text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
        {quote && (
          <blockquote className="mt-11 max-w-[820px] border-l-2 border-accent pl-6 text-[16px] italic leading-[1.7] text-slate-300">
            {quote}
          </blockquote>
        )}
      </div>
    </section>
  );
}
