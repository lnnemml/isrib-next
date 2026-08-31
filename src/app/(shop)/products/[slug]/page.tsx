import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  getAllProductSlugs,
  formatCents,
  type Product,
  type Pricing as ProductPricing,
  type FixedFormat,
} from "@/lib/copy/products";
import { Button, ProductHero, HeroStat, NmrSection } from "@/components/ui";

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | ISRIB A15`,
    description: product.categorySubtitle,
  };
}

function specValue(product: Product, label: string): string | undefined {
  return product.specs.find((s) => s.label === label)?.value;
}

// --- presentational pricing cells (design tokens only) ---

function PriceCard({
  sizeLabel,
  priceLabel,
  badge,
  discount,
}: {
  sizeLabel: string;
  priceLabel: string;
  badge?: string;
  discount?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[14px] text-text">{sizeLabel}</span>
        {badge && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-text-faint">
            {badge}
          </span>
        )}
        {discount && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-success">
            {discount}
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-[20px] font-semibold text-text">{priceLabel}</div>
    </div>
  );
}

function PriceGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint">
        {heading}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function formatCard(f: FixedFormat) {
  return (
    <PriceCard
      key={f.sku}
      sizeLabel={f.sizeLabel}
      priceLabel={formatCents(f.priceCents)}
      badge={f.format === "capsules" ? "Capsules" : "Powder"}
    />
  );
}

function Pricing({ pricing }: { pricing: ProductPricing }) {
  if (pricing.kind === "fixed") {
    return (
      <div className="flex flex-col gap-8">
        <PriceGroup heading="Sizes">{pricing.formats.map(formatCard)}</PriceGroup>
        {pricing.tiers && (
          <PriceGroup heading="Bulk (per gram)">
            {pricing.tiers.map((t) => (
              <PriceCard
                key={t.rangeLabel}
                sizeLabel={t.rangeLabel}
                priceLabel={`${formatCents(t.perGramCents)}/g`}
                discount={t.discountPct > 0 ? `Save ${t.discountPct}%` : undefined}
              />
            ))}
          </PriceGroup>
        )}
      </div>
    );
  }

  // per-gram-tiered (ISRIB Original) — tiers rendered as display cards only.
  return (
    <div className="flex flex-col gap-8">
      <PriceGroup heading="Trial sizes">
        {pricing.trials.map((t) => (
          <PriceCard key={t.sizeLabel} sizeLabel={t.sizeLabel} priceLabel={formatCents(t.priceCents)} />
        ))}
      </PriceGroup>
      <PriceGroup heading="Per-gram pricing">
        {pricing.tiers.map((t) => (
          <PriceCard
            key={t.rangeLabel}
            sizeLabel={t.rangeLabel}
            priceLabel={`${formatCents(t.perGramCents)}/g`}
            discount={t.discountPct > 0 ? `Save ${t.discountPct}%` : undefined}
          />
        ))}
      </PriceGroup>
      {pricing.formats && (
        <PriceGroup heading="Capsules">{pricing.formats.map(formatCard)}</PriceGroup>
      )}
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const purity = specValue(product, "Purity");
  const mw = specValue(product, "MW");

  return (
    <main>
      <ProductHero
        kicker={product.categorySubtitle}
        title={product.name}
        body={product.description}
        cta={<Button variant="primary">{`Order ${product.name}`}</Button>}
        stats={
          <div className="mt-8 flex gap-10">
            {purity && <HeroStat figure={purity} label="Purity" />}
            {mw && <HeroStat figure={mw} label="Molecular weight" />}
          </div>
        }
        formula={
          product.assets?.formulaSvg ? (
            // eslint-disable-next-line @next/next/no-img-element -- static SVG asset
            <img
              src={product.assets.formulaSvg}
              alt={`${product.name} molecular structure`}
              className="block h-auto w-full"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center font-mono text-[13px] text-text-faint">
              {"Structure diagram — coming soon"}
            </div>
          )
        }
      />

      <div className="mx-auto flex max-w-[--container-page] flex-col gap-16 px-8 py-16">
        <section>
          <h2 className="mb-6 text-h3 font-semibold">{"Pricing"}</h2>
          <Pricing pricing={product.pricing} />
        </section>

        {product.assets?.spectra && (
          <section>
            <h2 className="mb-6 text-h3 font-semibold">{"NMR characterization"}</h2>
            <NmrSection spectra={product.assets.spectra} downloads={product.assets.downloads} />
          </section>
        )}

        <section>
          <h2 className="mb-6 text-h3 font-semibold">{"Specifications"}</h2>
          <div className="rounded-xl border border-border bg-surface p-[26px] shadow-sm">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {product.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border-soft pb-2"
                >
                  <dt className="text-small text-text-subtle">{s.label}</dt>
                  <dd className="font-mono text-[13px] text-text">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {product.trustBullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-small text-text-muted">
                <span className="size-1.5 rounded-full bg-accent" />
                {b}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
