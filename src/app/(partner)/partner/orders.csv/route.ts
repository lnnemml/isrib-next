// ADR 0025 — the partner's own orders as a download, scoped by the session and limited to the same
// whitelisted, masked rows as the dashboard.

import { affiliatesEnabled } from "@/lib/affiliate/flag";
import { getPartnerOrders, partnerOrdersCsv } from "@/lib/affiliate/partner-queries";
import { getCurrentAffiliate } from "@/lib/affiliate/session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!affiliatesEnabled()) return new Response(null, { status: 404 });

  const affiliate = await getCurrentAffiliate();
  if (!affiliate) return new Response(null, { status: 401 });

  return new Response(partnerOrdersCsv(await getPartnerOrders(affiliate.id)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="isrib-partner-orders.csv"',
      "Cache-Control": "no-store",
    },
  });
}
