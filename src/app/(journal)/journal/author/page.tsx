import type { Metadata } from "next";
import Link from "next/link";

// E-E-A-T author page for the pseudonymous "The Synthesis Lab" author. This is a STATIC
// segment, so it takes precedence over [cluster] — intended. Never reveal a real identity.
export function generateMetadata(): Metadata {
  return {
    title: "The Synthesis Lab | Journal | ISRIB A15",
    description:
      "The Synthesis Lab — a pharmaceutical chemist specialising in small-molecule synthesis and independent ISRIB A15 research. About the author behind the Journal.",
  };
}

const EXPERTISE: { title: string; body: string }[] = [
  {
    title: "Small-molecule synthesis",
    body: "Hands-on synthesis and purification of research compounds, with structure and purity verified batch-by-batch via ¹H and ¹³C NMR.",
  },
  {
    title: "The integrated stress response",
    body: "A working focus on the ISR pathway — eIF2B, eIF2α phosphorylation, and how ISRIB A15 stabilises translation under cellular stress.",
  },
  {
    title: "Independent research",
    body: "Self-directed study of ISRIB A15's chemistry and reported effects, drawing on the published literature rather than commercial marketing.",
  },
];

export default function AuthorPage() {
  return (
    <div className="mx-auto max-w-[--container-page] px-8 pt-12 pb-16">
      <nav aria-label="Breadcrumb" className="mb-4 text-[0.875rem] text-text-muted">
        <Link href="/journal" className="hover:text-text">
          Journal
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <span>Author</span>
      </nav>

      <header className="max-w-[52rem]">
        <div className="mb-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-accent-strong">
          The Synthesis Lab
        </div>
        <h1 className="mb-3 text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.03em] text-text">
          About the author
        </h1>
        <p className="font-mono text-[0.8125rem] text-text-muted">
          Pharmaceutical chemist · Small-molecule synthesis · Independent ISRIB A15 researcher
        </p>
      </header>

      <div className="mt-8 max-w-[52rem] space-y-5 text-[1.0625rem] leading-[1.7] text-text-muted">
        <p>
          The Synthesis Lab is the pseudonym of a pharmaceutical chemist who makes and studies
          ISRIB A15. The Journal is written to explain the compound honestly — its chemistry, its
          proposed mechanism, and how it compares to other cognitive compounds — from the
          perspective of someone who works with it directly rather than markets it.
        </p>
        <p>
          The pseudonym is deliberate. Research compounds occupy a sensitive space, and anonymity
          keeps the focus on the science and on what can be verified — batch NMR data, published
          literature, and reproducible protocols — rather than on a personal brand.
        </p>
      </div>

      <section className="mt-12 max-w-[52rem]">
        <h2 className="mb-5 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-muted">
          Areas of focus
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {EXPERTISE.map((item) => (
            <div key={item.title} className="rounded-md border border-border bg-surface p-5">
              <h3 className="mb-2 text-[1rem] font-semibold text-text">{item.title}</h3>
              <p className="text-[0.9375rem] leading-[1.6] text-text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-accent-strong transition hover:text-accent"
        >
          ← Back to the Journal
        </Link>
      </div>
    </div>
  );
}
