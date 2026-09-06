/**
 * Launch promo-code seed (ADR 0016).
 *
 * Inserts (or upserts) the relaunch promo code into `promo_codes`. Defaults match the
 * ADR: RELAUNCH10, 10% off, active, 7-day expiry (computed at runtime), 0 redemptions.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/seed-promo-code.ts
 *   node --env-file=.env.local --import tsx scripts/seed-promo-code.ts CODE PCT DAYS
 *     e.g. scripts/seed-promo-code.ts SUMMER15 15 14
 *
 * Idempotent: on a code conflict it updates discountPct / active / expiresAt but LEAVES
 * redemptionCount untouched (re-seeding must never wipe usage tracking).
 *
 * Anton-gated: run `npm run db:push` (adds promo_codes) first, then this — against Neon.
 *
 * NOTE: src/lib/promo.ts is a `server-only` module — importing it from a plain tsx
 * script throws, so normalization (trim + uppercase) is inlined here.
 */

import { nanoid } from "nanoid";

const DEFAULT_CODE = "RELAUNCH10";
const DEFAULT_PCT = 10;
const DEFAULT_DAYS = 7;

function normalize(raw: string | undefined, fallback: string): string {
  const trimmed = (raw ?? "").trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : fallback;
}

async function main(): Promise<void> {
  const [codeArg, pctArg, daysArg] = process.argv.slice(2);

  const code = normalize(codeArg, DEFAULT_CODE);
  const discountPct = pctArg ? parseInt(pctArg, 10) : DEFAULT_PCT;
  const days = daysArg ? parseInt(daysArg, 10) : DEFAULT_DAYS;

  if (!Number.isInteger(discountPct) || discountPct <= 0 || discountPct > 100) {
    console.error(`ERROR: discountPct must be an integer 1-100 (got "${pctArg}").`);
    process.exitCode = 1;
    return;
  }
  if (!Number.isInteger(days) || days <= 0) {
    console.error(`ERROR: days must be a positive integer (got "${daysArg}").`);
    process.exitCode = 1;
    return;
  }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const { db } = await import("../src/lib/db/index");
  const { promoCodes } = await import("../src/lib/db/schema");

  console.log("");
  console.log("=== SEED PROMO CODE (ADR 0016) ===");
  console.log("");

  try {
    await db
      .insert(promoCodes)
      .values({
        id: nanoid(),
        code,
        discountPct,
        active: true,
        expiresAt,
        redemptionCount: 0,
      })
      .onConflictDoUpdate({
        target: promoCodes.code,
        // Re-seeding refreshes the terms but preserves redemptionCount (usage tracking).
        set: { discountPct, active: true, expiresAt },
      });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("promo_codes")) {
      console.error("ERROR: the promo_codes table does not exist yet.");
      console.error("Run `npm run db:push` first, then re-run.");
      console.error("");
      console.error("(underlying error:", msg, ")");
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  console.log(`Code:        ${code}`);
  console.log(`Discount:    ${discountPct}%`);
  console.log(`Active:      true`);
  console.log(`Expires at:  ${expiresAt.toISOString()}  (${days} days from now)`);
  console.log("");
  console.log("Done.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
