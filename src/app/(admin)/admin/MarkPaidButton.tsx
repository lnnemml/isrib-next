"use client";

// "Mark paid" for MANUAL orders (admin-panel.md §5, C2). Confirms the manual payment,
// which fires the paymentConfirmed email (the /shipping/<token> link) server-side. Shown by
// the parent only when the order is still pending/awaiting.
import { useState, useTransition } from "react";
import { markPaid } from "./actions";

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await markPaid(orderId);
      if ("error" in res) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded border border-success bg-surface px-2 py-1 text-caption font-semibold text-success transition hover:bg-surface-soft disabled:opacity-50"
      >
        {pending ? "Marking…" : "Mark paid"}
      </button>
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}
