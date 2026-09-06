import Link from "next/link";
import { getAllArticles, type JournalCluster } from "@/lib/journal/mdx";

// Server Component — reads the filesystem via getAllArticles(). No "use client",
// no hooks, no event handlers.

type Curated = { cluster: JournalCluster; slug: string; label: string };

// Curated selection — all four articles exist in content/journal. We still look each
// up defensively and skip any that resolve to nothing (never render a card for a
// missing article, never link to a 404).
const TRIO: Curated[] = [
  { cluster: "guide", slug: "isrib-a15-complete-guide", label: "Guide" },
  { cluster: "science", slug: "what-is-integrated-stress-response", label: "Science" },
  { cluster: "compare", slug: "isrib-vs-modafinil", label: "Comparison" },
];

const WIDE: Curated = { cluster: "blog", slug: "how-to-fix-brain-fog", label: "Blog" };

type ResolvedCard = {
  label: string;
  href: string;
  title: string;
  description: string;
};

export function HomeJournal() {
  const all = getAllArticles();
  const lookup = new Map(all.map((a) => [`${a.cluster}/${a.slug}`, a]));

  const resolve = (c: Curated): ResolvedCard | null => {
    const article = lookup.get(`${c.cluster}/${c.slug}`);
    if (!article) return null;
    return {
      label: c.label,
      href: `/journal/${c.cluster}/${c.slug}`,
      title: article.frontmatter.title,
      description: article.frontmatter.description,
    };
  };

  const trio = TRIO.map(resolve).filter((x): x is ResolvedCard => x !== null);
  const wide = resolve(WIDE);

  // If nothing resolved, render nothing.
  if (trio.length === 0 && !wide) return null;

  return (
    <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-accent-strong">
            {"The Journal"}
          </div>
          <h2 className="text-h2 font-bold text-text">
            {"Research, written by the chemist"}
          </h2>
        </div>
        <Link
          href="/journal"
          className="text-[15px] font-semibold text-primary-deep no-underline transition hover:text-primary"
        >
          {"All articles →"}
        </Link>
      </div>

      {/* Trio grid */}
      {trio.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trio.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 no-underline shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
            >
              <span className="inline-block self-start rounded-full border border-border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
                {card.label}
              </span>
              <h3 className="mt-3 text-[19px] font-semibold leading-[1.3] text-text">
                {card.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-small leading-[1.6] text-text-muted">
                {card.description}
              </p>
              <span className="mt-auto pt-4 text-[14px] font-semibold text-primary-deep">
                {"Read article →"}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Wide card */}
      {wide && (
        <Link
          href={wide.href}
          className="mt-6 block rounded-xl border border-border bg-surface p-6 no-underline shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 sm:flex sm:items-center sm:justify-between sm:gap-6"
        >
          <div>
            <span className="inline-block rounded-full border border-border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
              {wide.label}
            </span>
            <h3 className="mt-3 text-[19px] font-semibold leading-[1.3] text-text">
              {wide.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-small leading-[1.6] text-text-muted">
              {wide.description}
            </p>
          </div>
          <span className="mt-4 block shrink-0 text-[14px] font-semibold text-primary-deep sm:mt-0">
            {"Read article →"}
          </span>
        </Link>
      )}
    </section>
  );
}
