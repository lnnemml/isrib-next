// ADR 0023 — every order submission auto-joins the marketing list. One shared helper,
// used by the checkout action (submitOrder) and by scripts/backfill-order-contacts.ts.
//
// Rules (do not loosen without a new ADR):
//   - Insert-only (onConflictDoNothing on email): an existing row is NEVER touched, so an
//     opt-out (unsubscribed_at) always wins and is never reset.
//   - Resend only on a NEW row: an existing (incl. opted-out) contact is never re-pushed.
//   - QA addresses (*.test domains, e.g. @isrib-qa.test) are skipped — local dev writes
//     to prod Neon.
//   - DB errors are NOT caught here (callers decide); a Resend failure is caught + logged.
//
// Relative imports (not "@/") so the helper also loads under `node --import tsx` scripts.

import { Resend } from "resend";
import { nanoid } from "nanoid";
import { db } from "../db";
import { marketingContacts } from "../db/schema";

// The Resend "General" segment — same default as scripts/sync-resend-audience.ts.
const DEFAULT_SEGMENT_ID = "d8632a0a-7b29-4d20-9118-28c3c9c007b7";

export type AddMarketingContactResult = "added" | "exists" | "skipped";

// First whitespace-separated token of an order's `name`, or null when empty.
export function firstNameFromOrderName(name: string | null | undefined): string | null {
  const token = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return token || null;
}

// Normalised email (trim + lowercase).
export function normalizeMarketingEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

// PII-safe error tag for logs: ONLY the error's name and code (falling back to its cause's
// code, e.g. the pg SQLSTATE under a DrizzleQueryError). Never the message — Drizzle query
// errors embed the query params, i.e. the email.
export function safeErrorTag(err: unknown): string {
  if (err == null || typeof err !== "object") return typeof err;
  const e = err as { name?: unknown; code?: unknown; cause?: unknown };
  const name = typeof e.name === "string" ? e.name : "Error";
  const asCode = (v: unknown): string | null =>
    typeof v === "string" || typeof v === "number" ? String(v) : null;
  let code = asCode(e.code);
  if (!code && e.cause != null && typeof e.cause === "object") {
    code = asCode((e.cause as { code?: unknown }).code);
  }
  return code ? `${name} (${code})` : name;
}

// True when the (normalised) email must not be added: empty, no "@", or a .test domain.
export function isSkippableMarketingEmail(email: string): boolean {
  if (!email || !email.includes("@")) return true;
  const domain = email.slice(email.lastIndexOf("@") + 1);
  return domain.endsWith(".test");
}

export async function addMarketingContact(
  email: string,
  firstName: string | null,
  source: string,
): Promise<AddMarketingContactResult> {
  const normalized = normalizeMarketingEmail(email ?? "");
  if (isSkippableMarketingEmail(normalized)) return "skipped";

  const cleanFirstName = (firstName ?? "").trim() || null;

  // DB errors intentionally propagate to the caller.
  const inserted = await db
    .insert(marketingContacts)
    .values({
      id: nanoid(),
      email: normalized,
      firstName: cleanFirstName,
      source,
    })
    .onConflictDoNothing({ target: marketingContacts.email })
    .returning({ id: marketingContacts.id });

  if (inserted.length === 0) return "exists";

  // New row only → create the Resend contact in the General segment. Never throws.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const segmentId = process.env.RESEND_SEGMENT_ID || DEFAULT_SEGMENT_ID;
    try {
      const { error } = await new Resend(apiKey).contacts.create({
        email: normalized,
        unsubscribed: false,
        ...(cleanFirstName ? { firstName: cleanFirstName } : {}),
        segments: [{ id: segmentId }],
      });
      if (error) {
        // name + statusCode only — Resend messages can echo the email.
        console.error(
          "addMarketingContact: Resend contact create failed (non-fatal):",
          `${error.name}${error.statusCode != null ? ` (${error.statusCode})` : ""}`,
        );
      }
    } catch (err) {
      console.error("addMarketingContact: Resend contact create threw (non-fatal):", safeErrorTag(err));
    }
  }

  return "added";
}
