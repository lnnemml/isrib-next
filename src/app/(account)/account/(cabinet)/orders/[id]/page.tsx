import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { getCustomerOrderDetail } from "@/lib/customer/orders";
import { formatCents } from "@/lib/copy/products";
import { StatusBadge } from "../../statusBadge";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

// Reads a single customer order (PII) — never statically rendered.
export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function paymentLabel(method: "crypto" | "manual"): string {
  return method === "crypto" ? "Crypto" : "Manual arrangement";
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
      {children}
    </h2>
  );
}

// params is a Promise in Next 16 — must be awaited.
export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await getCurrentCustomer();
  if (!customer) return null; // layout guard redirects

  const order = await getCustomerOrderDetail(customer.email, id);
  if (!order) notFound(); // not found OR not owned by this customer

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/account/orders"
        className="text-small font-semibold text-primary transition hover:opacity-80"
      >
        {"← Back to order history"}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-semibold text-text">{`Order ${order.orderNumber}`}</h1>
          <p className="mt-1 text-caption text-text-muted">
            {`Placed ${fmtDate(order.date)} · ${paymentLabel(order.paymentMethod)}`}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Line items */}
      <SectionHeading>{"Items"}</SectionHeading>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full">
          <thead className="border-b border-border bg-surface-soft">
            <tr>
              <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                {"Product"}
              </th>
              <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                {"Size"}
              </th>
              <th className="px-3 py-2 text-right font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                {"Qty"}
              </th>
              <th className="px-3 py-2 text-right font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                {"Line total"}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-caption text-text">
                  {it.productName}
                  <span className="ml-1 text-text-faint">{`(${it.format})`}</span>
                </td>
                <td className="px-3 py-2 text-caption text-text-muted">{it.sizeLabel}</td>
                <td className="px-3 py-2 text-right text-caption text-text-muted">{it.quantity}</td>
                <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                  {formatCents(it.linePriceCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between text-small text-text-muted">
          <span>{"Subtotal"}</span>
          <span>{formatCents(order.subtotalCents)}</span>
        </div>
        {order.cryptoDiscountPct ? (
          <div className="mt-1 flex items-center justify-between text-small text-success">
            <span>{`Crypto discount (${order.cryptoDiscountPct}%)`}</span>
            <span>{`− ${formatCents(order.subtotalCents - order.totalCents)}`}</span>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-body font-semibold text-text">
          <span>{"Total"}</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </div>

      {/* Tracking */}
      {order.trackingNumber ? (
        <>
          <SectionHeading>{"Shipment tracking"}</SectionHeading>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-small text-text">
              {order.trackingCarrier ? `${order.trackingCarrier} · ` : ""}
              <span className="font-mono">{order.trackingNumber}</span>
            </div>
            {order.shippedAt ? (
              <div className="mt-1 text-caption text-text-muted">
                {`Shipped ${fmtDate(order.shippedAt)}`}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {/* Shipping address */}
      {order.address || order.city || order.postalCode ? (
        <>
          <SectionHeading>{"Shipping address"}</SectionHeading>
          <div className="rounded-lg border border-border bg-surface p-4 text-small text-text-muted">
            <div className="text-text">{order.name}</div>
            {order.address ? <div>{order.address}</div> : null}
            <div>
              {[order.city, order.stateRegion, order.postalCode].filter(Boolean).join(", ")}
            </div>
            <div>{order.country}</div>
            {order.phone ? <div className="mt-1">{order.phone}</div> : null}
          </div>
        </>
      ) : null}

      {/* Note */}
      {order.note ? (
        <>
          <SectionHeading>{"Order note"}</SectionHeading>
          <div className="rounded-lg border border-border bg-surface p-4 text-small text-text-muted">
            {order.note}
          </div>
        </>
      ) : null}
    </div>
  );
}
