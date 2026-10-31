import "server-only";

// ADR 0025 — partner auth. Tokens and sessions are opaque random values and only their SHA-256
// hashes reach the database, so a read of these tables gives nothing that can sign in. Sessions
// live in the DB, so deactivating an affiliate cuts access at once.

import { createHash, randomBytes } from "node:crypto";
import { and, count, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  affiliateLoginAttempts,
  affiliateLoginTokens,
  affiliateSessions,
  affiliates,
} from "@/lib/db/schema";
import { affiliatesEnabled } from "./flag";

export const PARTNER_COOKIE = "isrib_partner_session";

// `db` or an open transaction, so a caller can tie these deletes to its own write.
type DeleteExecutor = Pick<typeof db, "delete">;

export const EMAILED_LINK_TTL_MINUTES = 30;
export const ADMIN_LINK_TTL_MINUTES = 1440;

const TOKEN_BYTES = 32;
const MS_PER_MINUTE = 60_000;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;
const LOGIN_ATTEMPT_RETENTION_MINUTES = 60 * 24; // 1 day
const LINK_LIMIT_PER_AFFILIATE = 3;
const LINK_LIMIT_WINDOW_MINUTES = 60;

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * MS_PER_MINUTE);
}

export interface CurrentAffiliate {
  id: string;
  name: string;
  handle: string | null;
  code: string;
  commissionRateBps: number;
  customerDiscountBps: number;
}

// ── Tokens ──────────────────────────────────────────────────────────────────

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export async function createLoginToken(affiliateId: string, ttlMinutes: number): Promise<string> {
  const rawToken = generateToken();
  await db.insert(affiliateLoginTokens).values({
    id: nanoid(),
    affiliateId,
    tokenHash: hashToken(rawToken),
    expiresAt: minutesFromNow(ttlMinutes),
  });
  return rawToken;
}

export function buildPartnerLoginUrl(rawToken: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return `${base}/partner/auth/${rawToken}`;
}

// One conditional UPDATE is the whole single-use guarantee: of any number of concurrent POSTs,
// exactly one gets a row back. Exported so a test can read the SQL without running it.
export function consumeLoginTokenQuery(rawToken: string, now: Date) {
  return db
    .update(affiliateLoginTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(affiliateLoginTokens.tokenHash, hashToken(rawToken)),
        isNull(affiliateLoginTokens.usedAt),
        gt(affiliateLoginTokens.expiresAt, now),
      ),
    )
    .returning({ affiliateId: affiliateLoginTokens.affiliateId });
}

// The affiliate's id, or null for an unknown, used or expired token, or an inactive affiliate.
export async function consumeLoginToken(rawToken: string): Promise<string | null> {
  const [consumed] = await consumeLoginTokenQuery(rawToken, new Date());
  if (!consumed) return null;

  const [affiliate] = await db
    .select({ id: affiliates.id })
    .from(affiliates)
    .where(and(eq(affiliates.id, consumed.affiliateId), eq(affiliates.isActive, true)))
    .limit(1);
  return affiliate?.id ?? null;
}

// Unused tokens only: a used one can sign nobody in, and it still counts toward the hourly limit.
// Exported so a test can read the SQL without running it.
export function deleteAffiliateLoginTokensQuery(
  affiliateId: string,
  executor: DeleteExecutor = db,
) {
  return executor
    .delete(affiliateLoginTokens)
    .where(
      and(eq(affiliateLoginTokens.affiliateId, affiliateId), isNull(affiliateLoginTokens.usedAt)),
    );
}

export async function deleteAffiliateLoginTokens(
  affiliateId: string,
  executor: DeleteExecutor = db,
): Promise<void> {
  await deleteAffiliateLoginTokensQuery(affiliateId, executor);
}

// ── Sessions ────────────────────────────────────────────────────────────────

export async function createPartnerSession(affiliateId: string): Promise<string> {
  const rawToken = generateToken();
  await db.insert(affiliateSessions).values({
    id: nanoid(),
    affiliateId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
  });
  return rawToken;
}

export function partnerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  } as const;
}

