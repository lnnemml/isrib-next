// Order confirmation (gate G2, Step 2). Server component: fetches the order + items from
// Neon by orderNumber and renders a receipt. NO card fields, NO "Pay Now", no money-back
// / guarantee language (compliance). Crypto invoice redirect arrives in Step 4.

import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { getProduct, formatCents } from "@/lib/copy/products";
import { eq } from "drizzle-orm";
import { ClearCartOnMount } from "../ClearCartOnMount";

function productName(slug: string): string {
  return getProduct(slug)?.name ?? slug;
}

interface SuccessPageProps {
  searchParams: Promise<{ order?: string; paid?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  // Next 16 — searchParams is async.
  const { order: orderNumber, paid } = await searchParams;

  const [order] = orderNumber
    ? await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
    : [];

  if (!order) {
    return (
      <main className="mx-auto max-w-[820px] px-8 py-24">
        <h1 className="mb-4 text-h2 font-bold">{"Order not found"}</h1>
        <p className="text-body text-text-muted">
          {"We couldn't find that order. If you just placed one, please check your email, or "}
          <Link href="/contact" className="text-primary transition hover:text-primary-hover">
            {"contact us"}
          </Link>
          {"."}
        </p>
      </main>
    );
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  // Paid state: either the webhook/admin marked the order "paid", or the buyer
  // returned from the NowPayments hosted invoice via the paid=1 success_url flag.
  const isPaid = order.status === "paid" || paid === "1";

  return (
    <main className="mx-auto max-w-[820px] px-8 py-16">
      {/* Empties the cart now that the order has landed. */}
      <ClearCartOnMount />

      <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-success">
        {isPaid ? "Payment received" : "Order received"}
      </p>
      <h1 className="mb-2 text-h2 font-bold">{"Thank you"}</h1>
      <p className="mb-8 text-body text-text-muted">
        {"Your order "}
        <span className="font-mono font-semibold text-text">{order.orderNumber}</span>
        {" has been received."}
      </p>

      <ul className="flex flex-col divide-y divide-border-soft border-y border-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-text">{productName(item.productSlug)}</p>
              <p className="font-mono text-[12px] text-text-subtle">
                {item.sizeLabel} · {item.format} · {"×"}
                {item.quantity}
              </p>
            </div>
            <span className="w-20 shrink-0 text-right font-mono text-[14px] font-semibold text-text">
              {formatCents(item.linePrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-body text-text-muted">{"Subtotal"}</span>
        <span className="font-mono text-[16px] text-text">{formatCents(order.subtotalPrice)}</span>
      </div>
      {order.cryptoDiscountPct ? (
        <div className="mt-1 flex items-center justify-between">
          <span className="text-small text-success">{"Crypto discount (−10%)"}</span>
          <span className="font-mono text-[14px] text-success">
            {"−"}
            {formatCents(order.subtotalPrice - order.totalPrice)}
          </span>
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
        <span className="text-body font-semibold text-text">{"Total"}</span>
        <span className="font-mono text-[20px] font-semibold text-text">{formatCents(order.totalPrice)}</span>
      </div>

      {isPaid ? (
        <div className="mt-10 rounded-xl border border-border bg-surface-soft p-6">
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-success">
            {"Payment received"}
          </p>
          <h2 className="mb-2 text-h4 font-semibold text-text">{"Thank you — your payment is in."}</h2>
          <p className="mb-6 text-body text-text-muted">
            {"We've received your payment. Please provide your shipping details so we can prepare and ship your order."}
          </p>
          <Link
            href={`/shipping/${order.shippingToken}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 disabled:pointer-events-none max-sm:w-full"
          >
            {"Provide shipping details →"}
          </Link>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-border bg-surface-soft p-6">
          <h2 className="mb-2 text-h4 font-semibold text-text">{"What happens next"}</h2>
          {order.paymentMethod === "crypto" ? (
            <p className="text-body text-text-muted">
              {"If you weren't redirected to the payment page, please "}
              <Link href="/contact" className="text-primary transition hover:text-primary-hover">
                {"contact us"}
              </Link>
              {" and we'll help you complete your order."}
            </p>
          ) : (
            <p className="text-body text-text-muted">
              {"We've emailed you payment instructions. Once we confirm your payment, we'll email you to collect your shipping details."}
            </p>
          )}
        </div>
      )}

      <div className="mt-10">
        <Link href="/products" className="text-primary transition hover:text-primary-hover">
          {"Continue browsing products"}
        </Link>
      </div>
    </main>
  );
}
