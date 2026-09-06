"use client";

// Fires GA4-only `scroll_depth` events as the viewport bottom passes each depth
// threshold (25/50/75/90%) once per page view. This REPLACES a GTM-native scroll
// trigger with a code-based one, so it fires via trackEvent into the dataLayer and
// gives full SPA coverage — the fired-set re-arms on every route change (App Router
// client navigations don't reload the document). `scroll_depth` is in GA4_ONLY_EVENTS
// (client.ts) so it does NOT fan to Meta. Renders NO UI.
//
// RUNBOOK: remove the GTM-native scroll-depth trigger and configure the GA4 tag to
// fire on this `scroll_depth` dataLayer event to avoid double-counting.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

const THRESHOLDS = [25, 50, 75, 90] as const;

export function ScrollDepthTracker() {
  const pathname = usePathname();

  // Thresholds already fired for the CURRENT page view. Reset when pathname changes so
  // each SPA route gets a fresh set (re-arm). A ref (not state) avoids re-renders and
  // survives across scroll events without re-running the effect.
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Re-arm on route change: new page view starts with no thresholds fired.
    fired.current = new Set();

    // rAF throttle handle — coalesces bursts of scroll events into one measurement per
    // frame. Also serves as the strict-mode / cleanup guard (cancelled on unmount).
    let rafId = 0;

    const evaluate = () => {
      rafId = 0;

      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight;
      const innerHeight = window.innerHeight;

      // Guard: unscrollable / short page — don't fire thresholds. Re-evaluated on every
      // scroll/resize, so content that grows into scrollability starts firing then.
      if (scrollHeight <= innerHeight) return;

      const scrollTop = window.scrollY;
      const percent = ((scrollTop + innerHeight) / scrollHeight) * 100;

      for (const threshold of THRESHOLDS) {
        if (percent >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold);
          trackEvent("scroll_depth", {
            percent_scrolled: threshold,
            page_path: pathname,
          });
        }
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return; // already scheduled this frame
      rafId = window.requestAnimationFrame(evaluate);
    };

    // Initial measurement (page may already be scrolled, e.g. anchor/back-forward).
    evaluate();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
