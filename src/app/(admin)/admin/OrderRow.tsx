"use client";

// One expandable orders-table row (admin-panel.md §5, C2). The expand toggle is client
// state; the interactive fulfillment/status controls live inside. All money is pre-formatted
// by the server page (formatCents) and passed as display strings — no cents math here.
import { useState } from "react";
import { StatusSelect } from "./StatusSelect";
import { MarkPaidButton } from "./MarkPaidButton";
import { TrackingForm } from "./TrackingForm";

export interface OrderRowData {
  id: string;
  orderNumber: string;
  dateLabel: string;
  name: string;
  email: string;
  itemsSummary: string;
  totalLabel: string;
  status: string;
  trafficLabel: string;
  utmLabel: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  showMarkPaid: boolean;
  // expand view
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  shippingDetailsLabel: string;
}

export function OrderRow({ row }: { row: OrderRowData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="border-b border-border align-top">
        <td className="px-3 py-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-left text-caption font-semibold text-primary hover:underline"
          >
            {open ? "▾ " : "▸ "}
            {row.orderNumber}
          </button>
          <div className="text-caption text-text-faint">{row.dateLabel}</div>
        </td>
        <td className="px-3 py-2">
          <div className="text-caption font-medium text-text">{row.name}</div>
          <div className="text-caption text-text-muted">{row.email}</div>
        </td>
        <td className="px-3 py-2 text-caption text-text-muted">{row.itemsSummary}</td>
        <td className="px-3 py-2 text-caption font-semibold text-text">{row.totalLabel}</td>
        <td className="px-3 py-2">
          <span className="inline-block rounded bg-surface-soft px-1.5 py-0.5 text-caption text-text-muted">
            {row.trafficLabel}
          </span>
          <div className="mt-0.5 text-caption text-text-faint">{row.utmLabel}</div>
        </td>
        <td className="px-3 py-2">
          <StatusSelect orderId={row.id} status={row.status} />
        </td>
        <td className="px-3 py-2">
          <div className="flex flex-col gap-1.5">
            {row.showMarkPaid && <MarkPaidButton orderId={row.id} />}
            <TrackingForm
              orderId={row.id}
              trackingNumber={row.trackingNumber}
              carrier={row.trackingCarrier}
            />
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border bg-surface-soft">
          <td colSpan={7} className="px-3 py-3">
            <div className="grid gap-x-8 gap-y-1 text-caption text-text-muted sm:grid-cols-2">
              <div>
                <span className="font-semibold text-text">{"Ship to: "}</span>
                {row.address ?? "—"}
              </div>
              <div>
                <span className="font-semibold text-text">{"City: "}</span>
                {row.city ?? "—"}
              </div>
              <div>
                <span className="font-semibold text-text">{"Postal: "}</span>
                {row.postalCode ?? "—"}
              </div>
              <div>
                <span className="font-semibold text-text">{"Country: "}</span>
                {row.country}
              </div>
              <div>
                <span className="font-semibold text-text">{"Phone: "}</span>
                {row.phone ?? "—"}
              </div>
              <div>
                <span className="font-semibold text-text">{"Shipping details: "}</span>
                {row.shippingDetailsLabel}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
