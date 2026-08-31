"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// Class strings verbatim from handoff-spec.md §4 "FAQ accordion" (lines 362–375).
// The answer <p> is mounted only when its item is open.
interface FaqItem {
  q: ReactNode;
  a: ReactNode;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border-t border-border">
      {items.map((f, i) => (
        <div key={i} className="border-b border-border">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-5 py-[22px] text-left"
          >
            <span className="text-[18px] font-semibold tracking-[-0.01em] text-text">{f.q}</span>
            <span className="shrink-0 font-mono text-[20px] leading-none text-primary">
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <p className="m-0 pb-[26px] pr-10 text-[16px] leading-[1.7] text-text-muted">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
