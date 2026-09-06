import type { ReactNode } from "react";

// Ported from the SEO hub UserQuote, restyled onto the locked shop design system.
// Editorial quote treatment mirrors ui/Quote's editorial variant (left accent rule).
// Props match the source exactly.
type UserQuoteProps = {
  source?: string;
  year?: string;
  children: ReactNode;
};

export default function UserQuote({ source, year, children }: UserQuoteProps) {
  return (
    <figure className="my-8 max-w-[42rem] border-l-2 border-accent pl-6">
      <blockquote className="text-[1.2rem] leading-[1.7] text-text">{children}</blockquote>

      {source && (
        <figcaption className="mt-2.5 font-mono text-[0.8rem] text-text-muted">
          — {source}
          {year ? `, ${year}` : ""}
        </figcaption>
      )}
    </figure>
  );
}
