// Customer-accounts auth primitives (ADR 0013).
// Mirrors the admin primitives in src/lib/admin/auth.ts (jose + cookie + .trim()
// conventions, ADR 0011) but for CUSTOMERS: a separate cookie, a separate secret,
// per-customer password hashes stored in the DB, and a JWT that identifies WHICH
// customer via payload.sub.
//
// server-only: hashPassword/verifyPassword import node:crypto and MUST NOT be pulled
// into the Edge proxy bundle. The proxy will re-inline its own jose-only verify in a
// later task.
import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";

// Isolated from admin's isrib_admin_session — a customer session must never satisfy
// an admin check and vice-versa.
export const CUSTOMER_COOKIE = "isrib_customer_session";

// .trim() the secret on every read — a trailing newline in the env value was the
// NORA silent-failure (ADR 0011). Separate env var from ADMIN_AUTH_SECRET.
function secret() {
  return new TextEncoder().encode((process.env.CUSTOMER_AUTH_SECRET ?? "").trim());
}

// ── Password hashing (node:crypto scrypt — no external dep) ───────────────────

// Derive a salted scrypt hash. Returns "<saltHex>:<hashHex>" for storage in
// customers.passwordHash. Fresh 16-byte random salt per call.
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Constant-time verify. Parses the stored "salt:hash", recomputes with the same
// salt, and compares with timingSafeEqual. Returns false on null/blank stored,
// malformed format, or a length mismatch (timingSafeEqual throws on that).
export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  try {
    const [saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    if (actual.length !== expected.length) return false; // timingSafeEqual throws on length mismatch
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ── Session JWT (jose) ────────────────────────────────────────────────────────

// Customers stay logged in far longer than the 12h admin session.
export async function createCustomerSession(customerId: string): Promise<string> {
  return new SignJWT({ sub: customerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

// Returns the customerId (payload.sub) on a valid token, else null.
export async function verifyCustomerSession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// ── Current-customer helper (server components / actions) ─────────────────────

// Reads the signed cookie, verifies it, and loads the customer row. Returns null
// for no/invalid session AND for the deleted-customer case (valid token, row gone).
// cookies() is async in Next 16. Returns the full row (server-only); passwordHash
// is present on it — callers must not forward the row to the client.
export async function getCurrentCustomer(): Promise<typeof customers.$inferSelect | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  const customerId = await verifyCustomerSession(token);
  if (!customerId) return null;

  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  return rows[0] ?? null;
}

// Log out — delete the cookie. Setting the cookie on login lives in the login
// Server Action (later task). cookies() is async in Next 16.
export async function clearCustomerSession(): Promise<void> {
  (await cookies()).delete(CUSTOMER_COOKIE);
}
