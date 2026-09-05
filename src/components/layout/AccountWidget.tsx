"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signInCustomer, signOutCustomer, type SignInState } from "@/app/actions/customerAuth";

type PublicCustomer = { name: string | null; email: string };

const initialSignIn: SignInState = null;

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2 text-small text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "font-mono text-mono-label uppercase tracking-[0.16em] text-text-muted";
const navLinkClass = "text-small text-text-muted transition hover:text-text";

function UserGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}

function displayName(c: PublicCustomer): string {
  const name = (c.name ?? "").trim();
  if (name) return name.split(/\s+/)[0];
  return c.email;
}

function avatarInitial(c: PublicCustomer): string {
  const name = (c.name ?? "").trim();
  const source = name || c.email;
  return source.charAt(0).toUpperCase();
}

export function AccountWidget() {
  const pathname = usePathname();
  const [customer, setCustomer] = useState<PublicCustomer | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch current customer on mount and whenever the route changes (a login redirects
  // to /account, a logout to /account/login — both change pathname, refreshing the widget).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data: { customer: PublicCustomer | null }) => {
        if (!cancelled) {
          setCustomer(data.customer);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close popover on the route changing.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Stable-width placeholder while loading to avoid layout shift.
  if (!loaded) {
    return <span aria-hidden="true" className="inline-block h-5 w-16" />;
  }

  return (
    <div ref={containerRef} className="relative">
      {customer ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-small text-text transition hover:opacity-80"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary font-mono text-mono-label text-white" aria-hidden="true">
            {avatarInitial(customer)}
          </span>
          <span className="max-w-[8rem] truncate">{displayName(customer)}</span>
        </button>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-small text-text-muted transition hover:text-text"
        >
          <UserGlyph />
          {"Sign in"}
        </button>
      )}

      {open && (customer ? <LoggedInMenu customer={customer} onClose={() => setOpen(false)} /> : <SignInPopover />)}
    </div>
  );
}

function LoggedInMenu({ customer, onClose }: { customer: PublicCustomer; onClose: () => void }) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-surface p-4 shadow-lg"
    >
      <p className="truncate text-small text-text-muted">{customer.email}</p>

      <div className="mt-3 flex flex-col">
        <Link href="/account" onClick={onClose} className="block py-1.5 text-small text-text-muted transition hover:text-text">
          {"My account"}
        </Link>
        <Link href="/account/orders" onClick={onClose} className="block py-1.5 text-small text-text-muted transition hover:text-text">
          {"Order history"}
        </Link>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <form action={signOutCustomer}>
          <button type="submit" className="block w-full py-1.5 text-left text-small text-text-muted transition hover:text-text">
            {"Log out"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SignInPopover() {
  const [state, formAction, pending] = useActionState(signInCustomer, initialSignIn);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const error = state && "error" in state ? state.error : null;
  const needsVerify = state && "needsVerify" in state ? state : null;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-md border border-border bg-surface p-4 shadow-lg">
      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Email</span>
          <input
            ref={emailRef}
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </label>

        {error ? (
          <p className="text-small text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {needsVerify ? (
          <p className="text-small text-text-muted" role="status">
            {"Please confirm your email before signing in. "}
            <Link href="/account/login" className="font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover">
              {"More"}
            </Link>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <Link href="/account/register" className={navLinkClass}>
          {"Create account"}
        </Link>
        <Link href="/account/reset-password" className={navLinkClass}>
          {"Forgot password?"}
        </Link>
      </div>
    </div>
  );
}
