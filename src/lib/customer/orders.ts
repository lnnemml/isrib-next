// Customer cabinet data layer (ADR 0013). Server-only: touches the DB directly and
// must never be pulled into a client bundle.
//
// Ownership model (ADR 0013 v1): the cabinet reads by EMAIL match, not by an
// orders.customerId FK. LIVE orders join on orders.email == customer email; LEGACY
// orders join legacyOrders -> customers by the customer's email. Emails are
// lowercase-compared. The future orders.customerId backfill is out of scope here.
import "server-only";

import { db } from "@/lib/db";
import { orders, orderItems, customers, legacyOrders } from "@/lib/db/schema";
import { getProduct } from "@/lib/copy/products";
import { eq, and, desc, inArray } from "drizzle-orm";

// ── Public types ──────────────────────────────────────────────────────────────

// One normalized row for the unified history LIST view. Live and legacy orders are
// folded into the same shape; `source` tags which table it came from.
export type CustomerOrderListItem = {
  source: "live" | "legacy";
  id: string;
  orderNumber: string | null; // live only; legacy has no order number
  date: Date | null; // live: createdAt · legacy: orderedAt (nullable)
  status: (typeof orders.$inferSelect)["status"] | null; // live only
  paymentMethod: (typeof orders.$inferSelect)["paymentMethod"] | null; // live only
  totalCents: number;
  productsSummary: string; // live: "2× ISRIB A15 2g" · legacy: productsRaw
};

// A single line item on the detail page.
export type CustomerOrderItemDetail = {
  id: string;
  productSlug: string;
  productName: string;
  format: (typeof orderItems.$inferSelect)["format"];
  quantity: number;
  sizeLabel: string;
  linePriceCents: number;
};

// A single LIVE order with its line items, for the detail page.
export type CustomerOrderDetail = {
  id: string;
  orderNumber: string;
  date: Date;
  status: (typeof orders.$inferSelect)["status"];
  paymentMethod: (typeof orders.$inferSelect)["paymentMethod"];
  cryptoDiscountPct: number | null;
  subtotalCents: number;
  totalCents: number;
  note: string | null;
  // shipping address (all nullable — collected post-payment per ADR 0010)
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  stateRegion: string | null;
  country: string;
  phone: string | null;
  // tracking (present once shipped)
  trackingNumber: string | null;
  trackingCarrier: string | null;
  shippedAt: Date | null;
  items: CustomerOrderItemDetail[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

// Build the "2× ISRIB A15 2g, 1× ZZL-7 250mg" style summary for a live order from
// its line items. Falls back to the raw slug when the product is not in the catalog.
function liveItemsSummary(items: (typeof orderItems.$inferSelect)[]): string {
  if (items.length === 0) return "—";
  return items
    .map((it) => {
      const name = getProduct(it.productSlug)?.name ?? it.productSlug;
      return `${it.quantity}× ${name} ${it.sizeLabel}`;
    })
    .join(", ");
}

// ── getCustomerOrders — unified LIST (live + legacy) sorted by date DESC ─────────

export async function getCustomerOrders(email: string): Promise<CustomerOrderListItem[]> {
  const normalizedEmail = email.trim().toLowerCase();

  // LIVE orders owned by this email. orders.email is stored lowercased at checkout,
  // but lowercase-compare defensively anyway.
  const liveOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.email, normalizedEmail));

  // Fetch all line items for those orders in one query, then group by orderId.
  const liveOrderIds = liveOrders.map((o) => o.id);
  const items =
    liveOrderIds.length > 0
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, liveOrderIds))
      : [];
  const itemsByOrder = new Map<string, (typeof orderItems.$inferSelect)[]>();
  for (const it of items) {
    const list = itemsByOrder.get(it.orderId) ?? [];
    list.push(it);
    itemsByOrder.set(it.orderId, list);
  }

  const liveRows: CustomerOrderListItem[] = liveOrders.map((o) => ({
    source: "live",
    id: o.id,
    orderNumber: o.orderNumber,
    date: o.createdAt,
    status: o.status,
    paymentMethod: o.paymentMethod,
    totalCents: o.totalPrice,
    productsSummary: liveItemsSummary(itemsByOrder.get(o.id) ?? []),
  }));

  // LEGACY orders: find the customer row(s) by email, then their legacy orders.
  const customerRows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, normalizedEmail));
  const customerIds = customerRows.map((c) => c.id);

  const legacyRows: CustomerOrderListItem[] =
    customerIds.length > 0
      ? (
          await db
            .select()
            .from(legacyOrders)
            .where(inArray(legacyOrders.customerId, customerIds))
        ).map((l) => ({
          source: "legacy" as const,
          id: l.id,
          orderNumber: null,
          date: l.orderedAt,
          status: null,
          paymentMethod: null,
          totalCents: l.amountCents,
          productsSummary: l.productsRaw,
        }))
      : [];

  // Merge and sort by date DESC. Null dates (some legacy rows) sort to the bottom.
  return [...liveRows, ...legacyRows].sort((a, b) => {
    const at = a.date ? a.date.getTime() : -Infinity;
    const bt = b.date ? b.date.getTime() : -Infinity;
    return bt - at;
  });
}

// ── getCustomerOrderDetail — a single LIVE order, ownership by email ─────────────

export async function getCustomerOrderDetail(
  email: string,
  orderId: string,
): Promise<CustomerOrderDetail | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.email, normalizedEmail)))
    .limit(1);

  if (!order) return null; // not found OR not owned by this email

  const lineItems = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(desc(orderItems.linePrice));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    cryptoDiscountPct: order.cryptoDiscountPct,
    subtotalCents: order.subtotalPrice,
    totalCents: order.totalPrice,
    note: order.note,
    name: order.name,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode,
    stateRegion: order.stateRegion,
    country: order.country,
    phone: order.phone,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
    shippedAt: order.shippedAt,
    items: lineItems.map((it) => ({
      id: it.id,
      productSlug: it.productSlug,
      productName: getProduct(it.productSlug)?.name ?? it.productSlug,
      format: it.format,
      quantity: it.quantity,
      sizeLabel: it.sizeLabel,
      linePriceCents: it.linePrice,
    })),
  };
}
