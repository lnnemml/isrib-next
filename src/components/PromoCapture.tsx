"use client";

// ADR 0016 / 0017 lineage — promo auto-apply. A `?promo=CODE` link landing on ANY page
// (e.g. the relaunch email's `/products?promo=RELAUNCH10` CTA) writes a client-set
// marketing cookie so the code persists through to checkout, where the checkout page
// reads it and previews the discount. Mirrors RefCapture (ADR 0014) exactly. The server
// re-validates the code in submitOrder — authoritative pricing lives server-side; this
// cookie is a cosmetic-preview marker, not a secret, so it is NOT httpOnly by design.

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PROMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function PromoCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("promo");
    if (!raw) return;
    const code = raw.trim().toUpperCase();
    if (!code) return;
    // Overwrite on each new ?promo so the most recent promo link wins.
    document.cookie = `isrib_promo=${encodeURIComponent(code)}; path=/; max-age=${PROMO_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [searchParams]);

  return null;
}
