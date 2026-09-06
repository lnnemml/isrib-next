"use client";

// Fires a GA4-only `page_view` on every SPA route change (and on initial mount). App
// Router client navigations don't reload the document, so the GTM/GA4 pageview must be
// driven here. `page_view` is in GA4_ONLY_EVENTS (client.ts) so it does NOT fan to Meta
// (the Pixel base code fires its own PageView). Renders NO UI.
//
// RUNBOOK: configure the GA4 tag in GTM to fire on this `page_view` dataLayer event and
// DISABLE GA4 enhanced-measurement pageviews to avoid double-counting.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

export function RouteChangeTracker() {
  const pathname = usePathname();

  // Track the last path we reported so a strict-mode double-invoke (which re-runs the
  // effect with the SAME pathname) doesn't fire twice for one navigation. A genuine
  // route change updates `pathname`, which differs from lastPath and fires once.
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    trackEvent("page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
