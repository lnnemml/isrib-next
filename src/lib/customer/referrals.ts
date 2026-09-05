// Customer referral cabinet data layer (ADR 0014). Server-only: touches the DB
// directly and must never be pulled into a client bundle. The page passes ONLY plain
// string/scalar props to its client children (the copy button) — never these rows.
import "server-only";

import { db } from "@/lib/db";
import { discountLedger, referrals, orders } from "@/lib/db/schema";
import { eq, and, desc, isNull, gt, or } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ── Public types ────────────────────────────────────────────────────────────────

export interface ReferralOverview {
  code: string | null;
  shareUrl: string | null;
  availableCredits: { id: string; discountPct: number; createdAt: Date }[];
  redeemedCreditCount: number;
  history: {
    referredEmail: string; // MASKED — never the full referred email
    orderNumber: string | null;
    orderStatus: string | null;
    orderedAt: Date | null;
    rewardStatus: "pending" | "available" | "redeemed";
  }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

// Privacy: the referrer must not see the full email of the person they referred.
// Show the first character of the local part + "***@" + domain, e.g. "a***@gmail.com".
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***"; // no local part / malformed — reveal nothing
  const first = email.slice(0, 1);
  const domain = email.slice(at + 1);
  return domain ? `${first}***@${domain}` : `${first}***`;
}

// Reward rows can be "available" | "redeemed" | "expired". The cabinet only surfaces
// the credit's live spendability, so an expired reward is folded back to "available"
// vs "redeemed" is preserved. No reward row at all → the referred order is not yet paid.
function coerceRewardStatus(
  status: "available" | "redeemed" | "expired" | null,
): "pending" | "available" | "redeemed" {
  if (status === null) return "pending"; // reward only created once the order is paid
  if (status === "redeemed") return "redeemed";
  return "available"; // "available" and "expired" both surface as spendable/earned
}

// ── getReferralOverview ────────────────────────────────────────────────────────────

export async function getReferralOverview(customer: {
  id: string;
  referralCode: string | null;
}): Promise<ReferralOverview> {
  const code = customer.referralCode;
  const shareUrl = code ? `${BASE_URL}/?ref=${code}` : null;

  const now = new Date();

  // Available reward credits owned by this customer, not expired, newest first.
  const availableRows = await db
    .select({
      id: discountLedger.id,
      discountPct: discountLedger.discountPct,
      createdAt: discountLedger.createdAt,
    })
    .from(discountLedger)
    .where(
      and(
        eq(discountLedger.customerId, customer.id),
        eq(discountLedger.status, "available"),
        or(isNull(discountLedger.expiresAt), gt(discountLedger.expiresAt, now)),
      ),
    )
    .orderBy(desc(discountLedger.createdAt));

  const availableCredits = availableRows.map((r) => ({
    id: r.id,
    discountPct: r.discountPct,
    createdAt: r.createdAt,
  }));

  // Count of redeemed credits.
  const redeemedRows = await db
    .select({ id: discountLedger.id })
    .from(discountLedger)
    .where(
      and(
        eq(discountLedger.customerId, customer.id),
        eq(discountLedger.status, "redeemed"),
      ),
    );
  const redeemedCreditCount = redeemedRows.length;

  // Referral history: referrals owned by this customer, joined to the referred order
  // and (if created yet) the reward credit. LEFT JOINs so a referral shows even before
  // its reward exists. discountLedger only has a row here once the order is paid.
  const historyRows = await db
    .select({
      referredEmail: referrals.referredEmail,
      createdAt: referrals.createdAt,
      orderNumber: orders.orderNumber,
      orderStatus: orders.status,
      orderedAt: orders.createdAt,
      rewardStatus: discountLedger.status,
    })
    .from(referrals)
    .leftJoin(orders, eq(referrals.referredOrderId, orders.id))
    .leftJoin(discountLedger, eq(referrals.referrerRewardId, discountLedger.id))
    .where(eq(referrals.referrerCustomerId, customer.id))
    .orderBy(desc(referrals.createdAt));

  const history = historyRows.map((r) => ({
    referredEmail: maskEmail(r.referredEmail),
    orderNumber: r.orderNumber,
    orderStatus: r.orderStatus,
    orderedAt: r.orderedAt,
    rewardStatus: coerceRewardStatus(r.rewardStatus),
  }));

  return {
    code,
    shareUrl,
    availableCredits,
    redeemedCreditCount,
    history,
  };
}
