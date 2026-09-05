"use client";

// ADR 0014 — referral capture. A `?ref=CODE` link landing on ANY page writes a
// client-set marketing cookie so the code persists through to checkout, where the
// server reads it (authoritative validation lives server-side in submitOrder). This
// renders no UI. NOT httpOnly by design — it's a client-set marketing marker, not a
// secret; the server never trusts it beyond looking up a real referral code.

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function RefCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("ref");
    if (!raw) return;
    const code = raw.trim().toUpperCase();
    if (!code) return;
    // Overwrite on each new ?ref so the most recent referral link wins.
    document.cookie = `isrib_ref=${encodeURIComponent(code)}; path=/; max-age=${REF_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [searchParams]);

  return null;
}
