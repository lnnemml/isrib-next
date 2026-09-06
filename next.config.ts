import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 301 redirect map for the OLD journal domain (isrib-research.com) onto
  // isrib.shop/journal. Every entry is host-gated with `has: [{ type: "host",
  // value: "isrib-research.com" }]` so these NEVER fire on isrib.shop — the same
  // slugs must resolve normally on the canonical host. Cross-host destinations are
  // absolute URLs. `permanent: true` emits a 308 (Next preserves the request method
  // rather than a bare 301); 308 is the SEO-permanent code — search engines treat it
  // the same as a 301 for link-equity transfer. Order matters (first match wins):
  // the specific files come before the catch-all. See
  // docs/wiki/architecture/journal-migration-plan.md.
  async redirects() {
    return [
      {
        source: "/sitemap.xml",
        has: [{ type: "host", value: "isrib-research.com" }],
        destination: "https://isrib.shop/sitemap.xml",
        permanent: true,
      },
      {
        source: "/robots.txt",
        has: [{ type: "host", value: "isrib-research.com" }],
        destination: "https://isrib.shop/robots.txt",
        permanent: true,
      },
      {
        // Catch-all: covers `/` -> `/journal`, every cluster index, every article,
        // and `/author` -> `/journal/author` per the general rule (old {path} ->
        // isrib.shop/journal/{path}).
        source: "/:path*",
        has: [{ type: "host", value: "isrib-research.com" }],
        destination: "https://isrib.shop/journal/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
