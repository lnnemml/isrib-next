"use client";

import { useState } from "react";
import { PerGramCalculator } from "./PerGramCalculator";
import { AddToCartButton } from "./AddToCartButton";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { formatCents, type Trial, type PerGramTier, type FixedFormat } from "@/lib/copy/products";

// Faithful A15 order block: header + specs, powder/capsule format selector, the per-gram
// calculator (powder) or capsule variants, perks, and a trust strip near the CTA. Cart
// writes go through useCart (inside the children).
interface OrderBlockProps {
  productSlug: string;
  productName: string;
  subtitle: string;
  purity?: string;
  trials: Trial[];
  tiers: PerGramTier[];
  capsules?: FixedFormat[];
  perks: string[];
}

type Format = "powder" | "capsules";

function FormatOption({
  icon,
  label,
  desc,
  selected,
  onClick,
}: {
  icon: string;
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
        "flex items-start gap-3 rounded-xl p-4 text-left transition",
        selected
          ? "border-2 border-primary bg-blue-50"
          : "border-2 border-border bg-surface hover:border-primary",
      )}
    >
      <span aria-hidden className="text-[22px] leading-none">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold text-text">{label}</span>
        <span className="mt-0.5 text-small text-text-subtle">{desc}</span>
      </span>
    </button>
  );
}

export function OrderBlock({
  productSlug,
  productName,
  subtitle,
  purity,
  trials,
  tiers,
  capsules,
  perks,
}: OrderBlockProps) {
  const [format, setFormat] = useState<Format>("powder");
  const hasCapsules = !!capsules && capsules.length > 0;

  return (
    <Card accent className="p-6 shadow-md sm:p-7">
      {/* Order-card header — name + subtitle + key spec line */}
      <div className="mb-6 border-b border-border-soft pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-h3 font-semibold text-text">{productName}</h3>
          <span className="text-small text-text-subtle">{subtitle}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-[12px]">
          {purity && (
            <span className="text-text-subtle">
              {"Purity: "}
              <span className="font-medium text-text">{purity}</span>
            </span>
          )}
          <span className="text-text-subtle">
            {"COA: "}
            <span className="font-medium text-text">{"available per batch (on request)"}</span>
          </span>
        </div>
      </div>

      {hasCapsules && (
        <div className="mb-6">
          <h3 className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint">
            {"Select format"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FormatOption
              icon="⚗️"
              label="Powder"
              desc="Flexible dosing, bulk pricing"
              selected={format === "powder"}
              onClick={() => setFormat("powder")}
            />
            <FormatOption
              icon="💊"
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
          {capsules!.map((c, i) => {
            const popular = i === capsules!.length - 1;
            return (
              <div
                key={c.sku}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border-2 p-4 shadow-sm transition",
                  popular ? "border-accent bg-cyan-50 ring-1 ring-accent/30" : "border-border bg-surface",
                )}
              >
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]",
                      popular ? "text-accent-strong" : "text-text-faint",
                    )}
                  >
                    {popular && <span aria-hidden>{"⭐"}</span>}
                    {popular ? "Popular" : "Starter"}
                  </span>
                  <div className="mt-1.5 font-mono text-[14px] text-text">{c.sizeLabel}</div>
                  <div className="mt-1 font-mono text-[22px] font-semibold text-text">
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
            );
          })}
        </div>
      )}

      {/* Perks + trust/shipping strip near the CTA */}
      <div className="mt-6 border-t border-border-soft pt-5">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface-soft px-4 py-2.5 text-small">
          <span aria-hidden className="text-[16px] leading-none">
            {"🚚"}
          </span>
          <span className="font-semibold text-text">{"Free worldwide shipping"}</span>
          <span className="text-text-subtle">{"on all orders"}</span>
        </div>
        <ul className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2 text-small text-text-muted">
              <span className="size-1.5 shrink-0 rounded-full bg-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
