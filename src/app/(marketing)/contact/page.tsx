import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { ContactForm } from "@/components/marketing/ContactForm";

// Faithful port of the live contact.html on the locked design system.
// Header/Footer are global (root layout). The form is an interim mailto flow — see
// ContactForm.tsx (Day-2: POST /api/contact + Resend). The live "Start Chat" button
// opens a Tawk.to widget that is not wired here, so it is rendered as static text.
const HERO_SUBTITLE =
  "Get expert support for your research chemical needs. Our scientific team is here to help.";

export function generateMetadata(): Metadata {
  return {
    title: "Contact | ISRIB A15",
    description: HERO_SUBTITLE,
  };
}

const PAYMENT_METHODS: { icon: string; title: string; body: string }[] = [
  {
    icon: "₿",
    title: "Cryptocurrency",
    body: "Bitcoin, Ethereum, USDT (fastest processing)",
  },
  {
    icon: "🏦",
    title: "Bank transfer",
    body: "SEPA, SWIFT (secure international transfers)",
  },
  {
    icon: "💳",
    title: "Alternative methods",
    body: "Wise, others — discussed individually",
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"Contact Our Research Team"}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{HERO_SUBTITLE}</p>
        </div>
      </section>

      {/* Contact methods */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[70px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="flex flex-col text-center">
            <div className="mb-4 text-[36px] leading-none">{"📧"}</div>
            <h3 className="mb-2 text-h3 font-semibold text-text">{"Email Support"}</h3>
            <p className="mb-3 text-small text-text-muted">{"For general inquiries and order support"}</p>
            <a
              href="mailto:isrib.shop@protonmail.com"
              className="font-semibold text-primary transition hover:text-primary-hover"
            >
              {"isrib.shop@protonmail.com"}
            </a>
            <p className="mt-3 text-small text-text-faint">{"Response time: 4–8 hours"}</p>
          </Card>

          <Card className="flex flex-col text-center">
            <div className="mb-4 text-[36px] leading-none">{"💬"}</div>
            <h3 className="mb-2 text-h3 font-semibold text-text">{"Live Chat"}</h3>
            <p className="mb-3 text-small text-text-muted">{"Instant support during business hours"}</p>
            {/* Live chat widget (Tawk.to) is not wired in this repo yet — shown as static text. */}
            <p className="text-small font-medium text-text-faint">{"Live chat — coming soon"}</p>
            <p className="mt-3 text-small text-text-faint">{"Mon–Fri: 9:00–18:00 (EST)"}</p>
          </Card>

          <Card className="flex flex-col text-center">
            <div className="mb-4 text-[36px] leading-none">{"🛒"}</div>
            <h3 className="mb-2 text-h3 font-semibold text-text">{"Place an order"}</h3>
            <p className="mb-3 text-small text-text-muted">{"Direct ordering through personal consultation"}</p>
            <Link href="/products" className="font-semibold text-primary transition hover:text-primary-hover">
              {"Browse products"}
            </Link>
            <p className="mt-3 text-small text-text-faint">{"Secure payment arrangements"}</p>
          </Card>
        </div>
      </section>

      {/* Contact form */}
      <section className="border-y border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-[70px]">
          <div className="mx-auto max-w-[640px]">
            <h2 className="mb-8 text-center text-h2 font-bold text-text">{"Send Us a Message"}</h2>
            <Card>
              <ContactForm />
            </Card>
          </div>
        </div>
      </section>

      {/* Payment methods band — dark/inverse, informational only (no card fields, no Stripe). */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[70px]">
        <Card inverse className="p-[44px]">
          <h2 className="mb-10 text-center text-h2 font-bold text-white">{"Payment methods"}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.title} className="rounded-xl border border-slate-800 bg-surface-inverse-card p-6 text-center">
                <div className="mb-3 text-[30px] leading-none">{m.icon}</div>
                <h3 className="mb-2 text-h3 font-semibold text-white">{m.title}</h3>
                <p className="text-small leading-[1.6] text-slate-300">{m.body}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-[70ch] rounded-xl border border-slate-800 bg-surface-inverse-card p-6 text-center">
            <h3 className="mb-2 text-h3 font-semibold text-white">{"🔒 Secure transactions"}</h3>
            <p className="text-small leading-[1.6] text-slate-300">
              {"All payment details handled via encrypted communication. We arrange methods individually for maximum security and convenience."}
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
