// Shared status label + chip for the customer cabinet. Mirrors the admin
// STATUS_OPTIONS labels (src/app/(admin)/admin/StatusSelect.tsx) so the customer sees
// the same wording, with a token-based color chip. Server-safe (no client hooks) so it
// can render inside the cabinet server components.

type OrderStatus =
  | "pending_payment_instructions"
  | "awaiting_payment"
  | "paid"
  | "fulfilled"
  | "cancelled";

// Labels mirror the admin panel's STATUS_OPTIONS.
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment_instructions: "Pending instructions",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

// Color chip per status — locked tokens only.
const STATUS_CHIP: Record<OrderStatus, string> = {
  pending_payment_instructions: "bg-surface-soft text-text-muted",
  awaiting_payment: "bg-surface-soft text-text-muted",
  paid: "bg-success/10 text-success",
  fulfilled: "bg-success/10 text-success",
  cancelled: "bg-surface-soft text-text-faint",
};

export function statusLabel(status: OrderStatus): string {
  return STATUS_LABEL[status];
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const base =
    "inline-block rounded-full px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em]";
  return <span className={`${base} ${STATUS_CHIP[status]}`}>{STATUS_LABEL[status]}</span>;
}
