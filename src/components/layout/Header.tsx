"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

function CartGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16l-1.5 9.5a2 2 0 0 1-2 1.7H8a2 2 0 0 1-2-1.7L4 4H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  );
}

function CartLink({ className }: { className?: string }) {
  const { count } = useCart();
  return (
    <Link
      href="/checkout"
      aria-label={count > 0 ? `Cart — ${count} item${count === 1 ? "" : "s"}` : "Cart"}
      className={cn("relative inline-flex items-center gap-1.5 text-text-muted transition hover:text-text", className)}
    >
      <CartGlyph />
      {count > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-[--container-page] items-center justify-between px-8">
        <Link href="/" aria-label="ISRIB.shop home" className="font-semibold tracking-[-0.01em] text-text">
          {"ISRIB"}
          <span className="text-text-faint">{".shop"}</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-small text-text-muted transition hover:text-text">
              {l.label}
            </Link>
          ))}
          <CartLink />
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-4 md:hidden">
          <CartLink />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-md text-text-muted transition hover:text-text"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav aria-label="Mobile" className="border-t border-border bg-surface px-8 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-body text-text-muted transition hover:text-text"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
