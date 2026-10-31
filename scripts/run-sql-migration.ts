/**
 * Hand-written SQL migration runner (ADR 0025).
 *
 * The repo otherwise uses `db:push`, which is not reversible. This runs one up or down file
 * from src/lib/db/migrations/ in a single transaction, so a failure leaves nothing behind.
 *
 * Usage:
 *   npm run db:sql -- up 0025_affiliates
 *   npm run db:sql -- down 0025_affiliates --confirm
 *
 * Connects to POSTGRES_URL_NON_POOLING only, with no fallback to the pooled URL, and prints
 * the host before touching it. `.env.local` points at PRODUCTION Neon, so this runs against
 * production unless the variable is overridden. A down migration is destructive, so it
 * refuses to run without `--confirm`.
 *
 * NOTE: src/lib/db/index.ts opens its pool on POSTGRES_URL, so the driver is set up here
 * instead of importing `db`.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const MIGRATIONS_DIR = resolve(process.cwd(), "src/lib/db/migrations");

// Also keeps the argument from walking out of the migrations directory.
const MIGRATION_NAME = /^\d{4}_[a-z0-9_]+$/;

function fail(message: string): void {
  console.error(`ERROR: ${message}`);
  console.error("Usage: npm run db:sql -- <up|down> <migration> [--confirm]");
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const confirmed = args.includes("--confirm");
  const [direction, name, ...extra] = args.filter((arg) => arg !== "--confirm");

  if (direction !== "up" && direction !== "down") {
    fail(`direction must be "up" or "down" (got "${direction ?? ""}").`);
    return;
  }
  if (name === undefined || !MIGRATION_NAME.test(name)) {
    fail(`migration must look like 0025_affiliates (got "${name ?? ""}").`);
    return;
  }
  if (extra.length > 0) {
    fail(`unexpected arguments: ${extra.join(" ")}`);
    return;
  }

  const path = resolve(MIGRATIONS_DIR, `${name}.${direction}.sql`);
  if (!existsSync(path)) {
    fail(`no such migration file: ${path}`);
    return;
  }
  const sql = readFileSync(path, "utf8");

  const url = process.env.POSTGRES_URL_NON_POOLING;
  if (!url) {
    fail("POSTGRES_URL_NON_POOLING is not set.");
    return;
  }
  const host = new URL(url).hostname;

  console.log("");
  console.log(`=== SQL MIGRATION — ${direction.toUpperCase()} ${name} ===`);
  console.log("");
  console.log(`Host:  ${host}`);
  console.log(`File:  ${path}`);
  console.log("");

  if (direction === "down" && !confirmed) {
    fail("a down migration destroys data. Re-run with --confirm.");
    return;
  }

  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  } catch (err) {
    // A lost connection aborts the transaction anyway; keep the original error.
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }

  console.log("Committed.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
