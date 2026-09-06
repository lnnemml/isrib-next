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

      // Legacy isrib.shop static-site URLs (old vanilla `.html` pages + old
      // vercel.json path redirects) -> new App Router routes, so SEO/bookmarks
      // survive cutover. Host-AGNOSTIC (no `has` clause) so they also fire on
      // the Vercel preview domain for QA. `permanent: true` -> 308. See
      // docs/wiki/architecture/track-a-runbook.md Session 4.1.
      // Products (all six + index):
      {
        source: "/product_isrib_A15.html",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/product_isrib.html",
        destination: "/products/isrib-original",
        permanent: true,
      },
      {
        source: "/product_MPEP.html",
        destination: "/products/mpep-oxalate",
        permanent: true,
      },
      {
        source: "/product_zzl_7.html",
        destination: "/products/zzl-7",
        permanent: true,
      },
      {
        source: "/product_bromantane.html",
        destination: "/products/bromantane",
        permanent: true,
      },
      {
        source: "/product_n_acetyl_bromantane.html",
        destination: "/products/n-acetyl-bromantane",
        permanent: true,
      },
      {
        source: "/products.html",
        destination: "/products",
        permanent: true,
      },
      // Info / legal:
      {
        source: "/about.html",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/faq.html",
        destination: "/faq",
        permanent: true,
      },
      {
        source: "/contact.html",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/quality.html",
        destination: "/quality",
        permanent: true,
      },
      {
        source: "/safety.html",
        destination: "/safety",
        permanent: true,
      },
      {
        source: "/terms.html",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/privacy.html",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/research.html",
        destination: "/research",
        permanent: true,
      },
      {
        source: "/disclaimer.html",
        destination: "/disclaimer",
        permanent: true,
      },
      // Old vercel.json live path redirects (external links may still use them):
      {
        source: "/isrib-a15",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/product-page/isrib-a15-500mg",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/zzl-7",
        destination: "/products/zzl-7",
        permanent: true,
      },
      // Checkout / purchase flow:
      {
        source: "/checkout.html",
        destination: "/checkout",
        permanent: true,
      },
      {
        source: "/success.html",
        destination: "/checkout/success",
        permanent: true,
      },
      {
        source: "/confirm-purchase.html",
        destination: "/checkout/success",
        permanent: true,
      },
      {
        source: "/buy-500mg.html",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/buy-1g.html",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/buy-25-capsules.html",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/buy-50-capsules.html",
        destination: "/products/isrib-a15",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
