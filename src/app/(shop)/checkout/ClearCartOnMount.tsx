"use client";

// Tiny helper rendered on the success page: empties the cart once, AFTER the provider
// has hydrated. Waiting for hydration is what fixes the full-reload case (crypto path,
// returning from NowPayments): if we cleared before hydration, the provider's hydrate
// effect would reload the old cart from storage and clobber the clear. Guarded with a
// ref so React StrictMode's double-invoke (and any re-render) only clears once.
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/CartProvider";

export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clear();
  }, [hydrated, clear]);

  return null;
}
