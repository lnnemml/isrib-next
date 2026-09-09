"use client";

import { useEffect, useState } from "react";
import BuyNowButton from "./BuyNowButton";

// S7 · Offer / Order [B4] — id="offer" is the target of every "Order ISRIB A15" CTA.
// Format selector (Capsules/Powder) preserves localStorage("preferredFormat"). The 4
// SKU cards use the EXACT catalog values from src/lib/copy/products.ts (checkout
// reprices to the same cents): capsules 25×20mg/17000 + 50×20mg/24000; powder
// 500mg/13000 + 1g/20000. Risk reversal is proof-based (NOT a money-back guarantee).
// Copy verbatim from S7 + the deck's FINAL VOICED LINES.

type ProductFormat = "powder" | "capsules";

function FormatToggle({
  selected,
  onSwitch,
}: {
  selected: ProductFormat;
  onSwitch: (fmt: ProductFormat) => void;
}) {
  const opt = (fmt: ProductFormat, label: string) => (
    <button
      onClick={() => onSwitch(fmt)}
      className={
        selected === fmt
          ? "rounded-lg border-2 border-primary bg-blue-50 px-6 py-3 text-[15px] font-semibold text-primary-deep transition"
          : "rounded-lg border-2 border-border bg-surface px-6 py-3 text-[15px] font-semibold text-text-muted transition hover:border-primary"
      }
    >
      {label}
    </button>
  );

  return (
    <div className="mb-2 flex justify-center">
      <div className="inline-flex gap-2 rounded-xl border border-border bg-surface-soft p-1.5">
        {opt("capsules", "Capsules")}
        {opt("powder", "Powder")}
      </div>
    </div>
  );
}

const INCLUDED: { title: string; body: string }[] = [
  {
    title: "Certificate of Analysis",
    body: "Batch-specific HPLC purity, in every order.",
  },
  {
    title: "Dosing protocol",
    body: "Exactly how to run the 5-on / 2-off cycle.",
  },
  {
    title: "Direct support",
    body: "Email, Telegram or Signal, answered by a human.",
  },
];

