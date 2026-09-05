/**
 * One-off legacy import (ADR 0012).
 *
 * Imports historical customers + orders (already extracted to JSON from Anton's
 * Google Sheets) into Neon. Legacy data is quarantined from the live `orders`
 * table — it lands in `customers` + `legacy_orders` only.
 *
 * Modes:
 *   node --import tsx scripts/import-legacy-orders.ts            → DRY RUN (no DB access at all)
 *   node --env-file=.env.local --import tsx scripts/import-legacy-orders.ts --commit → import
 *
 * The dry run reads only JSON, so it is runnable without env vars or a DB.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "docs", "raw", "legacy-orders");

// ── Source shapes ────────────────────────────────────────────────────────────

interface ManifestCustomer {
  name: string;
  email: string;
  country: string | null;
  clientTypeRaw: string;
  clientType: string;
  firstOrderRaw: string;
  totalAmountRaw: string;
  orderQtyRaw: string;
  sheetId: string;
}

interface Manifest {
  count: number;
  customers: ManifestCustomer[];
}

interface BatchOrder {
  orderedAt: string | null; // "YYYY-MM-DD" | null
  productsRaw: string;
  amountCents: number;
}

interface BatchEntry {
  email: string;
  sheetId: string;
  orderCount: number;
  totalCents: number;
  orders: BatchOrder[];
}

// ── Computed row shapes (match schema.ts columns) ────────────────────────────

type ClientType = "regular" | "client" | "lead";

interface CustomerRow {
  id: string;
  email: string;
  name: string;
  country: string | null;
  clientType: ClientType;
  firstOrderAt: Date | null;
  legacySheetUrl: string | null;
  source: string;
  createdAt: Date;
}

interface LegacyOrderRow {
  id: string;
  customerId: string;
  orderedAt: Date | null;
  productsRaw: string;
  amountCents: number;
}

// The copy-paste error: chriscrew1983 shares d_mccallister's sheetId. His batch
// entry is a copy of d_mccallister's orders and must NOT be attached to him.
const EXCLUDED_ORDER_EMAIL = "chriscrew1983@hotmail.com";

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as T;
}

/** Parse D.M.YYYY → UTC-midnight Date; null if empty/unparseable. */
function parseFirstOrder(raw: string): Date | null {
  if (!raw || !raw.trim()) return null;
  const m = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  // Reject overflow (e.g. 31.2.2025 rolling into March)
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return d;
}

/** Parse "YYYY-MM-DD" → UTC-midnight Date; null if empty/unparseable. */
function parseOrderedAt(raw: string | null): Date | null {
  if (!raw || !raw.trim()) return null;
  const m = raw.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return d;
}

function computeClientType(orderCount: number): ClientType {
  if (orderCount >= 2) return "regular";
  if (orderCount === 1) return "client";
  return "lead";
}

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── Build ────────────────────────────────────────────────────────────────────

interface BuildResult {
  customerRows: CustomerRow[];
  orderRows: LegacyOrderRow[];
  // per-customer summary for reporting
  summaries: {
    email: string;
    orderCount: number;
    amountCents: number;
    computedClientType: ClientType;
    manifestClientType: string;
  }[];
}

function build(): BuildResult {
  const manifest = readJson<Manifest>("customers.json");

  // Load all 6 batches, build email → orders map. Lowercase emails for keying.
  const batchFiles = [1, 2, 3, 4, 5, 6].map((n) => `orders-batch-${n}.json`);
  const ordersByEmail = new Map<string, BatchOrder[]>();

  for (const file of batchFiles) {
    const entries = readJson<BatchEntry[]>(file);
    for (const entry of entries) {
      const email = entry.email.trim().toLowerCase();
      // Dedup fix: chriscrew1983's batch entry is a copy-paste of
      // d_mccallister's orders (shared sheetId). Skip attaching it entirely.
      if (email === EXCLUDED_ORDER_EMAIL) continue;
      const existing = ordersByEmail.get(email) ?? [];
      existing.push(...entry.orders);
      ordersByEmail.set(email, existing);
    }
  }

  const customerRows: CustomerRow[] = [];
  const orderRows: LegacyOrderRow[] = [];
  const summaries: BuildResult["summaries"] = [];

  for (const m of manifest.customers) {
    const email = m.email.trim().toLowerCase();
    const orders = ordersByEmail.get(email) ?? [];
    const orderCount = orders.length;
    const clientType = computeClientType(orderCount);

    const customerId = nanoid();
    customerRows.push({
      id: customerId,
      email,
      name: m.name,
      country: m.country && m.country.trim() ? m.country : null,
      clientType,
      firstOrderAt: parseFirstOrder(m.firstOrderRaw),
      legacySheetUrl: m.sheetId
        ? `https://docs.google.com/spreadsheets/d/${m.sheetId}/edit`
        : null,
      source: "legacy",
      createdAt: new Date(),
    });

    let amountCents = 0;
    for (const o of orders) {
      amountCents += o.amountCents;
      orderRows.push({
        id: nanoid(),
        customerId,
        orderedAt: parseOrderedAt(o.orderedAt),
        productsRaw: o.productsRaw,
        amountCents: o.amountCents,
      });
    }

    summaries.push({
      email,
      orderCount,
      amountCents,
      computedClientType: clientType,
      manifestClientType: m.clientType,
    });
  }

  return { customerRows, orderRows, summaries };
}

