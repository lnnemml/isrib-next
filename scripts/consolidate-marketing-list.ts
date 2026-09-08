/**
 * Build the canonical marketing list (ADR 0017, Phase B).
 *
 * Upserts the deduped union of:
 *   - Neon `customers`   (email + name)                → source "customers"
 *   - legacy customers.json ([{email, firstName}])     → source "legacy-json"
 * into `marketing_contacts`, then stamps `unsubscribedAt` on every recovered opt-out.
 *
 * Idempotent — safe to re-run. Upserts never clobber an existing `unsubscribedAt`.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/consolidate-marketing-list.ts
 *   node --env-file=.env.local --import tsx scripts/consolidate-marketing-list.ts path/to/customers.json
 *
 * Inputs (git-ignored, PII):
 *   data/customers.json          — REQUIRED. Anton copies /home/laptop/Documents/ISRIB/customers.json here.
 *   data/legacy-unsubscribes.json — optional; produced by export-legacy-unsubscribes.ts.
 *
 * Anton-gated: run `npm run db:push` (adds marketing_contacts) first, then this — against Neon.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const DEFAULT_LEGACY_FILE = join(DATA_DIR, "customers.json");
const UNSUB_FILE = join(DATA_DIR, "legacy-unsubscribes.json");

// Known Resend hard-bounces — always opted out (never mail again).
const KNOWN_BOUNCES = [
  "jdocj@gmail.com",
  "sandersmike208san@gmail.com",
  "mi_olson@yahoo.com",
  "jrzryd@protonmail.com",
  "oicur12@protonmail.com",
];

interface LegacyContact {
  email?: string;
  firstName?: string;
}

interface UnionRow {
  email: string;
  firstName: string | null;
  source: string; // "customers" | "legacy-json"
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

// "subscriber" or empty → null (not a real name).
function cleanFirstName(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (v.toLowerCase() === "subscriber") return null;
  return v;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const legacyFile = arg ? (isAbsolute(arg) ? arg : join(process.cwd(), arg)) : DEFAULT_LEGACY_FILE;

  console.log("");
  console.log("=== CONSOLIDATE MARKETING LIST (ADR 0017, Phase B) ===");
  console.log("");

  // ── Read legacy customers.json (required) ──────────────────────────────────
  if (!existsSync(legacyFile)) {
    console.error(`ERROR: legacy list not found at ${legacyFile}`);
    console.error("");
    console.error("Anton must copy the old campaign list into place, e.g.:");
    console.error("  cp /home/laptop/Documents/ISRIB/customers.json data/customers.json");
    console.error("then re-run (or pass a path as the first argument).");
    console.error("");
    process.exit(1);
  }
  const legacyList = JSON.parse(readFileSync(legacyFile, "utf8")) as LegacyContact[];

  // ── Read opt-outs (optional but strongly recommended) ──────────────────────
  const optOut = new Set<string>();
  for (const b of KNOWN_BOUNCES) optOut.add(normalizeEmail(b));

  if (existsSync(UNSUB_FILE)) {
    const legacyUnsubs = JSON.parse(readFileSync(UNSUB_FILE, "utf8")) as string[];
    for (const e of legacyUnsubs) {
      if (e && e.trim()) optOut.add(normalizeEmail(e));
    }
    console.log(`Loaded ${legacyUnsubs.length} legacy opt-out(s) from ${UNSUB_FILE}.`);
  } else {
    console.warn("");
    console.warn("!! WARNING: data/legacy-unsubscribes.json NOT found.");
    console.warn("!! No legacy Upstash opt-outs will be applied — only the 5 known Resend bounces.");
    console.warn("!! Run `npm run export:legacy-unsubscribes` FIRST to avoid re-mailing opted-out people.");
    console.warn("");
  }
  console.log(`Opt-out set size (legacy + known bounces): ${optOut.size}`);

  // ── Connect to Neon + read customers (mirrors seed-promo-code.ts) ──────────
  const { db } = await import("../src/lib/db/index");
  const { customers, marketingContacts } = await import("../src/lib/db/schema");
  const { and, isNull, inArray } = await import("drizzle-orm");

  const customerRows = await db
    .select({ email: customers.email, name: customers.name })
    .from(customers);

  // ── Build the union keyed by normalized email (customers wins on conflict) ──
  const union = new Map<string, UnionRow>();

  // 1) legacy-json first…
  for (const c of legacyList) {
    if (!c.email) continue;
    const email = normalizeEmail(c.email);
    if (!email) continue;
    union.set(email, {
      email,
      firstName: cleanFirstName(c.firstName),
      source: "legacy-json",
    });
  }

  // 2) …then customers, which overwrites: source "customers" wins, and its name
  //    is preferred when non-empty (else keep whatever the legacy row had).
  for (const c of customerRows) {
    const email = normalizeEmail(c.email);
    if (!email) continue;
    const customerName = cleanFirstName(c.name);
    const prior = union.get(email);
    const firstName = customerName ?? (prior ? prior.firstName : null);
    union.set(email, { email, firstName, source: "customers" });
  }

  const rows = [...union.values()];
  console.log("");
  console.log(`Neon customers:      ${customerRows.length}`);
  console.log(`Legacy JSON rows:    ${legacyList.length}`);
  console.log(`Deduped union total: ${rows.length}`);

  // ── Count pre-existing emails so "net-new" is meaningful ───────────────────
  const existing = await db
    .select({ email: marketingContacts.email })
    .from(marketingContacts);
  const existingEmails = new Set(existing.map((r) => normalizeEmail(r.email)));
  const netNew = rows.filter((r) => !existingEmails.has(r.email));

  // ── Upsert each row (idempotent; never clobber unsubscribedAt) ─────────────
  for (const r of rows) {
    await db
      .insert(marketingContacts)
      .values({
        id: nanoid(),
        email: r.email,
        firstName: r.firstName,
        source: r.source,
      })
      .onConflictDoUpdate({
        target: marketingContacts.email,
        // Refresh firstName/source only. unsubscribedAt is intentionally omitted so a
        // prior opt-out is never reset to null on re-run.
        set: { firstName: r.firstName, source: r.source },
      });
  }

  // ── Stamp opt-outs (only those present in the table, only if not already set) ─
  const optOutList = [...optOut];
  let optedOutCount = 0;
  if (optOutList.length > 0) {
    const updated = await db
      .update(marketingContacts)
      .set({ unsubscribedAt: new Date() })
      // Only rows that exist AND are not already opted out. inArray matches only rows
      // present in the table, so unknown opt-out emails are silently ignored.
      .where(
        and(
          isNull(marketingContacts.unsubscribedAt),
          inArray(marketingContacts.email, optOutList),
        ),
      )
      .returning({ email: marketingContacts.email });
    optedOutCount = updated.length;
  }

  // ── Summary (all computed, nothing hardcoded) ──────────────────────────────
  const totalNow = await db
    .select({ email: marketingContacts.email })
    .from(marketingContacts);
  const totalOptedOut = await db
    .select({ email: marketingContacts.email })
    .from(marketingContacts)
    .where(inArray(marketingContacts.email, optOutList.length > 0 ? optOutList : ["__none__"]));

  console.log("");
  console.log(`Total marketing_contacts:     ${totalNow.length}`);
  console.log(`Net-new inserted (approx):    ${netNew.length}`);
  console.log(`Opted-out stamped this run:   ${optedOutCount}`);
  console.log(`Opt-out emails present in list:${totalOptedOut.length}`);
  console.log("");
  console.log("Sample net-new (up to 3):");
  for (const r of netNew.slice(0, 3)) console.log(`  ${r.email}`);
  console.log("Sample opted-out (up to 3):");
  for (const e of totalOptedOut.slice(0, 3)) console.log(`  ${e.email}`);
  console.log("");
  console.log("Done.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
