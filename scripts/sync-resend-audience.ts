/**
 * Push the marketing list into the Resend segment (ADR 0017, Phase C).
 *
 * Reads every non-opted-out row from `marketing_contacts` and creates a Resend contact
 * in the "General" segment so Broadcasts can target them. Opted-out contacts are simply
 * NOT added (suppression management is handled separately — the installed SDK's support
 * for the suppression list is uncertain, so this script does not touch it).
 *
 * Idempotent: creating a contact that already exists errors soft; per-contact errors are
 * caught, counted, and the run continues. A light throttle keeps us under rate limits.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/sync-resend-audience.ts
 *
 * Requires RESEND_API_KEY. Optional RESEND_SEGMENT_ID (defaults to "General").
 *
 * Anton-gated: hits the live Resend account.
 */

import { Resend } from "resend";

// The Resend "General" segment. The SDK's `segments: [{ id }]` param takes this id
// (the dashboard calls it a "segment"; the deprecated `audienceId` shape is avoided).
const DEFAULT_SEGMENT_ID = "d8632a0a-7b29-4d20-9118-28c3c9c007b7";
const THROTTLE_MS = 120;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("ERROR: RESEND_API_KEY is not set. Add it to .env.local and re-run.");
    process.exit(1);
  }
  const segmentId = process.env.RESEND_SEGMENT_ID || DEFAULT_SEGMENT_ID;

  const resend = new Resend(apiKey);

  const { db } = await import("../src/lib/db/index");
  const { marketingContacts } = await import("../src/lib/db/schema");
  const { isNull } = await import("drizzle-orm");

  console.log("");
  console.log("=== SYNC RESEND AUDIENCE (ADR 0017, Phase C) ===");
  console.log("");
  console.log(`Segment: ${segmentId}`);
  console.log("");

  const contacts = await db
    .select({
      email: marketingContacts.email,
      firstName: marketingContacts.firstName,
    })
    .from(marketingContacts)
    .where(isNull(marketingContacts.unsubscribedAt));

  console.log(`Non-opted-out contacts to sync: ${contacts.length}`);
  console.log("");

  let attempted = 0;
  let created = 0;
  let errored = 0;

  for (const c of contacts) {
    attempted++;
    try {
      const { error } = await resend.contacts.create({
        email: c.email,
        unsubscribed: false,
        ...(c.firstName ? { firstName: c.firstName } : {}),
        segments: [{ id: segmentId }],
      });
      if (error) {
        // Existing-contact / soft errors: count and continue, never abort the run.
        errored++;
        console.warn(`  soft error for ${c.email}: ${error.message ?? JSON.stringify(error)}`);
      } else {
        created++;
      }
    } catch (err) {
      errored++;
      console.warn(`  threw for ${c.email}: ${String(err)}`);
    }
    await sleep(THROTTLE_MS);
  }

  console.log("");
  console.log(`Attempted:        ${attempted}`);
  console.log(`Created:          ${created}`);
  console.log(`Skipped/errored:  ${errored}`);
  console.log("");
  console.log("NOTE: opted-out contacts are NOT added here. Resend suppressions are managed");
  console.log("separately — this script only populates the active segment.");
  console.log("");
  console.log("Done.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
