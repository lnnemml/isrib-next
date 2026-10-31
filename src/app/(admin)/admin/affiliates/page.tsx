import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin/auth";
import { listAffiliatesWithStats } from "@/lib/affiliate/admin-queries";
import { computeTotalOwedCents, formatBpsAsPercent } from "@/lib/affiliate/core";
import { formatCents } from "@/lib/copy/products";
import { AffiliateForm } from "./AffiliateForm";
import { CopyButton } from "./CopyButton";
import { Card, FlagNotice, SectionHeading, Th, TopBar, fmtBalance, refLink } from "./ui";

export const metadata: Metadata = {
  title: "Affiliates",
  robots: { index: false, follow: false },
};

// Money and partner contact details — never statically rendered.
export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  // Defense-in-depth (ADR 0011): the proxy gates /admin/* at the edge, and we re-check the
  // signed session here so a misconfigured matcher can never expose this page.
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const rows = await listAffiliatesWithStats();

  const balances = rows.map((row) => row.stats.balanceCents);
  const owedCount = balances.filter((balance) => balance > 0).length;
  const activeCount = rows.filter((row) => row.isActive).length;

  return (
    <div className="min-h-screen bg-surface-soft">
      <TopBar section="Admin · Affiliates" backHref="/admin" backLabel="← Dashboard" />

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <FlagNotice />

        {/* 1 — Payout run */}
        <SectionHeading>{"Payout run"}</SectionHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card
            label="Total owed"
            value={formatCents(computeTotalOwedCents(balances))}
            sub={`${owedCount} with a positive balance; negatives are not netted off`}
          />
          <Card label="Affiliates" value={String(rows.length)} sub={`${activeCount} active`} />
        </div>

        {/* 2 — List */}
        <SectionHeading>{`Affiliates (${rows.length})`}</SectionHeading>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[1240px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Affiliate"}</Th>
                <Th>{"Code"}</Th>
                <Th right>{"Rate"}</Th>
                <Th right>{"Clicks"}</Th>
                <Th right>{"Attributed"}</Th>
                <Th right>{"Earned orders"}</Th>
                <Th right>{"Earned"}</Th>
                <Th right>{"Paid out"}</Th>
                <Th right>{"Balance"}</Th>
                <Th>{"Ref link"}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const link = refLink(row.code);
                return (
                  <tr key={row.id} className="border-b border-border align-top last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/affiliates/${row.id}`}
                        className="text-caption font-semibold text-primary hover:underline"
                      >
                        {row.name}
                      </Link>
                      <div className="text-caption text-text-faint">
                        {[row.handle, row.isActive ? null : "Inactive"]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-caption text-text">{row.code}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-caption text-text-muted">
                      {`${formatBpsAsPercent(row.commissionRateBps)}% / ${formatBpsAsPercent(row.customerDiscountBps)}%`}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {row.stats.clicks}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {row.stats.attributedOrders}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {row.stats.earnedOrders}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {formatCents(row.stats.earnedCents)}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {formatCents(row.stats.paidOutCents)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right text-caption font-semibold ${
                        row.stats.balanceCents < 0 ? "text-danger" : "text-text"
                      }`}
                    >
                      {fmtBalance(row.stats.balanceCents)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="break-all font-mono text-caption text-text-muted">
                          {link}
                        </span>
                        <CopyButton value={link} label={`Copy ref link for ${row.name}`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-caption text-text-faint">
                    {"No affiliates yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-caption text-text-muted">
          {"Rate is commission / buyer discount. Earned counts paid and fulfilled orders only."}
        </p>

        {/* 3 — Create */}
        <SectionHeading>{"New affiliate"}</SectionHeading>
        <div className="rounded-lg border border-border bg-surface p-4">
          <AffiliateForm />
        </div>
      </div>
    </div>
  );
}
