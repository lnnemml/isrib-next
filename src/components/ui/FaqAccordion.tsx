"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

// Class strings verbatim from handoff-spec.md §4 "FAQ accordion" (lines 362–375).
// The answer <p> is mounted only when its item is open.
interface FaqItem {
  q: ReactNode;
  a: ReactNode;
  // Optional deep-link anchor. Rendered as an id on the item wrapper so /faq#<id>
  // scrolls to it; if it matches the URL hash on load, the item auto-opens.
  id?: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  // Nice-to-have: on load (and on hashchange) auto-open the item whose id matches the
  // URL hash, so a deep link like /faq#isrib-a15 lands with that answer expanded.
  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const idx = items.findIndex((it) => it.id === hash);
      if (idx !== -1) setOpen(idx);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items]);

  return (
    <div className="border-t border-border">
      {items.map((f, i) => (
        <div key={i} id={f.id} className="scroll-mt-24 border-b border-border">
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
