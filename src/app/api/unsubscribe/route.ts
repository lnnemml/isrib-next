// Plain unsubscribe endpoint (ADR 0017, Path B relaunch send). The relaunch email carries
// a plain unsubscribe LINK (no List-Unsubscribe header — the winning-email-formula wants a
// 1:1 look) pointing here. The link is a stateless HMAC over the email (see
// src/lib/unsubscribe.ts): verify the token, then stamp marketing_contacts.unsubscribedAt.
//
// Neon is the primary record of opt-out (the send script skips anyone with unsubscribedAt
// set). Adding to Resend's suppression list is a best-effort backstop so any future Resend
// broadcast also skips them — its failure never breaks the response.
//
// Node runtime: node:crypto (HMAC verify) + the Neon/ws pool must not run on Edge.

import { and, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { marketingContacts } from "@/lib/db/schema";
import { verifyUnsubscribe } from "@/lib/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const email = (params.get("e") ?? "").trim().toLowerCase();
  const token = params.get("t") ?? "";

  if (!email || !token || !verifyUnsubscribe(email, token)) {
    return htmlPage(
      "Unsubscribe",
      "<p style=\"font-size:16px;\">Invalid or expired unsubscribe link.</p>",
      400,
    );
  }

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
    // A DB failure here should not expose an error to the recipient; Neon is the primary
    // record but the confirmation page is the user-facing contract. Fall through to success.
  }

  // Best-effort Resend suppression backstop — wrapped so any failure (unset key, network,
  // API change) never breaks the confirmation response.
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.suppressions.add({ email });
  } catch {
    // Neon is the primary record; the Resend suppression is only a backstop. Ignore.
  }

  return htmlPage(
    "Unsubscribed",
    "<p style=\"font-size:16px;\">You've been unsubscribed. You won't receive further marketing emails from ISRIB.shop.</p>",
    200,
  );
}
