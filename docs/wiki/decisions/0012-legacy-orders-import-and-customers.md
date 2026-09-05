# ADR 0012 — Legacy order history import + `customers` model

**Status:** accepted · 2026-09-05 · Anton approved full per-order porting.

## Decision

Port ~5 years of order history from Anton's Google Sheets into Neon so the admin panel
shows per-customer **repeat count** and **lifetime revenue (LTV)** across old + new orders.

Two new tables (legacy data is **quarantined** from the live `orders` table — no synthetic
tokens, no risk to the checkout/fulfilment flow):

- **`customers`** — one row per person, keyed by **email** (unique). Fields:
  `email`, `name`, `country`, `clientType` (`regular` = 2+ orders · `client` = 1 · `lead` = 0),
  `firstOrderAt`, `legacySheetUrl`, `source` (`legacy` for now), `createdAt`. The aggregation
  anchor for LTV **and** the future customer-accounts + referral feature (roadmap).
- **`legacy_orders`** — one row per historical order: `id`, `customerId` (FK → customers),
  `orderedAt` (date), `productsRaw` (free-text, e.g. "100 mg ISRIB" — NOT normalised to the
  typed catalog), `amountCents`, `createdAt`.

The admin per-customer view aggregates **by email** across live `orders` + `legacy_orders`
(joined to `customers` for metadata). No change to `submitOrder`/`orders`/checkout.

## Context

- **Source shape (read via Google Drive MCP; CSV export is auth-gated → MCP only):**
  - Master sheet = **customer-level** (~190 rows): `Name · Email · total amount · Products ·
    Order quantity · client type · Country · specification (link to per-client sheet) · first order`.
  - Per-client sheet = **order-level**: `order# · products · amount · date · total`.
- **Anton's rules (2026-09-05):** a large total on 1 order is legitimate (one big order) — do
  NOT infer order count from amount. **Order count = number of rows in the per-client sheet.**
  `regular customer` = 2+ orders. `ordered` ($0, qty 0) = a **lead** (never purchased) — imported
  as a `lead` customer with zero legacy_orders (useful for the migration-announce email).
- **Data-quality notes:** amounts are European-format (`$1 000,00` = 1000.00, space=thousands,
  comma=decimal); dates are `D.M.YYYY`; occasional typos ("clent"); one duplicated sheet link.
  Per-client sheets are the source of truth for order-level data.

## Consequences

- Legacy orders never touch the live checkout path; they cannot trigger emails/analytics/nurture.
- Admin customer/BI queries must UNION live + legacy (small query change; tracked in `admin-panel.md`).
- Product breakdown for legacy is coarse (`productsRaw`), sufficient for the LTV/repeat goal;
  SKU-level legacy analytics can be added later if needed.
- Import is a **one-off script** (marked `legacy`), run with a **dry-run** first; Anton runs the
  Neon migration (`db:push`) and the final load (the human runs migrations/deploys — see prior gates).

## Revisit if

- The customer-accounts feature lands → may promote `customers` to the auth user table and add
  `orders.customerId` FKs (backfill by email), retiring the email-join.
- We need per-SKU legacy analytics → normalise `productsRaw` into a legacy line-items table.