// Null with no cookie, an unknown or expired session, an inactive affiliate, or the flag off.
export async function getCurrentAffiliate(): Promise<CurrentAffiliate | null> {
  if (!affiliatesEnabled()) return null;

  const rawToken = (await cookies()).get(PARTNER_COOKIE)?.value;
  if (!rawToken) return null;

  const [affiliate] = await db
    .select({
      id: affiliates.id,
      name: affiliates.name,
      handle: affiliates.handle,
      code: affiliates.code,
      commissionRateBps: affiliates.commissionRateBps,
      customerDiscountBps: affiliates.customerDiscountBps,
    })
    .from(affiliateSessions)
    .innerJoin(affiliates, eq(affiliateSessions.affiliateId, affiliates.id))
    .where(
      and(
        eq(affiliateSessions.tokenHash, hashToken(rawToken)),
        gt(affiliateSessions.expiresAt, new Date()),
        eq(affiliates.isActive, true),
      ),
    )
    .limit(1);
  return affiliate ?? null;
}

export async function requireAffiliate(): Promise<CurrentAffiliate> {
  const affiliate = await getCurrentAffiliate();
  if (!affiliate) redirect("/partner/login");
  return affiliate;
}

// For a Server Action or Route Handler: cookies can only be deleted there.
export async function destroyPartnerSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(PARTNER_COOKIE)?.value;
  if (rawToken) {
    await db.delete(affiliateSessions).where(eq(affiliateSessions.tokenHash, hashToken(rawToken)));
  }
  cookieStore.delete(PARTNER_COOKIE);
}

export async function deleteAffiliateSessions(
  affiliateId: string,
  executor: DeleteExecutor = db,
): Promise<void> {
  await executor.delete(affiliateSessions).where(eq(affiliateSessions.affiliateId, affiliateId));
}

// ── Login requests ──────────────────────────────────────────────────────────

// Records the attempt first and counts after, so concurrent requests cannot all read a count
// under the limit. False once this visitor hash is over it.
export async function recordLoginAttempt(visitorHash: string): Promise<boolean> {
  await db.insert(affiliateLoginAttempts).values({ id: nanoid(), visitorHash });

  const [attempts] = await db
    .select({ total: count() })
    .from(affiliateLoginAttempts)
    .where(
      and(
        eq(affiliateLoginAttempts.visitorHash, visitorHash),
        gt(affiliateLoginAttempts.createdAt, minutesFromNow(-LOGIN_ATTEMPT_WINDOW_MINUTES)),
      ),
    );
  return attempts.total <= LOGIN_ATTEMPT_LIMIT;
}

export async function deleteOldLoginAttempts(): Promise<void> {
  await db
    .delete(affiliateLoginAttempts)
    .where(lt(affiliateLoginAttempts.createdAt, minutesFromNow(-LOGIN_ATTEMPT_RETENTION_MINUTES)));
}

// A fresh 30 minute token for the active affiliate on this email, or null if there is none or it
// already has its links for the hour. `email` must be normalised. Admin-generated links count
// toward the same limit, because the table holds them all.
export async function issueEmailedLoginToken(
  email: string,
): Promise<{ rawToken: string; notifyEmail: string } | null> {
  const [affiliate] = await db
    .select({ id: affiliates.id, notifyEmail: affiliates.notifyEmail })
    .from(affiliates)
    .where(and(eq(sql`lower(${affiliates.notifyEmail})`, email), eq(affiliates.isActive, true)))
    .limit(1);
  if (!affiliate?.notifyEmail) return null;

  const [links] = await db
    .select({ total: count() })
    .from(affiliateLoginTokens)
    .where(
      and(
        eq(affiliateLoginTokens.affiliateId, affiliate.id),
        gt(affiliateLoginTokens.createdAt, minutesFromNow(-LINK_LIMIT_WINDOW_MINUTES)),
      ),
    );
  if (links.total >= LINK_LIMIT_PER_AFFILIATE) return null;

  return {
    rawToken: await createLoginToken(affiliate.id, EMAILED_LINK_TTL_MINUTES),
    notifyEmail: affiliate.notifyEmail,
  };
}
