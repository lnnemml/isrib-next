import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { affiliatesEnabled } from "@/lib/affiliate/flag";

export const metadata: Metadata = {
  title: "Partner",
  robots: { index: false, follow: false },
};

// The flag is read per request, so nothing here may be prerendered.
export const dynamic = "force-dynamic";

export default function PartnerLayout({ children }: { children: ReactNode }) {
  if (!affiliatesEnabled()) notFound();
  return <div className="min-h-screen bg-surface-soft">{children}</div>;
}
