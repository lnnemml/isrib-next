"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Class strings verbatim from handoff-spec.md §4 "Payment-method selector — radio cards"
// (lines 407–442). No card fields. Crypto is the default and pre-selected; the card slot
// is permanently disabled. Selecting a method moves the selected treatment (border-2
// border-primary bg-blue-50 shadow-sm) to that card; the card slot never becomes
// selectable.
const SELECTED =
  "relative flex cursor-pointer items-start gap-3 rounded-xl border-2 border-primary bg-blue-50 p-5 shadow-sm";
const UNSELECTED =
  "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-5 transition hover:border-primary";

// Backward-compatible: when both `value` and `onChange` are supplied the component is
// controlled (checkout uses this to feed `paymentMethod` into the server action). With
// neither prop it keeps its own state, so existing usages (e.g. the kitchen-sink page)
// render unchanged.
interface PaymentSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function PaymentSelector({ value, onChange }: PaymentSelectorProps = {}) {
  const [internal, setInternal] = useState("crypto");
  const controlled = value !== undefined && onChange !== undefined;
  const method = controlled ? value : internal;
  const setMethod = (next: string) => {
    if (controlled) onChange(next);
    else setInternal(next);
  };
  const cardClass = (v: string) => (method === v ? SELECTED : UNSELECTED);

  return (
    <div className="flex flex-col gap-3">
      {/* CRYPTO — default selected + 10% discount treatment */}
      <label className={cardClass("crypto")}>
        <input
          type="radio"
          name="pay"
          value="crypto"
          checked={method === "crypto"}
          onChange={() => setMethod("crypto")}
          className="mt-0.5 accent-blue-600"
        />
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[16px] font-semibold text-text">Crypto</span>
            <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-success">
              Save 10%
            </span>
          </span>
          <span className="mt-1 block text-[14px] leading-[1.55] text-text-subtle">
            BTC, ETH, USDT, XMR. Address issued after you place the order.
          </span>
        </span>
      </label>

      {/* MANUAL arrangement */}
      <label className={cardClass("manual")}>
        <input
          type="radio"
          name="pay"
          value="manual"
          checked={method === "manual"}
          onChange={() => setMethod("manual")}
          className="mt-0.5 accent-blue-600"
        />
        <span className="flex-1">
          <span className="block text-[16px] font-semibold text-text">Manual arrangement</span>
          <span className="mt-1 block text-[14px] leading-[1.55] text-text-subtle">
            Bank/wire arranged individually over Email, Telegram or Signal.
          </span>
        </span>
      </label>

      {/* CARD — permanently disabled */}
      <label
        aria-disabled
        className="flex items-start gap-3 rounded-xl border border-border bg-slate-100 p-5 cursor-not-allowed opacity-70"
      >
        <input type="radio" name="pay" value="card" disabled className="mt-0.5" />
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[16px] font-semibold text-slate-400">Card</span>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-text-faint">
              Coming soon
            </span>
          </span>
          <span className="mt-1 block text-[14px] leading-[1.55] text-text-faint">
            No card checkout at this time — by design.
          </span>
        </span>
      </label>
    </div>
  );
}

// Order-quantity selector reuses the radio-card pattern (handoff-spec.md line 442):
// unselected border-border bg-surface, selected border-primary bg-blue-50.
interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function RadioCard({ name, value, checked, onChange, children }: RadioCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-5 transition hover:border-primary",
        checked ? "border-primary bg-blue-50" : "border-border bg-surface",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-blue-600"
      />
      <span className="flex-1">{children}</span>
    </label>
  );
}
