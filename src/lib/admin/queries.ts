// Admin-panel data layer (ADR 0011 + admin-panel.md §3). server-only: these queries read
// the whole orders table (PII + attribution) and must never be pulled into a client bundle.
//
// MONEY: every amount here is INTEGER CENTS (matching orders.total_price / order_items.line_price).
// NOTHING is formatted in this layer — the UI (C2) formats at the edge via formatCents().
//
// Drizzle query builders only (no raw SQL outside the `sql` tagged helpers used for
// aggregates). The 30-day window uses a JS Date cutoff bound as a parameter, so the
// boundary is computed once per call rather than per-row in Postgres.
import "server-only";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { getProduct } from "@/lib/copy/products";
import { and, count, desc, eq, gte, inArray, isNull, isNotNull, ne, sql, sum } from "drizzle-orm";

// Status groups reused across aggregates.
const PAID_STATUSES = ["paid", "fulfilled"] as const;
const UNPAID_STATUSES = ["pending_payment_instructions", "awaiting_payment"] as const;

function cutoff30d(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

// A Drizzle SUM over an integer column comes back as a numeric string (or null). Coerce to
// an integer-cents number; null (no rows) → 0.
function toCents(v: string | number | null): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : Math.round(Number(v));
}

// ── biSummary ────────────────────────────────────────────────────────────────
// Return types are exported so C2 (the UI builder) can consume them directly.

export interface TrafficTypeRow {
  trafficType: string | null;
  orders: number;
  revenueCents: number;
}

export interface UtmSourceRow {
  utmSource: string | null;
  orders: number;
  revenueCents: number;
}

export interface TopProductRow {
  productSlug: string;
  name: string;
  units: number;
  revenueCents: number;
}

export interface CountryRow {
  country: string;
  orders: number;
  revenueCents: number;
}

export interface NeedsActionCounts {
  paidNoAddress: number; // status = 'paid' AND shipping_details_at IS NULL
  awaitingShipment: number; // shipping details provided, not yet shipped, not cancelled
}

export interface BiSummary {
  windowDays: number;
  cutoff: Date;
  revenueCents: number; // Σ total_price WHERE paid/fulfilled AND created_at >= cutoff
  orders30d: number; // count of ALL orders created >= cutoff
  paid30d: number; // paid+fulfilled, created >= cutoff
  unpaid30d: number; // pending+awaiting, created >= cutoff
  unpaidToPaidRatio: number; // unpaid30d / paid30d (0 when no paid orders)
  aovCents: number; // revenueCents / max(paid30d, 1)
  byTrafficType: TrafficTypeRow[];
  byUtmSource: UtmSourceRow[]; // top ~8 by order count
  topProducts: TopProductRow[]; // top ~8 by revenue
  needsAction: NeedsActionCounts;
  byCountry: CountryRow[]; // by revenue desc
}

