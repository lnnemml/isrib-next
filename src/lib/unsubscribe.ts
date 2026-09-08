// Plain unsubscribe token primitives (ADR 0017, Path B relaunch send).
// Path B sends plain 1:1 mail with a plain unsubscribe LINK and deliberately NO
// List-Unsubscribe header (the winning-email-formula: that header reads as "bulk" to
// Gmail and pushes mail out of Important). So we need a self-contained, stateless
// unsubscribe URL on the new site: an HMAC over the recipient's email that /api/unsubscribe
// re-verifies. No DB token table — the signature IS the proof.
//
// Server-only in practice: it imports node:crypto, so bundling it into a client/Edge
// build already fails. We deliberately do NOT `import "server-only"` here — this module is
// also imported by the plain-tsx send script (scripts/send-relaunch.ts), and the
// "server-only" shim resolves only inside Next's bundler, not under bare tsx (same reason
// seed-promo-code.ts inlines rather than importing the server-only src/lib/promo.ts).
import { createHmac, timingSafeEqual } from "node:crypto";

// Reuse the existing CUSTOMER_AUTH_SECRET (already set in Vercel). Domain-separated from
// every other use of that secret by the "unsubscribe:v1:" prefix, so a token here can
// never be replayed as an auth token elsewhere. .trim() on every read — a trailing newline
// in the env value was the NORA silent-failure (ADR 0011).
function secret(): string {
  return (process.env.CUSTOMER_AUTH_SECRET ?? "").trim();
}

function computeToken(email: string): string {
  const message = "unsubscribe:v1:" + email.trim().toLowerCase();
  return createHmac("sha256", secret()).update(message).digest("hex");
}

// Hex HMAC-SHA256 over "unsubscribe:v1:<normalized email>".
export function signUnsubscribe(email: string): string {
  return computeToken(email);
}

// Constant-time compare of the recomputed HMAC vs the provided token. timingSafeEqual
// throws on a length mismatch, so guard it (a wrong-length token is simply invalid).
export function verifyUnsubscribe(email: string, token: string): boolean {
  if (!token) return false;
  const expected = computeToken(email);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Build the full unsubscribe URL for an email against a given base (no trailing slash).
export function unsubscribeUrl(email: string, baseUrl: string): string {
  const token = signUnsubscribe(email);
  return `${baseUrl}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${token}`;
}
