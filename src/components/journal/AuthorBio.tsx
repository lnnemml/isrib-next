import Link from "next/link";

// Ported from the SEO hub AuthorBio, restyled onto the locked shop design system.
// Avatar circle uses the accent token; profile link points to the internal journal route.
export default function AuthorBio() {
  return (
    <div className="mt-8 flex max-w-[42rem] items-start gap-4 border-t border-border pt-6">
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[0.875rem] font-medium text-accent-strong"
      >
        SL
      </div>

      <div>
        <div className="mb-0.5 text-[0.9375rem] font-semibold text-text">
          The Synthesis Lab
        </div>

        <div className="mb-2.5 text-[0.8rem] text-text-muted">
          Pharmaceutical chemist · Small-molecule synthesis · Independent ISRIB A15 researcher
        </div>

        <p className="mb-2 max-w-none text-[0.875rem] leading-[1.6] text-text">
          One of the earliest independent synthesizers of ISRIB A15. Background in medicinal
          chemistry and small-molecule synthesis. Writing about compounds I&apos;ve actually made.
        </p>

        <Link href="/journal/author" className="text-[0.875rem] font-medium text-accent-strong hover:text-accent">
          Full profile →
        </Link>
      </div>
    </div>
  );
}
