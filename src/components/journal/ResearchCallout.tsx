import type { ReactNode } from "react";

// Ported from the SEO hub ResearchCallout, restyled onto the locked shop design system.
// Props: a required `source` label, an optional `title` study citation, and callout `children`.
type ResearchCalloutProps = {
  source: string;
  title?: string;
  children: ReactNode;
};

export default function ResearchCallout({ source, title, children }: ResearchCalloutProps) {
  return (
    <div className="my-8 max-w-[42rem] rounded-md border-l-[3px] border-accent bg-accent/5 p-5">
      <div className="mb-2.5 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-accent-strong">
        Research Note
      </div>

      {title ? (
        <div className="mb-1.5 text-[17px] font-semibold leading-[1.4] text-text">{title}</div>
      ) : null}

      <div className="text-[17px] italic leading-[1.7] text-text">{children}</div>

      <div className="mt-2.5 text-[0.8rem] text-text-muted">{source}</div>
    </div>
  );
}
