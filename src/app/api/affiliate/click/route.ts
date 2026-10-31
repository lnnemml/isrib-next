// ADR 0025 — internal click recorder, called only by the proxy with AFFILIATE_HASH_SECRET. The
// proxy has no db or node:crypto, so validation, hashing and the insert all happen here. The IP
// from the body goes into the hash and nowhere else: never stored, never logged. Failures are
// logged by tag only, because a driver error message can quote query parameters.

import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import {
  computeVisitorHash,
  isBotUserAgent,
  sanitizeLandingPath,
  secretsMatch,
} from "@/lib/affiliate/click";
import { isValidAffiliateCode, normalizeAffiliateCode } from "@/lib/affiliate/core";
import { affiliatesEnabled } from "@/lib/affiliate/flag";
import { getAffiliatesByCodes } from "@/lib/affiliate/lookup";
import { db } from "@/lib/db";
import { affiliateClicks } from "@/lib/db/schema";
import { safeErrorTag } from "@/lib/marketing/addContact";

export const dynamic = "force-dynamic";

function status(code: number): NextResponse {
  return new NextResponse(null, { status: code });
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  if (!affiliatesEnabled()) return status(404);

  const secret = (process.env.AFFILIATE_HASH_SECRET ?? "").trim();
  if (!secretsMatch(request.headers.get("x-affiliate-secret"), secret)) return status(401);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (parsed === null || typeof parsed !== "object") return status(400);
    body = parsed as Record<string, unknown>;
  } catch {
    return status(400);
  }

  const code = normalizeAffiliateCode(text(body.code));
  const userAgent = text(body.userAgent);
  if (code === null || !isValidAffiliateCode(code) || isBotUserAgent(userAgent)) return status(204);

  try {
    const [affiliate] = await getAffiliatesByCodes([code]);
    if (!affiliate?.isActive) return status(204);

    await db
      .insert(affiliateClicks)
      .values({
        id: nanoid(),
        affiliateId: affiliate.id,
        landingPath: sanitizeLandingPath(text(body.path)),
        visitorHash: computeVisitorHash({ secret, ip: text(body.ip), userAgent }),
      })
      .onConflictDoNothing();
  } catch (err) {
    console.error("Affiliate click failed (non-fatal):", safeErrorTag(err));
  }

  return status(204);
}
