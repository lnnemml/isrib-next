import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, type JournalCluster } from "@/lib/journal/mdx";

export function generateMetadata(): Metadata {
  return {
    title: "Journal | ISRIB A15",
    description:
      "The Synthesis Lab Journal — comparisons, protocols, and mechanism deep-dives on ISRIB A15 and the integrated stress response, written by a pharmaceutical chemist.",
  };
}

// Cluster cards. Only clusters that currently hold content are linked (never link a
// zero-article cluster to a 404). A cluster with no articles renders as a non-linked
// "coming soon" card so the editorial map reads complete without dangling to a missing
// route.
const CLUSTER_CARDS: { slug: JournalCluster; label: string; blurb: string }[] = [
  {
    slug: "compare",
    label: "Compare",
    blurb: "How ISRIB A15 stacks up against modafinil, racetams, noopept, and more.",
  },
  {
    slug: "guide",
    label: "Guide",
    blurb: "Practical protocols — dosing, timing, stacking, and what to expect.",
  },
  {
    slug: "science",
    label: "Science",
    blurb: "The mechanism: the integrated stress response and eIF2B stabilisation.",
  },
  {
    slug: "blog",
    label: "Blog",
    blurb: "Field notes on brain fog, burnout, and cognitive recovery.",
  },
  {
    slug: "tbi",
    label: "TBI",
    blurb: "What the preclinical research shows on ISRIB, the integrated stress response, and recovery after brain injury.",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function JournalHomePage() {
  const articles = getAllArticles();
  const clustersWithContent = new Set(articles.map((a) => a.cluster));
  const recent = articles.slice(0, 6);

  return (
    <div className="mx-auto max-w-[--container-page] px-8 pt-12 pb-16">
      {/* Masthead intro */}
      <header className="max-w-[52rem]">
        <div className="mb-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-accent-strong">
          The Synthesis Lab
        </div>
        <h1 className="mb-4 text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-text">
          Journal
        </h1>
        <p className="text-[1.125rem] leading-[1.7] text-text-muted">
          Comparisons, protocols, and mechanism deep-dives on ISRIB A15 and the integrated
          stress response — written by a pharmaceutical chemist who makes and studies the
          compound.
        </p>
      </header>

      {/* Cluster cards */}
      <section className="mt-12">
        <h2 className="mb-5 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-muted">
          Sections
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CLUSTER_CARDS.map((c) => {
            const count = articles.filter((a) => a.cluster === c.slug).length;
            const available = clustersWithContent.has(c.slug) && count > 0;
            const inner = (
              <>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="text-[1.125rem] font-semibold text-text">{c.label}</span>
                  <span className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-text-faint">
                    {available
                      ? `${count} ${count === 1 ? "article" : "articles"}`
                      : "Coming soon"}
                  </span>
                </div>
                <p className="text-[0.9375rem] leading-[1.6] text-text-muted">{c.blurb}</p>
              </>
            );

            return available ? (
              <Link
                key={c.slug}
                href={`/journal/${c.slug}`}
                className="rounded-md border border-border bg-surface p-5 no-underline transition hover:border-accent hover:bg-surface-soft"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={c.slug}
                aria-disabled="true"
                className="rounded-md border border-dashed border-border bg-surface-soft/50 p-5 opacity-70"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent articles */}
      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-muted">
            Recent
          </h2>
          <div className="flex flex-col gap-3">
            {recent.map((article) => (
              <Link
                key={`${article.cluster}/${article.slug}`}
                href={`/journal/${article.cluster}/${article.slug}`}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3.5 no-underline transition hover:border-accent hover:bg-surface-soft"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent-strong">
                    {article.cluster.charAt(0).toUpperCase() + article.cluster.slice(1)}
                  </div>
                  <div className="truncate text-[0.9375rem] font-semibold leading-[1.35] text-text">
                    {article.frontmatter.title}
                  </div>
                </div>
                <div className="shrink-0 text-[0.75rem] text-text-muted">
                  {formatDate(article.frontmatter.publishedAt)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
