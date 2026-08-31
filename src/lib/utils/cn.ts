// Minimal class joiner. Appends conditional state strings onto the exact spec class
// strings from handoff-spec.md §4 — it filters falsy and joins with a space, and does
// NOT merge/dedupe (no tailwind-merge), so verbatim spec classes are never dropped or
// reordered away.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
