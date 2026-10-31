import "server-only";

// ADR 0025 — the ONLY place partner data is read. Named columns only, every query scoped to the
// session's affiliate, and order numbers masked in the mapper, so a full number never leaves this
// file. Customer tables stay out of the imports on purpose; partner-queries.test.ts enforces that.
//
// The builders return the unexecuted query so the test can read its SQL without a database. Only
// the get* functions below are for callers.

import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { affiliateClicks, affiliatePayouts, orders } from "@/lib/db/schema";
import { commissionState, maskOrderNumber, type CommissionState } from "./core";

export const PARTNER_ORDER_COLUMNS = {
  orderNumber: orders.orderNumber,
  createdAt: orders.createdAt,
  totalPrice: orders.totalPrice,
  commissionAmountCents: orders.commissionAmountCents,
  status: orders.status,
};

export const PARTNER_PAYOUT_COLUMNS = {
  paidAt: affiliatePayouts.paidAt,
  periodStart: affiliatePayouts.periodStart,
  periodEnd: affiliatePayouts.periodEnd,
  amountCents: affiliatePayouts.amountCents,
  cryptoCurrency: affiliatePayouts.cryptoCurrency,
  cryptoAmount: affiliatePayouts.cryptoAmount,
  txHash: affiliatePayouts.txHash,
};

export function partnerOrdersQuery(affiliateId: string) {
  return db
    .select(PARTNER_ORDER_COLUMNS)
    .from(orders)
    .where(eq(orders.affiliateId, affiliateId))
    .orderBy(desc(orders.createdAt));
}

export function partnerPayoutsQuery(affiliateId: string) {
  return db
    .select(PARTNER_PAYOUT_COLUMNS)
    .from(affiliatePayouts)
    .where(eq(affiliatePayouts.affiliateId, affiliateId))
    .orderBy(desc(affiliatePayouts.paidAt));
}

export function partnerClickCountQuery(affiliateId: string) {
  return db
    .select({ total: count() })
    .from(affiliateClicks)
    .where(eq(affiliateClicks.affiliateId, affiliateId));
}

type RawPartnerOrder = Awaited<ReturnType<typeof partnerOrdersQuery>>[number];

export type PartnerPayout = Awaited<ReturnType<typeof partnerPayoutsQuery>>[number];

// `status` is the commission state, so the raw order status stays in here too.
export interface PartnerOrder {
  orderNumber: string;
  createdAt: Date;
  totalPrice: number;
  commissionAmountCents: number;
  status: CommissionState;
}

export interface PartnerSummary {
  clicks: number;
  attributedOrders: number;
  earnedOrders: number;
  // null at zero clicks, where a rate means nothing.
  conversionRate: number | null;
  earnedCents: number;
  paidOutCents: number;
  // Negative after a cancellation that follows a payout; it carries forward.
  balanceCents: number;
}

export interface PartnerDashboard {
  summary: PartnerSummary;
  orders: PartnerOrder[];
  payouts: PartnerPayout[];
}

// Picks fields by name, so anything extra on the row cannot pass through.
export function mapPartnerOrder(row: RawPartnerOrder): PartnerOrder {
  return {
    orderNumber: maskOrderNumber(row.orderNumber),
    createdAt: row.createdAt,
    totalPrice: row.totalPrice,
    commissionAmountCents: row.commissionAmountCents ?? 0,
    status: commissionState(row.status),
  };
}

// Totals are worked out from the same mapped rows the table shows, through commissionState, so
// the figures and the status column cannot disagree. Earned means paid + fulfilled only.
export function summarizePartner(
  clicks: number,
  partnerOrders: readonly PartnerOrder[],
  payouts: readonly Pick<PartnerPayout, "amountCents">[],
): PartnerSummary {
  const earned = partnerOrders.filter((order) => order.status === "earned");
  const earnedCents = earned.reduce((sum, order) => sum + order.commissionAmountCents, 0);
  const paidOutCents = payouts.reduce((sum, payout) => sum + payout.amountCents, 0);

  return {
    clicks,
    attributedOrders: partnerOrders.length,
    earnedOrders: earned.length,
    conversionRate: clicks > 0 ? earned.length / clicks : null,
    earnedCents,
    paidOutCents,
    balanceCents: earnedCents - paidOutCents,
  };
}

export async function getPartnerOrders(affiliateId: string): Promise<PartnerOrder[]> {
  const rows = await partnerOrdersQuery(affiliateId);
  return rows.map(mapPartnerOrder);
}

export async function getPartnerDashboard(affiliateId: string): Promise<PartnerDashboard> {
  const [partnerOrders, payouts, [clickCount]] = await Promise.all([
    getPartnerOrders(affiliateId),
    partnerPayoutsQuery(affiliateId),
    partnerClickCountQuery(affiliateId),
  ]);

  return {
    summary: summarizePartner(clickCount.total, partnerOrders, payouts),
    orders: partnerOrders,
    payouts,
  };
}

// ── CSV ─────────────────────────────────────────────────────────────────────

export const COMMISSION_STATE_LABEL: Record<CommissionState, string> = {
  pending: "Pending",
  earned: "Earned",
  void: "Void",
};

const CSV_HEADER = ["Order", "Date (UTC)", "Amount (USD)", "Commission (USD)", "Status"];

// RFC 4180: quote a cell holding a comma, quote or line break, and double any quote inside it.
function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function csvRow(cells: readonly string[]): string {
  return cells.map(csvCell).join(",");
}

function centsToUsd(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function partnerOrdersCsv(partnerOrders: readonly PartnerOrder[]): string {
  const rows = partnerOrders.map((order) =>
    csvRow([
      order.orderNumber,
      order.createdAt.toISOString().slice(0, 10),
      centsToUsd(order.totalPrice),
      centsToUsd(order.commissionAmountCents),
      COMMISSION_STATE_LABEL[order.status],
    ]),
  );
  return `${[csvRow(CSV_HEADER), ...rows].join("\r\n")}\r\n`;
}
