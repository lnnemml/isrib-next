// Access gate for BOTH admin (ADR 0011 + admin-panel.md §1) and customer cabinet
// (ADR 0013). Two fully isolated cookies + secrets: the admin session
// (isrib_admin_session / ADMIN_AUTH_SECRET) and the customer session
// (isrib_customer_session / CUSTOMER_AUTH_SECRET) never share verification.
// NORA post-mortem hard rules (apply to both gates):
//  1. The access check lives in the proxy HANDLER BODY — no framework
//     `authorized` callback (those silently no-op'd on NORA).
//  2. This file is named `proxy.ts` at the repo root. Next 16 renamed Middleware
//     to Proxy (middleware.ts is now a deprecated alias that will eventually break).
//  3. EDGE-SAFE: jose only. No bcrypt, no db, no node:crypto, no Node-only imports.
//     Each verify is re-inlined here (not imported from src/lib/admin/auth.ts nor
//     src/lib/customer/auth.ts — both are server-only / node:crypto) so no Node-only
//     password code can ever leak into the Edge bundle.
//  4. Every secret read from env is .trim()'d before use.
//
// ADR 0025 adds two things, both behind AFFILIATES_ENABLED and both held to the rules above:
// the /partner gate, and ?ref capture. The partner gate checks cookie presence only, because
// sessions live in the DB; the server checks them. Clicks are handed to /api/affiliate/click,
// which owns the db and node:crypto work this file cannot do.
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { normalizeAffiliateCode } from "@/lib/affiliate/core";
import { affiliatesEnabled } from "@/lib/affiliate/flag";

const ADMIN_COOKIE = "isrib_admin_session";
const CUSTOMER_COOKIE = "isrib_customer_session";
const PARTNER_COOKIE = "isrib_partner_session";
const REF_COOKIE = "isrib_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, matching RefCapture

// Accepts affiliate codes and customer REF- codes, which share this cookie (ADR 0014). Stricter
// checks belong to the click route and checkout; this only keeps junk out of a Set-Cookie.
const REF_CODE = /^[A-Z0-9_-]{2,32}$/;
const CUSTOMER_REF_PREFIX = "REF-";
const CLICK_TIMEOUT_MS = 3000;

async function valid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode((process.env.ADMIN_AUTH_SECRET ?? "").trim()),
    );
    return payload.role === "admin";
  } catch {
    return false;
  }
}

async function customerValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode((process.env.CUSTOMER_AUTH_SECRET ?? "").trim()),
    );
    return typeof payload.sub === "string" && payload.sub.length > 0;
  } catch {
    return false;
  }
}

// Public account routes that must never require a session, or we redirect-loop the
// sign-in flow. Matches the exact path or any subpath (e.g. reset-password/<token>).
const PUBLIC_ACCOUNT_PREFIXES = [
  "/account/login",
  "/account/register",
  "/account/reset-password",
  "/account/verify-email",
];

function isPublicAccountPath(pathname: string): boolean {
  return PUBLIC_ACCOUNT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// /partner/login and the magic-link route must stay reachable with no session.
function isPublicPartnerPath(pathname: string): boolean {
  return pathname === "/partner/login" || pathname.startsWith("/partner/auth/");
}

// The matcher's `missing` covers only the ?ref entry, so prefetches of the gated paths and browser
// speculative loads (sec-purpose) are caught here. Next strips next-router-prefetch from the
// request it hands the proxy, which is why that header is tested in the matcher instead.
function isPrefetch(req: NextRequest): boolean {
  return (
    req.headers.get("purpose") === "prefetch" ||
    (req.headers.get("sec-purpose") ?? "").includes("prefetch")
  );
}

// Fire-and-forget. Resolves whatever happens, so nothing here can reach the response.
async function recordClick(req: NextRequest, code: string, secret: string): Promise<void> {
  try {
    await fetch(`${req.nextUrl.origin}/api/affiliate/click`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-affiliate-secret": secret },
      body: JSON.stringify({
        code,
        path: req.nextUrl.pathname,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
        userAgent: req.headers.get("user-agent") ?? "",
      }),
      signal: AbortSignal.timeout(CLICK_TIMEOUT_MS),
    });
  } catch {
    // Best-effort by design: a lost click is cheaper than a slower or broken page.
  }
}

// Every response the proxy returns passes through here, so the cookie lands on redirects from the
// gates too. Only top-level GETs count: a Server Function on a ?ref page POSTs to that same URL.
// Failing anything here leaves the response as it was; RefCapture still runs in the browser.
function withRefCapture(
  req: NextRequest,
  event: NextFetchEvent,
  response: NextResponse,
): NextResponse {
  if (!affiliatesEnabled() || req.method !== "GET" || isPrefetch(req)) return response;

  try {
    const code = normalizeAffiliateCode(req.nextUrl.searchParams.get("ref"));
    if (code === null || !REF_CODE.test(code)) return response;

    response.cookies.set(REF_COOKIE, code, {
      maxAge: REF_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // the checkout page reads it
    });

    const secret = (process.env.AFFILIATE_HASH_SECRET ?? "").trim();
    if (secret && !code.startsWith(CUSTOMER_REF_PREFIX)) {
      event.waitUntil(recordClick(req, code, secret));
    }
  } catch (err) {
    console.error("Ref capture failed (non-fatal):", err instanceof Error ? err.name : typeof err);
  }
  return response;
}

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  const respond = (response: NextResponse) => withRefCapture(req, event, response);
  // Exclude the login page itself, or we redirect-loop it.
  if (pathname === "/admin/login") return respond(NextResponse.next());
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!(await valid(req.cookies.get(ADMIN_COOKIE)?.value))) {
      return respond(NextResponse.redirect(new URL("/admin/login", req.url)));
    }
  }
  // Customer cabinet gate — auth pages stay public; everything else needs a session.
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    if (!isPublicAccountPath(pathname)) {
      if (!(await customerValid(req.cookies.get(CUSTOMER_COOKIE)?.value))) {
        const loginUrl = new URL("/account/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return respond(NextResponse.redirect(loginUrl));
      }
    }
  }
  // Partner gate — presence only. With the flag off this is skipped and the page 404s itself.
  if (affiliatesEnabled() && (pathname === "/partner" || pathname.startsWith("/partner/"))) {
    if (!isPublicPartnerPath(pathname) && !req.cookies.get(PARTNER_COOKIE)?.value) {
      return respond(NextResponse.redirect(new URL("/partner/login", req.url)));
    }
  }
  return respond(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/partner",
    "/partner/:path*",
    // Page requests carrying ?ref. Not /api, not _next assets, not files with an extension, and
    // not prefetches, which are not visits. All other traffic keeps skipping the proxy.
    {
      source: "/((?!api(?:/|$)|_next/|.*\\.[^/]+$).*)",
      has: [{ type: "query", key: "ref" }],
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
