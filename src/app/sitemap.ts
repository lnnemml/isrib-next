import type { MetadataRoute } from "next";
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

  return entries;
}
