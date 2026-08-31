import Link from "next/link";
import { getAllProductSlugs, getProduct } from "@/lib/copy/products";

// Server component — ports the legacy 4-column footer structure, elevated to the design
// system. Product links resolve to real /products/[slug] routes; Information/Legal link
// to intended routes that land in later sessions.
const INFORMATION_LINKS: { label: string; href: string }[] = [
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Quality Control", href: "/quality" },
  { label: "Safety Guidelines", href: "/safety" },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Research Use Only", href: "/research" },
  { label: "Disclaimer", href: "/disclaimer" },
];

function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-mono text-mono-label font-medium uppercase tracking-[0.08em] text-text-faint">
        {heading}
      </h3>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-small text-text-muted transition hover:text-text">
        {label}
      </Link>
    </li>
  );
}

export function Footer() {
  const productLinks = getAllProductSlugs().map((slug) => {
    const product = getProduct(slug);
    return { slug, name: product ? product.name : slug };
  });

  return (
    <footer className="border-t border-border bg-surface-soft">
      <div className="mx-auto max-w-[--container-page] px-8 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-semibold text-text">
              {"ISRIB"}
              <span className="text-text-faint">{".shop"}</span>
            </div>
            <p className="mt-3 max-w-[38ch] text-small text-text-muted">
              {"Research compounds for scientific use. Quality-verified, COA per batch, worldwide shipping."}
            </p>
            <p className="mt-3 text-small text-text-muted">
              {"Email: "}
              <a href="mailto:isrib.shop@protonmail.com" className="text-text transition hover:text-primary">
                {"isrib.shop@protonmail.com"}
              </a>
            </p>
          </div>

          <FooterColumn heading="Products">
            {productLinks.map((p) => (
              <FooterLink key={p.slug} href={`/products/${p.slug}`} label={p.name} />
            ))}
            <FooterLink href="/products" label="All Products" />
          </FooterColumn>

          <FooterColumn heading="Information">
            {INFORMATION_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href} label={l.label} />
            ))}
          </FooterColumn>

          <FooterColumn heading="Legal">
            {LEGAL_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href} label={l.label} />
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-caption text-text-faint">
            {"© 2026 ISRIB.shop. Research chemicals for laboratory use only."}
          </p>
        </div>
      </div>
    </footer>
  );
}
