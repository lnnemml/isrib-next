"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { type Product, specValue } from "@/lib/copy/products";
import { getCatalogOptions, hasCapsules } from "@/lib/copy/catalog";

// A mini order block for the /products catalog grid — a faithful port of the live
// products.html card ("rich inline purchase"): formula box, name + subtitle, purity/COA
// line, a size selector wired to a price display, an inline Add-to-cart whose label
// reflects the selection, and a "View details" link. Design tokens only.
interface ProductCardProps {
  product: Product;
}

// Two-decimal dollar display ("$360.00") — matches the live catalog price line and the
// sibling FixedSizeSelector. Kept local so this card is self-consistent.
function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addLine } = useCart();
  const options = getCatalogOptions(product);

  // True only for per-gram products (A15/ISRIB), which have discounted sizes — drives the
  // static bulk-discount hint. Fixed products (MPEP/N-Acetyl/Bromantane/ZZL-7) have none.
  const hasTieredDiscounts = options.some((o) => o.savingsPct);

  // Default to the "popular" preset (matches the live `selected` <option>); fall back to
  // the first option.
  const defaultIndex = Math.max(
    0,
    options.findIndex((o) => o.popular),
  );
  const [index, setIndex] = useState(defaultIndex);
  const selected = options[index] ?? options[0];

  // Purity ported from spec data (never "Included" for COA — variant A, ADR 0008).
  const purity = specValue(product, "Purity") ?? "≥98% (HPLC)";
  const capsules = hasCapsules(product);

  function handleAdd() {
    if (!selected) return;
    addLine({
      productSlug: product.slug,
      format: "powder",
      quantity: 1,
      sizeLabel: selected.sizeLabel,
      linePriceCents: selected.priceCents,
    });
  }

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
      {/* Formula box — bordered slot echoing the product hero's formula panel, smaller. */}
      <div className="mb-5 flex aspect-[3/2] items-center justify-center rounded-lg border border-border bg-surface-soft p-4">
        {product.assets?.formulaSvg ? (
          // eslint-disable-next-line @next/next/no-img-element -- static SVG asset
          <img
            src={product.assets.formulaSvg}
            alt={`${product.name} molecular structure`}
            className="block max-h-full w-auto"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="font-mono text-[12px] text-text-faint">{"Structure — coming soon"}</span>
        )}
      </div>

      {/* Name + data-driven subtitle (consistent with the detail pages). */}
      <div className="mb-4">
        <h2 className="text-[19px] font-semibold text-text">{product.name}</h2>
        <p className="mt-0.5 text-small text-text-muted">{product.categorySubtitle}</p>
      </div>

      {/* Purity + COA line — COA "on request", never "Included". */}
      <dl className="mb-5 flex flex-col gap-1.5 border-y border-border-soft py-3">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-small text-text-subtle">{"Purity"}</dt>
          <dd className="font-mono text-[13px] font-semibold text-success">{purity}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-small text-text-subtle">{"COA"}</dt>
          <dd className="font-mono text-[13px] text-text">{"On request"}</dd>
        </div>
      </dl>

      {/* Size selector → price display. Grows to fill so footers align across the grid. */}
      <div className="flex flex-1 flex-col">
        <label
          htmlFor={`size-${product.slug}`}
          className="mb-2 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint"
        >
          {"Select size"}
        </label>
        <select
          id={`size-${product.slug}`}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 font-mono text-[14px] text-text transition focus:border-primary focus:outline-none"
        >
          {options.map((o, i) => (
            <option key={o.sizeLabel} value={i}>
              {`${o.sizeLabel} — ${usd(o.priceCents)}${o.popular && options.length > 1 ? " · Most popular" : ""}`}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-3 font-mono text-[24px] font-semibold text-text">
            {usd(selected.priceCents)}
          </div>
        )}

        {selected && selected.savingsCents ? (
          <p className="mt-1 font-mono text-[13px] font-medium text-success">
            {`You save ${usd(selected.savingsCents)} (${selected.savingsPct}%)`}
          </p>
        ) : null}

        {hasTieredDiscounts && (
          <p className="mt-2 text-small text-text-subtle">
            {"Bulk discount — save up to 20% on 10g orders"}
          </p>
        )}

        {capsules && (
          <div className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-center text-small font-medium text-success">
            <span>{"💊 Also available in "}</span>
            <a
              href={`/products/${product.slug}`}
              className="underline underline-offset-2 hover:text-success"
            >
              {"pre-measured 20mg capsules"}
            </a>
          </div>
        )}
      </div>

      {/* Add-to-cart (label reflects selection) + View details. */}
      <div className="mt-5 flex flex-col gap-2">
        <Button type="button" variant="primary" onClick={handleAdd} className="w-full">
          {selected
            ? `Add to cart — ${selected.sizeLabel} for ${usd(selected.priceCents)}`
            : "Add to cart"}
        </Button>
        <a
          href={`/products/${product.slug}`}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-[14px]",
            "font-semibold text-slate-700 transition hover:text-primary",
          )}
        >
          {"View details →"}
        </a>
      </div>
    </article>
  );
}
