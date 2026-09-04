import { customAlphabet } from "nanoid";

// No confusable characters (no I, O, 0, 1)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(alphabet, 8);

export function generateOrderNumber(): string {
  return `ISR-${generate()}`;
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
