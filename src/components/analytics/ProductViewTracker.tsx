"use client";

// Fires `product_viewed` (→ Meta ViewContent via META_EVENT_MAP) once when a product
// page mounts. Product pages are server components, so this tiny client island carries
// the event. It renders NO UI. All values are passed down from the server component's
// already-loaded product data — this component NEVER computes or reads pricing itself.

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/client";

export function ProductViewTracker({
  slug,
  contentName,
  value,
  eventId,
}: {
  slug: string;
  contentName: string;
  // Display price (USD) read from existing product data by the parent. Optional so a
  // product without a resolvable display price still fires the event (no value param).
  value?: number;
  eventId?: string;
}) {
  // Guard against React strict-mode's double-invoke of effects in dev — fire exactly once.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(
      "product_viewed",
      {
        content_ids: [slug],
        content_name: contentName,
        value,
        currency: "USD",
      },
      eventId,
    );
  }, [slug, contentName, value, eventId]);

  return null;
}
