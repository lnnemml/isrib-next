"use client";

import { useState, useEffect } from "react";

/**
 * Reading progress (0–100) as a percentage of the page scrolled.
 * Ported from the source SEO hub's useReadingProgress hook. useScrollHeader is
 * intentionally NOT ported — the source Header is not part of this migration.
 */
export function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      if (scrollable <= 0) {
        setProgress(100);
        return;
      }
      setProgress(Math.round((scrollTop / scrollable) * 100));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return progress;
}
