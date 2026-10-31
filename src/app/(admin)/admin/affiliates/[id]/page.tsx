import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin/auth";
import {
  getAffiliateDetail,
  type AdminAffiliate,
  type AdminAffiliatePayout,
} from "@/lib/affiliate/admin-queries";
import {
  commissionState,
  formatBpsAsPercent,
  toDateInputValue,
  type AffiliateInput,
  type CommissionState,
} from "@/lib/affiliate/core";
import { txExplorerUrl } from "@/lib/affiliate/explorer";
import { formatCents } from "@/lib/copy/products";
import { AffiliateForm } from "../AffiliateForm";
import { CopyButton } from "../CopyButton";
import { Card, FlagNotice, SectionHeading, Th, TopBar, fmtBalance, fmtDate, refLink } from "../ui";
import { AffiliateControls } from "./AffiliateControls";
import { PayoutForm } from "./PayoutForm";

export const metadata: Metadata = {
  title: "Affiliate",
  robots: { index: false, follow: false },
};

// Money, partner contact details and full order numbers — never statically rendered.
export const dynamic = "force-dynamic";

const STATE_CHIP: Record<CommissionState, string> = {
  pending: "bg-surface-soft text-text-muted",
  earned: "bg-success/10 text-success",
  void: "bg-surface-soft text-text-faint",
};

function StateChip({ status }: { status: string }) {
  const state = commissionState(status);
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em] ${STATE_CHIP[state]}`}
    >
      {state}
    </span>
  );
}

function TxHash({ payout }: { payout: AdminAffiliatePayout }) {
  const url = txExplorerUrl(payout.cryptoCurrency, payout.txHash);
  if (!url) return <span className="break-all font-mono text-text-muted">{payout.txHash}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all font-mono font-semibold text-primary hover:underline"
    >
      {payout.txHash}
    </a>
  );
}

function toFormValues(affiliate: AdminAffiliate): AffiliateInput {
  return {
    name: affiliate.name,
    handle: affiliate.handle ?? "",
    code: affiliate.code,
    commissionPercent: formatBpsAsPercent(affiliate.commissionRateBps),
    discountPercent: formatBpsAsPercent(affiliate.customerDiscountBps),
    notifyEmail: affiliate.notifyEmail ?? "",
    telegramChatId: affiliate.notifyTelegramChatId ?? "",
  };
}

export default async function AdminAffiliatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Defense-in-depth (ADR 0011), same as the list page.
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const detail = await getAffiliateDetail(id);
  if (!detail) notFound();

  const { affiliate, stats, orders, payouts } = detail;
  const link = refLink(affiliate.code);

  return (
    <div className="min-h-screen bg-surface-soft">
      <TopBar
        section={`Admin · Affiliates · ${affiliate.name}`}
        backHref="/admin/affiliates"
        backLabel="← Affiliates"
      />

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <FlagNotice />
        {!affiliate.isActive && (
          <p className="mt-1 text-caption text-danger">
            {"This affiliate is inactive. Their code and link are ignored at checkout."}
          </p>
        )}

        {/* 1 — Stats */}
        <SectionHeading>{"Stats"}</SectionHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Card label="Clicks" value={String(stats.clicks)} />
          <Card label="Attributed orders" value={String(stats.attributedOrders)} />
          <Card label="Earned orders" value={String(stats.earnedOrders)} />
          <Card label="Earned commission" value={formatCents(stats.earnedCents)} />
          <Card label="Paid out" value={formatCents(stats.paidOutCents)} />
          <Card
            label="Balance"
            value={fmtBalance(stats.balanceCents)}
            danger={stats.balanceCents < 0}
          />
        </div>

        {/* 2 — Access */}
        <SectionHeading>{"Access"}</SectionHeading>
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="break-all font-mono text-caption text-text-muted">{link}</span>
            <CopyButton value={link} label="Copy ref link" />
          </div>
          <AffiliateControls affiliateId={affiliate.id} isActive={affiliate.isActive} />
        </div>

        {/* 3 — Edit */}
        <SectionHeading>{"Details"}</SectionHeading>
        <div className="rounded-lg border border-border bg-surface p-4">
          <AffiliateForm affiliateId={affiliate.id} initial={toFormValues(affiliate)} />
          <p className="mt-3 text-caption text-text-muted">
            {"A new rate applies to new orders only; existing orders keep their snapshot. A new code stops the old link and code working."}
          </p>
        </div>

        {/* 4 — Record payout */}
        <SectionHeading>{"Record payout"}</SectionHeading>
        <div className="rounded-lg border border-border bg-surface p-4">
          <PayoutForm
            affiliateId={affiliate.id}
            balanceCents={stats.balanceCents}
            balanceLabel={fmtBalance(stats.balanceCents)}
            today={toDateInputValue(new Date())}
          />
          <p className="mt-3 text-caption text-text-muted">
            {"Payouts cannot be edited or deleted once recorded."}
          </p>
        </div>

        {/* 5 — Payout history */}
        <SectionHeading>{`Payouts (${payouts.length})`}</SectionHeading>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Paid"}</Th>
                <Th>{"Period"}</Th>
                <Th right>{"Amount"}</Th>
                <Th>{"Currency"}</Th>
                <Th right>{"Crypto amount"}</Th>
                <Th>{"Tx hash"}</Th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-border align-top last:border-0">
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
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-caption text-text-faint">
                    {"No payouts yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6 — Attributed orders */}
        <SectionHeading>{`Attributed orders (${orders.length})`}</SectionHeading>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Order"}</Th>
                <Th>{"Date"}</Th>
                <Th right>{"Total"}</Th>
                <Th right>{"Commission"}</Th>
                <Th>{"Source"}</Th>
                <Th>{"Order status"}</Th>
                <Th>{"State"}</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-mono text-caption text-text">
                    {order.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-caption text-text-muted">
                    {fmtDate(order.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-right text-caption text-text-muted">
                    {formatCents(order.totalPrice)}
                  </td>
                  <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                    {formatCents(order.commissionAmountCents ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-caption text-text-muted">
                    {order.attributionSource ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-caption text-text-muted">{order.status}</td>
                  <td className="px-3 py-2 text-caption">
                    <StateChip status={order.status} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-caption text-text-faint">
                    {"No attributed orders yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