export async function biSummary(): Promise<BiSummary> {
  const cutoff = cutoff30d();
  const inWindow = gte(orders.createdAt, cutoff);

  // Revenue + paid count (paid/fulfilled in window).
  const [revenueRow] = await db
    .select({
      revenueCents: sum(orders.totalPrice),
      paidCount: count(),
    })
    .from(orders)
    .where(and(inWindow, inArray(orders.status, [...PAID_STATUSES])));
  const revenueCents = toCents(revenueRow?.revenueCents ?? null);
  const paid30d = revenueRow?.paidCount ?? 0;

  // All orders in window.
  const [ordersRow] = await db
    .select({ n: count() })
    .from(orders)
    .where(inWindow);
  const orders30d = ordersRow?.n ?? 0;

  // Unpaid count (pending + awaiting) in window.
  const [unpaidRow] = await db
    .select({ n: count() })
    .from(orders)
    .where(and(inWindow, inArray(orders.status, [...UNPAID_STATUSES])));
  const unpaid30d = unpaidRow?.n ?? 0;

  const unpaidToPaidRatio = paid30d > 0 ? unpaid30d / paid30d : 0;
  const aovCents = Math.round(revenueCents / Math.max(paid30d, 1));

  // Revenue/orders by traffic_type (all orders in window; revenue counts paid/fulfilled only
  // via a filtered SUM so unpaid orders show orders>0 but revenue 0).
  const paidRevenueExpr = sql<string | null>`sum(case when ${inArray(orders.status, [...PAID_STATUSES])} then ${orders.totalPrice} else 0 end)`;

  const trafficRows = await db
    .select({
      trafficType: orders.trafficType,
      orders: count(),
      revenueCents: paidRevenueExpr,
    })
    .from(orders)
    .where(inWindow)
    .groupBy(orders.trafficType);
  const byTrafficType: TrafficTypeRow[] = trafficRows.map((r) => ({
    trafficType: r.trafficType,
    orders: r.orders,
    revenueCents: toCents(r.revenueCents),
  }));

  // Top ~8 UTM sources by order count.
  const utmRows = await db
    .select({
      utmSource: orders.utmSource,
      orders: count(),
      revenueCents: paidRevenueExpr,
    })
    .from(orders)
    .where(inWindow)
    .groupBy(orders.utmSource)
    .orderBy(desc(count()))
    .limit(8);
  const byUtmSource: UtmSourceRow[] = utmRows.map((r) => ({
    utmSource: r.utmSource,
    orders: r.orders,
    revenueCents: toCents(r.revenueCents),
  }));

  // Top ~8 products by revenue — JOIN order_items on paid/fulfilled orders in the window.
  // units = Σ quantity; revenue = Σ line_price * quantity (line_price is per-UNIT cents).
  const productRows = await db
    .select({
      productSlug: orderItems.productSlug,
      units: sql<string | null>`sum(${orderItems.quantity})`,
      revenueCents: sql<string | null>`sum(${orderItems.linePrice} * ${orderItems.quantity})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(inWindow, inArray(orders.status, [...PAID_STATUSES])))
    .groupBy(orderItems.productSlug)
    .orderBy(desc(sql`sum(${orderItems.linePrice} * ${orderItems.quantity})`))
    .limit(8);
  const topProducts: TopProductRow[] = productRows.map((r) => ({
    productSlug: r.productSlug,
    name: getProduct(r.productSlug)?.name ?? r.productSlug,
    units: r.units == null ? 0 : Math.round(Number(r.units)),
    revenueCents: toCents(r.revenueCents),
  }));

  // Needs-action counts.
  const [paidNoAddressRow] = await db
    .select({ n: count() })
    .from(orders)
    .where(and(eq(orders.status, "paid"), isNull(orders.shippingDetailsAt)));
  const [awaitingShipmentRow] = await db
    .select({ n: count() })
    .from(orders)
    .where(
      and(
        isNotNull(orders.shippingDetailsAt),
        isNull(orders.shippedAt),
        ne(orders.status, "cancelled"),
      ),
    );
  const needsAction: NeedsActionCounts = {
    paidNoAddress: paidNoAddressRow?.n ?? 0,
    awaitingShipment: awaitingShipmentRow?.n ?? 0,
  };

  // By country — orders + paid revenue in window, ordered by revenue desc.
  const countryRows = await db
    .select({
      country: orders.country,
      orders: count(),
      revenueCents: paidRevenueExpr,
    })
    .from(orders)
    .where(inWindow)
    .groupBy(orders.country)
    .orderBy(desc(paidRevenueExpr));
  const byCountry: CountryRow[] = countryRows.map((r) => ({
    country: r.country,
    orders: r.orders,
    revenueCents: toCents(r.revenueCents),
  }));

  return {
    windowDays: 30,
    cutoff,
    revenueCents,
    orders30d,
    paid30d,
    unpaid30d,
    unpaidToPaidRatio,
    aovCents,
    byTrafficType,
    byUtmSource,
    topProducts,
    needsAction,
    byCountry,
  };
}

// ── listOrders ─────────────────────────────────────────────────────────────────

export interface AdminOrderItemRow {
  productSlug: string;
  sizeLabel: string;
  format: "powder" | "capsules";
  quantity: number;
  linePriceCents: number; // per-UNIT cents
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  createdAt: Date;
  name: string;
  email: string;
  country: string;
  status: string;
  paymentMethod: "crypto" | "manual";
  totalPriceCents: number;
  trafficType: string | null;
  utmSource: string | null;
  shippingDetailsAt: Date | null;
  shippedAt: Date | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  shippingToken: string;
  // expand view
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  items: AdminOrderItemRow[];
}

// ALL orders, newest first. Capped at the latest 200 (single-operator BI panel — a hard cap
// keeps the query bounded; pagination is out of scope for C1).
export async function listOrders(): Promise<AdminOrderRow[]> {
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      createdAt: orders.createdAt,
      name: orders.name,
      email: orders.email,
      country: orders.country,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      totalPriceCents: orders.totalPrice,
      trafficType: orders.trafficType,
      utmSource: orders.utmSource,
      shippingDetailsAt: orders.shippingDetailsAt,
      shippedAt: orders.shippedAt,
      trackingNumber: orders.trackingNumber,
      trackingCarrier: orders.trackingCarrier,
      shippingToken: orders.shippingToken,
      address: orders.address,
      city: orders.city,
      postalCode: orders.postalCode,
      phone: orders.phone,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  if (rows.length === 0) return [];

  // Fetch items for exactly the capped set of orders (one round trip), then group in JS.
  const orderIds = rows.map((r) => r.id);
  const itemRows = await db
    .select({
      orderId: orderItems.orderId,
      productSlug: orderItems.productSlug,
      sizeLabel: orderItems.sizeLabel,
      format: orderItems.format,
      quantity: orderItems.quantity,
      linePriceCents: orderItems.linePrice,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const itemsByOrder = new Map<string, AdminOrderItemRow[]>();
  for (const it of itemRows) {
    const list = itemsByOrder.get(it.orderId) ?? [];
    list.push({
      productSlug: it.productSlug,
      sizeLabel: it.sizeLabel,
      format: it.format,
      quantity: it.quantity,
      linePriceCents: it.linePriceCents,
    });
    itemsByOrder.set(it.orderId, list);
  }

  return rows.map((r) => ({
    ...r,
    items: itemsByOrder.get(r.id) ?? [],
  }));
}

// ── groupByCustomer ──────────────────────────────────────────────────────────────

export interface CustomerGroup {
  email: string;
  name: string;
  orderCount: number;
  paidRevenueCents: number; // Σ total_price of paid/fulfilled orders
  lastOrderAt: Date;
}

// Group orders by email. paidRevenueCents sums only paid/fulfilled orders (a filtered SUM);
// name is the most recent order's name for that email; ordered by paid revenue desc.
export async function groupByCustomer(): Promise<CustomerGroup[]> {
  const rows = await db
    .select({
      email: orders.email,
      // most-recent name for this email (Postgres: name of the max created_at row)
      name: sql<string>`(array_agg(${orders.name} order by ${orders.createdAt} desc))[1]`,
      orderCount: count(),
      paidRevenueCents: sql<string | null>`sum(case when ${inArray(orders.status, [...PAID_STATUSES])} then ${orders.totalPrice} else 0 end)`,
      lastOrderAt: sql<Date>`max(${orders.createdAt})`,
    })
    .from(orders)
    .groupBy(orders.email)
    .orderBy(desc(sql`sum(case when ${inArray(orders.status, [...PAID_STATUSES])} then ${orders.totalPrice} else 0 end)`));

  return rows.map((r) => ({
    email: r.email,
    name: r.name,
    orderCount: r.orderCount,
    paidRevenueCents: toCents(r.paidRevenueCents),
    lastOrderAt: r.lastOrderAt,
  }));
}
