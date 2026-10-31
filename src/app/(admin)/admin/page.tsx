import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ADMIN_COOKIE } from "@/lib/admin/auth";
import {
  biSummary,
  listOrders,
  groupByCustomer,
  lifetimeShipping,
  monthlyRevenue,
} from "@/lib/admin/queries";
import type { AdminOrderRow, AdminOrderItemRow } from "@/lib/admin/queries";
import { formatCents, getProduct } from "@/lib/copy/products";
import { OrderRow, type OrderRowData } from "./OrderRow";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// The dashboard reads the whole orders table (PII) — never statically rendered.
export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  try {
    // cookies() is async in Next 16 — must be awaited.
    (await cookies()).delete(ADMIN_COOKIE);
    redirect("/admin/login");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    throw err;
  }
}

// ── formatting helpers (edge-only; queries deliberately return raw cents/dates) ──

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: "2-digit",
    month: "short",
    day: "numeric",
  });
}

// Null-safe date label for the unified customer view (legacy dates can be null).
function fmtDateOrDash(d: Date | null): string {
  return d ? fmtDate(d) : "—";
}

// Small badge classes per client type — reusing existing color tokens only.
function clientTypeBadge(t: "regular" | "client" | "lead"): string {
  const base =
    "inline-block rounded-full px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em]";
  if (t === "regular") return `${base} bg-success/10 text-success`;
  if (t === "client") return `${base} bg-surface-soft text-text-muted`;
  return `${base} bg-surface-soft text-text-faint`;
}

function itemsSummary(items: AdminOrderItemRow[]): string {
  if (items.length === 0) return "—";
  const totalUnits = items.reduce((n, it) => n + it.quantity, 0);
  const parts = items.map((it) => {
    const name = getProduct(it.productSlug)?.name ?? it.productSlug;
    return `${name} ${it.sizeLabel}`;
  });
  return `${totalUnits}× · ${parts.join(", ")}`;
}

function trafficLabel(t: string | null): string {
  return t && t.trim() ? t : "direct";
}

function utmLabel(u: string | null): string {
  return u && u.trim() ? u : "—";
}

// "YYYY-MM" (UTC) → a UTC Date for month-name labels.
function monthDate(key: string): Date {
  const [yy, mm] = key.split("-").map(Number);
  return new Date(Date.UTC(yy, mm - 1, 1));
}

// "2026-10" → "October"
function monthLong(key: string): string {
  return monthDate(key).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
}

