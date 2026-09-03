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
import { ProductHero, HeroStat, NmrSection, MechanismSection, Card } from "@/components/ui";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { OrderBlock } from "@/components/shop/OrderBlock";
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

// Research-application card icons (keyed by ported heading; safe emoji fallback).
function educationIcon(heading: string): string {
  const h = heading.toLowerCase();
  if (h.includes("aging")) return "🧠";
  if (h.includes("injury")) return "🛡️";
  if (h.includes("disorder") || h.includes("eif2b")) return "🧬";
  if (h.includes("window") || h.includes("isr")) return "🔬";
  return "🔬";
}

// Specs split into the live page's three columns. Chemical + storage/handling are ported
// from product.specs; Documentation is a fixed, compliance-safe column (COA framed as
// "on request", never "included" — ADR 0008 variant A).
const CHEMICAL_LABELS = ["Formula", "MW", "CAS", "Purity", "Form", "Solubility"];
const STORAGE_LABELS = ["Storage", "Stability", "Container"];

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

  return (
    <main>
      <ProductHero
        kicker={product.categorySubtitle}
        title={product.name}
        body={product.description}
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

      {/* Order block — A15 (per-gram-tiered w/ calculator bounds) gets the live calculator;
          fixed products keep the discrete PriceCard grid. */}
      <div className="mx-auto max-w-[--container-page] px-8 py-16">
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
          ) : (
            <Pricing pricing={product.pricing} productSlug={product.slug} />
          )}
        </section>
      </div>

      {product.mechanism && (
        <MechanismSection
          kicker={product.mechanism.kicker}
          title={product.mechanism.title}
          body={product.mechanism.body}
          steps={product.mechanism.steps}
          quote={product.mechanism.quote}
        />
      )}

      <div className="mx-auto flex max-w-[--container-page] flex-col gap-16 px-8 py-16">
        {product.education && (
          <section>
            <h2 className="mb-6 text-h3 font-semibold">{"Research applications"}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {product.education.map((b) => (
                <Card key={b.heading} accent className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-[20px]"
                  >
                    {educationIcon(b.heading)}
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-text">{b.heading}</h3>
                    <p className="mt-2 text-body text-text-muted">{b.body}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {product.assets?.spectra && (
          <section>
            <h2 className="mb-3 text-h3 font-semibold">{"NMR characterization"}</h2>
            <p className="mb-6 max-w-[70ch] text-body text-text-muted">
              {"Every batch is characterised by ¹H and ¹³C NMR. We publish both the processed spectra and the raw FID data so any researcher can independently verify the structure and purity of what they receive — compatible with MestReNova, TopSpin, and other standard NMR software. COA available per batch on request."}
            </p>
            <NmrSection spectra={product.assets.spectra} downloads={product.assets.downloads} />
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
