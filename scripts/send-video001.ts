/**
 * NeuroBench channel launch announcement send (video 001, ISRIB) — a Path-B sibling of
 * scripts/send-email2.ts. Plain 1:1 `resend.emails.send` loop over the active
 * marketing_contacts list, built to the winning-email-formula
 * (docs/raw/winning-email-formula.md).
 *
 * Basis: ADR 0012 §3 (one launch announcement to the shop list, NO shop CTA) and the copy in
 * ~/Documents/NeuroBench/docs/videos/001-isrib/launch-email-isrib-shop.md. Sent FROM
 * isrib.shop (the shop list is never imported into the NeuroBench list). Only the subject +
 * buildHtml (markup and copy) differ from Email 2; all Path-B formula machinery below is
 * identical.
 *
 * Formula-critical properties (do not "improve"):
 *   - NO `headers` at all — specifically NO List-Unsubscribe (reads as bulk → Promotions tab).
 *   - Exactly ONE hyperlink: the words "the first video" in paragraph 2 → the 001 YouTube
 *     video, with NO UTM params.
 *   - No shop link, no product, no discount, no promo code. The shop is present only as sender.
 *   - No button, no "→", no font-weight:600. Plain link style only.
 *   - Plain unsubscribe LINK (new-site /api/unsubscribe HMAC URL), margin-top:48px, no footer.
 *
 * This sends REAL mail to real customers — correctness matters. It is idempotent and
 * resumable (data/video001-sent.json — SEPARATE from Email 1's and Email 2's resume sets) so
 * a crash mid-run never double-sends.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/send-video001.ts
 *     → DRY RUN: count active recipients + print ONE fully-rendered sample email. No send.
 *   node --env-file=.env.local --import tsx scripts/send-video001.ts --test you@example.com
 *     → send exactly ONE real email to that address (firstName "there") for inbox verification.
 *   node --env-file=.env.local --import tsx scripts/send-video001.ts --commit
 *     → send to ALL active recipients (throttled, resumable).
 *
 * DO NOT run --test or --commit without the Anton gate. DRY RUN is safe.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const SENT_FILE = join(DATA_DIR, "video001-sent.json"); // git-ignored (PII)

// Used only for the recipient-specific unsubscribe URL.
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://isrib.shop").replace(/\/$/, "");

// The single link. NO UTM: YouTube ignores it (visits show as External / Direct in Analytics).
const VIDEO_URL = "https://www.youtube.com/watch?v=xWzXJqCrbyg";

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
  return `${firstName}, something different this time`;
}

// Builds the plain, 1:1-personal HTML (same Variant-B style as Email 2) — deliberately
// undesigned: no centered max-width container, no background color, normal typed hyperlink
// (not a CTA button). `unsubUrl` is the recipient-specific plain unsubscribe link. firstName
// is already display-normalized ("there" fallback). The approved copy is reproduced verbatim;
// the ONLY hyperlink is "the first video" in paragraph 2.
function buildHtml(firstName: string, unsubUrl: string): string {
  const P = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1e293b;margin:0 0 16px;";
  const link = `<a href="${VIDEO_URL}" style="color:#1e293b;text-decoration:underline;">the first video</a>`;

  return `<div>
  <p style="${P}">Hi ${firstName},</p>
  <p style="${P}">We started a small science channel called NeuroBench, where a chemist walks through what molecules actually do and what the papers really show.</p>
  <p style="${P}">The first long video is about ISRIB: the screen of 106,281 compounds it came from, the old-mouse memory experiments, and what the pharma programmes that followed actually tested. Here's ${link}. It's about ten minutes.</p>
  <p style="${P}">If you watch it, I'd really like to hear what you think: what landed, what was missing, and what you'd want covered next. Just reply here.</p>
  <p style="${P}">Danylo</p>
  <p style="color:#94a3b8;font-size:12px;margin:0;margin-top:48px;"><a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a></p>
</div>`;
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

// ── Resume/idempotency: data/video001-sent.json is an array of already-sent lc emails ──
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
  console.log("=== VIDEO 001 ANNOUNCEMENT SEND — DRY RUN (no mail sent) ===");
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
  console.log("=== VIDEO 001 ANNOUNCEMENT SEND — TEST (one real email) ===");
  console.log(`Sending to: ${target} (firstName "there")`);
  console.log("");
  await sendOne(target, "there");
  console.log("Test email sent. (Progress file untouched.)");
  console.log("");
}

// ── COMMIT: send to ALL active recipients; throttled, resumable ──────────────────────
async function commitSend(): Promise<void> {
  console.log("");
  console.log("=== VIDEO 001 ANNOUNCEMENT SEND — COMMIT (real mail to ALL active recipients) ===");
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
