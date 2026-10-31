"use client";

import { useState } from "react";

const COPIED_MS = 2000;

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // Clipboard access can be refused. The value stays on screen to select by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="shrink-0 rounded border border-border bg-surface px-2 py-1 text-caption font-semibold text-text transition hover:bg-surface-soft"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
