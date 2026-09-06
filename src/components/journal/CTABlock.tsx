"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";

// Primary Button variant classes from the shop DS (Button.tsx). The DS Button renders
// a <button>; for internal navigation we apply the same primary styling to a Next <Link>.
const PRIMARY_LINK_CLASSES =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35 max-sm:w-full";

// Ported from the SEO hub CTABlock, restyled onto the locked shop design system.
// The link now targets the INTERNAL product route (was https://isrib.shop/...).
// Copy is honest and compliant: no money-back guarantee, no cancer/dementia claims.
export default function CTABlock() {
  function handleCTAClick() {
    trackEvent("journal_cta_click", { cta_location: "article_bottom" });
  }

  return (
    <div className="mt-12 max-w-[42rem] rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-8 shadow-sm">
      <h3 className="mb-2 text-[1.375rem] font-semibold leading-[1.25] tracking-[-0.01em] text-text">
        Where to buy ISRIB A15
      </h3>

      <p className="mb-1 text-[15px] text-text-muted">
        In-house synthesized · 98%+ purity · Research compound
      </p>

      <p className="mb-5 text-[13px] text-text-subtle">
        Individual results vary. For research purposes only.
      </p>

      <Link href="/products/isrib-a15" onClick={handleCTAClick} className={PRIMARY_LINK_CLASSES}>
        Buy ISRIB A15 →
      </Link>
    </div>
  );
}
