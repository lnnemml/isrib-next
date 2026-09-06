import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllArticles,
  getArticlesByCluster,
  type JournalCluster,
} from "@/lib/journal/mdx";

// Only clusters with >= 1 article are prerendered; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  const clusters = new Set(getAllArticles().map((a) => a.cluster));
  return Array.from(clusters).map((cluster) => ({ cluster }));
}

const CLUSTER_META: Record<
  JournalCluster,
  { label: string; description: string }
> = {
  compare: {
    label: "Compare",
    description:
      "How ISRIB A15 compares to modafinil, racetams, noopept, and other cognitive compounds.",
  },
  guide: {
    label: "Guide",
    description: "Practical protocols for ISRIB A15 — dosing, timing, and what to expect.",
  },
  science: {
    label: "Science",
    description:
      "The mechanism behind ISRIB A15 — the integrated stress response and eIF2B stabilisation.",
  },
  blog: {
    label: "Blog",
    description: "Field notes on brain fog, burnout, and cognitive recovery.",
  },
  tbi: {
    label: "TBI",
    description: "ISRIB A15 and the integrated stress response after traumatic brain injury.",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cluster: string }>;
}): Promise<Metadata> {
  const { cluster } = await params;
  const meta = CLUSTER_META[cluster as JournalCluster];
  if (!meta) return {};
  return {
    title: `${meta.label} | Journal | ISRIB A15`,
    description: meta.description,
  };
}

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ cluster: string }>;
}) {
  const { cluster } = await params;
  const typedCluster = cluster as JournalCluster;
  const articles = getArticlesByCluster(typedCluster);
  if (articles.length === 0) notFound();

  const meta = CLUSTER_META[typedCluster];

  return (
    <div className="mx-auto max-w-[--container-page] px-8 pt-12 pb-16">
      <nav aria-label="Breadcrumb" className="mb-4 text-[0.875rem] text-text-muted">
        <Link href="/journal" className="hover:text-text">
          Journal
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <span>{meta.label}</span>
      </nav>

      <header className="max-w-[52rem]">
        <h1 className="mb-4 text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.03em] text-text">
          {meta.label}
        </h1>
        <p className="text-[1.0625rem] leading-[1.7] text-text-muted">{meta.description}</p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/journal/${article.cluster}/${article.slug}`}
            className="flex flex-col rounded-md border border-border bg-surface p-5 no-underline transition hover:border-accent hover:bg-surface-soft"
          >
            <h2 className="mb-2 text-[1.1875rem] font-semibold leading-[1.3] text-text">
              {article.frontmatter.title}
            </h2>
            <p className="mb-4 flex-1 text-[0.9375rem] leading-[1.6] text-text-muted">
              {article.frontmatter.description}
            </p>
            <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-text-faint">
              <span>{formatDate(article.frontmatter.publishedAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{article.frontmatter.readingTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
