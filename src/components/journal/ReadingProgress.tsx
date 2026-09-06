"use client";

import { useReadingProgress } from "./hooks";

// Ported from the SEO hub ReadingProgress, restyled onto the locked shop design system.
// Fixed top progress bar filled in the accent token.
export default function ReadingProgress() {
  const progress = useReadingProgress();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-0.5 bg-accent"
      style={{ width: `${progress}%` }}
    />
  );
}
