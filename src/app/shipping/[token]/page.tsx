// Post-payment shipping capture page (ADR 0010). Server component: resolves the order by
// its unguessable shipping_token (never the guessable order_number). If the address has
// already been submitted (shipping_details_at set) it renders a read-only "received" panel
// so a revisit/refresh is idempotent; otherwise it renders the form. Header/footer come
// from the root layout.

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ShippingForm } from "./ShippingForm";

interface ShippingPageProps {
  params: Promise<{ token: string }>;
}

export default async function ShippingPage({ params }: ShippingPageProps) {
  // Next 16 — params is async.
  const { token } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.shippingToken, token)).limit(1);

  if (!order) {
    notFound();
  }

  const received = order.shippingDetailsAt != null;

  return (
    <main className="mx-auto max-w-[820px] px-8 py-16">
      <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
        {"Shipping details"}
      </h1>

      <div className="mt-8">
        {received ? (
          <div className="rounded-xl border border-border bg-surface-soft p-6">
            <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-success">
              {"Shipping details received"}
            </p>
            <p className="mb-6 text-body text-text-muted">
              {"Thanks — we have your delivery details for order "}
              <span className="font-mono font-semibold text-text">{order.orderNumber}</span>
              {". We'll ship your order and follow up by email."}
            </p>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-small font-medium text-text-subtle">{"Name"}</dt>
                <dd className="text-body text-text">{order.name}</dd>
              </div>
              <div>
                <dt className="text-small font-medium text-text-subtle">{"Mobile"}</dt>
                <dd className="text-body text-text">{order.phone ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-small font-medium text-text-subtle">{"Address"}</dt>
                <dd className="text-body text-text">{order.address ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-small font-medium text-text-subtle">{"City"}</dt>
                <dd className="text-body text-text">{order.city ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-small font-medium text-text-subtle">{"Postal code"}</dt>
                <dd className="text-body text-text">{order.postalCode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-small font-medium text-text-subtle">{"Country"}</dt>
                <dd className="text-body text-text">{order.country}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <ShippingForm token={token} orderNumber={order.orderNumber} country={order.country} />
        )}
      </div>
    </main>
  );
}
