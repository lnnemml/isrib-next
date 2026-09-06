"use client";

import { useEffect, useState } from "react";
import type { TOCItem } from "@/lib/journal/toc";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils/cn";

// Ported from the SEO hub TOC, restyled onto the locked shop design system.
// Sticky sidebar with IntersectionObserver active-highlight; active link in accent.
type TOCProps = {
  items: TOCItem[];
};

export default function TOC({ items }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const headingIds = items.map((i) => i.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <div className="mb-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-muted">
        Contents
      </div>

      <ol className="m-0 list-none p-0">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-0.5 text-[0.875rem] leading-[1.6] no-underline transition-colors",
                activeId === item.id ? "text-accent" : "text-text-muted hover:text-text"
              )}
              onClick={() => {
                trackEvent("journal_toc_click", { toc_heading: item.text });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