// "2026-10" → "Oct"
function monthShort(key: string): string {
  return monthDate(key).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

// "2026-10" → "Oct 2026"
function monthShortYear(key: string): string {
  return monthDate(key).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Signed whole-percent label: "+12%" / "−8%" (true minus sign) / "—" when null.
function pctLabel(p: number | null): string {
  if (p == null) return "—";
  const r = Math.round(p);
  if (r > 0) return `+${r}%`;
  if (r < 0) return `−${Math.abs(r)}%`;
  return "0%";
}

// Tone for a % change — existing tokens only (success / danger / muted).
function pctTone(p: number | null): "success" | "danger" | "muted" {
  if (p == null) return "muted";
  const r = Math.round(p);
  if (r > 0) return "success";
  if (r < 0) return "danger";
  return "muted";
}

const TONE_CLASS = {
  success: "text-success",
  danger: "text-danger",
  muted: "text-text-muted",
} as const;

function toRowData(o: AdminOrderRow): OrderRowData {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    dateLabel: fmtDate(o.createdAt),
    name: o.name,
    email: o.email,
    itemsSummary: itemsSummary(o.items),
    totalLabel: formatCents(o.totalPriceCents),
    status: o.status,
    trafficLabel: trafficLabel(o.trafficType),
    utmLabel: utmLabel(o.utmSource),
    trackingNumber: o.trackingNumber,
    trackingCarrier: o.trackingCarrier,
    // Manual paid transition only makes sense before the order is paid/fulfilled.
    showMarkPaid:
      o.status === "pending_payment_instructions" || o.status === "awaiting_payment",
    address: o.address,
    city: o.city,
    stateRegion: o.stateRegion,
    postalCode: o.postalCode,
    country: o.country,
    phone: o.phone,
    shippingDetailsLabel: o.shippingDetailsAt
      ? `provided ${fmtDate(o.shippingDetailsAt)}`
      : "not provided",
  };
}

// ── small presentational primitives ──────────────────────────────────────────

function Card({
  label,
  value,
  sub,
  subTone = "muted",
}: {
  label: string;
  value: string;
  sub?: string;
  subTone?: keyof typeof TONE_CLASS;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="font-mono text-caption uppercase tracking-[0.08em] text-text-faint">
        {label}
      </div>
      <div className="mt-1 text-h3 font-semibold text-text">{value}</div>
      {sub && <div className={`mt-0.5 text-caption ${TONE_CLASS[subTone]}`}>{sub}</div>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
      {children}
    </h2>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
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

export default async function AdminDashboardPage() {
  const [bi, orders, customers, shipping, monthly] = await Promise.all([
    biSummary(),
    listOrders(),
    groupByCustomer(),
    lifetimeShipping(),
    monthlyRevenue(),
  ]);

  // Revenue by month — trend-bar scale + MTD comparison labels.
  const { mtd } = monthly;
  const maxMonthRevenueCents = Math.max(...monthly.rows.map((r) => r.totalRevenueCents), 0);
  const mtdCompareLabel = `${monthShort(mtd.prevMonth)} 1–${mtd.prevThroughDay}`;

  const ratioLabel =
    bi.paid30d > 0 ? `${bi.unpaidToPaidRatio.toFixed(2)}× unpaid/paid` : "no paid orders";
  const rows = orders.map(toRowData);

  // Customers summary (ADR 0012 — across LIVE + LEGACY).
  const customerBuyers = customers.filter((c) => c.orderCount >= 1).length;
  const customerRepeat = customers.filter((c) => c.orderCount >= 2).length;
  const customerLifetimeRevenueCents = customers.reduce((sum, c) => sum + c.revenueCents, 0);

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Top bar */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="font-semibold tracking-[-0.01em] text-text">
            {"ISRIB "}
            <span className="text-text-faint">{"Admin"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/campaigns"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
            >
              {"Campaigns"}
            </Link>
            <Link
              href="/admin/affiliates"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
            >
              {"Affiliates"}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
              >
                {"Log out"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        {/* 1 — BI cards */}
        <SectionHeading>{`Last ${bi.windowDays} days`}</SectionHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <Card label="Revenue" value={formatCents(bi.revenueCents)} sub="paid + fulfilled" />
          <Card label="Orders" value={String(bi.orders30d)} sub="all statuses" />
          <Card label="AOV" value={formatCents(bi.aovCents)} sub="per paid order" />
          <Card
            label="Paid / Unpaid"
            value={`${bi.paid30d} / ${bi.unpaid30d}`}
            sub={ratioLabel}
          />
          <Card
            label="Needs action"
            value={`${bi.needsAction.paidNoAddress} · ${bi.needsAction.awaitingShipment}`}
            sub="paid·no address · awaiting shipment"
          />
        </div>

        {/* 1b — Revenue by month (UTC months; live paid + legacy) */}
        <SectionHeading>{"Revenue by month"}</SectionHeading>
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Card
            label={`${monthLong(mtd.month)} so far`}
            value={formatCents(mtd.totalRevenueCents)}
            sub={`vs ${mtdCompareLabel}: ${pctLabel(mtd.pacePct)}`}
            subTone={pctTone(mtd.pacePct)}
          />
          <Card
            label={`${monthLong(mtd.month)} paid orders`}
            value={String(mtd.paidOrders)}
            sub={`vs ${mtdCompareLabel}: ${pctLabel(mtd.paidOrdersPacePct)}`}
            subTone={pctTone(mtd.paidOrdersPacePct)}
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Month"}</Th>
                <Th right>{"Live"}</Th>
                <Th right>{"Legacy"}</Th>
                <Th right>{"Total"}</Th>
                <Th right>{"Paid orders"}</Th>
                <Th right>{"AOV"}</Th>
                <Th right>{"Δ MoM"}</Th>
                <Th>{"Trend"}</Th>
              </tr>
            </thead>
            <tbody>
              {monthly.rows.map((r) => {
                const barPct =
                  maxMonthRevenueCents > 0 ? (r.totalRevenueCents / maxMonthRevenueCents) * 100 : 0;
                return (
                  <tr key={r.month} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-caption text-text">
                      {monthShortYear(r.month)}
                      {r.isCurrent && <span className="text-text-faint">{" · MTD"}</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {formatCents(r.liveRevenueCents)}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {r.legacyRevenueCents > 0 ? formatCents(r.legacyRevenueCents) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                      {formatCents(r.totalRevenueCents)}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {r.livePaidOrders + r.legacyOrders}
                      {r.legacyOrders > 0 && (
                        <span className="text-text-faint">
                          {` (${r.livePaidOrders}+${r.legacyOrders})`}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">
                      {formatCents(r.aovCents)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right text-caption ${
                        r.isCurrent ? "text-text-muted" : TONE_CLASS[pctTone(r.momPct)]
                      }`}
                    >
                      {pctLabel(r.momPct)}
                      {r.isCurrent && <span className="text-text-faint">{" (partial)"}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-2 w-full min-w-[120px] overflow-hidden rounded-full bg-surface-soft">
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-caption text-text-muted">
          {"Booked by order date (UTC). Revenue = paid + fulfilled orders; legacy = old-site orders before the 6 Sep cutover."}
        </p>

        {/* 2 — Attribution */}
        <SectionHeading>{"Attribution"}</SectionHeading>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-soft">
                <tr>
                  <Th>{"Traffic type"}</Th>
                  <Th right>{"Orders"}</Th>
                  <Th right>{"Revenue"}</Th>
                </tr>
              </thead>
              <tbody>
                {bi.byTrafficType.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-caption text-text">{trafficLabel(r.trafficType)}</td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">{r.orders}</td>
                    <td className="px-3 py-2 text-right text-caption text-text">{formatCents(r.revenueCents)}</td>
                  </tr>
                ))}
                {bi.byTrafficType.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-caption text-text-faint">{"No data"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-soft">
                <tr>
                  <Th>{"Top UTM source"}</Th>
                  <Th right>{"Orders"}</Th>
                  <Th right>{"Revenue"}</Th>
                </tr>
              </thead>
              <tbody>
                {bi.byUtmSource.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-caption text-text">{utmLabel(r.utmSource)}</td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">{r.orders}</td>
                    <td className="px-3 py-2 text-right text-caption text-text">{formatCents(r.revenueCents)}</td>
                  </tr>
                ))}
                {bi.byUtmSource.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-caption text-text-faint">{"No data"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 — Top products + By country */}
        <SectionHeading>{"Top products & geography"}</SectionHeading>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-soft">
                <tr>
                  <Th>{"Product"}</Th>
                  <Th right>{"Units"}</Th>
                  <Th right>{"Revenue"}</Th>
                </tr>
              </thead>
              <tbody>
                {bi.topProducts.map((r) => (
                  <tr key={r.productSlug} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-caption text-text">{r.name}</td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">{r.units}</td>
                    <td className="px-3 py-2 text-right text-caption text-text">{formatCents(r.revenueCents)}</td>
                  </tr>
                ))}
                {bi.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-caption text-text-faint">{"No data"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-soft">
                <tr>
                  <Th>{"Country"}</Th>
                  <Th right>{"Orders"}</Th>
                  <Th right>{"Revenue"}</Th>
                </tr>
              </thead>
              <tbody>
                {bi.byCountry.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-caption text-text">{r.country}</td>
                    <td className="px-3 py-2 text-right text-caption text-text-muted">{r.orders}</td>
                    <td className="px-3 py-2 text-right text-caption text-text">{formatCents(r.revenueCents)}</td>
                  </tr>
                ))}
                {bi.byCountry.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-caption text-text-faint">{"No data"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 — Orders */}
        <SectionHeading>{`Orders (${rows.length})`}</SectionHeading>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[960px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Order"}</Th>
                <Th>{"Customer"}</Th>
                <Th>{"Items"}</Th>
                <Th>{"Total"}</Th>
                <Th>{"Attribution"}</Th>
                <Th>{"Status"}</Th>
                <Th>{"Fulfillment"}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <OrderRow key={r.id} row={r} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-caption text-text-faint">
                    {"No orders yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5 — Customers (ADR 0012 — LIVE + LEGACY unified: repeat count + lifetime LTV) */}
        <SectionHeading>{`Customers (${customers.length})`}</SectionHeading>
        <p className="mb-3 -mt-1 text-caption text-text-muted">
          {`${customers.length} total · ${customerBuyers} buyers · ${customerRepeat} repeat · ${formatCents(
            customerLifetimeRevenueCents,
          )} lifetime revenue`}
        </p>

        {/* Lifetime shipping economics (ADR 0018 — all legacy + live-paid orders) */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card
            label="Lifetime orders"
            value={String(shipping.lifetimeOrders)}
            sub="legacy + live paid, all-time"
          />
          <Card
            label="Lifetime revenue"
            value={formatCents(shipping.lifetimeRevenueCents)}
            sub="legacy + live paid, all-time"
          />
          <Card
            label="Shipping cost"
            value={formatCents(shipping.shippingCostCents)}
            sub={`${shipping.lifetimeOrders} orders × $10`}
          />
          <Card
            label="Net after shipping"
            value={formatCents(shipping.netAfterShippingCents)}
            sub="lifetime, after shipping"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Email"}</Th>
                <Th>{"Name"}</Th>
                <Th>{"Country"}</Th>
                <Th>{"Type"}</Th>
                <Th right>{"Orders"}</Th>
                <Th right>{"Revenue (LTV)"}</Th>
                <Th>{"First order"}</Th>
                <Th>{"Last order"}</Th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-caption text-text">{c.email}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{c.name}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{c.country ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={clientTypeBadge(c.clientType)}>{c.clientType}</span>
                  </td>
                  <td className="px-3 py-2 text-right text-caption text-text-muted">
                    {c.orderCount}
                    {c.legacyOrderCount > 0 && (
                      <span className="text-text-faint">
                        {` (${c.liveOrderCount}+${c.legacyOrderCount})`}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-caption font-semibold text-text">{formatCents(c.revenueCents)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtDateOrDash(c.firstOrderAt)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtDateOrDash(c.lastOrderAt)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-caption text-text-faint">
                    {"No customers yet"}
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
