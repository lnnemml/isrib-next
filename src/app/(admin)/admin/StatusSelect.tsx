"use client";

// Inline status editor (admin-panel.md §5, C2). Bound to a row's current status; onChange
// fires setStatus() and relies on the action's revalidatePath("/admin") to refresh the row.
// Kept minimal — only the id + current status cross the server→client boundary.
import { useState, useTransition } from "react";
import { setStatus } from "./actions";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending_payment_instructions", label: "Pending instructions" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

type OrderStatus =
  | "pending_payment_instructions"
  | "awaiting_payment"
  | "paid"
  | "fulfilled"
  | "cancelled";

export function StatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    setError(null);
    startTransition(async () => {
      const res = await setStatus(orderId, next);
      if ("error" in res) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        onChange={onChange}
        disabled={pending}
        aria-label="Order status"
        className="rounded border border-border bg-surface px-2 py-1 text-caption text-text disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}
