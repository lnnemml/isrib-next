import { type Product, formatCents } from "@/lib/copy/products";
import { getCatalogOptions } from "@/lib/copy/catalog";

// Homepage "Featured research compounds" card — a lighter variant of the /products
// catalog card: NO inline add-to-cart, just browse → detail. Design tokens only.
//
// Compliance choices (per task + ADR 0008):
//  - subtitle + description come from typed DATA (product.categorySubtitle /
//    product.description), NOT the live homepage's efficacy-heavy card copy.
//  - badges only for the two the live homepage flags: A15 → "Most popular",
//    N-Acetyl-Bromantane → "Premium".
//  - the whole card is a link to the detail page (stretched-link pattern), while the
//    inner "View details" span stays keyboard-focusable via the wrapping <a>.
interface HomeProductCardProps {
  product: Product;
}

// Slug → accent badge label (only these two carry a badge on the live homepage).
const BADGE_BY_SLUG: Record<string, string> = {
  "isrib-a15": "Most popular",
  "n-acetyl-bromantane": "Premium",
};

export function HomeProductCard({ product }: HomeProductCardProps) {
  const options = getCatalogOptions(product);
  const minPriceCents = options.reduce(
    (min, o) => (o.priceCents < min ? o.priceCents : min),
    options[0]?.priceCents ?? 0,
  );
  const badge = BADGE_BY_SLUG[product.slug];
  const href = `/products/${product.slug}`;

  return (
    <a
      href={href}
      className="group relative flex h-full flex-col rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-6 shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
    >
      {/* Formula box — small bordered slot echoing the product hero panel. */}
      <div className="mb-5 flex aspect-[3/2] items-center justify-center rounded-lg border border-border bg-surface-soft p-4">
        {product.assets?.formulaSvg ? (
          // eslint-disable-next-line @next/next/no-img-element -- static SVG asset
          <img
            src={product.assets.formulaSvg}
            alt={`${product.name} molecular structure`}
            className="block max-h-full w-auto"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="font-mono text-[12px] text-text-faint">{"Structure — coming soon"}</span>
        )}
      </div>

      {/* Name + optional badge. */}
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="text-[19px] font-semibold text-text">{product.name}</h3>
        {badge && (
          <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-accent-strong">
            {badge}
          </span>
        )}
      </div>

      {/* Data-driven subtitle (consistent with detail pages, not the live card copy). */}
      <p className="text-small text-text-muted">{product.categorySubtitle}</p>

      {/* Clean data description — deliberately NOT the live efficacy-heavy card copy. */}
      <p className="mt-3 text-small leading-[1.6] text-text-subtle">{product.description}</p>

      {/* "From $X" min price + View details, pinned to the card foot. */}
      <div className="mt-auto flex items-baseline justify-between gap-3 pt-5">
        <p className="text-small text-text-subtle">
          {"From "}
          <span className="font-mono text-[16px] font-semibold text-primary-deep">
            {formatCents(minPriceCents)}
          </span>
        </p>
        <span className="text-[14px] font-semibold text-slate-700 transition group-hover:text-primary">
          {"View details →"}
        </span>
      </div>
    </a>
  );
}
