import type { MetadataRoute } from "next";

// Keep the dev-only /kitchen-sink preview out of search indexes. Note: this is a
// courtesy signal only — the hard guard that keeps the page off the live domain after
// cutover is the VERCEL_ENV production check inside the page itself.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/kitchen-sink"],
    },
  };
}
