import type { Metadata } from "next";
import { getAllProducts } from "@/lib/copy/products";
import { Button, Card } from "@/components/ui";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomeProductCard } from "@/components/marketing/HomeProductCard";
import { HomeAbout } from "@/components/marketing/HomeAbout";

// Homepage metadata — mirrors the live index.html <title>/<description>, adapted to the
// new brand line. (No money-back / cancer / dementia claims; "guaranteed purity" is a
// quality claim, permitted.)
export function generateMetadata(): Metadata {
  return {
    title: "ISRIB Shop — Advanced Research Chemicals",
    description:
      "Advanced research chemicals for scientific innovation. ISRIB A15, ISRIB, ZZL-7, MPEP and more — 98%+ purity, NMR verified, worldwide shipping.",
  };
}

// Trust indicators — verbatim from the live #trust block.
const TRUST: { icon: string; title: string; body: string }[] = [
  {
    icon: "🌍",
    title: "Shipped worldwide",
    body: "Delivered to 50+ countries since 2020. Average delivery 7–12 business days. Every order ships with tracking.",
  },
  {
    icon: "📄",
    title: "Full documentation",
    body: "Every order includes a batch-specific Certificate of Analysis. ¹H and ¹³C NMR spectra available on request. Raw FID data downloadable.",
  },
  {
    icon: "🔬",
    title: "Independent QC",
    body: "NMR verification performed by an independent third-party spectroscopist — not self-reported. Externally confirmed purity on every batch.",
  },
];

// How-to-order steps — verbatim EXCEPT step 3 omits "PayPal" (the new flow is crypto +
// manual arrangement; see report flag).
const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Choose product",
    body: "Browse our catalog and select the compound and quantity you need.",
  },
  {
    n: "2",
    title: "Add to cart",
    body: "Select your desired amount and add products to your cart for instant checkout.",
  },
  {
    n: "3",
    title: "Pay & ship",
    body: "Choose from Bitcoin, USDT, Wise, or SWIFT. Order confirmed within 24h, shipped discreetly with tracking.",
  },
];

// FAQ preview — verbatim Q&A from the live #faq block. Links deep-link into /faq
// (not built yet — these 404 until the FAQ page is ported; see report flag).
const FAQS: { q: string; a: string; anchor: string }[] = [
  {
    q: "What is ISRIB A15?",
    a: "A next-gen ISRIB analogue with improved bioavailability & potency.",
    anchor: "isrib-a15",
  },
  {
    q: "How do I place an order?",
    a: "Place items in cart and proceed to checkout. Simple and fast.",
    anchor: "how-to-order",
  },
  {
    q: "What payment methods do you accept?",
    a: "Crypto, Wise, SEPA/SWIFT, USDT, and other secure options.",
    anchor: "payments",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, to 50+ countries with discreet packaging.",
    anchor: "international-shipping",
  },
  {
    q: "Is there a Certificate of Analysis?",
    a: "Yes, provided with every order.",
    anchor: "coa",
  },
  {
    q: "What purity levels do you guarantee?",
    a: "All compounds are ≥98% purity verified by independent labs.",
    anchor: "purity",
  },
  {
    q: "How long does shipping take?",
    a: "5–15 business days depending on destination country.",
    anchor: "shipping-times",
  },
  {
    q: "Can I get custom quantities?",
    a: "Yes, contact us for custom synthesis and bulk orders.",
    anchor: "custom-orders",
  },
];

export default function HomePage() {
  const products = getAllProducts();

  return (
    <main>
      {/* A — HERO */}
      <HomeHero />

      {/* B — FEATURED PRODUCTS */}
      <section id="products" className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <div className="mb-12 text-center">
          <h2 className="text-h2 font-bold text-text">{"Featured research compounds"}</h2>
          <p className="mt-3 text-body text-text-muted">
            {"Explore cutting-edge molecules — tap any product to learn more"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p) => (
            <HomeProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <a
            href="/products"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-surface px-[22px] py-3 text-[15px] font-semibold text-primary-deep transition hover:border-primary hover:bg-surface-soft"
          >
            {"See all products →"}
          </a>
        </div>
      </section>

      {/* C — ABOUT / In-house synthesis */}
      <div className="border-y border-border bg-surface-soft">
        <HomeAbout />
      </div>

      {/* D — TRUST indicators */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <h2 className="mb-12 text-center text-h2 font-bold text-text">
          {"Why researchers trust us"}
        </h2>
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-3">
          {TRUST.map((t) => (
            <Card key={t.title} className="flex flex-col">
              <span className="mb-4 text-[32px] leading-none">{t.icon}</span>
              <h3 className="mb-2 text-h3 font-semibold text-text">{t.title}</h3>
              <p className="text-small leading-[1.6] text-text-muted">{t.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* E — HOW TO ORDER */}
      <div className="border-y border-border bg-surface-soft">
        <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
          <h2 className="mb-12 text-center text-h2 font-bold text-text">{"How to order"}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="flex flex-col">
                <span className="mb-4 flex size-[34px] items-center justify-center rounded-[9px] bg-primary font-mono text-[15px] font-semibold text-white">
                  {s.n}
                </span>
                <h3 className="mb-2 text-h3 font-semibold text-text">{s.title}</h3>
                <p className="text-small leading-[1.6] text-text-muted">{s.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="/products">
              <Button variant="primary">{"Start your order"}</Button>
            </a>
          </div>
        </section>
      </div>

      {/* F — FAQ preview */}
      <section id="faq" className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <h2 className="mb-12 text-center text-h2 font-bold text-text">
          {"Frequently asked questions"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FAQS.map((f) => (
            <a
              key={f.anchor}
              href={`/faq#${f.anchor}`}
              className="block rounded-lg border border-border bg-surface-soft p-6 transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/35"
            >
              <div className="mb-1.5 text-[17px] font-semibold text-text">{f.q}</div>
              <p className="text-small leading-[1.6] text-text-muted">{f.a}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
