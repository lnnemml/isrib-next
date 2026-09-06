import type { ReactNode } from "react";
import Link from "next/link";
import type { JournalFrontmatter } from "@/lib/journal/mdx";
import type { TOCItem } from "@/lib/journal/toc";
import TOC from "./TOC";
import CTABlock from "./CTABlock";
import AuthorBio from "./AuthorBio";
import ReadingProgress from "./ReadingProgress";
import MobileTOC from "./MobileTOC";
import ArticleReadTracker from "./ArticleReadTracker";

// Ported from the SEO hub ArticleLayout, restyled onto the locked shop design system.
// Editorial "The Synthesis Lab / Journal" sub-brand masthead (ADR 0015), two-column
// TOC-sidebar + article grid (single column on mobile), and the end-of-article block
// order: CTABlock → RelatedArticles → AuthorBio.
type ArticleLayoutProps = {
  frontmatter: JournalFrontmatter;
  toc: TOCItem[];
  children: ReactNode;
  relatedArticles?: ReactNode;
};

// Self-contained token-based prose styling. Native <table> renders (source MDX uses
// native HTML tables). Kept as a Tailwind class composition so globals.css is untouched.
const PROSE_CLASSES = [
  "relative text-[17px] leading-[1.7] text-text",
  // Headings
  "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-[2.375rem] [&_h2]:leading-[1.12] [&_h2]:tracking-[-0.025em] [&_h2]:font-semibold [&_h2]:text-text",
  "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[1.375rem] [&_h3]:leading-[1.25] [&_h3]:tracking-[-0.01em] [&_h3]:font-semibold [&_h3]:text-text",
  // Body
  "[&_p]:my-5 [&_p]:text-text",
  "[&_a]:text-accent-strong [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-accent",
  "[&_strong]:font-semibold [&_strong]:text-text",
  // Lists
  "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-text",
  "[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-text",
  "[&_li]:my-1.5 [&_li]:leading-[1.7]",
  // Inline code
  "[&_code]:rounded [&_code]:bg-surface-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-text",
  // Native tables
  "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.9375rem]",
  "[&_th]:border [&_th]:border-border [&_th]:bg-surface-soft [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-text",
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-text",
  // Blockquote (fallback for raw markdown quotes)
  "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-6 [&_blockquote]:text-text-muted",
].join(" ");

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleLayout({
  frontmatter,
  toc,
  children,
  relatedArticles,
}: ArticleLayoutProps) {
  const clusterLabel =
    frontmatter.cluster.charAt(0).toUpperCase() + frontmatter.cluster.slice(1);

  return (
    <div className="mx-auto max-w-[--container-page] px-8 pt-8 pb-16">
      <ReadingProgress />

      {/* Desktop grid: sidebar | content (single column on mobile) */}
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar — hidden on mobile; MobileTOC covers small screens */}
        <aside className="sticky top-20 hidden lg:block">
          <TOC items={toc} />
        </aside>

        {/* Content column */}
        <main>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-4 text-[0.875rem] text-text-muted"
          >
            <Link href="/journal" className="hover:text-text">
              Journal
            </Link>
            <span aria-hidden="true" className="mx-1.5">
              ›
            </span>
            <span>{clusterLabel}</span>
          </nav>

          {/* H1 */}
          <h1 className="mt-0 mb-3 text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-text">
            {frontmatter.title}
          </h1>

          {/* Meta row: byline + published date + reading time */}
          <div className="mb-10 text-[0.875rem] text-text-muted">
            The Synthesis Lab · {formatDate(frontmatter.publishedAt)} ·{" "}
            {frontmatter.readingTime}
          </div>

          {/* Article body */}
          <div className={`journal-prose ${PROSE_CLASSES}`}>
            {children}
            <ArticleReadTracker
              slug={frontmatter.slug}
              cluster={frontmatter.cluster}
              title={frontmatter.title}
            />
          </div>

          {/* End-of-article blocks */}
          <CTABlock />
          {relatedArticles}
          <AuthorBio />
        </main>
      </div>

      {/* Mobile TOC — floating button + drawer, hidden on desktop */}
      <div className="lg:hidden">
        <MobileTOC items={toc} />
      </div>
    </div>
  );
}
