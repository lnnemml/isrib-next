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

/** Semantic event name (e.g. "order_submitted"). Mapped to vendor names internally. */
export type EventName = string;

/** Flat, serializable event properties. No nested objects — vendors flatten these. */
export type EventParams = Record<string, string | number | boolean | null | undefined>;

export {};
