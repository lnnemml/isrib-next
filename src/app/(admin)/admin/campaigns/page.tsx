import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin/auth";
import {
  marketingListHealth,
  resendSegmentInfo,
  listBroadcasts,
  RESEND_SEGMENT_ID,
} from "@/lib/admin/marketing";
import { BroadcastControls, type BroadcastOption } from "./BroadcastControls";

export const metadata: Metadata = {
  title: "Campaigns",
  robots: { index: false, follow: false },
};

// Reads the marketing list (PII) + live Resend state — never statically rendered.
export const dynamic = "force-dynamic";

// ── small presentational primitives (mirrors the dashboard) ───────────────────────

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="font-mono text-caption uppercase tracking-[0.08em] text-text-faint">
        {label}
      </div>
      <div className="mt-1 text-h3 font-semibold text-text">{value}</div>
      {sub && <div className="mt-0.5 text-caption text-text-muted">{sub}</div>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
      {children}
    </h2>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint">
      {children}
    </th>
  );
}

function fmtTs(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "2-digit",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Short id for display (broadcast ids are UUIDs).
function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

export default async function AdminCampaignsPage() {
  // Defense-in-depth (ADR 0011): the proxy gates /admin/* at the edge, and we re-check the
  // signed session here so a misconfigured matcher can never expose this page.
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const [health, segment, broadcastsResult] = await Promise.all([
    marketingListHealth(),
    resendSegmentInfo(),
    listBroadcasts(),
  ]);

  const options: BroadcastOption[] = broadcastsResult.broadcasts.map((b) => ({
    id: b.id,
    label: `${b.name} · ${b.status} · ${shortId(b.id)}`,
  }));

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Top bar */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="font-semibold tracking-[-0.01em] text-text">
            {"ISRIB "}
            <span className="text-text-faint">{"Admin · Campaigns"}</span>
          </div>
          <Link
            href="/admin"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-small font-semibold text-text transition hover:bg-surface-soft"
          >
            {"← Dashboard"}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        {/* 1 — List health */}
        <SectionHeading>{"Marketing list health"}</SectionHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card label="Total contacts" value={String(health.total)} sub="Neon marketing_contacts" />
          <Card label="Active" value={String(health.active)} sub="mailable (not opted out)" />
          <Card label="Opted out" value={String(health.optedOut)} sub="never mail" />
          <Card
            label="Resend segment"
            value={
              segment.error
                ? "—"
                : segment.approximate
                  ? `${segment.count}+`
                  : String(segment.count)
            }
            sub={segment.error ? "error (see below)" : `id ${shortId(RESEND_SEGMENT_ID)}`}
          />
        </div>
        {segment.error && (
          <p className="mt-3 text-caption text-danger">
            {`Resend segment lookup failed: ${segment.error}`}
          </p>
        )}

        {/* 2 — Broadcasts */}
        <SectionHeading>{`Broadcasts (${broadcastsResult.broadcasts.length})`}</SectionHeading>
        {broadcastsResult.error && (
          <p className="mb-3 text-caption text-danger">
            {`Could not load broadcasts: ${broadcastsResult.error}`}
          </p>
        )}
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                <Th>{"Name"}</Th>
                <Th>{"ID"}</Th>
                <Th>{"Status"}</Th>
                <Th>{"Created"}</Th>
                <Th>{"Scheduled"}</Th>
                <Th>{"Sent"}</Th>
              </tr>
            </thead>
            <tbody>
              {broadcastsResult.broadcasts.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-caption text-text">{b.name}</td>
                  <td className="px-3 py-2 font-mono text-caption text-text-muted">{shortId(b.id)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{b.status}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtTs(b.createdAt)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtTs(b.scheduledAt)}</td>
                  <td className="px-3 py-2 text-caption text-text-muted">{fmtTs(b.sentAt)}</td>
                </tr>
              ))}
              {broadcastsResult.broadcasts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-caption text-text-faint">
                    {"No broadcasts yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3 — Controls */}
        <SectionHeading>{"Send"}</SectionHeading>
        <div className="max-w-xl rounded-lg border border-border bg-surface p-4">
          <BroadcastControls options={options} />
          <p className="mt-4 text-caption text-text-muted">
            {"Send test to admin previews the selected broadcast to your admin inbox. Send broadcast to segment mails the whole Resend segment (managed unsubscribe). Content is authored in Resend, not here."}
          </p>
        </div>
      </div>
    </div>
  );
}
