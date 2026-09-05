"use client";

import { useState } from "react";

// Tiny client child for the referrals page. Receives ONLY the plain string to copy —
// never the customer row or any server-only object. Copies to the clipboard and shows
// a brief "Copied" confirmation.
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context / permissions) — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ? `Copy ${label}` : "Copy"}
      className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
