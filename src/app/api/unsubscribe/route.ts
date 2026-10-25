// Plain unsubscribe endpoint (ADR 0017, Path B relaunch send). The relaunch email carries
// a plain unsubscribe LINK (no List-Unsubscribe header — the winning-email-formula wants a
// 1:1 look) pointing here. The link is a stateless HMAC over the email (see
// src/lib/unsubscribe.ts); every request re-verifies it.
//
// GET is deliberately NON-MUTATING. Link scanners (Outlook Safe Links, corporate AV) pre-fetch
// every URL in an email, so a GET that unsubscribed would opt out people who never clicked,
// and an accidental click could not be undone. GET only renders a confirmation page; the
// actual change happens on a POST from that page's form (scanners don't submit forms).
//
// POST action=unsubscribe stamps marketing_contacts.unsubscribedAt (Neon is the primary
// record — the send scripts skip anyone with it set). POST action=resubscribe clears it, so
// an opt-out is always reversible from the same page.
//
// Resend side (best-effort, never breaks the response): we set the Resend CONTACT's
// `unsubscribed` flag rather than adding the address to Resend's suppression list. A
// suppression blocks ALL mail from the account to that address — including transactional
// order emails — which is wrong for a marketing opt-out. Resubscribe flips the contact flag
// back and also removes any suppression the old version of this route added.
//
// Pages never leak list membership: the same confirmation is shown whether or not the
// address is in marketing_contacts.
//
// Node runtime: node:crypto (HMAC verify) + the Neon/ws pool must not run on Edge.

import { and, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { marketingContacts } from "@/lib/db/schema";
import { verifyUnsubscribe } from "@/lib/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIMARY_BUTTON_STYLE =
  "background:#1e40af;color:#ffffff;border:0;border-radius:8px;padding:12px 20px;font-size:16px;font-family:inherit;cursor:pointer;";

function htmlPage(title: string, body: string, status: number): Response {
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body style="background:#ffffff;">
<div style="max-width:600px;margin:80px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.6;">
${body}
</div>
</body>
</html>`;
  return new Response(doc, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function invalidPage(): Response {
  return htmlPage(
    "Unsubscribe",
    "<p style=\"font-size:16px;\">Invalid or expired unsubscribe link.</p>",
    400,
  );
}

// A POST form back to this route carrying the signed pair plus the intended action.
function actionForm(email: string, token: string, action: string, label: string): string {
  return `<form method="post" action="/api/unsubscribe" style="margin:24px 0 0;">
<input type="hidden" name="e" value="${escapeHtml(email)}" />
<input type="hidden" name="t" value="${escapeHtml(token)}" />
<input type="hidden" name="action" value="${escapeHtml(action)}" />
<button type="submit" style="${PRIMARY_BUTTON_STYLE}">${escapeHtml(label)}</button>
</form>`;
}

function heading(text: string): string {
  return `<h1 style="font-size:24px;font-weight:600;margin:0 0 12px;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="font-size:16px;margin:0;">${text}</p>`;
}

async function getResend() {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const email = (params.get("e") ?? "").trim().toLowerCase();
  const token = params.get("t") ?? "";

  if (!email || !token || !verifyUnsubscribe(email, token)) {
    return invalidPage();
  }

  // No DB or Resend change here — see header comment (link scanners pre-fetch GETs).
  return htmlPage(
    "Unsubscribe",
    heading("Unsubscribe from ISRIB.shop emails?") +
      paragraph(
        "You'll stop getting updates and announcements. You'll still receive emails about any orders you place.",
      ) +
      actionForm(email, token, "unsubscribe", "Unsubscribe") +
      "<p style=\"font-size:14px;color:#64748b;margin:20px 0 0;\">Got here by accident? Just close this page.</p>",
    200,
  );
}

export async function POST(request: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidPage();
  }

  const rawEmail = form.get("e");
  const rawToken = form.get("t");
  const rawAction = form.get("action");
  const email = (typeof rawEmail === "string" ? rawEmail : "").trim().toLowerCase();
  const token = typeof rawToken === "string" ? rawToken : "";
  const action = typeof rawAction === "string" ? rawAction : "";

  if (!email || !token || !verifyUnsubscribe(email, token)) {
    return invalidPage();
  }

  if (action === "unsubscribe") {
    // Idempotent: only rows that exist AND are not already opted out are touched. If the
    // email isn't in the table we still show success (never leak list membership).
    try {
      await db
        .update(marketingContacts)
        .set({ unsubscribedAt: new Date() })
        .where(
          and(
            sql`lower(${marketingContacts.email}) = ${email}`,
            isNull(marketingContacts.unsubscribedAt),
          ),
        );
    } catch {
      // A DB failure should not expose an error to the recipient; the confirmation page is
      // the user-facing contract. Fall through to success.
    }

    // Best-effort: mark the Resend contact unsubscribed (NOT a suppression — that would
    // also block transactional order mail). Any failure is ignored.
    try {
      const resend = await getResend();
      await resend.contacts.update({ email, unsubscribed: true });
    } catch {
      // Neon is the primary record; the Resend flag is only a backstop. Ignore.
    }

    return htmlPage(
      "Unsubscribed",
      heading("You've been unsubscribed") +
        paragraph(
          "You won't receive further marketing emails from ISRIB.shop. You'll still get emails about any orders you place.",
        ) +
        actionForm(email, token, "resubscribe", "Resubscribe"),
      200,
    );
  }

  if (action === "resubscribe") {
    // Update only, never insert: an address not on the list stays off it, and the page is
    // the same either way (never leak list membership).
    try {
      await db
        .update(marketingContacts)
        .set({ unsubscribedAt: null })
        .where(sql`lower(${marketingContacts.email}) = ${email}`);
    } catch {
      // Same contract as above — never surface a DB error to the recipient.
    }

    // Best-effort: flip the Resend contact flag back.
    try {
      const resend = await getResend();
      await resend.contacts.update({ email, unsubscribed: false });
    } catch {
      // Ignore — backstop only.
    }

    // Best-effort: remove any suppression the previous version of this route added.
    try {
      const resend = await getResend();
      await resend.suppressions.remove(email);
    } catch {
      // Ignore — most addresses were never suppressed.
    }

    return htmlPage(
      "Subscribed",
      heading("You're subscribed again") +
        paragraph("Thanks — you'll keep getting our emails."),
      200,
    );
  }

  return invalidPage();
}
