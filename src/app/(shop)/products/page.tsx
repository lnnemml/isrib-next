import type { Metadata } from "next";
import { getAllProducts } from "@/lib/copy/products";
import { ProductCard } from "@/components/shop/ProductCard";

// Catalog subtitle — reused as both the on-page intro line and the metadata description
// (uses "·" separators, matching the live products.html hero copy).
const CATALOG_SUBTITLE = "Research-grade chemical catalog · 98%+ purity · worldwide shipping";

export function generateMetadata(): Metadata {
  return {
    title: "Products | ISRIB A15",
    description: CATALOG_SUBTITLE,
  };
}

export default function ProductsPage() {
  const products = getAllProducts();

  return (
    <main>
      {/* Hero / intro — compact, design-system page-title treatment. */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"ISRIB Shop Products"}
          </h1>
          <p className="mt-3 text-body text-text-muted">{CATALOG_SUBTITLE}</p>
        </div>
      </section>

      {/* Flat responsive grid — faithful to the live single-grid catalog (no filters). */}
      <section className="mx-auto max-w-[--container-page] px-8 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
