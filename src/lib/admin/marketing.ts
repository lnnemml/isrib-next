// Marketing-campaigns data layer (Phase E — ADR 0017). server-only: reads the
// marketing_contacts table (PII) and talks to Resend with the secret API key, so it must
// never be pulled into a client bundle.
//
// Two sources of truth are reported side-by-side:
//   - Neon `marketing_contacts` — the canonical list (total / active / opted-out).
//   - Resend segment + broadcasts — what will actually be mailed.
// Nothing here mutates anything; the admin page renders these, the server actions send.
import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { marketingContacts } from "@/lib/db/schema";
import { count, isNull, isNotNull } from "drizzle-orm";

// The "General" segment id (ADR 0017 §Resend account state). Overridable via env so a
// different segment can be pointed at without a code change.
export const RESEND_SEGMENT_ID =
  process.env.RESEND_SEGMENT_ID || "d8632a0a-7b29-4d20-9118-28c3c9c007b7";

let _resend: Resend | undefined;

// Lazily construct the Resend client (mirrors src/lib/email/send.ts) so a missing key at
// import time never crashes the build.
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export { getResend };

// ── Neon list health ────────────────────────────────────────────────────────────

export interface ListHealth {
  total: number;
  active: number; // unsubscribedAt IS NULL
  optedOut: number; // unsubscribedAt IS NOT NULL
}

export async function marketingListHealth(): Promise<ListHealth> {
  const [totalRow, activeRow, optedOutRow] = await Promise.all([
    db.select({ n: count() }).from(marketingContacts),
    db.select({ n: count() }).from(marketingContacts).where(isNull(marketingContacts.unsubscribedAt)),
    db.select({ n: count() }).from(marketingContacts).where(isNotNull(marketingContacts.unsubscribedAt)),
  ]);
  return {
    total: totalRow[0]?.n ?? 0,
    active: activeRow[0]?.n ?? 0,
    optedOut: optedOutRow[0]?.n ?? 0,
  };
}

// ── Resend segment size ───────────────────────────────────────────────────────────

export interface SegmentInfo {
  count: number;
  approximate: boolean; // true if more pages exist beyond the cap (count is a floor)
  error: string | null;
}

// Count contacts in the Resend segment. resend ^6.26.0 `contacts.list` takes `{ segmentId }`
// (segments, NOT the deprecated audienceId) and returns { data, has_more }. The list response
// carries no cursor field, so cursor pagination can't be walked from the returned data; the
// audience is ~600, so we request the max page size (100) a few times using the last contact
// id as the `after` cursor and stop once has_more is false. If we hit the page cap, the count
// is reported as a floor (approximate).
export async function resendSegmentInfo(): Promise<SegmentInfo> {
  try {
    const MAX_PAGES = 10; // 10 * 100 = 1000, well above the ~600 audience
    let total = 0;
    let after: string | undefined;
    let hasMore = false;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await getResend().contacts.list({
        segmentId: RESEND_SEGMENT_ID,
        limit: 100,
        ...(after ? { after } : {}),
      });
      if (res.error) {
        return { count: total, approximate: false, error: res.error.message ?? "Resend error" };
      }
      const data = res.data?.data ?? [];
      total += data.length;
      hasMore = Boolean(res.data?.has_more);
      const last = data[data.length - 1];
      after = last?.id;
      if (!hasMore || !after || data.length === 0) {
        hasMore = false;
        break;
      }
    }
    return { count: total, approximate: hasMore, error: null };
  } catch (e) {
    return { count: 0, approximate: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ── Broadcasts list ───────────────────────────────────────────────────────────────

export interface BroadcastRow {
  id: string;
  name: string;
  status: string;
  createdAt: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
}

export interface BroadcastsResult {
  broadcasts: BroadcastRow[];
  error: string | null;
}

// List every broadcast in the account (drafts + sent). The finalized relaunch broadcast —
// authored later once copy is locked (Phase D deferred) — appears here with no code change.
export async function listBroadcasts(): Promise<BroadcastsResult> {
  try {
    const res = await getResend().broadcasts.list();
    if (res.error) {
      return { broadcasts: [], error: res.error.message ?? "Resend error" };
    }
    const rows: BroadcastRow[] = (res.data?.data ?? []).map((b) => ({
      id: b.id,
      name: b.name || "(untitled)",
      status: b.status,
      createdAt: b.created_at ?? null,
      scheduledAt: b.scheduled_at ?? null,
      sentAt: b.sent_at ?? null,
    }));
    return { broadcasts: rows, error: null };
  } catch (e) {
    return { broadcasts: [], error: e instanceof Error ? e.message : "Unknown error" };
  }
}
