"use client";

import { useState } from "react";
import { PerGramCalculator } from "./PerGramCalculator";
import { AddToCartButton } from "./AddToCartButton";
import { cn } from "@/lib/utils/cn";
import { formatCents, type Trial, type PerGramTier, type FixedFormat } from "@/lib/copy/products";

// Faithful A15 order block: powder/capsule format selector + the per-gram calculator
// (powder) or capsule variants. Cart writes go through useCart (inside the children).
interface OrderBlockProps {
  productSlug: string;
  trials: Trial[];
  tiers: PerGramTier[];
  capsules?: FixedFormat[];
}

type Format = "powder" | "capsules";

function FormatOption({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-start rounded-xl p-4 text-left transition",
        selected
          ? "border-2 border-primary bg-blue-50"
          : "border-2 border-border bg-surface hover:border-primary",
      )}
    >
      <span className="text-[15px] font-semibold text-text">{label}</span>
      <span className="mt-1 text-small text-text-subtle">{desc}</span>
    </button>
  );
}

export function OrderBlock({ productSlug, trials, tiers, capsules }: OrderBlockProps) {
  const [format, setFormat] = useState<Format>("powder");
  const hasCapsules = !!capsules && capsules.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
      {hasCapsules && (
        <div className="mb-6">
          <h3 className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint">
            {"Select format"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FormatOption
              label="Powder"
              desc="Flexible dosing, bulk pricing"
              selected={format === "powder"}
              onClick={() => setFormat("powder")}
            />
            <FormatOption
              label="Capsules"
              desc="Pre-measured 20mg doses"
              selected={format === "capsules"}
              onClick={() => setFormat("capsules")}
            />
          </div>
        </div>
      )}

      {format === "powder" || !hasCapsules ? (
        <PerGramCalculator productSlug={productSlug} trials={trials} tiers={tiers} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {capsules!.map((c) => (
            <div
              key={c.sku}
              className="flex flex-col justify-between rounded-lg border border-border bg-surface p-4 shadow-sm"
            >
              <div>
                <div className="font-mono text-[14px] text-text">{c.sizeLabel}</div>
                <div className="mt-1 font-mono text-[20px] font-semibold text-text">
                  {formatCents(c.priceCents)}
                </div>
              </div>
              <div className="mt-3">
                <AddToCartButton
                  productSlug={productSlug}
                  format="capsules"
                  sizeLabel={c.sizeLabel}
                  priceCents={c.priceCents}
                  variant="secondary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
