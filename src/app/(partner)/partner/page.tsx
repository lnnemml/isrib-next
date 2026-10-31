import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { CommissionState } from "@/lib/affiliate/core";
import { txExplorerUrl } from "@/lib/affiliate/explorer";
import {
  COMMISSION_STATE_LABEL,
  getPartnerDashboard,
  type PartnerPayout,
} from "@/lib/affiliate/partner-queries";
import { destroyPartnerSession, requireAffiliate } from "@/lib/affiliate/session";
import { formatCents } from "@/lib/copy/products";
import { CopyButton } from "./CopyButton";

export const metadata: Metadata = {
  title: "Partner dashboard",
};

const BPS_PER_PERCENT = 100;

async function signOut() {
  "use server";
  await destroyPartnerSession();
  redirect("/partner/login");
}

// UTC, matching the notifications and the CSV.
function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// A balance can go negative after a cancellation, and formatCents would print "$-12".
function fmtBalance(cents: number): string {
  return cents < 0 ? `− ${formatCents(-cents)}` : formatCents(cents);
}

function fmtConversion(rate: number | null): string {
  return rate === null ? "—" : `${(rate * 100).toFixed(1)}%`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="font-mono text-caption uppercase tracking-[0.08em] text-text-faint">
        {label}
      </div>
      <div className="mt-1 text-h3 font-semibold text-text">{value}</div>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
      {children}
    </h2>
  );
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-3 py-2 font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-small text-text-muted">
      {children}
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="font-mono text-caption uppercase tracking-[0.08em] text-text-faint">
          {label}
        </div>
        <div className="mt-0.5 break-all font-mono text-small text-text">{value}</div>
      </div>
      <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
    </div>
  );
}

const STATE_CHIP: Record<CommissionState, string> = {
  pending: "bg-surface-soft text-text-muted",
  earned: "bg-success/10 text-success",
  void: "bg-surface-soft text-text-faint",
};

function StateBadge({ state }: { state: CommissionState }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em] ${STATE_CHIP[state]}`}
    >
      {COMMISSION_STATE_LABEL[state]}
    </span>
  );
}

function TxHash({ payout }: { payout: PartnerPayout }) {
  const url = txExplorerUrl(payout.cryptoCurrency, payout.txHash);
  if (!url) return <span className="break-all font-mono text-text-muted">{payout.txHash}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all font-mono font-semibold text-primary transition hover:opacity-80"
    >
      {payout.txHash}
    </a>
  );
}

export default async function PartnerDashboardPage() {
  const affiliate = await requireAffiliate();
  const { summary, orders, payouts } = await getPartnerDashboard(affiliate.id);

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const refLink = `${base}/?ref=${affiliate.code}`;
  const commissionPct = affiliate.commissionRateBps / BPS_PER_PERCENT;
  const discountPct = affiliate.customerDiscountBps / BPS_PER_PERCENT;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold text-text">{"Partner dashboard"}</h1>
          <p className="mt-1 text-small text-text-muted">
            {affiliate.handle ? `${affiliate.name} · ${affiliate.handle}` : affiliate.name}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
          >
            {"Sign out"}
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Clicks" value={summary.clicks.toLocaleString("en-US")} />
        <Stat label="Attributed orders" value={summary.attributedOrders.toLocaleString("en-US")} />
        <Stat label="Conversion rate" value={fmtConversion(summary.conversionRate)} />
        <Stat label="Earned commission" value={formatCents(summary.earnedCents)} />
        <Stat label="Paid out" value={formatCents(summary.paidOutCents)} />
        <Stat label="Current balance" value={fmtBalance(summary.balanceCents)} />
      </div>

      <SectionHeading>{"Your link and code"}</SectionHeading>
      <div className="divide-y divide-border rounded-lg border border-border bg-surface">
        <CopyRow label="Referral link" value={refLink} />
        <CopyRow label="Code" value={affiliate.code} />
      </div>
      <p className="mt-3 text-small text-text-muted">
        {`You earn ${commissionPct}% of the total of every paid order. Buyers who use your link or code get ${discountPct}% off, and discounts do not stack.`}
      </p>

      <div className="mb-3 mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
          {"Orders"}
        </h2>
        <a
          href="/partner/orders.csv"
          className="text-small font-semibold text-primary transition hover:opacity-80"
        >
          {"Download CSV"}
        </a>
      </div>
      {orders.length === 0 ? (
        <EmptyState>{"No attributed orders yet."}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[620px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Order"}</Th>
                <Th>{"Date"}</Th>
                <Th right>{"Amount"}</Th>
                <Th right>{"Commission"}</Th>
                <Th>{"Status"}</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={`${order.orderNumber}-${index}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2 font-mono text-caption text-text">
                    {order.orderNumber}
                  </td>
                  <td className="px-3 py-2 text-caption text-text-muted">
                    {fmtDate(order.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-right text-caption text-text-muted">
                    {formatCents(order.totalPrice)}
                  </td>
                  <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                    {formatCents(order.commissionAmountCents)}
                  </td>
                  <td className="px-3 py-2 text-caption">
                    <StateBadge state={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionHeading>{"Payouts"}</SectionHeading>
      {payouts.length === 0 ? (
        <EmptyState>{"No payouts yet."}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Date"}</Th>
                <Th>{"Period"}</Th>
                <Th right>{"Amount"}</Th>
                <Th>{"Currency"}</Th>
                <Th right>{"Crypto amount"}</Th>
                <Th>{"Transaction"}</Th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.txHash} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-caption text-text-muted">
                    {fmtDate(payout.paidAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-caption text-text-muted">
                    {`${fmtDate(payout.periodStart)} – ${fmtDate(payout.periodEnd)}`}
                  </td>
                  <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                    {formatCents(payout.amountCents)}
                  </td>
                  <td className="px-3 py-2 text-caption text-text-muted">
                    {payout.cryptoCurrency}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-caption text-text-muted">
                    {payout.cryptoAmount}
                  </td>
                  <td className="px-3 py-2 text-caption">
                    <TxHash payout={payout} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