export default function Offer() {
  const [selectedFormat, setSelectedFormat] = useState<ProductFormat>("capsules");

  useEffect(() => {
    const saved = localStorage.getItem("preferredFormat") as ProductFormat | null;
    if (saved === "powder" || saved === "capsules") setSelectedFormat(saved);
  }, []);

  const handleFormatSwitch = (fmt: ProductFormat) => {
    setSelectedFormat(fmt);
    localStorage.setItem("preferredFormat", fmt);
  };

  return (
    <section id="offer" className="scroll-mt-8 bg-surface-soft py-[90px]">
      <div className="mx-auto max-w-[--container-page] px-8">
        <div className="mb-8 text-center">
          <p className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.16em] text-accent-strong">
            Order ISRIB A15
          </p>
          <h2 className="mb-3 text-h2 font-bold">Start your protocol.</h2>
          <p className="mb-4 font-mono text-small uppercase tracking-[0.06em] text-text-subtle">
            Synthesized in-house · NMR-verified · COA with every order · ships within 48h
          </p>
          <p className="mx-auto mb-6 max-w-[62ch] text-small font-semibold text-accent-strong">
            A reagent supplier charges <span className="font-mono">$415</span> for{" "}
            <span className="font-mono">50 mg</span>. A full gram here is{" "}
            <span className="font-mono">$200</span> — about <span className="font-mono">20×</span>{" "}
            the compound per dollar.
          </p>

          <FormatToggle selected={selectedFormat} onSwitch={handleFormatSwitch} />
          <p className="mx-auto mt-3 max-w-[52ch] text-small text-text-muted">
            {selectedFormat === "capsules"
              ? "Pre-dosed 20 mg. No scale, no solvents, no prep — start today."
              : "Best value per dose. You measure with a milligram scale."}
          </p>
        </div>

        {selectedFormat === "capsules" && (
          <div className="mx-auto grid max-w-[820px] gap-6 md:grid-cols-2">
            {/* Starter Protocol */}
            <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-h3 font-semibold">Starter Protocol</h3>
                <div className="mb-1">
                  <span className="font-mono text-[36px] font-semibold text-primary">$170</span>
                </div>
                <p className="font-mono text-small text-text-subtle">25 × 20 mg</p>
                <p className="text-small text-text-subtle">
                  ~5-week protocol (5 days on, 2 off)
                </p>
              </div>
              <ul className="mb-8 space-y-2 text-small text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Pre-measured 20 mg
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>No scale needed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>COA included
                </li>
              </ul>
              <BuyNowButton
                productSlug="isrib-a15"
                format="capsules"
                sizeLabel="25 × 20mg"
                priceCents={17000}
                label="Order 25 Capsules"
              />
            </div>

            {/* Full Protocol — BEST PER-DOSE VALUE badge */}
            <div className="relative rounded-xl border-2 border-primary bg-surface p-8 shadow-md">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="whitespace-nowrap rounded-full bg-primary px-5 py-1.5 font-mono text-mono-label font-semibold uppercase tracking-[0.06em] text-white">
                  Best Per-Dose Value
                </span>
              </div>
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-h3 font-semibold">Full Protocol</h3>
                <div className="mb-1">
                  <span className="font-mono text-[36px] font-semibold text-primary">$240</span>
                </div>
                <p className="font-mono text-small text-text-subtle">50 × 20 mg</p>
                <p className="text-small text-text-subtle">~10-week protocol</p>
              </div>
              <ul className="mb-8 space-y-2 text-small text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Best per-capsule value
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Pre-measured 20 mg
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>COA included
                </li>
              </ul>
              <BuyNowButton
                productSlug="isrib-a15"
                format="capsules"
                sizeLabel="50 × 20mg"
                priceCents={24000}
                label="Order 50 Capsules"
              />
            </div>
          </div>
        )}

        {selectedFormat === "powder" && (
          <div className="mx-auto grid max-w-[820px] gap-6 md:grid-cols-2">
            {/* 500 mg */}
            <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-h3 font-semibold">Starter Protocol</h3>
                <div className="mb-1">
                  <span className="font-mono text-[36px] font-semibold text-primary">$130</span>
                </div>
                <p className="font-mono text-small text-text-subtle">500 mg · ~25 doses at 20 mg</p>
              </div>
              <ul className="mb-8 space-y-2 text-small text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Same protocol, you measure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Requires a milligram scale
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>COA included
                </li>
              </ul>
              <BuyNowButton
                productSlug="isrib-a15"
                format="powder"
                sizeLabel="500mg"
                priceCents={13000}
                label="Order 500mg Powder"
              />
            </div>

            {/* 1 g */}
            <div className="relative rounded-xl border-2 border-primary bg-surface p-8 shadow-md">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="whitespace-nowrap rounded-full bg-primary px-5 py-1.5 font-mono text-mono-label font-semibold uppercase tracking-[0.06em] text-white">
                  Best Value
                </span>
              </div>
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-h3 font-semibold">Full Protocol</h3>
                <div className="mb-1">
                  <span className="font-mono text-[36px] font-semibold text-primary">$200</span>
                </div>
                <p className="font-mono text-small text-text-subtle">
                  1 g · ~50 doses at 20 mg · best value
                </p>
              </div>
              <ul className="mb-8 space-y-2 text-small text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Same protocol, you measure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>Best per-dose value
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>COA included
                </li>
              </ul>
              <BuyNowButton
                productSlug="isrib-a15"
                format="powder"
                sizeLabel="1g"
                priceCents={20000}
                label="Order 1g Powder"
              />
            </div>
          </div>
        )}

        {/* What's included */}
        <div className="mx-auto mt-8 max-w-[820px] rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-center text-h3 font-semibold">What's included</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {INCLUDED.map((item) => (
              <div key={item.title} className="flex items-start gap-2 text-small">
                <span className="mt-0.5 text-success">✓</span>
                <span className="text-text-muted">
                  <span className="font-semibold text-text">{item.title}</span> — {item.body}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk reversal WITHOUT a guarantee — reverse the REAL fear (purity/authenticity) */}
        <div className="mx-auto mt-6 max-w-[820px] rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="text-small leading-[1.7] text-text-muted">
            This is a research compound, so every sale is final. But here's what we can promise:
            exactly what's in the bottle. Every batch is NMR-verified and ships with a Certificate
            of Analysis. Want to see the current batch's COA before you order? Just ask — we'll
            send it.
          </p>
        </div>

        {/* Disclaimer + payment note */}
        <div className="mx-auto mt-6 max-w-[820px] rounded-xl border border-border bg-surface-soft p-6 text-center">
          <p className="mb-2 text-small text-text-subtle">
            <span className="font-semibold text-text">Important:</span> ISRIB A15 is a research
            compound, not an FDA-approved product. Sold for research use.
          </p>
          <p className="text-small text-text-subtle">
            Pay by crypto or arrange manually — details sent after you place the order.
          </p>
        </div>
      </div>
    </section>
  );
}
