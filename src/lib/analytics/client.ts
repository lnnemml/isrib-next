// ONLY tracking API. Never call fbq()/dataLayer.push()/clarity() directly elsewhere — see ADR 0005.
//
// Browser-side tracking. `trackEvent` fans a single semantic event out to the three
// client sinks — GTM dataLayer, Meta Pixel (fbq), Microsoft Clarity — simultaneously.
// Reddit is fired via a GTM tag (dataLayer), never called directly here.

import "./types";
import type { EventName, EventParams } from "./types";

// Semantic event name → Meta standard event. Unmapped names pass through unchanged.
const META_EVENT_MAP: Record<string, string> = {
  order_submitted: "InitiateCheckout", // PRIMARY Meta conversion — preserve (ADR 0005 / analytics.md)
  order_confirmed: "Purchase", // internal revenue signal (mirrors server-side)
  product_viewed: "ViewContent",
  email_subscribed: "Lead",
};

/**
 * Fire a semantic analytics event to every browser sink.
 *
 * @param name    Semantic event name (e.g. "order_submitted").
 * @param props   Flat, serializable properties.
 * @param eventId Optional shared id for browser↔CAPI deduplication. When the same
 *                event is also sent server-side via trackServerEvent, pass the same
 *                id to both so Meta counts it once. Use generateEventId() to mint one.
 */
export function trackEvent(name: EventName, props?: EventParams, eventId?: string): void {
  if (typeof window === "undefined") return;

  // GTM dataLayer (also carries Reddit + any other GTM-managed tags).
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, event_id: eventId, ...props });

  // Meta Pixel.
  if (typeof window.fbq === "function") {
    const metaEvent = META_EVENT_MAP[name] ?? name;
    const metaParams = props ? { ...props } : {};
    if (eventId) {
      window.fbq("track", metaEvent, metaParams, { eventID: eventId });
    } else {
      window.fbq("track", metaEvent, metaParams);
    }
  }

  // Microsoft Clarity — tag the session with a custom event/value.
  if (typeof window.clarity === "function") {
    window.clarity("set", name, props ? JSON.stringify(props) : "true");
  }
}

/**
 * Mint an event id for browser↔CAPI dedup. Pass the same id to trackEvent (browser)
 * and trackServerEvent (server) for one logical event.
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
