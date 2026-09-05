/**
 * One-off referral-code backfill (ADR 0014).
 *
 * Assigns a unique personal referral code (REF-XXXXXX) to every `customers` row
 * where `referral_code IS NULL` — primarily the 212 imported legacy customers who
 * predate the referral system. New sign-ups get a code at registration time
 * (src/app/actions/customerAuth.ts), so this only ever backfills the gap.
 *
 * Modes:
 *   node --env-file=.env.local --import tsx scripts/backfill-referral-codes.ts            → DRY RUN (reads DB, writes nothing)
 *   node --env-file=.env.local --import tsx scripts/backfill-referral-codes.ts --commit   → assign + write
 *
 * Idempotent: only touches rows where referral_code IS NULL, so re-running is safe.
 *
 * NOTE: src/lib/referral.ts is a `server-only` module — importing it from a plain
 * tsx script throws. So the generate-and-check loop is replicated inline here using
 * `customAlphabet` + an in-process Set of used codes (loaded from the DB at start,
 * plus every code minted this run), which also avoids per-row DB round-trips.
 */

import { customAlphabet } from "nanoid";

// Mirrors src/lib/referral.ts exactly: no confusable chars (no I, O, 0, 1),
// 6 chars, "REF-" prefix so codes never collide with ISR- order numbers.
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCode = customAlphabet(alphabet, 6);

function genCode(): string {
  return `REF-${generateCode()}`;
}

/** Draw a code not already present in `used`; records it in `used` before returning. */
function genUniqueCode(used: Set<string>): string {
  for (let i = 0; i < 20; i++) {
    const code = genCode();
    if (!used.has(code)) {
      used.add(code);
      return code;
    }
  }
  throw new Error("could not generate a unique referral code after 20 attempts");
}

interface CustomerRow {
  id: string;
  email: string;
  referralCode: string | null;
}

async function main(): Promise<void> {
  const isCommit = process.argv.includes("--commit");

  const { db } = await import("../src/lib/db/index");
  const { customers } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log("");
  console.log(
    `=== REFERRAL CODE BACKFILL — ${isCommit ? "COMMIT" : "DRY RUN (no writes)"} ===`,
  );
  console.log("");

  let rows: CustomerRow[];
  try {
    rows = await db
      .select({
        id: customers.id,
        email: customers.email,
        referralCode: customers.referralCode,
      })
      .from(customers);
  } catch (err) {
    const msg = String(err);
    if (
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("undefined_table") ||
      msg.includes("referral_code")
    ) {
      console.error("");
      console.error(
        "ERROR: the customers table (or its referral_code column) does not exist yet.",
      );
      console.error("Run `npm run db:push` first, then re-run.");
      console.error("");
      console.error("(underlying error:", msg, ")");
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const total = rows.length;
  const alreadyHave = rows.filter((r) => r.referralCode != null);
  const missing = rows.filter((r) => r.referralCode == null);

  // Seed the used-set with every existing code so backfilled codes never collide
  // with a code already assigned to another customer.
  const used = new Set<string>();
  for (const r of alreadyHave) {
    if (r.referralCode != null) used.add(r.referralCode);
  }

  // Assign a fresh unique code to each missing row (in memory first).
  const assignments = missing.map((r) => ({
    id: r.id,
    email: r.email,
    code: genUniqueCode(used),
  }));

  console.log(`Total customers:            ${total}`);
  console.log(`Already have a code:        ${alreadyHave.length}`);
  console.log(`Missing a code (to assign): ${missing.length}`);
  console.log("");

  const samples = assignments.slice(0, 5);
  if (samples.length > 0) {
    console.log("Sample assignments:");
    for (const a of samples) {
      console.log(`  ${a.email.padEnd(44, " ")} → ${a.code}`);
    }
    console.log("");
  }

  if (!isCommit) {
    console.log("Dry run only — no rows were written. Pass --commit to assign.");
    console.log("");
    return;
  }

  if (assignments.length === 0) {
    console.log("Nothing to do — every customer already has a referral code.");
    console.log("");
    return;
  }

  let assigned = 0;
  await db.transaction(async (tx) => {
    for (const a of assignments) {
      await tx
        .update(customers)
        .set({ referralCode: a.code })
        .where(eq(customers.id, a.id));
      assigned++;
    }
  });

  console.log(`Assigned referral codes:    ${assigned}`);
  console.log("Done.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
