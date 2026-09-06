// ONLY tracking API. Never call fbq()/dataLayer.push()/clarity() directly elsewhere — see ADR 0005.
//
// Shared analytics types + the global Window augmentation for the browser sinks
// (GTM dataLayer, Meta Pixel, Microsoft Clarity). Importing this file anywhere in
// the compilation makes the augmentation available; client.ts imports it directly.

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    fbq: (...args: unknown[]) => void;
    clarity: (...args: unknown[]) => void;
  }
}

/**
 * Journal (SEO hub) semantic events. GA4-only custom events — they pass through the
 * dataLayer sink unchanged (no Meta/Clarity mapping). Kept as a named union so the
 * journal components fire from a documented, typo-checked set.
 */
export type JournalEventName =
  | "journal_cta_click"
  | "journal_article_read"
  | "journal_toc_click";

/** Semantic event name (e.g. "order_submitted"). Mapped to vendor names internally. */
export type EventName = string | JournalEventName;

/** Flat, serializable event properties. No nested objects — vendors flatten these. */
export type EventParams = Record<string, string | number | boolean | null | undefined>;

export {};
