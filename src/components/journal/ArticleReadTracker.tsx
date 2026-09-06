"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/client";

// Ported from the SEO hub ArticleReadTracker. Sentinel at ~75% scroll fires
// journal_article_read (once) via trackEvent — was a raw dataLayer.push.
type ArticleReadTrackerProps = {
  slug: string;
  cluster: string;
  title: string;
};

export default function ArticleReadTracker({ slug, cluster, title }: ArticleReadTrackerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackEvent("journal_article_read", {
            article_slug: slug,
            article_cluster: cluster,
            article_title: title,
          });
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [slug, cluster, title]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-[75%] h-px w-px"
    />
  );
}
