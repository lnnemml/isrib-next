"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { formatCents, type Trial, type PerGramTier } from "@/lib/copy/products";
import {
  computeTieredPrice,
  formatQuantity,
  MAX_MG,
  MIN_MG,
  type TieredPriceResult,
} from "@/lib/copy/pricing";
import { Button } from "@/components/ui";

// Faithful port of the live A15 per-gram calculator. Powder path only (capsules are a
// separate selector in OrderBlock). All cart writes go through useCart().addLine.
interface PerGramCalculatorProps {
  productSlug: string;
  trials: Trial[];
  tiers: PerGramTier[];
}

type Unit = "mg" | "g";

// Reference rows (trials + tiers) — clicking prefills the input, matching the live page.
interface RefRow {
  label: string;
  price: string;
  discount?: string;
  mg: number;
}

export function PerGramCalculator({ productSlug, trials, tiers }: PerGramCalculatorProps) {
  const { addLine } = useCart();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState<Unit>("g");
  const [result, setResult] = useState<TieredPriceResult | null>(null);

  useEffect(() => setMounted(true), []);

  const pricing = useMemo(() => ({ trials, tiers }), [trials, tiers]);

  const refRows: RefRow[] = useMemo(() => {
    const trialRows: RefRow[] = trials
      .filter((t) => t.mg != null)
      .map((t) => ({ label: t.sizeLabel, price: formatCents(t.priceCents), mg: t.mg as number }));
    const tierRows: RefRow[] = tiers
      .filter((t) => t.minMg != null)
      .map((t) => ({
        label: t.rangeLabel,
        price: `${formatCents(t.perGramCents)}/g`,
        discount: t.discountPct > 0 ? `Save ${t.discountPct}%` : undefined,
        mg: t.minMg as number,
      }));
    return [...trialRows, ...tierRows];
  }, [trials, tiers]);

  function toMg(v: string, u: Unit): number {
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return NaN;
    return u === "g" ? Math.round(n * 1000) : Math.round(n);
  }

  function calculate(mg: number) {
    setResult(computeTieredPrice(mg, pricing));
  }

  function handleCalculate() {
    calculate(toMg(value, unit));
  }

  function handleRefClick(mg: number) {
    if (mg >= 1000) {
      setValue(String(mg / 1000));
      setUnit("g");
    } else {
      setValue(String(mg));
      setUnit("mg");
    }
    calculate(mg);
  }

  function handleAdd() {
    if (result?.status !== "ok") return;
    addLine({
      productSlug,
      format: "powder",
      quantity: 1,
      sizeLabel: result.sizeLabel,
      linePriceCents: result.totalCents,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Reference tiers — click to prefill */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {refRows.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => handleRefClick(r.mg)}
            className="flex flex-col items-start rounded-lg border border-border bg-surface p-3 text-left transition hover:border-primary"
          >
            <span className="font-mono text-[13px] text-text">{r.label}</span>
            <span className="mt-1 font-mono text-[15px] font-semibold text-text">{r.price}</span>
            {r.discount && (
              <span className="mt-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-success">
                {r.discount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom quantity */}
      <div>
        <label htmlFor="a15-qty" className="mb-2 block text-small text-text-subtle">
          {"Enter custom quantity"}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="a15-qty"
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-[15px] text-text focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
          />
          <select
            aria-label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-[15px] text-text focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
          >
            <option value="mg">{"mg"}</option>
            <option value="g">{"g"}</option>
          </select>
          <Button type="button" variant="secondary" onClick={handleCalculate} disabled={!mounted}>
            {"Calculate"}
          </Button>
        </div>
        <p className="mt-2 font-mono text-[11px] text-text-faint">
          {`Min ${formatQuantity(MIN_MG)} · Max ${formatQuantity(MAX_MG)}`}
        </p>
      </div>

      {/* Result */}
      {result && result.status === "ok" && (
        <div className="rounded-xl border border-border bg-surface-soft p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-small text-text-subtle">{result.sizeLabel}</span>
            <span className="font-mono text-[26px] font-semibold text-text">{formatCents(result.totalCents)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[12px] text-text-subtle">
            <span>{`${formatCents(result.perGramCents)}/g`}</span>
            {result.savingsCents > 0 && (
              <span className="text-success">{`Save ${formatCents(result.savingsCents)} (${result.savingsPct}%)`}</span>
            )}
          </div>
          <div className="mt-4">
            <Button type="button" variant="primary" onClick={handleAdd} disabled={!mounted} className="w-full">
              {`Add to cart — ${result.sizeLabel} for ${formatCents(result.totalCents)}`}
            </Button>
          </div>
        </div>
      )}

      {result && result.status === "below-min" && (
        <p className="text-small text-danger">{`Minimum quantity is ${formatQuantity(MIN_MG)}.`}</p>
      )}
      {result && result.status === "gap" && (
        <p className="text-small text-danger">
          {"Please choose a valid quantity — 100mg, 500mg, or within a listed gram range (1g, 2–4g, 5–9g, 10–30g)."}
        </p>
      )}
      {result && result.status === "bulk" && (
        <p className="text-small text-text-muted">
          {"Orders over 30g are arranged individually — "}
          <a href="/contact" className="text-primary transition hover:text-primary-hover">
            {"contact us"}
          </a>
          {"."}
        </p>
      )}
    </div>
  );
}
