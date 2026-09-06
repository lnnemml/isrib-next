import type { ReactNode } from "react";
import Link from "next/link";

// Journal sub-brand masthead / sub-nav (ADR 0015 — "The Synthesis Lab" editorial
// treatment). The global marketing Header/Footer come from the ROOT layout via
// ChromeGate; this only adds the slim journal bar above {children}. Built on the
// locked shop design tokens (surface/border/text-muted, font-mono labels).

const CLUSTER_LINKS: { label: string; slug: string }[] = [
  { label: "Compare", slug: "compare" },
  { label: "Guide", slug: "guide" },
  { label: "Science", slug: "science" },
  { label: "Blog", slug: "blog" },
];

export default function JournalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="border-b border-border bg-surface-soft">
        <div className="mx-auto flex max-w-[--container-page] flex-col gap-3 px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/journal" className="flex items-center gap-2.5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-strong">
              The Synthesis Lab
            </span>
            <span aria-hidden="true" className="text-text-faint">
              /
            </span>
            <span className="text-[0.9375rem] font-semibold text-text">Journal</span>
          </Link>

          <nav aria-label="Journal clusters">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {CLUSTER_LINKS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/journal/${c.slug}`}
                    className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-text-muted transition hover:text-text"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {children}
    </>
  );
}
