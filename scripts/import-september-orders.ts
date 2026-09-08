/**
 * Additive September-2026 orders import (ADR 0012 pattern; additive, NOT the
 * destructive legacy loader).
 *
 * Unlike scripts/import-legacy-orders.ts — which DELETEs all source="legacy"
 * customers on --commit and re-inserts — this script is ADDITIVE and IDEMPOTENT.
 * It never deletes, and re-running --commit never double-inserts. To keep a future
 * legacy re-import from ever deleting these people, NEW customers here are stamped
 * source "legacy-sep2026" (the destructive loader only deletes source="legacy").
 *
 * Modes:
 *   node --import tsx scripts/import-september-orders.ts            → DRY RUN (no DB access at all)
 *   node --env-file=.env.local --import tsx scripts/import-september-orders.ts --commit → import
 *
 * The dry run touches no DB and needs no env vars.
 */

import { nanoid } from "nanoid";

// ── Source rows (hardcoded; the September batch) ─────────────────────────────

type ClientType = "regular" | "client" | "lead";

interface SeptemberOrderInput {
  date: string; // "YYYY-MM-DD"
  name: string;
  email: string;
  productsRaw: string;
  amountCents: number;
}

const SEPTEMBER_ORDERS: readonly SeptemberOrderInput[] = [
  {
    date: "2026-09-03",
    name: "Diego Medina",
    email: "diegomedinaofficial2@gmail.com",
    productsRaw: "5 g ISRIB-A15",
    amountCents: 85000,
  },
  {
    date: "2026-09-03",
    name: "Mihails Umanskis",
    email: "ahim@inbox.lv",
    productsRaw: "25 caps ISRIB-A15",
    amountCents: 15000,
  },
  {
    date: "2026-09-04",
    name: "David Daniel",
    email: "daniedv143@gmail.com",
    productsRaw: "500 mg ISRIB-A15",
    amountCents: 13000,
  },
] as const;

// New customers inserted by THIS script use this source so a future run of the
// destructive import-legacy-orders.ts (which deletes source="legacy") never
// removes them.
const NEW_CUSTOMER_SOURCE = "legacy-sep2026";
const MARKETING_SOURCE = "legacy-sep2026";

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Parse "YYYY-MM-DD" → UTC-midnight Date; null if empty/unparseable. Mirrors
 *  parseOrderedAt in import-legacy-orders.ts. */
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

