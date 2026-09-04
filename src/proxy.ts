// Admin access gate (ADR 0011 + admin-panel.md §1). NORA post-mortem hard rules:
//  1. The access check lives in the proxy HANDLER BODY — no framework
//     `authorized` callback (those silently no-op'd on NORA).
//  2. This file is named `proxy.ts` at the repo root. Next 16 renamed Middleware
//     to Proxy (middleware.ts is now a deprecated alias that will eventually break).
//  3. EDGE-SAFE: jose only. No bcrypt, no db, no node:crypto, no Node-only imports.
//     The verify is re-inlined here (not imported from src/lib/admin/auth.ts) so the
//     node:crypto verifyPassword can never leak into the Edge bundle.
//  4. Every secret read from env is .trim()'d before use.
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "isrib_admin_session";

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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Exclude the login page itself, or we redirect-loop it.
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!(await valid(req.cookies.get(ADMIN_COOKIE)?.value))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
