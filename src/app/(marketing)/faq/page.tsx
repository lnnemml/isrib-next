import type { Metadata } from "next";
import { Button, Card, FaqAccordion } from "@/components/ui";

// FAQ page — faithful port of the live faq.html on the locked design system.
// Header/Footer are global (root layout). Q&A copy is VERBATIM from faq.html; each item
// carries the live anchor id so /faq#<id> deep links resolve, and the locked
// FaqAccordion auto-opens the hash-matched item on load.
//
// Compliance flags (ported verbatim, surfaced for LEAD/Anton review):
//  (a) "What is ISRIB A15?" — "potentially restoring cognitive function that has been
//      impaired by stress, aging, or injury"; "How does ISRIB work?" ends
//      "...potentially restore cognitive abilities" (hedged efficacy).
//  (b) "lost or damaged" — "a replacement at no extra cost" (reshipment policy,
//      adjacent to the no-money-back-guarantee rule).
//  The COA Q&A below is framed "on request" (never "included") per variant A.
const HERO_SUBTITLE =
  "Find answers about ISRIB, ordering, shipping, and our research-grade quality standards.";

export function generateMetadata(): Metadata {
  return {
    title: "FAQ | ISRIB A15",
    description: HERO_SUBTITLE,
  };
}

type Faq = { id: string; q: string; a: string };
type Category = { heading: string; subtitle: string; items: Faq[] };

