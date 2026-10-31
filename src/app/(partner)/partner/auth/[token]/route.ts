// ADR 0025 — the magic-link target. A route handler, not a page, so the token URL never renders
// the root layout and so never reaches GTM, Meta or Clarity.
//
// GET must not touch the token, because Telegram and email link previews fetch URLs. Only the
// POST from the button consumes it. The token is not echoed back: the form has no action, so it
// posts to the URL it was loaded from. no-referrer keeps the URL out of the Referer header and
// document.referrer on the page the 303 lands on.

import { NextResponse } from "next/server";
import { affiliatesEnabled } from "@/lib/affiliate/flag";
import {
  PARTNER_COOKIE,
  consumeLoginToken,
  createPartnerSession,
  partnerCookieOptions,
} from "@/lib/affiliate/session";
import { safeErrorTag } from "@/lib/marketing/addContact";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
};

function htmlPage(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta name="referrer" content="no-referrer">
<title>${title}</title>
</head>
<body style="margin:0;padding:64px 16px;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="box-sizing:border-box;max-width:384px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
${content}
</div>
</body>
</html>`;
}

function htmlResponse(html: string, status: number): Response {
  return new Response(html, {
    status,
    headers: { ...PRIVATE_HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
}

const SIGN_IN_PAGE = htmlPage(
  "Partner sign in",
  `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.25;font-weight:600;">Partner sign in</h1>
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">Continue to your partner dashboard.</p>
<form method="post" onsubmit="this.querySelector('button').disabled=true">
<button type="submit" style="width:100%;padding:10px 16px;border:0;border-radius:8px;background:#2563eb;color:#ffffff;font:inherit;font-size:17px;font-weight:600;cursor:pointer;">Sign in</button>
</form>`,
);

const EXPIRED_PAGE = htmlPage(
  "Link expired",
  `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.25;font-weight:600;">Link expired</h1>
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">This sign-in link has expired or was already used.</p>
<a href="/partner/login" style="font-size:14px;font-weight:600;color:#2563eb;">Request a new link</a>`,
);

function notFoundResponse(): Response {
  return new Response(null, { status: 404, headers: PRIVATE_HEADERS });
}

export async function GET(): Promise<Response> {
  if (!affiliatesEnabled()) return notFoundResponse();
  return htmlResponse(SIGN_IN_PAGE, 200);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  if (!affiliatesEnabled()) return notFoundResponse();

  const { token } = await params;

  try {
    const affiliateId = await consumeLoginToken(token);
    if (!affiliateId) return htmlResponse(EXPIRED_PAGE, 410);

    const session = await createPartnerSession(affiliateId);
    const response = new NextResponse(null, {
      status: 303,
      headers: { ...PRIVATE_HEADERS, Location: "/partner" },
    });
    response.cookies.set(PARTNER_COOKIE, session, partnerCookieOptions());
    return response;
  } catch (err) {
    // By tag only: a driver error can quote query parameters.
    console.error("Partner sign-in failed:", safeErrorTag(err));
    return htmlResponse(EXPIRED_PAGE, 500);
  }
}
