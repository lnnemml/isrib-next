// ADR 0025 — the AFFILIATES_ENABLED switch. No "server-only" and no db, because the proxy reads
// it too. Off means no buyer-facing change.
export function affiliatesEnabled(): boolean {
  return process.env.AFFILIATES_ENABLED?.trim() === "true";
}
