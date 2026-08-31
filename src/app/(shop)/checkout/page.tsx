"use client";

// Cart shell only — lists the cart's line items with qty/remove controls and a subtotal.
// NO card fields, NO "Pay Now", NO Stripe, NO order submission — payment is manual
// arrangement + crypto (NowPayments), wired in a later session. See CLAUDE.md.

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { getProduct, formatCents } from "@/lib/copy/products";
import { Button } from "@/components/ui";

function productName(slug: string): string {
  return getProduct(slug)?.name ?? slug;
}

export default function CheckoutPage() {
  const { lines, count, subtotalCents, updateQuantity, removeLine } = useCart();

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-[820px] px-8 py-24">
        <h1 className="mb-4 text-h2 font-bold">{"Your cart"}</h1>
        <p className="text-body text-text-muted">
          {"Your cart is empty. Browse the "}
          <Link href="/products" className="text-primary transition hover:text-primary-hover">
            {"products"}
          </Link>
          {" to get started."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[820px] px-8 py-16">
      <h1 className="mb-2 text-h2 font-bold">{"Your cart"}</h1>
      <p className="mb-8 text-small text-text-subtle">
        {count} {count === 1 ? "item" : "items"}
      </p>

      <ul className="flex flex-col divide-y divide-border-soft border-y border-border">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-text">{productName(line.productSlug)}</p>
              <p className="font-mono text-[12px] text-text-subtle">
                {line.sizeLabel} · {line.format} · {formatCents(line.linePriceCents)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(line.key, line.quantity - 1)}
                  aria-label={`Decrease ${line.sizeLabel} quantity`}
                  className="flex size-7 items-center justify-center rounded-md border border-border font-mono text-[14px] text-text-subtle transition hover:border-primary hover:text-primary"
                >
                  {"−"}
                </button>
                <span className="w-6 text-center font-mono text-[13px] text-text">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.key, line.quantity + 1)}
                  aria-label={`Increase ${line.sizeLabel} quantity`}
                  className="flex size-7 items-center justify-center rounded-md border border-border font-mono text-[14px] text-text-subtle transition hover:border-primary hover:text-primary"
                >
                  {"+"}
                </button>
              </div>

              <span className="w-16 text-right font-mono text-[14px] font-semibold text-text">
                {formatCents(line.linePriceCents * line.quantity)}
              </span>

              <button
                type="button"
                onClick={() => removeLine(line.key)}
                aria-label={`Remove ${productName(line.productSlug)} ${line.sizeLabel}`}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-faint transition hover:text-danger"
              >
                {"Remove"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-body text-text-muted">{"Subtotal"}</span>
        <span className="font-mono text-[20px] font-semibold text-text">{formatCents(subtotalCents)}</span>
      </div>

      <div className="mt-8">
        <Button variant="primary" disabled className="w-full sm:w-auto">
          {"Continue — payment next"}
        </Button>
        <p className="mt-3 text-caption text-text-faint">
          {"Checkout and manual/crypto payment arrive in a later session. No card payment, by design."}
        </p>
      </div>
    </main>
  );
}
