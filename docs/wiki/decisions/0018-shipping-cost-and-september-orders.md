# ADR 0018 — Per-order shipping cost + September-2026 order backfill

**Status:** accepted · 2026-09-08

## Decision

Two related changes to the order/BI model:

1. **Flat $10/order shipping cost as a computed BI metric.** Shipping is free to the
   customer, so each shipped order costs us ~$10 out of margin. Model it as a constant
   `SHIPPING_COST_CENTS = 1000` (`src/lib/admin/queries.ts`) and surface, in the admin
   panel, **Shipping cost** = `lifetimeOrders × $10` and **Net after shipping** =
   `lifetimeRevenue − shippingCost`, across **all legacy orders + PAID live orders** (we
   only ship paid ones). **No schema change** — it's a derived figure via `lifetimeShipping()`,
   so the rate is trivially changeable and nothing is stored per row.

2. **September-2026 orders backfilled additively.** Three real orders taken on the old
   site this month (from `/home/laptop/Downloads/september.xlsx`) are imported into
   `legacy_orders` + `customers` + `marketing_contacts` + the Resend segment — WITHOUT the
   destructive full re-import.

## Context

The system was entirely **revenue-based** — `orders.total_price`, `legacy_orders.amount_cents`,
and `biSummary` all tracked revenue; there was no cost/profit/COGS concept. Anton tracks
**profit-per-order** in his sheets, and on these compounds his margin is near the full order
price (a "5 g ISRIB-A15" order is ~$850 as both the legacy stored amount AND the September
sheet's "profit"), so the tracked `amount_cents` doubles as his profit basis. The one real
cost he wanted reflected is the **$10 shipping he eats per order** (free shipping to the
buyer). Hence a net-after-shipping view, not a full COGS model.

The 3 September orders had to be added **without** re-running `import-legacy-orders.ts`,
which is **destructive** (`delete(customers).where(source='legacy')` then re-insert with
fresh nanoid ids) — re-running it now would regenerate legacy customer ids and cascade-delete
their referral/reward rows (ADR 0014). So a separate additive/idempotent importer was written.

## Consequences

- **`amount_cents` is treated as the profit/value basis**, not gross revenue with separate
  COGS. If a true COGS model is ever needed, this ADR is where the assumption is recorded.
- New September customers use **`source = "legacy-sep2026"`** (not `"legacy"`) specifically so
  a future destructive legacy re-import cannot delete them. The customer BI fold has no source
  filter, so they still count in LTV/BI. **Landmine:** `ahim@inbox.lv` was an EXISTING
  `source="legacy"` customer, so his new September order rides on a `source="legacy"` row — a
  full legacy re-import WOULD cascade-delete it. Re-run `import:september-orders --commit`
  after any such re-import (it's idempotent).
- `import-september-orders.ts` is additive + idempotent (dup-guard on
  customerId+productsRaw+amountCents+orderedAt; opt-out-preserving marketing upsert;
  clientType recomputed → `ahim` went client→regular). Safe to re-run.
- Current lifetime figures after this backfill: **226 orders · $44,767.75 revenue · $2,260
  shipping · $42,507.75 net** (0 paid live orders yet post-cutover; the live half grows as
  paid orders come in).
- The shipping metric counts **paid live orders only** — unpaid/cancelled orders incur no
  shipping cost. Rate change = edit one constant.

## Revisit if

- We need a real COGS/profit model (per-product cost) rather than "amount ≈ profit".
- Shipping cost stops being a flat $10 (e.g. per-region, per-weight) — then it likely needs
  a stored per-order `shipping_cost` column instead of a constant.
- We want shipping/net in the 30-day window too (currently lifetime-only).

## Related
- [ADR 0012](0012-legacy-orders-import-and-customers.md) (legacy import + the destructive
  importer this one deliberately avoids) · [ADR 0017](0017-email-campaign-broadcasts-and-marketing-list.md)
  (the marketing list the 3 orders also join) · `src/lib/admin/queries.ts` · `architecture/admin-panel.md`
