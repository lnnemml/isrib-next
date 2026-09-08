"use client";

// Broadcast controls (Phase E). A broadcast is selected from the dropdown, then either
// test-mailed to the admin or sent to the whole segment. Both invoke server actions that
// re-verify the admin session; the send is guarded by a confirm dialog. Results render
// inline — the actions never throw to the user.
import { useState, useTransition } from "react";
import { sendTestToAdmin, sendBroadcast, type ActionResult } from "./actions";

export interface BroadcastOption {
  id: string;
  label: string;
}

export function BroadcastControls({ options }: { options: BroadcastOption[] }) {
  const [selected, setSelected] = useState<string>(options[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function onTest() {
    setResult(null);
    startTransition(async () => {
      const res = await sendTestToAdmin(selected);
      setResult(res);
    });
  }

  function onSend() {
    setResult(null);
    const opt = options.find((o) => o.id === selected);
    const label = opt?.label ?? selected;
    const confirmed = window.confirm(
      `Send this broadcast to the ENTIRE segment?\n\n${label}\n\nThis cannot be undone.`,
    );
    if (!confirmed) return;
    startTransition(async () => {
      const res = await sendBroadcast(selected);
      setResult(res);
    });
  }

  if (options.length === 0) {
    return (
      <p className="text-caption text-text-muted">
        {"No broadcasts found. Create one in Resend, then it appears here to test and send."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="broadcast-select"
          className="font-mono text-caption uppercase tracking-[0.08em] text-text-faint"
        >
          {"Broadcast"}
        </label>
        <select
          id="broadcast-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={pending}
          className="rounded border border-border bg-surface px-2 py-1.5 text-caption text-text disabled:opacity-50"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTest}
          disabled={pending || !selected}
          className="rounded border border-border bg-surface px-3 py-1.5 text-caption font-semibold text-text transition hover:bg-surface-soft disabled:opacity-50"
        >
          {pending ? "Working…" : "Send test to admin"}
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={pending || !selected}
          className="rounded border border-danger bg-surface px-3 py-1.5 text-caption font-semibold text-danger transition hover:bg-surface-soft disabled:opacity-50"
        >
          {pending ? "Working…" : "Send broadcast to segment"}
        </button>
      </div>

      {result && "error" in result && (
        <span className="text-caption text-danger">{result.error}</span>
      )}
      {result && "ok" in result && (
        <span className="text-caption text-success">{result.message}</span>
      )}
    </div>
  );
}
