"use client";

// The ONLY sanctioned cart write on the /go funnel. Every buy button in the Offer
// section routes through here: add one line via useCart().addLine
// (the single cart API — never touch storage directly), then push to /checkout. The
// priceCents passed in must match the server catalog (src/lib/copy/products.ts) so
// checkout charges the displayed sale price.
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useCart } from "@/lib/cart/CartProvider";
import type { CartFormat } from "@/lib/cart/types";

interface BuyNowButtonProps {
  productSlug: string;
  format: CartFormat;
  sizeLabel: string;
  priceCents: number;
  label: string;
  variant?: "primary" | "secondary";
}

export default function BuyNowButton({
  productSlug,
  format,
  sizeLabel,
  priceCents,
  label,
  variant = "primary",
}: BuyNowButtonProps) {
  const router = useRouter();
  const { addLine } = useCart();

  const handleClick = () => {
    addLine({ productSlug, format, sizeLabel, quantity: 1, linePriceCents: priceCents });
    router.push("/checkout");
  };

  return (
    <Button variant={variant} className="w-full" onClick={handleClick}>
      {label}
    </Button>
  );
}
