import "server-only";

import { customAlphabet, nanoid } from "nanoid";
import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "./db";
import { customers, discountLedger, orders, referrals } from "./db/schema";

// ADR 0014 — referral reward is a 10% credit for the referrer.
export const REFERRAL_DISCOUNT_PCT = 10;

// No confusable characters (no I, O, 0, 1) — mirrors src/lib/order-number.ts.
// Distinct "REF-" prefix so referral codes can never collide with ISR- order numbers.
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCode = customAlphabet(alphabet, 6);

// Pure — a customer's personal referral code, e.g. "REF-ABC234".
export function generateReferralCode(): string {
  return `REF-${generateCode()}`;
}

export async function generateUniqueReferralCode(): Promise<string> {
  // Collisions are astronomically unlikely (6 chars × 32-char alphabet), but the
  // referral_code column is UNIQUE — retry a few times, then throw (caller decides).
  for (let i = 0; i < 6; i++) {
    const code = generateReferralCode();
    const [hit] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.referralCode, code))
      .limit(1);
    if (!hit) return code;
  }
  throw new Error("could not generate a unique referral code after 6 attempts");
}

// Codes are stored and compared uppercase; trim + uppercase, null if empty.
export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : null;
}

// Validate an incoming referral code against the customers table, guarding
// against self-referral (same id, or same email case-insensitively).
export async function validateReferralCode(input: {
  code: string | null | undefined;
  refereeEmail: string;
  refereeCustomerId?: string | null;
}): Promise<{ ok: true; referrerId: string; code: string } | { ok: false }> {
  const code = normalizeReferralCode(input.code);
  if (code === null) return { ok: false };

  const [referrer] = await db
    .select()
    .from(customers)
    .where(eq(customers.referralCode, code))
    .limit(1);

  if (!referrer) return { ok: false };

  // Self-referral guard.
  const sameCustomer =
    input.refereeCustomerId != null && referrer.id === input.refereeCustomerId;
  const sameEmail =
    referrer.email.toLowerCase() === input.refereeEmail.trim().toLowerCase();
  if (sameCustomer || sameEmail) return { ok: false };

  return { ok: true, referrerId: referrer.id, code };
}

// Moved to the pure ./discount module so it can be tested without a connection.
export { computeEffectiveDiscount, type EffectiveDiscount } from "./discount";

// The oldest still-usable reward credit for a customer: status "available" and
// not expired (expiresAt null = never expires, or in the future). Null if none.
export async function getAvailableRewardCredit(
  customerId: string | null | undefined
): Promise<{ id: string; discountPct: number } | null> {
  if (!customerId) return null;

  const [credit] = await db
    .select({ id: discountLedger.id, discountPct: discountLedger.discountPct })
    .from(discountLedger)
    .where(
      and(
        eq(discountLedger.customerId, customerId),
        eq(discountLedger.status, "available"),
        or(isNull(discountLedger.expiresAt), gt(discountLedger.expiresAt, new Date()))
      )
    )
    .orderBy(asc(discountLedger.createdAt))
    .limit(1);

  return credit ?? null;
}

// Mint the referrer's reward AFTER a referred order transitions to "paid"
// (webhook + admin markPaid). Idempotent and never throws on the no-op paths.
export async function createReferrerReward(orderId: string): Promise<void> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  // Nothing to do: order gone, or it was not a referred order.
  if (!order || order.referredByCustomerId == null) return;

  // Idempotency: a reward for this order has already been created.
  const [existing] = await db
    .select({ id: referrals.id })
    .from(referrals)
    .where(eq(referrals.referredOrderId, orderId))
    .limit(1);
  if (existing) return;

  const referrerCustomerId = order.referredByCustomerId;
  const rewardId = nanoid();

  await db.transaction(async (tx) => {
    await tx.insert(discountLedger).values({
      id: rewardId,
      customerId: referrerCustomerId,
      source: "referral_reward",
      discountPct: REFERRAL_DISCOUNT_PCT,
      status: "available",
      expiresAt: null,
    });

    await tx.insert(referrals).values({
      id: nanoid(),
      referrerCustomerId,
      referredOrderId: orderId,
      referredEmail: order.email,
      referrerRewardId: rewardId,
    });
  });
}
