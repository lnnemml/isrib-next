import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { getReferralOverview } from "@/lib/customer/referrals";
import { StatusBadge } from "../statusBadge";
import { CopyButton } from "./CopyButton";

export const metadata: Metadata = {
  title: "Referral program",
  robots: { index: false, follow: false },
};

// Reads the logged-in customer + their referral data (PII) — never statically rendered.
export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Reward-status chip for the history table (locked tokens only).
function RewardBadge({ status }: { status: "pending" | "available" | "redeemed" }) {
  const base =
    "inline-block rounded-full px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em]";
  if (status === "available") {
    return <span className={`${base} bg-success/10 text-success`}>{"Available"}</span>;
  }
  if (status === "redeemed") {
    return <span className={`${base} bg-surface-soft text-text-muted`}>{"Redeemed"}</span>;
  }
  return <span className={`${base} bg-surface-soft text-text-faint`}>{"Pending"}</span>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-3 py-2 font-mono text-caption font-medium uppercase tracking-[0.06em] text-text-faint ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// Known order statuses (mirrors statusBadge's union) — used to decide whether the
// referred order's status can render as a StatusBadge chip.
const ORDER_STATUSES = new Set([
  "pending_payment_instructions",
  "awaiting_payment",
  "paid",
  "fulfilled",
  "cancelled",
]);

export default async function AccountReferralsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null; // layout guard redirects

  const overview = await getReferralOverview(customer);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h2 font-semibold text-text">{"Referral program"}</h1>
        <Link
          href="/account"
          className="text-small font-semibold text-primary transition hover:opacity-80"
        >
          {"← Back to account"}
        </Link>
      </div>

      {/* Your code + share link */}
      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
          {"Your referral code"}
        </h2>

        {overview.code ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-h3 font-semibold tracking-[0.04em] text-text">
                {overview.code}
              </span>
              <CopyButton value={overview.code} label="referral code" />
            </div>

            {overview.shareUrl ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-soft px-3 py-2">
                <span className="min-w-0 break-all font-mono text-caption text-text-muted">
                  {overview.shareUrl}
                </span>
                <CopyButton value={overview.shareUrl} label="share link" />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-small text-text-muted">
            {"Your referral code is being generated. Check back shortly."}
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
          {"How it works"}
        </h2>
        <ol className="mt-4 space-y-2 text-small text-text-muted">
          <li>{"Share your link."}</li>
          <li>
            {
              "They get 10% off their order (on manual-payment orders; crypto orders already include the 10% discount)."
            }
          </li>
          <li>{"You get 10% off a future order once their order is paid."}</li>
        </ol>
      </div>

      {/* Available rewards */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
            {"Available rewards"}
          </h2>
          {overview.redeemedCreditCount > 0 ? (
            <span className="text-caption text-text-faint">
              {`${overview.redeemedCreditCount} redeemed`}
            </span>
          ) : null}
        </div>

        {overview.availableCredits.length === 0 ? (
          <p className="mt-4 text-small text-text-muted">{"No rewards yet."}</p>
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {overview.availableCredits.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-soft px-3 py-2"
                >
                  <span className="text-small text-text">
                    {`${c.discountPct}% off a future order`}
                  </span>
                  <span className="inline-block rounded-full bg-success/10 px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.06em] text-success">
                    {"Available"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-caption text-text-faint">
              {
                "Rewards apply automatically at checkout on manual-payment orders. They are preserved on crypto orders, which already include the 10% discount."
              }
            </p>
          </>
        )}
      </div>

      {/* Referral history */}
      <div className="mt-6">
        <h2 className="font-mono text-mono-label font-medium uppercase tracking-[0.12em] text-text-subtle">
          {"Referral history"}
        </h2>

        {overview.history.length === 0 ? (
          <div className="mt-3 rounded-lg border border-border bg-surface px-4 py-8 text-center text-small text-text-muted">
            {"No referrals yet."}
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[560px]">
              <thead className="border-b border-border bg-surface-soft">
                <tr>
                  <Th>{"Date"}</Th>
                  <Th>{"Referred"}</Th>
                  <Th>{"Order"}</Th>
                  <Th>{"Reward"}</Th>
                </tr>
              </thead>
              <tbody>
                {overview.history.map((h, i) => (
                  <tr
                    key={`${h.orderNumber ?? "row"}-${i}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2 text-caption text-text-muted">
                      {fmtDate(h.orderedAt)}
                    </td>
                    <td className="px-3 py-2 font-mono text-caption text-text-muted">
                      {h.referredEmail}
                    </td>
                    <td className="px-3 py-2 text-caption">
                      {h.orderStatus && ORDER_STATUSES.has(h.orderStatus) ? (
                        <StatusBadge
                          status={
                            h.orderStatus as
                              | "pending_payment_instructions"
                              | "awaiting_payment"
                              | "paid"
                              | "fulfilled"
                              | "cancelled"
                          }
                        />
                      ) : (
                        <span className="text-text-faint">{"—"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-caption">
                      <RewardBadge status={h.rewardStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
