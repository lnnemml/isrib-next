"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import type { CartFormat } from "@/lib/cart/types";
import { Button } from "@/components/ui";

// The sanctioned add-to-cart surface: a small client island that pages drop next to a
// purchasable size. All cart writes go through useCart().addLine — never storage directly.
interface AddToCartButtonProps {
  productSlug: string;
  format: CartFormat;
  sizeLabel: string;
  priceCents: number;
  variant?: "primary" | "secondary";
}

export function AddToCartButton({
  productSlug,
  format,
  sizeLabel,
  priceCents,
  variant = "primary",
}: AddToCartButtonProps) {
  const { addLine } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addLine({ productSlug, format, sizeLabel, quantity: 1, linePriceCents: priceCents });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      aria-label={`Add ${sizeLabel} to cart`}
      className="w-full"
    >
      {added ? "Added ✓" : "Add to cart"}
    </Button>
  );
}
