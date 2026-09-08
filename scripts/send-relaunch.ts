/**
 * Path B relaunch send (ADR 0017). Plain 1:1 `resend.emails.send` loop over the active
 * marketing_contacts list, built to the winning-email-formula (docs/raw/winning-email-formula.md)
 * and the approved copy (docs/wiki/marketing/relaunch-announcement-email.md).
 *
 * Formula-critical properties (do not "improve"):
 *   - NO `headers` at all — specifically NO List-Unsubscribe (reads as bulk → Promotions tab).
 *   - Exactly ONE hyperlink: the word "isrib.shop" in the "Everything's in stock" sentence.
 *   - `RELAUNCH10` is PLAIN text, never <strong>. No button, no "→", no font-weight:600.
 *   - Plain unsubscribe LINK (new-site /api/unsubscribe HMAC URL), margin-top:48px, no footer.
 *
 * This sends REAL mail to real customers — correctness matters. It is idempotent and
 * resumable (data/relaunch-sent.json) so a crash mid-run never double-sends.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/send-relaunch.ts
 *     → DRY RUN: count active recipients + print ONE fully-rendered sample email. No send.
 *   node --env-file=.env.local --import tsx scripts/send-relaunch.ts --test you@example.com
 *     → send exactly ONE real email to that address (firstName "there") for inbox verification.
 *   node --env-file=.env.local --import tsx scripts/send-relaunch.ts --commit
 *     → send to ALL active recipients (throttled, resumable).
 *
 * DO NOT run --test or --commit without the Anton gate. DRY RUN is safe.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const SENT_FILE = join(DATA_DIR, "relaunch-sent.json"); // git-ignored (PII)

const CAMPAIGN = "relaunch_2026";
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://isrib.shop").replace(/\/$/, "");

// Throttle: ~2s between sends (small jitter) to look 1:1; 8s cool-off after an error.
const THROTTLE_MS = 2000;
const THROTTLE_JITTER_MS = 600;
const ERROR_BACKOFF_MS = 8000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// "subscriber" (case-insensitive) or empty → "there" (formula: personalizeEmail()).
function displayFirstName(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "there";
  if (v.toLowerCase() === "subscriber") return "there";
  return v;
}

function buildSubject(firstName: string): string {
  return `${firstName}, quick update on the shop`;
}

// The single CTA link. utm_content is the (uri-encoded) firstName per formula.
function ctaHref(firstName: string): string {
  return (
    `${BASE_URL}/products?promo=RELAUNCH10` +
    `&utm_source=email&utm_campaign=${CAMPAIGN}` +
    `&utm_content=${encodeURIComponent(firstName)}`
  );
}

// Builds the formula-faithful HTML. `unsubUrl` is the recipient-specific plain unsubscribe
// link. firstName is already display-normalized ("there" fallback). The approved copy is
// reproduced verbatim; the ONLY hyperlink is "isrib.shop" inside the in-stock sentence.
function buildHtml(firstName: string, unsubUrl: string): string {
  const href = ctaHref(firstName);
  const P = "margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;font-size:16px;line-height:1.6;";
  const link = `<a href="${href}" style="color:#0ea5e9;text-decoration:none;">isrib.shop</a>`;

  return `<body style="background:#ffffff;">
  <div style="max-width:600px;margin:40px auto;padding:0 20px;">
    <p style="${P}">Hi ${firstName},</p>
    <p style="${P}">Quick update &mdash; I've spent the last while rebuilding ISRIB.shop from the ground up. Same lab, same in-house synthesis, same independent NMR and COA on every batch. The site around it is just faster and cleaner now, and everything, checkout included, lives in one place.</p>
    <p style="${P}">A couple of things that might be handy: you can make an account with the same email you've ordered with before, and your full order history is already sitting there. Paying with crypto now takes 10% off automatically, and if you'd rather pay another way, RELAUNCH10 gets you the same 10% this week. Your account also has a referral link &mdash; your friend gets a discount on their first order, and you earn a credit toward your next.</p>
    <p style="${P}">Everything's in stock at ${link}, and the journal there now collects my research writing &mdash; mechanism notes and honest compound comparisons.</p>
    <p style="${P}">How have things been since your last order? Happy to talk through anything for your work &mdash; just reply here.</p>
    <p style="${P}">Danylo</p>
    <p style="color:#94a3b8;font-size:12px;margin:0;margin-top:48px;"><a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a></p>
  </div>
</body>`;
}

// ── Resend send (formula-compliant; NO headers, NO List-Unsubscribe) ─────────────────
async function sendOne(email: string, firstName: string): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { unsubscribeUrl } = await import("../src/lib/unsubscribe");

  const subject = buildSubject(firstName);
  const html = buildHtml(firstName, unsubscribeUrl(email, BASE_URL));

  const { error } = await resend.emails.send({
    from: "Danylo from ISRIB <noreply@isrib.shop>",
    replyTo: "isrib.shop@protonmail.com",
    to: email,
    subject,
    html,
    // Intentionally NO `headers` — NO List-Unsubscribe. This is the formula's core.
  });
  if (error) throw new Error(`Resend send failed: ${error.message ?? JSON.stringify(error)}`);
}

interface ActiveRecipient {
  email: string;
  firstName: string; // display-normalized ("there" fallback)
}

async function loadActiveRecipients(): Promise<ActiveRecipient[]> {
  const { db } = await import("../src/lib/db/index");
  const { marketingContacts } = await import("../src/lib/db/schema");
  const { isNull } = await import("drizzle-orm");

  const rows = await db
    .select({ email: marketingContacts.email, firstName: marketingContacts.firstName })
    .from(marketingContacts)
    .where(isNull(marketingContacts.unsubscribedAt));

  return rows.map((r) => ({
    email: r.email.trim().toLowerCase(),
    firstName: displayFirstName(r.firstName),
  }));
}

// ── Resume/idempotency: data/relaunch-sent.json is an array of already-sent lc emails ──
function loadSent(): Set<string> {
  if (!existsSync(SENT_FILE)) return new Set();
  try {
    const arr = JSON.parse(readFileSync(SENT_FILE, "utf8")) as string[];
    return new Set(arr.map((e) => e.trim().toLowerCase()));
  } catch {
    return new Set();
  }
}

function persistSent(sent: Set<string>): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SENT_FILE, JSON.stringify([...sent], null, 2));
}

// ── DRY RUN: count + render one sample; NO Resend call whatsoever ────────────────────
async function dryRun(): Promise<void> {
  console.log("");
  console.log("=== RELAUNCH SEND — DRY RUN (no mail sent) ===");
  console.log("");

  const recipients = await loadActiveRecipients();
  console.log(`Active recipients (unsubscribed_at IS NULL): ${recipients.length}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log("");

  const sampleEmail = recipients[0]?.email ?? "sample@example.com";
  const firstName = "there";
  const { unsubscribeUrl } = await import("../src/lib/unsubscribe");
  const subject = buildSubject(firstName);
  const html = buildHtml(firstName, unsubscribeUrl(sampleEmail, BASE_URL));

  console.log("--- SAMPLE (firstName forced to \"there\") ---");
  console.log(`Sample recipient email (for unsubscribe URL only): ${sampleEmail}`);
  console.log(`From:     Danylo from ISRIB <noreply@isrib.shop>`);
  console.log(`Reply-To: isrib.shop@protonmail.com`);
  console.log(`Subject:  ${subject}`);
  console.log("");
  console.log("--- HTML ---");
  console.log(html);
  console.log("--- END HTML ---");
  console.log("");
  console.log("DRY RUN complete. No emails were sent.");
  console.log("");
}

// ── TEST: send exactly ONE real email; do NOT touch the progress file ────────────────
async function testSend(email: string): Promise<void> {
  const target = email.trim().toLowerCase();
  if (!target || !target.includes("@")) {
    console.error(`ERROR: --test needs a valid email (got "${email}").`);
    process.exitCode = 1;
    return;
  }
  console.log("");
  console.log("=== RELAUNCH SEND — TEST (one real email) ===");
  console.log(`Sending to: ${target} (firstName "there")`);
  console.log("");
  await sendOne(target, "there");
  console.log("Test email sent. (Progress file untouched.)");
  console.log("");
}

// ── COMMIT: send to ALL active recipients; throttled, resumable ──────────────────────
async function commitSend(): Promise<void> {
  console.log("");
  console.log("=== RELAUNCH SEND — COMMIT (real mail to ALL active recipients) ===");
  console.log("");

  const recipients = await loadActiveRecipients();
  const sent = loadSent();

  const pending = recipients.filter((r) => !sent.has(r.email));
  console.log(`Active recipients:      ${recipients.length}`);
  console.log(`Already sent (resume):  ${sent.size}`);
  console.log(`To send this run:       ${pending.length}`);
  console.log(`Base URL:               ${BASE_URL}`);
  console.log("");

  let sentCount = 0;
  let failedCount = 0;
  const skippedAlready = recipients.length - pending.length;

  for (let i = 0; i < pending.length; i++) {
    const r = pending[i];
    try {
      await sendOne(r.email, r.firstName);
      sent.add(r.email);
      persistSent(sent); // write incrementally so a crash resumes without double-sending
      sentCount++;
      if (sentCount % 25 === 0) {
        console.log(`  progress: ${sentCount} sent / ${failedCount} failed / ${pending.length} target`);
      }
      // Throttle with jitter to look 1:1 (skip the wait after the final send).
      if (i < pending.length - 1) {
        await sleep(THROTTLE_MS + Math.floor(Math.random() * THROTTLE_JITTER_MS));
      }
    } catch (err) {
      failedCount++;
      console.error(`  FAILED ${r.email}: ${String(err)}`);
      // Never abort the whole run on one failure — back off longer, then continue.
      await sleep(ERROR_BACKOFF_MS);
    }
  }

  console.log("");
  console.log("=== SUMMARY ===");
  console.log(`Total active:          ${recipients.length}`);
  console.log(`Sent this run:         ${sentCount}`);
  console.log(`Skipped (already sent):${skippedAlready}`);
  console.log(`Failed:                ${failedCount}`);
  console.log("");
  console.log("Done.");
  console.log("");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const testIdx = args.indexOf("--test");

  if (args.includes("--commit")) {
    await commitSend();
    return;
  }
  if (testIdx !== -1) {
    await testSend(args[testIdx + 1] ?? "");
    return;
  }
  await dryRun();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
