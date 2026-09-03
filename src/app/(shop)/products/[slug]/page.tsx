import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  getAllProductSlugs,
  formatCents,
  type Product,
  type Pricing as ProductPricing,
  type FixedFormat,
  type SpecRow,
} from "@/lib/copy/products";
import { ProductHero, HeroStat, NmrSection, MechanismSection, ComparisonTable, Card } from "@/components/ui";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { OrderBlock } from "@/components/shop/OrderBlock";
import { UnderstandingSection } from "@/components/shop/UnderstandingSection";
import { cn } from "@/lib/utils/cn";
import type { CartFormat } from "@/lib/cart/types";

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

// Specs split into the live page's three columns. Chemical + storage/handling are ported
// from product.specs; Documentation is a fixed, compliance-safe column (COA framed as
// "on request", never "included" — ADR 0008 variant A).
const CHEMICAL_LABELS = ["Formula", "MW", "CAS", "Purity", "Form", "Solubility"];
const STORAGE_LABELS = ["Storage", "Stability", "Light", "Moisture", "Container"];

function specGroup(product: Product, labels: string[]): SpecRow[] {
  return labels
    .map((label) => product.specs.find((s) => s.label === label))
    .filter((s): s is SpecRow => s != null);
}

function SpecCard({
  icon,
  title,
  rows,
}: {
  icon: string;
  title: string;
  rows: { label: string; value: string; strong?: boolean }[];
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center gap-2.5">
        <span aria-hidden className="text-[18px] leading-none">
          {icon}
        </span>
        <h3 className="text-[16px] font-semibold text-text">{title}</h3>
      </div>
      <dl className="flex flex-col gap-y-2.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-4 border-b border-border-soft pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-small text-text-subtle">{r.label}</dt>
            <dd className={cn("font-mono text-[13px]", r.strong ? "font-semibold text-success" : "text-text")}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

// --- presentational pricing cells (design tokens only) ---

function PriceCard({
  sizeLabel,
  priceLabel,
  badge,
  discount,
  add,
}: {
  sizeLabel: string;
  priceLabel: string;
  badge?: string;
  discount?: string;
  add?: { productSlug: string; format: CartFormat; sizeLabel: string; priceCents: number };
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div>
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
      {add && (
        <div className="mt-3">
          <AddToCartButton
            productSlug={add.productSlug}
            format={add.format}
            sizeLabel={add.sizeLabel}
            priceCents={add.priceCents}
            variant="secondary"
          />
        </div>
      )}
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

function formatCard(f: FixedFormat, productSlug: string) {
  return (
    <PriceCard
      key={f.sku}
      sizeLabel={f.sizeLabel}
      priceLabel={formatCents(f.priceCents)}
      badge={f.format === "capsules" ? "Capsules" : "Powder"}
      add={{ productSlug, format: f.format, sizeLabel: f.sizeLabel, priceCents: f.priceCents }}
    />
  );
}

function Pricing({ pricing, productSlug }: { pricing: ProductPricing; productSlug: string }) {
  if (pricing.kind === "fixed") {
    return (
      <div className="flex flex-col gap-8">
        <PriceGroup heading="Sizes">{pricing.formats.map((f) => formatCard(f, productSlug))}</PriceGroup>
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
          <PriceCard
            key={t.sizeLabel}
            sizeLabel={t.sizeLabel}
            priceLabel={formatCents(t.priceCents)}
            add={{ productSlug, format: "powder", sizeLabel: t.sizeLabel, priceCents: t.priceCents }}
          />
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
        <PriceGroup heading="Capsules">
          {pricing.formats.map((f) => formatCard(f, productSlug))}
        </PriceGroup>
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

  // Hero stats are data-driven (A15 ports the live trio); other products fall back to
  // the Purity/MW pair so they keep working unchanged.
  const heroStats =
    product.heroStats ??
    [
      ...(purity ? [{ figure: purity, label: "Purity" }] : []),
      ...(mw ? [{ figure: mw, label: "Molecular weight" }] : []),
    ];

  return (
    <main>
      <ProductHero
        kicker={product.categorySubtitle}
        title={product.name}
        subtitle={
          product.heroSubtitle ??
          (product.heroHighlights ? specValue(product, "Formula") : undefined)
        }
        body={product.description}
        cta={
          product.heroCtas && product.heroCtas.length > 0 ? (
            // Data-driven hero CTAs (per product). Button renders a <button>; a <button>
            // nested in an <a> is invalid HTML, so the anchors carry the locked Button
            // variant classes directly (kept in sync with Button.tsx — system is locked).
            // First CTA = primary, remaining = ghost.
            <div className="mb-2 flex flex-wrap gap-3">
              {product.heroCtas.map((c, i) =>
                i === 0 ? (
                  <a
                    key={c.href}
                    href={c.href}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
                  >
                    {c.label}
                  </a>
                ) : (
                  <a
                    key={c.href}
                    href={c.href}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-surface px-[22px] py-3 text-[15px] font-semibold text-primary-deep transition hover:border-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
                  >
                    {c.label}
                  </a>
                ),
              )}
            </div>
          ) : undefined
        }
        stats={
          <>
            {product.heroBadges && product.heroBadges.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.heroBadges.map((b) => (
                  <span
                    key={b.label}
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]",
                      b.tone === "success"
                        ? "bg-success/10 text-success"
                        : "bg-cyan-50 text-accent-strong",
                    )}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            )}
            {heroStats.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-10">
                {heroStats.map((s) => (
                  <HeroStat key={s.label} figure={s.figure} label={s.label} />
                ))}
              </div>
            )}
            {product.heroHighlights && product.heroHighlights.length > 0 && (
              <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-border pt-8 sm:grid-cols-2">
                {product.heroHighlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-small text-text-muted">
                    <span aria-hidden className="mt-px font-semibold text-success">
                      {"✓"}
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        }
        formula={
          <>
            {product.assets?.formulaSvg ? (
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
            )}
            {product.formulaCaption && (
              <p className="mt-3 text-center font-mono text-[11px] text-text-faint">
                {product.formulaCaption}
              </p>
            )}
          </>
        }
      />

      {/* Order block — A15 (per-gram-tiered w/ calculator bounds) gets the live calculator;
          fixed products with formats get the rich single-card FixedSizeSelector. Anything
          OrderBlock can't handle falls back to the discrete PriceCard grid. */}
      <div id="order" className="mx-auto max-w-[--container-page] px-8 py-16">
        <section>
          <h2 className="mb-6 text-h3 font-semibold">{"Order"}</h2>
          {product.pricing.kind === "per-gram-tiered" &&
          product.pricing.trials.some((t) => t.mg != null) ? (
            <OrderBlock
              productSlug={product.slug}
              productName={product.name}
              subtitle={product.categorySubtitle}
              purity={purity}
              trials={product.pricing.trials}
              tiers={product.pricing.tiers}
              capsules={product.pricing.formats}
              perks={product.trustBullets}
            />
          ) : product.pricing.kind === "fixed" && product.pricing.formats.length > 0 ? (
            <OrderBlock
              productSlug={product.slug}
              productName={product.name}
              subtitle={product.categorySubtitle}
              purity={purity}
              fixedFormats={product.pricing.formats}
              perks={product.trustBullets}
            />
          ) : (
            <Pricing pricing={product.pricing} productSlug={product.slug} />
          )}
        </section>
      </div>

      {/* A15: bespoke deep "Understanding" section, with the dark MechanismSection
          embedded in its live position (block 4D). Other products fall back to the
          standalone MechanismSection (none currently carry `understanding`). */}
      {product.understanding && product.mechanism ? (
        <UnderstandingSection
          content={product.understanding}
          mechanism={
            <MechanismSection
              kicker={product.mechanism.kicker}
              title={product.mechanism.title}
              body={product.mechanism.body}
              steps={product.mechanism.steps}
              quote={product.mechanism.quote}
            />
          }
        />
      ) : (
        product.mechanism && (
          // `id="science"` anchors the hero "The Science" CTA (Original). MechanismSection
          // renders its own <section>, so the id lives on a wrapper here.
          <div id="science">
            <MechanismSection
              kicker={product.mechanism.kicker}
              title={product.mechanism.title}
              body={product.mechanism.body}
              steps={product.mechanism.steps}
              quote={product.mechanism.quote}
            />
          </div>
        )
      )}

      {/* "Key research findings" (ZZL-7) — a lightweight heading + icon-card grid.
          Sits between the science/mechanism section and the comparison, matching the
          live order (science → findings → comparison). Other products omit `findings`. */}
      {product.findings && (
        <section className="mx-auto max-w-[--container-page] px-8 py-16">
          <h2 className="mb-8 text-center text-h2 font-bold">{product.findings.heading}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {product.findings.cards.map((c) => (
              <Card key={c.title} className="flex flex-col items-start gap-3.5 border-l-4 border-l-accent">
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-[18px] leading-none"
                >
                  {c.icon ?? "🔬"}
                </span>
                <div>
                  <strong className="mb-1.5 block text-[15px] font-semibold text-text">
                    {c.title}
                  </strong>
                  <p className="text-small leading-[1.7] text-text-subtle">{c.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {product.comparison && (
        <section className="mx-auto max-w-[--container-page] px-8 py-16">
          <h2 className="mb-8 text-center text-h2 font-bold">{product.comparison.heading}</h2>
          <ComparisonTable
            columns={product.comparison.columns}
            rows={product.comparison.rows.map((r) => ({
              label: r.label,
              cells: r.cells.map((cell) => ({
                value:
                  cell.tone === "favorable" ? (
                    <span className="font-semibold text-success">{cell.value}</span>
                  ) : cell.tone === "unfavorable" ? (
                    <span className="font-semibold text-danger">{cell.value}</span>
                  ) : (
                    cell.value
                  ),
              })),
            }))}
          />
          <Card className="mt-8 border-l-4 border-l-accent">
            <p className="text-body text-text-muted">
              <span aria-hidden className="mr-2">
                {"💡"}
              </span>
              {product.comparison.callout}
            </p>
          </Card>
        </section>
      )}

      <div className="mx-auto flex max-w-[--container-page] flex-col gap-16 px-8 py-16">
        {product.assets?.spectra && (
          <section>
            <h2 className="mb-3 text-center text-h3 font-semibold">{"NMR characterization"}</h2>
            <p className="mb-6 mx-auto max-w-[70ch] text-center text-body text-text-muted">
              {"Every batch is characterised by ¹H and ¹³C NMR. We publish both the processed spectra and the raw FID data so any researcher can independently verify the structure and purity of what they receive — compatible with MestReNova, TopSpin, and other standard NMR software. COA available per batch on request."}
            </p>
            <NmrSection
              spectra={product.assets.spectra}
              downloads={product.assets.downloads}
              fidBanner={
                product.assets.downloads && product.assets.downloads.length > 0
                  ? {
                      heading: "Download raw FID data",
                      body:
                        "We don't just show you pictures. Download the original spectrometer output and process it yourself in MestReNova, TopSpin, or any compatible NMR software. Every peak, every integration — fully verifiable.",
                    }
                  : undefined
              }
            />
          </section>
        )}

        <section>
          <h2 className="mb-6 text-h3 font-semibold">{"Technical specifications"}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SpecCard
              icon="🧪"
              title="Chemical properties"
              rows={specGroup(product, CHEMICAL_LABELS).map((s) => ({
                label: s.label,
                value: s.value,
                strong: s.label === "Purity",
              }))}
            />
            <SpecCard
              icon="📦"
              title="Storage & handling"
              rows={specGroup(product, STORAGE_LABELS)}
            />
            <SpecCard
              icon="📋"
              title="Documentation"
              rows={[
                { label: "COA", value: "On request", strong: true },
                ...(product.assets?.spectra
                  ? [
                      { label: "¹H NMR", value: "Available", strong: true },
                      { label: "¹³C NMR", value: "Available", strong: true },
                    ]
                  : []),
                { label: "Safety data", value: "Provided", strong: true },
              ]}
            />
          </div>
        </section>

        <section>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2">
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
