"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { type FixedFormat } from "@/lib/copy/products";

// Faithful port of the live fixed-size order body (product_MPEP.html "Select Quantity"):
// radio-style size options and a single Add-to-cart whose label reflects the active size.
// All cart writes go through useCart().addLine. Design tokens only (mirrors
// PerGramCalculator's tier-button look). The price shows on each size card and in the
// Add-to-cart label, so no separate total panel is needed here.
interface FixedSizeSelectorProps {
  productSlug: string;
  formats: FixedFormat[];
}

// Two-decimal dollar display ("$60.00" / "$0.60") — matches the live price line, which
// always renders cents (the shared formatCents trims whole dollars).
function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function FixedSizeSelector({ productSlug, formats }: FixedSizeSelectorProps) {
  const { addLine } = useCart();
  const [selectedSku, setSelectedSku] = useState(formats[0]?.sku);

  const selected = formats.find((f) => f.sku === selectedSku) ?? formats[0];

  function handleAdd() {
    addLine({
      productSlug,
      format: selected.format,
      quantity: 1,
      sizeLabel: selected.sizeLabel,
      linePriceCents: selected.priceCents,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Size options — click to select. Active option is primary-highlighted. */}
      <div>
        <h3 className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint">
          {"Select quantity"}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {formats.map((f) => {
            const active = f.sku === selected.sku;
            return (
              <button
                key={f.sku}
                type="button"
                onClick={() => setSelectedSku(f.sku)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start rounded-xl border-2 p-4 text-left transition",
                  active
                    ? "border-primary bg-blue-50"
                    : "border-border bg-surface hover:border-primary hover:bg-surface-soft",
                )}
              >
                <span className="font-mono text-[15px] font-semibold text-text">
                  {f.sizeLabel}
                </span>
                <span className="mt-0.5 font-mono text-[13px] text-text-muted">
                  {usd(f.priceCents)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-to-cart — label reflects the active size (live: "Add to cart — 100mg for $60"). */}
      <div className="flex flex-col gap-2">
        <Button type="button" variant="primary" onClick={handleAdd} className="w-full">
          {`Add to cart — ${selected.sizeLabel} for ${usd(selected.priceCents)}`}
        </Button>
        <a
          href="/checkout"
          className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-[14px] font-semibold text-slate-700 transition hover:text-primary"
        >
          {"View cart →"}
        </a>
      </div>
    </div>
  );
}
