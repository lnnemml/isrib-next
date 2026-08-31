import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// Class strings verbatim from handoff-spec.md §4 "Buttons" (lines 194–214).
type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 disabled:pointer-events-none max-sm:w-full",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-surface px-[22px] py-3 text-[15px] font-semibold text-primary-deep transition hover:border-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 max-sm:w-full",
  ghost:
    "inline-flex items-center gap-1.5 rounded-md px-4 py-3 text-[15px] font-semibold text-slate-700 transition hover:text-primary",
};

// Disabled has its own distinct treatment in the spec, independent of variant.
const DISABLED_CLASSES =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-slate-100 px-[22px] py-3 text-[15px] font-semibold text-slate-400 cursor-not-allowed";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(disabled ? DISABLED_CLASSES : VARIANT_CLASSES[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
