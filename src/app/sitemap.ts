import type { MetadataRoute } from "next";
import { getAllArticles, getAllSlugs } from "@/lib/journal/mdx";
import { getAllProductSlugs } from "@/lib/copy/products";

const BASE_URL = "https://isrib.shop";

// Static commercial/marketing routes that exist as real pages (verified against
// src/app). Private/dev routes (/admin, /account, /checkout, /kitchen-sink, /go,
// /api, /shipping) are intentionally excluded — they must never appear in search.
const MARKETING_PATHS = [
  "/about",
  "/faq",
  "/contact",
  "/quality",
  "/safety",
  "/research",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // --- Core commercial pages ---
  entries.push({
    url: BASE_URL,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  });
  entries.push({
    url: `${BASE_URL}/products`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  });
  for (const slug of getAllProductSlugs()) {
    entries.push({
      url: `${BASE_URL}/products/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // --- Marketing pages ---
  for (const path of MARKETING_PATHS) {
    entries.push({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // --- Journal ---
  const articles = getAllArticles();

  entries.push({
    url: `${BASE_URL}/journal`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  });
  entries.push({
    url: `${BASE_URL}/journal/author`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  });

  // Only clusters that actually have content — derived from published articles.
  const clustersWithContent = [...new Set(articles.map((a) => a.cluster))];
  for (const cluster of clustersWithContent) {
    entries.push({
      url: `${BASE_URL}/journal/${cluster}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Every article, using its own updatedAt as lastModified.
  const updatedBySlug = new Map(
    articles.map((a) => [`${a.cluster}/${a.slug}`, a.frontmatter.updatedAt])
  );
  for (const { cluster, slug } of getAllSlugs()) {
    entries.push({
      url: `${BASE_URL}/journal/${cluster}/${slug}`,
      lastModified: updatedBySlug.get(`${cluster}/${slug}`) ?? now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