function firstNameOf(name: string): string | null {
  const token = name.trim().split(/\s+/)[0];
  return token && token.length > 0 ? token : null;
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

// ── Dry-run plan (no DB) ─────────────────────────────────────────────────────
// The dry run cannot know which emails already exist in Neon, so it annotates
// known facts from the task brief (ahim@inbox.lv pre-exists as source "legacy").

const KNOWN_EXISTING_EMAILS = new Set<string>(["ahim@inbox.lv"]);

function printDryRun(): void {
  console.log("");
  console.log("=== SEPTEMBER ORDERS IMPORT — DRY RUN (no DB access) ===");
  console.log("");
  console.log("Additive + idempotent. NEW customers stamped source", `"${NEW_CUSTOMER_SOURCE}"`);
  console.log("so a future destructive legacy re-import (source=\"legacy\") never deletes them.");
  console.log("");

  let newCount = 0;
  let existingCount = 0;

  console.log("Per-order plan:");
  for (const o of SEPTEMBER_ORDERS) {
    const email = normalizeEmail(o.email);
    const orderedAt = parseOrderedAt(o.date);
    const known = KNOWN_EXISTING_EMAILS.has(email);
    if (known) existingCount++;
    else newCount++;
    const custLabel = known
      ? "EXISTING customer (reuse id; source/name/firstOrderAt untouched)"
      : `NEW customer (source "${NEW_CUSTOMER_SOURCE}", clientType computed)`;
    console.log(`  • ${o.name} <${email}>`);
    console.log(`      ${custLabel}`);
    console.log(
      `      order INSERT: ${o.productsRaw} · ${fmtUsd(o.amountCents)} · ${
        orderedAt ? orderedAt.toISOString().slice(0, 10) : "n/a (unparseable date)"
      }`,
    );
    console.log(
      "      marketing_contacts UPSERT:",
      `firstName="${firstNameOf(o.name) ?? ""}" source="${MARKETING_SOURCE}" (opt-out never clobbered)`,
    );
  }

  console.log("");
  console.log(`Customers: ${newCount} new · ${existingCount} existing`);
  console.log(`Orders to insert (subject to idempotency guard): ${SEPTEMBER_ORDERS.length}`);
  console.log("");
  console.log("clientType recompute (after inserting orders, from TOTAL legacy order count):");
  console.log("  • diegomedinaofficial2@gmail.com → client   (1 order)");
  console.log("  • daniedv143@gmail.com          → client   (1 order)");
  console.log("  • ahim@inbox.lv                 → client → regular (now 2 orders)");
  console.log("");
  console.log("Dry run only — no DB was touched. Pass --commit to import.");
  console.log("");
}

// ── Commit (real DB write, one transaction) ──────────────────────────────────

async function commit(): Promise<void> {
  const { db } = await import("../src/lib/db/index");
  const { customers, legacyOrders, marketingContacts } = await import(
    "../src/lib/db/schema"
  );
  const { and, eq, count } = await import("drizzle-orm");

  console.log("");
  console.log("=== SEPTEMBER ORDERS IMPORT — COMMIT ===");
  console.log(`Prepared ${SEPTEMBER_ORDERS.length} September order(s).`);

  const newCustomers: string[] = [];
  const reusedCustomers: string[] = [];
  const insertedOrders: string[] = [];
  const skippedOrders: string[] = [];
  const typeTransitions: string[] = [];

  try {
    await db.transaction(async (tx) => {
      // Track the affected customerId per email so we recompute clientType once each.
      const affected = new Map<string, string>(); // email → customerId

      for (const o of SEPTEMBER_ORDERS) {
        const email = normalizeEmail(o.email);
        const orderedAt = parseOrderedAt(o.date);

        // (1) resolve customer — reuse existing by lower(email), else insert new.
        const [existing] = await tx
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.email, email))
          .limit(1);

        let customerId: string;
        if (existing) {
          customerId = existing.id;
          reusedCustomers.push(email);
        } else {
          customerId = nanoid();
          await tx.insert(customers).values({
            id: customerId,
            email,
            name: o.name,
            country: null,
            clientType: "client", // provisional; recomputed after order insert
            firstOrderAt: orderedAt,
            legacySheetUrl: null,
            source: NEW_CUSTOMER_SOURCE,
            createdAt: new Date(),
          });
          newCustomers.push(email);
        }
        affected.set(email, customerId);

        // (2) insert legacy_order — idempotency guard: skip if an identical row
        //     (customerId + productsRaw + amountCents + orderedAt) already exists.
        const dupWhere = and(
          eq(legacyOrders.customerId, customerId),
          eq(legacyOrders.productsRaw, o.productsRaw),
          eq(legacyOrders.amountCents, o.amountCents),
          // orderedAt is null-safe here: our September dates always parse, so a
          // strict equality is correct. (parseOrderedAt would only yield null on
          // an unparseable date, which none of these are.)
          eq(legacyOrders.orderedAt, orderedAt as Date),
        );
        const [dup] = await tx
          .select({ id: legacyOrders.id })
          .from(legacyOrders)
          .where(dupWhere)
          .limit(1);

        if (dup) {
          skippedOrders.push(`${email} (${o.productsRaw} · ${fmtUsd(o.amountCents)})`);
        } else {
          await tx.insert(legacyOrders).values({
            id: nanoid(),
            customerId,
            orderedAt,
            productsRaw: o.productsRaw,
            amountCents: o.amountCents,
          });
          insertedOrders.push(`${email} (${o.productsRaw} · ${fmtUsd(o.amountCents)})`);
        }

        // (3) upsert marketing_contacts — refresh firstName/source only; never
        //     clobber unsubscribedAt (mirrors consolidate-marketing-list.ts).
        await tx
          .insert(marketingContacts)
          .values({
            id: nanoid(),
            email,
            firstName: firstNameOf(o.name),
            source: MARKETING_SOURCE,
          })
          .onConflictDoUpdate({
            target: marketingContacts.email,
            set: { firstName: firstNameOf(o.name), source: MARKETING_SOURCE },
          });
      }

      // (4) recompute clientType per affected customer from TOTAL legacy order
      //     count. Never downgrade below actual count.
      for (const [email, customerId] of affected) {
        const [cnt] = await tx
          .select({ n: count() })
          .from(legacyOrders)
          .where(eq(legacyOrders.customerId, customerId));
        const orderCount = cnt?.n ?? 0;
        const desired = computeClientType(orderCount);

        const [cur] = await tx
          .select({ clientType: customers.clientType })
          .from(customers)
          .where(eq(customers.id, customerId))
          .limit(1);

        if (cur && cur.clientType !== desired) {
          await tx
            .update(customers)
            .set({ clientType: desired })
            .where(eq(customers.id, customerId));
          typeTransitions.push(`${email}: ${cur.clientType} → ${desired} (${orderCount} orders)`);
        }
      }
    });

    console.log("");
    console.log(`New customers inserted:  ${newCustomers.length}`);
    for (const e of newCustomers) console.log(`  + ${e}`);
    console.log(`Existing customers reused: ${reusedCustomers.length}`);
    for (const e of reusedCustomers) console.log(`  = ${e}`);
    console.log(`Orders inserted:         ${insertedOrders.length}`);
    for (const s of insertedOrders) console.log(`  + ${s}`);
    console.log(`Orders skipped (idempotent): ${skippedOrders.length}`);
    for (const s of skippedOrders) console.log(`  ~ ${s}`);
    console.log(`clientType transitions:  ${typeTransitions.length}`);
    for (const s of typeTransitions) console.log(`  ↑ ${s}`);
    console.log("");
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
        "ERROR: the customers/legacy_orders/marketing_contacts tables don't exist yet.",
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
  if (isCommit) {
    await commit();
  } else {
    printDryRun();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
