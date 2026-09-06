"use client";

import { useState } from "react";
import type { TOCItem } from "@/lib/journal/toc";

// Ported from the SEO hub MobileTOC, restyled onto the locked shop design system.
// Floating button + bottom drawer. The hardcoded teal shadow (rgba(13,107,107,0.25))
// has been removed in favor of the token-based --shadow-md elevation.
type MobileTOCProps = {
  items: TOCItem[];
};

export default function MobileTOC({ items }: MobileTOCProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const close = () => setOpen(false);

  const handleItemClick = (id: string) => {
    close();
    // Brief timeout lets the drawer close before scroll fires.
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-[997] bg-black/30 transition-opacity duration-200"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Table of contents"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-[998] max-h-[60vh] overflow-y-auto border-t border-border bg-surface p-6 shadow-md transition-transform"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="mb-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-muted">
          Contents
        </div>

        <ol className="m-0 list-none p-0">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
              <button
                onClick={() => handleItemClick(item.id)}
                className="block w-full cursor-pointer border-none bg-transparent py-1 text-left text-[0.9375rem] leading-[1.8] text-text"
              >
                {item.text}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-toc-drawer"
        className="fixed right-6 bottom-6 z-[999] cursor-pointer rounded-full border-none bg-accent px-4 py-2.5 text-[0.875rem] font-medium text-[#ffffff] shadow-md"
      >
        {open ? "Close ✕" : "Contents ↑"}
      </button>
    </>
  );
}
