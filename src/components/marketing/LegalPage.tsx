import type { ReactNode } from "react";

// Shared prose layout for the four legal pages (Terms / Privacy / Research / Disclaimer).
// Gradient page-title + optional "Last updated" line + a token prose container.
// Content is passed in verbatim from each page's live HTML source.
interface LegalPageProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPage({ title, subtitle, lastUpdated, children }: LegalPageProps) {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{subtitle}</p>
        </div>
      </section>

      {/* Prose */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[70px]">
        <div className="mx-auto max-w-[75ch]">
          {lastUpdated ? (
            <p className="mb-8 text-small text-text-faint">{lastUpdated}</p>
          ) : null}
          {children}
        </div>
      </section>
    </main>
  );
}

// Prose primitives — consistent token styling for the ported legal copy.
export function LegalHeading({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 mt-10 text-h3 font-semibold text-text">{children}</h2>;
}

export function LegalSubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-6 text-body font-semibold text-text">{children}</h3>;
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-body leading-[1.7] text-text-muted">{children}</p>;
}

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-body leading-[1.7] text-text-muted">
      {children}
    </ul>
  );
}

export function LegalStrong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-text">{children}</strong>;
}
