import { Fragment } from "react";
import type { ReactNode } from "react";

// Class strings verbatim from handoff-spec.md §4 "Checkout steps (stepper)"
// (lines 381–401). Completed step swaps the number chip for bg-success text-white with
// a ✓ (line 401). The spec does not give a distinct completed *label* colour, so a
// completed label reuses the active label treatment (font-semibold text-text) — flagged
// for review.
type StepStatus = "active" | "upcoming" | "complete";

interface Step {
  label: ReactNode;
  status: StepStatus;
}

const CHIP_CLASSES: Record<StepStatus, string> = {
  active:
    "flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white",
  upcoming:
    "flex size-6 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-text-faint",
  complete:
    "flex size-6 items-center justify-center rounded-full bg-success text-[11px] font-semibold text-white",
};

const LABEL_CLASSES: Record<StepStatus, string> = {
  active: "font-semibold text-text",
  upcoming: "text-text-faint",
  complete: "font-semibold text-text",
};

export function CheckoutStepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex items-center gap-3 font-mono text-[12px]">
      {steps.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="h-px w-8 bg-border" />}
          <li className="flex items-center gap-2">
            <span className={CHIP_CLASSES[s.status]}>{s.status === "complete" ? "✓" : i + 1}</span>
            <span className={LABEL_CLASSES[s.status]}>{s.label}</span>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
