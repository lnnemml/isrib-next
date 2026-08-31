import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// Class strings verbatim from handoff-spec.md §4 "Card & accent card" (lines 218–227).
const BASE = "rounded-xl border border-border bg-surface p-[26px] shadow-sm";
const ACCENT =
  "rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-[26px] shadow-sm";
const INVERSE = "rounded-xl border border-slate-800 bg-surface-inverse p-[26px] text-white";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  inverse?: boolean;
}

export function Card({ accent = false, inverse = false, className, children, ...props }: CardProps) {
  const base = inverse ? INVERSE : accent ? ACCENT : BASE;
  return (
    <div className={cn(base, className)} {...props}>
      {children}
    </div>
  );
}
