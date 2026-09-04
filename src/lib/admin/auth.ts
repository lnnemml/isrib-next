// Admin-panel auth primitives (ADR 0011 + admin-panel.md §1).
// server-only: verifyPassword imports node:crypto and MUST NOT be pulled into the
// Edge middleware bundle. The Edge middleware re-inlines its own jose-only verify.
import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "isrib_admin_session";

// .trim() the secret on every read — a trailing newline in the env value was the
// NORA silent-failure (ADR 0011).
function secret() {
  return new TextEncoder().encode((process.env.ADMIN_AUTH_SECRET ?? "").trim());
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

// Server-action defense-in-depth (ADR 0011): every admin Server Action re-verifies the
// session itself, so a misconfigured proxy/matcher can never leave a mutating action
// unprotected. Reads the same signed cookie the proxy checks. cookies() is async in Next 16.
export async function isAdminAuthed(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

// Constant-time password compare. node:crypto keeps this off the Edge — only the
// login Server Action (Node runtime) ever calls it.
export function verifyPassword(input: string): boolean {
  const expected = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
  return timingSafeEqual(a, b);
}
