import type { ReactNode } from "react";

// Class strings verbatim from handoff-spec.md §4 "Quote / testimonial block"
// (lines 231–246). Editorial variant swaps the card border for a left rule.
interface QuoteProps {
  children: ReactNode;
  author: ReactNode;
  role: ReactNode;
  avatar?: ReactNode;
  editorial?: boolean;
}

export function Quote({ children, author, role, avatar, editorial = false }: QuoteProps) {
  const figureClass = editorial
    ? "border-l-2 border-accent pl-6"
    : "rounded-xl border border-border bg-surface p-[30px] shadow-sm";

  return (
    <figure className={figureClass}>
      <blockquote className="mb-5 text-[17px] font-medium leading-[1.55] tracking-[-0.01em] text-text">
        {children}
      </blockquote>
      <figcaption className="flex items-center gap-[11px]">
        <span className="size-9 shrink-0 rounded-full bg-slate-200">{avatar}</span>
        <span>
          <span className="block text-[13px] font-semibold text-text">{author}</span>
          <span className="block font-mono text-[11px] text-text-subtle">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
