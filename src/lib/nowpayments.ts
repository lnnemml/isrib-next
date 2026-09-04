// NowPayments crypto-invoice client (G2 Step 4). Mirrors the NORA reference
// (NORA/src/lib/nowpayments.ts) adapted to the ISRIB order model, with ONE hardening:
// the IPN signature compare uses crypto.timingSafeEqual instead of a plain `!==`.
//
// Two responsibilities:
//   1. createInvoice() — POST a hosted-invoice request; the customer is redirected to
//      invoice_url to pay in BTC/LTC/USDT/etc.
//   2. verifyIpnSignature() — HMAC-SHA512 verify of the IPN callback body, using the
//      NowPayments convention of recursively key-sorting the JSON before hashing.

import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.nowpayments.io/v1";

export interface NowPaymentsInvoice {
  id: string;
  invoice_url: string;
}

export async function createInvoice(params: {
  orderNumber: string;
  amountUsd: number;
  successUrl: string;
  cancelUrl: string;
  ipnCallbackUrl: string;
}): Promise<NowPaymentsInvoice> {
  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount:        params.amountUsd,
      price_currency:      "usd",
      order_id:            params.orderNumber,
      order_description:   `ISRIB Shop order ${params.orderNumber}`,
      success_url:         params.successUrl,
      cancel_url:          params.cancelUrl,
      ipn_callback_url:    params.ipnCallbackUrl,
      is_fixed_rate:       true,
      is_fee_paid_by_user: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NowPayments API error ${res.status}: ${body}`);
  }

  return res.json();
}

// Recursively key-sort a parsed JSON object (NowPayments hashes the sorted-key form).
// Arrays are passed through as-is (their order is significant); nested objects recurse.
function sortObjectRecursive(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj).sort().reduce(
    (result: Record<string, unknown>, key: string) => {
      const val = obj[key];
      result[key] =
        val !== null && typeof val === "object" && !Array.isArray(val)
          ? sortObjectRecursive(val as Record<string, unknown>)
          : val;
      return result;
    },
    {},
  );
}

// Verify the x-nowpayments-sig header against the raw request body. Returns false for a
// missing signature or any mismatch; throws only if the IPN secret is unset (a server
// misconfiguration the caller surfaces as a 500). Hardened vs NORA's `!==`: the compare
// is constant-time via crypto.timingSafeEqual, with an explicit length + null guard so
// timingSafeEqual (which throws on unequal-length buffers) is never reached unsafely.
export function verifyIpnSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) throw new Error("NOWPAYMENTS_IPN_SECRET not set");
  if (!signature) return false;

  const data = JSON.parse(rawBody) as Record<string, unknown>;
  const sorted = sortObjectRecursive(data);
  const expected = createHmac("sha512", secret)
    .update(JSON.stringify(sorted))
    .digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  // timingSafeEqual throws if lengths differ — guard first so a wrong-length signature
  // simply fails verification instead of raising.
  if (sigBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(sigBuf, expectedBuf);
}
