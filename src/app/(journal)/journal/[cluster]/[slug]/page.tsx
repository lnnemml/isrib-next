import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { getArticle, getAllSlugs, type JournalCluster } from "@/lib/journal/mdx";
import { extractTOC } from "@/lib/journal/toc";
import {
  buildArticleSchema,
  buildFAQSchema,
  extractFAQsFromContent,
} from "@/lib/journal/schema";
import ArticleLayout from "@/components/journal/ArticleLayout";
import RelatedArticles from "@/components/journal/RelatedArticles";
import DoseProtocol from "@/components/journal/DoseProtocol";
import ResearchCallout from "@/components/journal/ResearchCallout";
import UserQuote from "@/components/journal/UserQuote";

const BASE_URL = "https://isrib.shop";

// LOCKED renderer: next-mdx-remote/rsc. Only these three components go in the MDX map;
// CTABlock / RelatedArticles / AuthorBio are injected by ArticleLayout, not via MDX.
const mdxComponents = { DoseProtocol, ResearchCallout, UserQuote };

// Every article is prerendered; unspecified {cluster,slug} pairs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs();
}

function loadArticle(cluster: string, slug: string) {
  try {
    return getArticle(cluster as JournalCluster, slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cluster: string; slug: string }>;
}): Promise<Metadata> {
  const { cluster, slug } = await params;
  const article = loadArticle(cluster, slug);
  if (!article) return {};

  const { frontmatter } = article;
  const canonical = `${BASE_URL}/journal/${cluster}/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.keywords,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: frontmatter.title,
      description: frontmatter.description,
      url: canonical,
      publishedTime: frontmatter.publishedAt,
      modifiedTime: frontmatter.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ cluster: string; slug: string }>;
}) {
  const { cluster, slug } = await params;
  const article = loadArticle(cluster, slug);
  if (!article) notFound();

  const { frontmatter, content } = article;
  const toc = extractTOC(content);

  const articleSchema = buildArticleSchema({
    title: frontmatter.title,
    description: frontmatter.description,
    slug: frontmatter.slug,
    cluster: frontmatter.cluster,
    publishedAt: frontmatter.publishedAt,
    updatedAt: frontmatter.updatedAt,
    keywords: frontmatter.keywords,
  });
  const faqSchema = buildFAQSchema(extractFAQsFromContent(content));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <ArticleLayout
        frontmatter={frontmatter}
        toc={toc}
        relatedArticles={
          <RelatedArticles
            slugs={frontmatter.relatedSlugs}
            currentCluster={frontmatter.cluster}
          />
        }
      >
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
        />
      </ArticleLayout>
    </>
  );
}
