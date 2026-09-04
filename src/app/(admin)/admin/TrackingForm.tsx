"use client";

// Inline tracking capture (admin-panel.md §5, C2). Saving sets tracking + shipped_at +
// status=fulfilled and auto-sends the shipped email (carrier + number) server-side. If the
// order already has tracking, the fields are pre-filled and remain editable (re-save updates
// and re-sends). Kept minimal.
import { useState, useTransition } from "react";
import { saveTracking } from "./actions";

export function TrackingForm({
  orderId,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  trackingNumber: string | null;
  carrier: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState(trackingNumber ?? "");
  const [carr, setCarr] = useState(carrier ?? "");
  const alreadyShipped = Boolean(trackingNumber);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveTracking(orderId, track, carr);
      if ("error" in res) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          value={carr}
          onChange={(e) => setCarr(e.target.value)}
          placeholder="Carrier"
          aria-label="Carrier"
          disabled={pending}
          className="w-24 rounded border border-border bg-surface px-2 py-1 text-caption text-text disabled:opacity-50"
        />
        <input
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          placeholder="Tracking #"
          aria-label="Tracking number"
          disabled={pending}
          className="w-32 rounded border border-border bg-surface px-2 py-1 text-caption text-text disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-primary bg-surface px-2 py-1 text-caption font-semibold text-primary transition hover:bg-surface-soft disabled:opacity-50"
        >
          {pending ? "Saving…" : alreadyShipped ? "Update" : "Save"}
        </button>
      </div>
      {alreadyShipped && (
        <span className="text-caption text-text-faint">
          {"Shipped · "}
          {carrier}
          {" "}
          {trackingNumber}
        </span>
      )}
      {error && <span className="text-caption text-danger">{error}</span>}
    </form>
  );
}