const CATEGORIES: Category[] = [
  {
    heading: "🧬 Product Questions",
    subtitle: "Everything about ISRIB / ISRIB-A15, purity, safety, and storage.",
    items: [
      {
        id: "isrib-a15",
        q: "What is ISRIB A15?",
        a: "ISRIB A15 is an enhanced analogue of the original ISRIB compound, designed with improved bioavailability and potency. It targets the eIF2B complex to inhibit the integrated stress response (ISR), potentially restoring cognitive function that has been impaired by stress, aging, or injury. A15 is specifically optimized for oral administration and research applications.",
      },
      {
        id: "how-does-work",
        q: "How does ISRIB work?",
        a: "ISRIB works by targeting the integrated stress response (ISR) in cells. When neurons are under stress, the ISR acts like a brake on protein synthesis, which is essential for memory formation. ISRIB releases this brake by enhancing eIF2B function, allowing neurons to resume normal protein production and potentially restore cognitive abilities.",
      },
      {
        id: "difference-a15",
        q: "What's the difference between ISRIB and ISRIB A15?",
        a: "ISRIB A15 is a more potent analog with enhanced pharmacokinetic properties. While the original ISRIB requires larger doses and has limited oral bioavailability, A15 achieves similar effects at lower doses (5–15 mg vs 50+ mg) and is better suited for oral administration. A15 also has improved stability and solubility.",
      },
      {
        id: "purity",
        q: "What purity levels do you guarantee?",
        a: "All our compounds are ≥98% purity, verified through independent third-party testing using HPLC, NMR, and mass spectrometry.",
      },
      {
        // Added so the homepage /faq#coa deep-link resolves. Framed "on request"
        // (variant A) — never "included".
        id: "coa",
        q: "Is there a Certificate of Analysis?",
        a: "A batch-specific Certificate of Analysis is available on request for every order. Identity and purity are confirmed by ¹H and ¹³C NMR before any batch ships; raw FID data is available for independent verification.",
      },
      {
        id: "safety",
        q: "Are these compounds safe?",
        a: "These are research chemicals intended for laboratory use only. While animal studies have shown promising safety profiles, these compounds have not been approved for human consumption. Handle only by qualified researchers following proper safety protocols.",
      },
      {
        id: "storage",
        q: "How should I store these compounds?",
        a: "Store at −20 °C in a dry, light-protected environment. Use desiccant to prevent moisture. Allow vials to reach room temperature before opening to avoid condensation. Properly stored compounds maintain stability for 2+ years.",
      },
    ],
  },
  {
    heading: "🛒 Ordering & Payment",
    subtitle: "How to order, what we accept, and invoices for institutions.",
    items: [
      {
        id: "how-to-order",
        q: "How do I place an order?",
        a: "Add products to cart and proceed to checkout — no account required. We'll confirm shipping details and finalize payment after checkout.",
      },
      {
        id: "payments",
        q: "What payment methods do you accept?",
        a: "Cryptocurrency (USDT, BTC), bank transfers (SEPA/SWIFT), and Wise. We arrange the method individually for speed and privacy.",
      },
      {
        id: "custom-orders",
        q: "Can I get a custom quantity?",
        a: "Yes — we offer custom synthesis and bulk production. Send your requirements for a quote and timeline.",
      },
      {
        id: "bulk-discounts",
        q: "Do you offer bulk discounts?",
        a: "Yes, significant discounts are available for bulk orders (>10 g) and institutional purchases.",
      },
      {
        id: "payment-security",
        q: "Is my payment information secure?",
        a: "Absolutely. All payment details are handled via encrypted channels. We don't store sensitive payment data.",
      },
      {
        id: "invoices",
        q: "Can I get an invoice for my institution?",
        a: "Yes — we provide invoices and documentation required by universities and research institutions.",
      },
    ],
  },
  {
    heading: "📦 Shipping & Delivery",
    subtitle: "Timelines, international shipments, packaging, and replacements.",
    items: [
      {
        id: "shipping-time",
        q: "How long does shipping take?",
        a: "Typically 5–15 business days, depending on destination: Europe 5–10, North America 7–12, Australia/Asia 10–15. Express options available. All orders include tracking.",
      },
      {
        id: "international-shipping",
        q: "Do you ship internationally?",
        a: "Yes — we ship to 50+ countries. We manage customs paperwork and ensure compliance. Packaging is discreet.",
      },
      {
        id: "packaging",
        q: "How is my order packaged?",
        a: "Orders are packed discreetly with proper labeling and safety information. Temperature-sensitive items include cold packs when needed.",
      },
      {
        id: "lost-damaged",
        q: "What if my package is lost or damaged?",
        a: "Shipments are tracked and insured. If a package is lost or damaged, we will promptly send a replacement at no extra cost.",
      },
      {
        id: "institution-shipping",
        q: "Can you ship to my university/institution?",
        a: "Yes, we frequently ship to universities and labs. We coordinate with receiving departments and provide all required documents.",
      },
      {
        id: "restrictions",
        q: "Are there any shipping restrictions?",
        a: "Some countries restrict certain research chemicals. We'll advise on restrictions and alternatives for your location.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"Frequently Asked Questions"}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{HERO_SUBTITLE}</p>
        </div>
      </section>

      {/* Category sections */}
      {CATEGORIES.map((cat) => (
        <section key={cat.heading} className="border-b border-border">
          <div className="mx-auto max-w-[860px] px-8 py-16">
            <h2 className="text-h2 font-bold text-text">{cat.heading}</h2>
            <p className="mt-2 text-body text-text-muted">{cat.subtitle}</p>
            <div className="mt-8">
              <FaqAccordion items={cat.items.map((f) => ({ id: f.id, q: f.q, a: f.a }))} />
            </div>
          </div>
        </section>
      ))}

      {/* Contact CTA — dark inverse band */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <Card inverse className="p-[52px] text-center">
          <h2 className="text-h2 font-bold text-white">{"Still Have Questions?"}</h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-body text-slate-300">
            {"Our team is here to help with any questions about our research compounds."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact">
              <Button variant="secondary">{"Contact Support"}</Button>
            </a>
            <a href="mailto:isrib.shop@protonmail.com">
              <Button variant="primary">{"Email Directly"}</Button>
            </a>
          </div>
        </Card>
      </section>
    </main>
  );
}
