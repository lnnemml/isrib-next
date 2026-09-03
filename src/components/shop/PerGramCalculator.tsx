"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { formatCents, type Trial, type PerGramTier } from "@/lib/copy/products";
import {
  computeTieredPrice,
  formatQuantity,
  MAX_MG,
  MIN_MG,
  type TieredPriceResult,
} from "@/lib/copy/pricing";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

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
  badge: string;
  range: string;
  rate: string;
  savings?: string;
  popular?: boolean;
  mg: number;
}

export function PerGramCalculator({ productSlug, trials, tiers }: PerGramCalculatorProps) {
  const { addLine } = useCart();
  const pricing = useMemo(() => ({ trials, tiers }), [trials, tiers]);

  // Default to the standard 1g tier so the breakdown + CTA are visible immediately,
  // matching the live page (which opens on "1g for $200"). Deterministic on server/client.
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState<Unit>("g");
  const [selectedMg, setSelectedMg] = useState(1000);
  const [result, setResult] = useState<TieredPriceResult | null>(() =>
    computeTieredPrice(1000, pricing),
  );

  const refRows: RefRow[] = useMemo(() => {
    const trialRows: RefRow[] = trials
      .filter((t) => t.mg != null)
      .map((t) => ({
        badge: t.badge ?? "Trial",
        range: t.sizeLabel,
        rate: formatCents(t.priceCents),
        mg: t.mg as number,
      }));
    const tierRows: RefRow[] = tiers
      .filter((t) => t.minMg != null)
      .map((t) => ({
        badge: t.tierName ?? "Standard",
        range: t.rangeLabel,
        rate: `${formatCents(t.perGramCents)}/g`,
        savings: t.discountPct > 0 ? `Save ${t.discountPct}%` : undefined,
        popular: t.popular,
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
    const mg = toMg(value, unit);
    setSelectedMg(mg);
    calculate(mg);
  }

  function handleRefClick(mg: number) {
    if (mg >= 1000) {
      setValue(String(mg / 1000));
      setUnit("g");
    } else {
      setValue(String(mg));
      setUnit("mg");
    }
    setSelectedMg(mg);
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

  const ok = result?.status === "ok" ? result : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Tier grid — click to prefill. Popular tier is accent-highlighted. */}
      <div>
        <h3 className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint">
          {"Select quantity"}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {refRows.map((r) => {
            const active = r.mg === selectedMg;
            return (
              <button
                key={r.range}
                type="button"
                onClick={() => handleRefClick(r.mg)}
                aria-pressed={active}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition",
                  r.popular
                    ? "border-accent bg-cyan-50 shadow-sm ring-1 ring-accent/30"
                    : active
                      ? "border-primary bg-blue-50"
                      : "border-border bg-surface hover:border-primary hover:bg-surface-soft",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]",
                    r.popular ? "text-accent-strong" : "text-text-faint",
                  )}
                >
                  {r.popular && <span aria-hidden>{"⭐"}</span>}
                  {r.badge}
                </span>
                <span className="mt-1.5 font-mono text-[15px] font-semibold text-text">{r.range}</span>
                <span className="mt-0.5 font-mono text-[13px] text-text-muted">{r.rate}</span>
                {r.savings && (
                  <span className="mt-2 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-success">
                    {r.savings}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
          <Button type="button" variant="secondary" onClick={handleCalculate}>
            {"Calculate"}
          </Button>
        </div>
        <p className="mt-2 font-mono text-[11px] text-text-faint">
          {`Min ${formatQuantity(MIN_MG)} · Max ${formatQuantity(MAX_MG)} · larger orders arranged individually`}
        </p>
      </div>

      {/* Price breakdown — prominent dark panel (total / quantity / per-gram / savings / tier),
          mirroring the live page's Total Price card via the locked inverse Card variant. */}
      {ok && (
        <Card inverse className="p-6">
          <div className="flex items-baseline justify-between border-b border-border-inverse pb-4">
            <span className="text-[15px] font-semibold text-slate-300">{"Total Price"}</span>
            <span className="font-mono text-[28px] font-semibold tracking-[-0.02em] text-cyan-400">
              {formatCents(ok.totalCents)}
            </span>
          </div>
          <dl className="mt-4 flex flex-col gap-2.5 font-mono text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">{"Quantity"}</dt>
              <dd className="text-white">{`${ok.sizeLabel} (${ok.mg}mg)`}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">{"Price per gram"}</dt>
              <dd className="text-white">{`${formatCents(ok.perGramCents)}/g`}</dd>
            </div>
            {ok.savingsCents > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-success">{"You save"}</dt>
                <dd className="font-semibold text-success">{`${formatCents(ok.savingsCents)} (${ok.savingsPct}%)`}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 border-t border-border-inverse pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-inverse bg-surface-inverse-card px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-cyan-400">
              {`${ok.tierName} tier`}
            </span>
          </div>
        </Card>
      )}

      {/* Prominent, always-visible Add-to-Cart (reflects current selection) */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="primary"
          onClick={handleAdd}
          disabled={!ok}
          className="w-full"
        >
          {ok
            ? `Add to cart — ${ok.sizeLabel} for ${formatCents(ok.totalCents)}`
            : "Choose a valid quantity"}
        </Button>
        <a
          href="/checkout"
          className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-[14px] font-semibold text-slate-700 transition hover:text-primary"
        >
          {"View cart →"}
        </a>
      </div>

      {/* Invalid-state guidance */}
      {result?.status === "below-min" && (
        <p className="text-small text-danger">{`Minimum quantity is ${formatQuantity(MIN_MG)}.`}</p>
      )}
      {result?.status === "gap" && (
        <p className="text-small text-danger">
          {"Please choose a valid quantity — 100mg, 500mg, or within a listed gram range (1g, 2–4g, 5–9g, 10–30g)."}
        </p>
      )}
      {result?.status === "bulk" && (
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
