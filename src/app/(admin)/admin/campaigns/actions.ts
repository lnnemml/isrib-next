"use server";

// Campaign Server Actions (Phase E — ADR 0017 + ADR 0011 defense-in-depth).
//
// Every action re-verifies the admin session server-side via isAdminAuthed() as its FIRST
// line — the proxy is the first gate, this is the second, so a misconfigured matcher can
// never leave a sending action unprotected. Each action returns a small typed result the
// client renders; nothing throws to the user.
//
// CONTENT: no email HTML is authored here (Phase D deferred — Anton revises the copy). These
// actions only send EXISTING broadcasts selected in the UI.
import { isAdminAuthed } from "@/lib/admin/auth";
import { getResend } from "@/lib/admin/marketing";

export type ActionResult = { ok: true; message: string } | { error: string };

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function getFrom(): string {
  return process.env.FROM_EMAIL ?? "onboarding@resend.dev";
}

// Neutralize Resend broadcast merge tags for a standalone test send (which has no per-contact
// merge context): first-name placeholders → "there", and the unsubscribe URL tag → a plain
// label (a test send has no real unsubscribe context).
function neutralizeMergeTags(html: string): string {
  return html
    .replace(/\{\{\{\s*FIRST_NAME\s*\|\s*there\s*\}\}\}/g, "there")
    .replace(/\{\{\{\s*FIRST_NAME\s*\}\}\}/g, "there")
    .replace(/\{\{\s*FIRST_NAME\s*\|\s*there\s*\}\}/g, "there")
    .replace(/\{\{\s*FIRST_NAME\s*\}\}/g, "there")
    .replace(/\{\{\{\s*RESEND_UNSUBSCRIBE_URL\s*\}\}\}/g, "#")
    .replace(/\{\{\s*RESEND_UNSUBSCRIBE_URL\s*\}\}/g, "#");
}

// ── sendTestToAdmin ───────────────────────────────────────────────────────────────
// SDK PATH: resend ^6.26.0 `broadcasts.send(id, payload?)` only accepts `{ scheduledAt }`
// (SendBroadcastOptions) — there is NO test/`to` option to route a broadcast to a single
// recipient. So the test path fetches the broadcast (broadcasts.get) and re-sends its
// html/subject to the first ADMIN_EMAIL via emails.send, with merge tags neutralized and a
// "[TEST]" subject prefix.
export async function sendTestToAdmin(broadcastId: string): Promise<ActionResult> {
  if (!(await isAdminAuthed())) return { error: "Unauthorized" };

  const id = broadcastId.trim();
  if (!id) return { error: "Select a broadcast first." };

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return { error: "ADMIN_EMAIL is not configured." };
  const to = adminEmails[0]!;

  try {
    const got = await getResend().broadcasts.get(id);
    if (got.error) return { error: got.error.message ?? "Could not load the broadcast." };
    const b = got.data;
    if (!b) return { error: "Broadcast not found." };
    if (!b.html) return { error: "This broadcast has no HTML content yet." };

    const subject = `[TEST] ${b.subject ?? b.name ?? "Broadcast preview"}`;
    const html = neutralizeMergeTags(b.html);

    const sent = await getResend().emails.send({
      from: `ISRIB Shop <${getFrom()}>`,
      to,
      subject,
      html,
    });
    if (sent.error) return { error: sent.error.message ?? "Send failed." };

    return { ok: true, message: `Test sent to ${to}.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unexpected error." };
  }
}

// ── sendBroadcast ─────────────────────────────────────────────────────────────────
// Sends the selected broadcast to its whole segment. resend ^6.26.0 `broadcasts.send(id)`
// takes the broadcast id as its first positional arg (the segment is already bound to the
// broadcast). The client guards this with a confirm dialog.
export async function sendBroadcast(broadcastId: string): Promise<ActionResult> {
  if (!(await isAdminAuthed())) return { error: "Unauthorized" };

  const id = broadcastId.trim();
  if (!id) return { error: "Select a broadcast first." };

  try {
    const res = await getResend().broadcasts.send(id);
    if (res.error) return { error: res.error.message ?? "Send failed." };
    return { ok: true, message: `Broadcast queued to the segment (id ${res.data?.id ?? id}).` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unexpected error." };
  }
}
