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
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "isrib_admin_session";
const CUSTOMER_COOKIE = "isrib_customer_session";

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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Exclude the login page itself, or we redirect-loop it.
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!(await valid(req.cookies.get(ADMIN_COOKIE)?.value))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  // Customer cabinet gate — auth pages stay public; everything else needs a session.
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    if (!isPublicAccountPath(pathname)) {
      if (!(await customerValid(req.cookies.get(CUSTOMER_COOKIE)?.value))) {
        const loginUrl = new URL("/account/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*"],
};
