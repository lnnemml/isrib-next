import Link from "next/link";
import { getAllArticles } from "@/lib/journal/mdx";
import type { JournalArticle } from "@/lib/journal/mdx";

// Ported from the SEO hub RelatedArticles, restyled onto the locked shop design system.
// Resolves each slug via getAllArticles() and links to /journal/{cluster}/{slug}.
type Props = {
  slugs: string[];
  currentCluster: string;
};

export default function RelatedArticles({ slugs, currentCluster: _currentCluster }: Props) {
  if (slugs.length === 0) return null;

  const allArticles = getAllArticles();

  const related: JournalArticle[] = slugs
    .map((slug) => allArticles.find((a) => a.slug === slug))
    .filter((a): a is JournalArticle => a !== undefined)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-8 max-w-[42rem] border-t border-border pt-6">
      <div className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-muted">
        Related articles
      </div>

      <div className="flex flex-col gap-3">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/journal/${article.cluster}/${article.slug}`}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3.5 text-inherit no-underline transition hover:border-accent hover:bg-surface-soft"
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
              {article.frontmatter.readingTime}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
