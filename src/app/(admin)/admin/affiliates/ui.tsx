// Presentational pieces shared by the two affiliate pages. No state and no data access, so they
// render on the server. They mirror the dashboard's primitives and use existing tokens only.
import Link from "next/link";
import type { ReactNode } from "react";
import { affiliatesEnabled } from "@/lib/affiliate/flag";
import { formatCents } from "@/lib/copy/products";

const TOP_BAR_LINK =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft";

export function TopBar({
  section,
  backHref,
  backLabel,
}: {
  section: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
        <div className="font-semibold tracking-[-0.01em] text-text">
          {"ISRIB "}
          <span className="text-text-faint">{section}</span>
        </div>
        <Link href={backHref} className={TOP_BAR_LINK}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

export function FlagNotice() {
  const enabled = affiliatesEnabled();
  // Presence only: neither value goes past these two lines. Trimmed like the code that reads them.
  const missingHashSecret = !process.env.AFFILIATE_HASH_SECRET?.trim();
  const missingBotToken = !process.env.TELEGRAM_BOT_TOKEN?.trim();

  return (
    <>
      <p className={`text-caption ${enabled ? "text-success" : "text-warning"}`}>
        {enabled
          ? "AFFILIATES_ENABLED is on: ref links, codes and partner sign-in are live."
          : "AFFILIATES_ENABLED is off: you can set affiliates up here, but ref links, codes and partner sign-in do nothing until it is on."}
      </p>
      {enabled && missingHashSecret && (
        <p className="mt-1 text-caption text-warning">
          {"AFFILIATE_HASH_SECRET is empty: clicks won't be recorded and partner login by email won't work."}
        </p>
      )}
      {enabled && missingBotToken && (
        <p className="mt-1 text-caption text-warning">
          {"TELEGRAM_BOT_TOKEN is empty: Telegram notifications won't work."}
        </p>
      )}
    </>
  );
}

export function Card({
  label,
  value,
  sub,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="font-mono text-caption uppercase tracking-[0.08em] text-text-faint">
        {label}
      </div>
      <div className={`mt-1 text-h3 font-semibold ${danger ? "text-danger" : "text-text"}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-caption text-text-muted">{sub}</div>}
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
      {children}
    </h2>
  );
}

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// UTC: payout dates are stored as a UTC midnight, so a local format could show the day before.
export function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// A balance can go negative after a cancellation, and formatCents would print "$-12".
export function fmtBalance(cents: number): string {
  return cents < 0 ? `− ${formatCents(-cents)}` : formatCents(cents);
}

export function refLink(code: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return `${base}/?ref=${code}`;
}
