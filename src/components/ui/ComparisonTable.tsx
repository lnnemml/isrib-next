import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Class strings verbatim from handoff-spec.md §4 "Comparison table" (lines 330–358).
// The ISRIB column is highlighted: header bg-blue-50 text-primary-deep, body cells
// bg-[#f8faff]. Numeric cells add font-mono.
interface ComparisonColumn {
  label: ReactNode;
  highlight?: boolean;
}

interface ComparisonCell {
  value: ReactNode;
  mono?: boolean;
}

interface ComparisonRow {
  label: ReactNode;
  cells: ComparisonCell[];
}

interface ComparisonTableProps {
  // Columns after the (empty) first corner cell, in left-to-right order.
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export function ComparisonTable({ columns, rows }: ComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <table className="w-full border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[24%] px-6 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint" />
            {columns.map((c, i) =>
              c.highlight ? (
                <th
                  key={i}
                  className="bg-blue-50 px-6 py-4 text-left text-[14px] font-bold text-primary-deep"
                >
                  {c.label}
                </th>
              ) : (
                <th key={i} className="px-5 py-4 text-left text-[14px] font-semibold text-text-subtle">
                  {c.label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-border-soft">
              <td className="px-6 py-4 font-medium text-slate-700">{r.label}</td>
              {r.cells.map((cell, ci) =>
                columns[ci]?.highlight ? (
                  <td key={ci} className={cn("bg-[#f8faff] px-6 py-4 text-text", cell.mono && "font-mono")}>
                    {cell.value}
                  </td>
                ) : (
                  <td key={ci} className={cn("px-5 py-4 text-text-subtle", cell.mono && "font-mono")}>
                    {cell.value}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
