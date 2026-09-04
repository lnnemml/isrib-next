"use client";

// Tiny helper rendered on the success page: empties the cart once after a successful
// order. Guarded with a ref so React StrictMode's double-invoke (and any re-render)
// only clears once.
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/CartProvider";

export function ClearCartOnMount() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);

  return null;
}
