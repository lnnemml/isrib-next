import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { getCustomerOrders } from "@/lib/customer/orders";
import { signOutCustomer } from "@/app/actions/customerAuth";
import { formatCents } from "@/lib/copy/products";
import { StatusBadge } from "./statusBadge";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

// Reads the logged-in customer + their orders (PII) — never statically rendered.
export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AccountHomePage() {
  // The (cabinet) layout guard guarantees a customer here; re-fetch for the row.
  const customer = await getCurrentCustomer();
  if (!customer) return null; // layout redirects; this satisfies the type

  const orders = await getCustomerOrders(customer.email);
  const recent = orders.slice(0, 3);

  const memberSince = customer.firstOrderAt
    ? `Customer since ${fmtDate(customer.firstOrderAt)}`
    : `Account created ${fmtDate(customer.createdAt)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-text">
            {`Welcome back${customer.name ? `, ${customer.name}` : ""}`}
          </h1>
          <p className="mt-1 text-small text-text-muted">{customer.email}</p>
          <p className="mt-0.5 text-caption text-text-faint">{memberSince}</p>
        </div>
        <form action={signOutCustomer}>
          <button
            type="submit"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
          >
            {"Log out"}
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href="/account/orders"
          className="text-small font-semibold text-primary transition hover:opacity-80"
        >
          {"Order history →"}
        </Link>
        <Link
          href="/account/referrals"
          className="text-small font-semibold text-primary transition hover:opacity-80"
        >
          {"Referral program →"}
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
          {"Recent orders"}
        </h2>
        {orders.length > 0 ? (
          <Link
            href="/account/orders"
            className="text-small font-semibold text-primary transition hover:opacity-80"
          >
            {"View all orders →"}
          </Link>
        ) : null}
      </div>

      {recent.length === 0 ? (
        <div className="mt-3 rounded-lg border border-border bg-surface px-4 py-8 text-center text-small text-text-muted">
          {"No orders yet."}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                  {"Order"}
                </th>
                <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                  {"Date"}
                </th>
                <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                  {"Products"}
                </th>
                <th className="px-3 py-2 text-right font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                  {"Total"}
                </th>
                <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                  {"Status"}
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
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
                      <span className="inline-block rounded-full bg-surface-soft px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
                        {"Archive"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtDate(o.date)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{o.productsSummary}</td>
                  <td className="px-3 py-2 text-right text-caption font-semibold text-text">
                    {formatCents(o.totalCents)}
                  </td>
                  <td className="px-3 py-2 text-caption">
                    {o.status ? (
                      <StatusBadge status={o.status} />
                    ) : (
                      <span className="text-text-faint">{"—"}</span>
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
