// Meta Pixel base code. Loaded DIRECTLY in code (not via GTM) so trackEvent's direct
// fbq("track", event, params, {eventID}) call in src/lib/analytics/client.ts produces
// clean browser↔CAPI deduplication (hybrid model — ADR 0005 / Slice A). This file only
// bootstraps window.fbq + fires the initial PageView; all subsequent events go through
// trackEvent, never a raw fbq() call in a component.

import Script from "next/script";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Loads the Meta Pixel and fires the initial PageView. Renders null when
 * NEXT_PUBLIC_META_PIXEL_ID is empty/undefined so the site builds and runs as a no-op
 * without a pixel ID.
 *
 * strategy="afterInteractive" per the Next 16 Script docs' analytics guidance — loads
 * early but after first-party hydration, never blocking it. Inline scripts require an
 * `id` for next/script to track/optimize them.
 *
 * The inline snippet is Meta's standard base code: it defines window.fbq (queuing calls
 * until fbevents.js loads), injects fbevents.js, then init + track PageView.
 */
export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel-bootstrap"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta requires a raw
            tracking pixel <img>; next/image would rewrite the URL and break tracking. */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
