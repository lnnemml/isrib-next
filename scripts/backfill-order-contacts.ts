/**
 * Backfill order emails into the marketing list (ADR 0023).
 *
 * ADR 0017 seeded `marketing_contacts` once (2026-09-08) and nothing wrote to it after,
 * so order emails placed since then are missing. This adds every distinct order email
 * (ALL statuses — paid and unpaid alike, per ADR 0023) that is not yet in
 * `marketing_contacts`, through the same helper the checkout action uses
 * (src/lib/marketing/addContact.ts): insert-only, Resend only on a new row, *.test skipped.
 * The first name comes from that email's MOST RECENT order.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/backfill-order-contacts.ts
 *     → DRY RUN (default): prints COUNTS only (total, by status, would-skip). No emails
 *       printed, nothing written.
 *   node --env-file=.env.local --import tsx scripts/backfill-order-contacts.ts --commit
 *     → adds each missing contact (Neon + Resend General segment), throttled ~150ms apart,
 *       and prints added / exists / skipped / failed counts.
 *
 * Anton-gated: --commit writes to prod Neon and the live Resend account. DRY RUN is safe.
 */

const THROTTLE_MS = 150;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Candidate {
  email: string;          // normalised
  firstName: string | null; // from the most recent order
  latestStatus: string;   // status of the most recent order
  statuses: Set<string>;  // every status seen for this email
}

async function main(): Promise<void> {
  const commit = process.argv.includes("--commit");

  const { db } = await import("../src/lib/db/index");
  const { orders, marketingContacts } = await import("../src/lib/db/schema");
  const { desc } = await import("drizzle-orm");
  const {
    addMarketingContact,
    firstNameFromOrderName,
    normalizeMarketingEmail,
    isSkippableMarketingEmail,
    safeErrorTag,
  } = await import("../src/lib/marketing/addContact");

  console.log("");
  console.log(`=== BACKFILL ORDER CONTACTS (ADR 0023) — ${commit ? "COMMIT" : "DRY RUN"} ===`);
  console.log("");

  // Newest first, so the first row seen per email is its most recent order.
  const orderRows = await db
    .select({ email: orders.email, name: orders.name, status: orders.status })
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const existingRows = await db
    .select({ email: marketingContacts.email })
    .from(marketingContacts);
  const existing = new Set(existingRows.map((r) => normalizeMarketingEmail(r.email)));

  const candidates = new Map<string, Candidate>();
  for (const o of orderRows) {
    const email = normalizeMarketingEmail(o.email ?? "");
    if (existing.has(email)) continue;
    const prior = candidates.get(email);
    if (prior) {
      prior.statuses.add(o.status);
    } else {
      candidates.set(email, {
        email,
        firstName: firstNameFromOrderName(o.name),
        latestStatus: o.status,
        statuses: new Set([o.status]),
      });
    }
  }

  const list = [...candidates.values()];
  const wouldSkip = list.filter((c) => isSkippableMarketingEmail(c.email)).length;

  const byLatest = new Map<string, number>();
  for (const c of list) byLatest.set(c.latestStatus, (byLatest.get(c.latestStatus) ?? 0) + 1);

  const anyPaid = list.filter((c) => c.statuses.has("paid") || c.statuses.has("fulfilled")).length;

  console.log(`Orders scanned:                          ${orderRows.length}`);
  console.log(`Existing marketing_contacts:             ${existing.size}`);
  console.log(`Distinct order emails missing from list: ${list.length}`);
  console.log(`  with a paid/fulfilled order:           ${anyPaid}`);
  console.log(`  with only unpaid/cancelled orders:     ${list.length - anyPaid}`);
  console.log("  by most-recent order status:");
  for (const [status, n] of [...byLatest.entries()].sort()) {
    console.log(`    ${status.padEnd(30)} ${n}`);
  }
  console.log(`Would be skipped (.test / invalid):      ${wouldSkip}`);
  console.log(`Would be added:                          ${list.length - wouldSkip}`);
  console.log("");

  if (!commit) {
    console.log("DRY RUN — nothing written. Re-run with --commit to add them.");
    console.log("");
    return;
  }

  let added = 0;
  let exists = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of list) {
    try {
      const result = await addMarketingContact(c.email, c.firstName, "orders");
      if (result === "added") added++;
      else if (result === "exists") exists++;
      else skipped++;
    } catch (err) {
      failed++;
      // Name/code only — never the message (Drizzle errors embed query params = the email).
      console.warn(`  failed: ${safeErrorTag(err)}`);
    }
    await sleep(THROTTLE_MS);
  }

  console.log(`Added:    ${added}`);
  console.log(`Exists:   ${exists}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Failed:   ${failed}`);
  console.log("");
  console.log("Done.");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
