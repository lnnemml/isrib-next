import { customAlphabet, nanoid } from "nanoid";

// No confusable characters (no I, O, 0, 1)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(alphabet, 8);

export function generateOrderNumber(): string {
  return `ISR-${generate()}`;
}

// Unguessable, URL-safe per-order token (a plain 21-char nanoid). It backed ADR 0010's
// post-payment shipping link; ADR 0024 removed that form, but the column is NOT NULL +
// unique so a token is still generated per order.
export function generateShippingToken(): string {
  return nanoid();
}

export function deriveTrafficType(
  utmSource?: string | null,
  utmMedium?: string | null
): "paid" | "referral" | "direct" {
  if (!utmSource && !utmMedium) return "direct";
  const paidMediums = ["cpc", "ppc", "paid", "paid_social", "paid-social", "cpm"];
  if (utmMedium && paidMediums.some(m => utmMedium.toLowerCase().includes(m))) {
    return "paid";
  }
  return "referral";
}
