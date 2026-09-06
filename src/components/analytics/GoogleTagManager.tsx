// GTM container bootstrap. GA4 (client) and Clarity are configured as GTM tags in
// the GTM UI (hybrid model — ADR 0005 / Slice A) and are deliberately NOT injected
// in code here; only the container itself is. The Meta Pixel loads directly (see
// MetaPixel.tsx) so trackEvent's direct fbq({eventID}) call gives clean CAPI dedup.
//
// trackEvent (src/lib/analytics/client.ts) pushes to window.dataLayer — this file is
// what actually loads GTM so those pushes reach a live container.

import Script from "next/script";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Loads the GTM container. Renders null when NEXT_PUBLIC_GTM_ID is empty/undefined so
 * the site builds and runs as a no-op until Anton provisions the container ID (the
 * post-collapse container value is still TBD — ADR 0002).
 *
 * Uses strategy="afterInteractive" — the strategy the Next 16 Script docs name for
 * tag managers ("Some examples of scripts that are good candidates for afterInteractive
 * include: Tag managers, Analytics"). It loads early but after first-party hydration,
 * so it never blocks hydration, which is correct for a tag manager.
 *
 * This is GTM's canonical single-snippet install: one inline script that seeds
 * window.dataLayer, pushes gtm.start, then injects the container source. Keeping it as
 * one inline block guarantees gtm.start is pushed before gtm.js runs. Inline scripts
 * require an `id` for next/script to track/optimize them.
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <Script
      id="gtm-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=document.getElementsByTagName('script')[0],j=document.createElement('script'),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,'dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

/**
 * GTM <noscript> iframe fallback. GTM's install guidance places this immediately after
 * the opening <body> tag. Server-safe (no client hooks) so it renders in the initial
 * HTML for no-JS clients. Renders null without a container ID.
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
