import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { getCustomerOrders } from "@/lib/customer/orders";
import { formatCents } from "@/lib/copy/products";
import { StatusBadge } from "../statusBadge";

export const metadata: Metadata = {
  title: "Order history",
  robots: { index: false, follow: false },
};

// Reads customer order history (PII) — never statically rendered.
export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function paymentLabel(method: "crypto" | "manual" | null): string {
  if (method === "crypto") return "Crypto";
  if (method === "manual") return "Manual";
  return "—";
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

export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null; // layout guard redirects

  const orders = await getCustomerOrders(customer.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h2 font-semibold text-text">{"Order history"}</h1>
        <Link
          href="/account"
          className="text-small font-semibold text-primary transition hover:opacity-80"
        >
          {"← Back to account"}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-surface px-4 py-12 text-center text-small text-text-muted">
          {"No orders yet."}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Order"}</Th>
                <Th>{"Date"}</Th>
                <Th>{"Products"}</Th>
                <Th>{"Payment"}</Th>
                <Th right>{"Total"}</Th>
                <Th>{"Status"}</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={`${o.source}-${o.id}`} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-caption text-text">
                    {o.source === "live" && o.orderNumber ? (
                      <Link
                        href={`/account/orders/${o.id}`}
                        className="font-semibold text-primary transition hover:opacity-80"
                      >
                        {o.orderNumber}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-text-faint">{"—"}</span>
                        <span className="inline-block rounded-full bg-surface-soft px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                          {"Archive"}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtDate(o.date)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{o.productsSummary}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">
                    {paymentLabel(o.paymentMethod)}
                  </td>
                  <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                    {formatCents(o.totalCents)}
                  </td>
                  <td className="px-3 py-2 text-caption">
                    {o.status ? (
                      <StatusBadge status={o.status} />
                    ) : (
                      <span className="inline-block rounded-full bg-surface-soft px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                        {"Legacy"}
                      </span>
                    )}
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
