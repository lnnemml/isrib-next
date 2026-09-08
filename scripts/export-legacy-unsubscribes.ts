/**
 * Recover the OLD site's opt-out list (ADR 0017, Phase A).
 *
 * The legacy unsubscribe list lives ONLY in the old Upstash Redis as `unsub:<email>`
 * keys and was never synced to Resend. This one-off admin export reads those keys via
 * the Upstash REST API (no new npm dependency — plain `fetch`) and writes the deduped
 * list of emails to `data/legacy-unsubscribes.json` (git-ignored — PII), which
 * `consolidate-marketing-list.ts` then stamps as opted-out.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/export-legacy-unsubscribes.ts
 *
 * Requires (from the OLD Vercel project — namespaced with LEGACY_ so they never
 * collide with this project's own KV creds):
 *   LEGACY_KV_REST_API_URL
 *   LEGACY_KV_REST_API_TOKEN
 *
 * Anton-gated: needs the old project's creds; this hits the old Upstash instance.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "data");
const OUT_FILE = join(OUT_DIR, "legacy-unsubscribes.json");

const UNSUB_PREFIX = "unsub:";

// Upstash REST `KEYS unsub:*` returns { result: [...keys] }.
interface UpstashKeysResponse {
  result: string[];
}

async function main(): Promise<void> {
  const url = process.env.LEGACY_KV_REST_API_URL;
  const token = process.env.LEGACY_KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error("");
    console.error("ERROR: LEGACY_KV_REST_API_URL and/or LEGACY_KV_REST_API_TOKEN are not set.");
    console.error("");
    console.error("These are the OLD Vercel project's Upstash creds (the old site's KV store),");
    console.error("NOT this project's. Anton must copy them from the OLD Vercel project's env");
    console.error("into .env.local as:");
    console.error("  LEGACY_KV_REST_API_URL=...");
    console.error("  LEGACY_KV_REST_API_TOKEN=...");
    console.error("then re-run.");
    console.error("");
    process.exit(1);
  }

  const base = url.replace(/\/+$/, ""); // drop any trailing slash

  console.log("");
  console.log("=== EXPORT LEGACY UNSUBSCRIBES (ADR 0017, Phase A) ===");
  console.log("");
  console.log(`Listing "${UNSUB_PREFIX}*" keys from old Upstash…`);

  // KEYS on a large set is acceptable here — one-off admin export.
  const res = await fetch(`${base}/keys/${encodeURIComponent(`${UNSUB_PREFIX}*`)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("");
    console.error(`ERROR: Upstash REST request failed (${res.status} ${res.statusText}).`);
    console.error(await res.text());
    console.error("");
    process.exit(1);
  }

  const body = (await res.json()) as UpstashKeysResponse;
  const keys = Array.isArray(body.result) ? body.result : [];

  const emails = new Set<string>();
  for (const key of keys) {
    const email = key.slice(UNSUB_PREFIX.length).trim().toLowerCase();
    if (email) emails.add(email);
  }

  const list = [...emails].sort();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");

  console.log("");
  console.log(`Keys returned:       ${keys.length}`);
  console.log(`Unique opt-outs:     ${list.length}`);
  console.log(`Written to:          ${OUT_FILE}`);
  console.log("");
  console.log("Done.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