// ── Report (dry run) ─────────────────────────────────────────────────────────

function printSummary(r: BuildResult): void {
  const { customerRows, orderRows, summaries } = r;

  const byType = { regular: 0, client: 0, lead: 0 };
  for (const c of customerRows) byType[c.clientType]++;

  const withOrders = summaries.filter((s) => s.orderCount >= 1).length;
  const repeat = summaries.filter((s) => s.orderCount >= 2).length;

  const totalRevenueCents = orderRows.reduce((a, o) => a + o.amountCents, 0);

  const datedOrders = orderRows.filter((o) => o.orderedAt !== null);
  const nullDateOrders = orderRows.length - datedOrders.length;
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  for (const o of datedOrders) {
    const d = o.orderedAt!;
    if (minDate === null || d < minDate) minDate = d;
    if (maxDate === null || d > maxDate) maxDate = d;
  }

  const nullFirstOrder = customerRows.filter(
    (c) => c.firstOrderAt === null,
  ).length;

  const typeMismatches = summaries.filter(
    (s) => s.computedClientType !== s.manifestClientType,
  ).length;

  const top10 = [...summaries]
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 10);

  console.log("");
  console.log("=== LEGACY IMPORT — DRY RUN (no DB access) ===");
  console.log("");
  console.log(`Dedup action: excluded batch orders for ${EXCLUDED_ORDER_EMAIL}`);
  console.log(
    "  (shared sheetId 1nDjnYJFfFKGiqu-m-zK2FDTlwriK0blz7K2xduyLpOE →",
    "orders belong only to d_mccallister@suddenlink.net)",
  );
  console.log("");
  console.log(`Total customers:            ${customerRows.length}`);
  console.log(`  regular (2+ orders):      ${byType.regular}`);
  console.log(`  client  (1 order):        ${byType.client}`);
  console.log(`  lead    (0 orders):       ${byType.lead}`);
  console.log(`Customers with >=1 order:   ${withOrders}`);
  console.log(`Repeat customers (2+):      ${repeat}`);
  console.log("");
  console.log(`Total legacy orders:        ${orderRows.length}`);
  console.log(`Total revenue:              ${fmtUsd(totalRevenueCents)}`);
  console.log(
    `Order date range:           ${minDate ? fmtDate(minDate) : "n/a"} → ${
      maxDate ? fmtDate(maxDate) : "n/a"
    }`,
  );
  console.log(`Orders with null date:      ${nullDateOrders}`);
  console.log(`Customers w/ null firstOrderAt: ${nullFirstOrder}`);
  console.log(
    `Computed clientType != manifest clientType: ${typeMismatches} customer(s)`,
  );
  console.log("");
  console.log("Top 10 customers by summed amountCents:");
  console.log("  #  email                                        orders        $");
  top10.forEach((s, i) => {
    const rank = String(i + 1).padStart(2, " ");
    const email = s.email.padEnd(44, " ");
    const orders = String(s.orderCount).padStart(6, " ");
    const usd = fmtUsd(s.amountCents).padStart(12, " ");
    console.log(`  ${rank} ${email} ${orders} ${usd}`);
  });
  console.log("");
}

// ── Commit (real DB write) ───────────────────────────────────────────────────

async function commit(r: BuildResult): Promise<void> {
  const { customerRows, orderRows } = r;

  // Only import the DB module on the commit path — dry run must not touch it.
  const { db } = await import("../src/lib/db/index");
  const { customers, legacyOrders } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log("");
  console.log("=== LEGACY IMPORT — COMMIT ===");
  console.log(
    `Prepared ${customerRows.length} customers, ${orderRows.length} legacy orders.`,
  );

  try {
    let insertedCustomers = 0;
    let insertedOrders = 0;

    await db.transaction(async (tx) => {
      // (a) idempotent: drop all prior legacy customers; FK onDelete cascade
      //     removes their legacy_orders too.
      await tx.delete(customers).where(eq(customers.source, "legacy"));

      // (b) insert customers
      if (customerRows.length > 0) {
        await tx.insert(customers).values(customerRows);
        insertedCustomers = customerRows.length;
      }

      // (c) insert legacy orders
      if (orderRows.length > 0) {
        await tx.insert(legacyOrders).values(orderRows);
        insertedOrders = orderRows.length;
      }
    });

    console.log("");
    console.log(`Inserted customers:      ${insertedCustomers}`);
    console.log(`Inserted legacy orders:  ${insertedOrders}`);
    console.log("Done.");
    console.log("");
  } catch (err) {
    const msg = String(err);
    if (
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("undefined_table")
    ) {
      console.error("");
      console.error(
        "ERROR: the customers/legacy_orders tables don't exist yet.",
      );
      console.error("Run `npm run db:push` first, then re-run with --commit.");
      console.error("");
      console.error("(underlying error:", msg, ")");
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

// ── Entry ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const isCommit = process.argv.includes("--commit");
  const result = build();

  if (isCommit) {
    await commit(result);
  } else {
    printSummary(result);
    console.log("Dry run only — no DB was touched. Pass --commit to import.");
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
