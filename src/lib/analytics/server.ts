// ONLY tracking API. Never call fbq()/dataLayer.push()/clarity() directly elsewhere — see ADR 0005.
//
// Server-side tracking (Node runtime). `trackServerEvent` sends one semantic event
// to Meta Conversions API (CAPI) and GA4 Measurement Protocol in parallel. It never
// throws — analytics must never break the request that triggered it — and it never
// runs client-side (reads server-only secrets).

import { createHash } from "node:crypto";
import type { EventName } from "./types";

/** Properties for a server-side event. Carries PII used for CAPI matching + dedup. */
export interface ServerEventProps {
  /** Shared id for browser↔CAPI dedup — pass the same value used with trackEvent. */
  eventId?: string;
  email?: string;
  value?: number;
  currency?: string;
  userAgent?: string;
  sourceUrl?: string;
  ip?: string;
  [key: string]: unknown;
}

// Semantic event name → Meta/GA4 standard event. Mirrors client META_EVENT_MAP.
const EVENT_MAP: Record<string, string> = {
  order_submitted: "InitiateCheckout", // PRIMARY Meta conversion — preserve (ADR 0005)
  order_confirmed: "Purchase",
  product_viewed: "ViewContent",
  email_subscribed: "Lead",
};

const sha256 = (value: string): string =>
  createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/**
 * Fire a semantic event to Meta CAPI + GA4 Measurement Protocol.
 * Resolves once both settle; individual failures are logged, never thrown.
 */
export async function trackServerEvent(name: EventName, props: ServerEventProps): Promise<void> {
  await Promise.allSettled([sendMetaCAPI(name, props), sendGA4(name, props)]);
}

async function sendMetaCAPI(name: EventName, props: ServerEventProps): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn("[analytics] Meta CAPI skipped: NEXT_PUBLIC_META_PIXEL_ID / META_CAPI_ACCESS_TOKEN not set");
    return;
  }

  const hashedEmail = props.email ? sha256(props.email) : undefined;
  const payload = {
    data: [
      {
        event_name: EVENT_MAP[name] ?? name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: props.eventId,
        action_source: "website",
        event_source_url: props.sourceUrl,
        user_data: {
          em: hashedEmail ? [hashedEmail] : undefined,
          client_ip_address: props.ip,
          client_user_agent: props.userAgent,
        },
        custom_data: {
          value: props.value,
          currency: props.currency ?? "USD",
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.error(`[analytics] Meta CAPI ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error("[analytics] Meta CAPI request failed:", err);
  }
}

async function sendGA4(name: EventName, props: ServerEventProps): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA4_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) {
    console.warn("[analytics] GA4 MP skipped: NEXT_PUBLIC_GA4_ID / GA4_API_SECRET not set");
    return;
  }

  const clientId = props.email
    ? `${sha256(props.email).substring(0, 16)}.${Math.floor(Date.now() / 1000)}`
    : `server.${Date.now()}`;

  const payload = {
    client_id: clientId,
    events: [
      {
        name: EVENT_MAP[name] ?? name,
        params: {
          event_id: props.eventId,
          value: props.value,
          currency: props.currency ?? "USD",
          source: "server",
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.error(`[analytics] GA4 MP ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error("[analytics] GA4 MP request failed:", err);
  }
}
