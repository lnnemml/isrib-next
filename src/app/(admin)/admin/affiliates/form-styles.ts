// Class strings for the client forms. Kept apart from ui.tsx, which pulls in the product catalog
// and the server-side flag read, so importing these adds neither to a client bundle.

export const FIELD_CLASS =
  "w-full rounded border border-border bg-surface px-2 py-1.5 text-caption text-text disabled:opacity-50";

export const FIELD_LABEL_CLASS =
  "font-mono text-caption uppercase tracking-[0.08em] text-text-faint";
