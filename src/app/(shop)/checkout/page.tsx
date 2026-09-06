"use client";

// Real checkout (gate G2, Step 2). Keeps the cart line list + subtotal, and adds the
// checkout form wired to the `submitOrder` server action via `useActionState`. Server is
// authoritative on price (the recompute lives in the action); the client only PREVIEWS
// the crypto discount. NO card fields, NO "Pay Now", NO Stripe — payment is manual
// arrangement + crypto (NowPayments), by design. See CLAUDE.md.

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import { useCart } from "@/lib/cart/CartProvider";
import { getProduct, formatCents } from "@/lib/copy/products";
import { Button } from "@/components/ui";
import { PaymentSelector } from "@/components/ui";
import { trackEvent } from "@/lib/analytics/client";
import { submitOrder, type SubmitState } from "@/app/actions/submitOrder";

// Read a browser cookie by name — used to capture the Meta Pixel _fbp/_fbc cookies at
// submit so they can be forwarded to CAPI (analytics only, never affects pricing).
function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function productName(slug: string): string {
  return getProduct(slug)?.name ?? slug;
}

const CRYPTO_DISCOUNT_PCT = 10;

// Field styling reused verbatim from ContactForm.tsx so inputs match the rest of the site.
const FIELD_CLASS =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-body text-text transition placeholder:text-text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";
const LABEL_CLASS = "mb-1.5 block text-small font-medium text-text";

export default function CheckoutPage() {
  const { lines, count, subtotalCents, updateQuantity, removeLine } = useCart();

  // Stable per-attempt keys generated once on mount (idempotency + analytics dedup).
  const [idem] = useState(() => nanoid());
  const [eventId] = useState(() => nanoid());
  const [method, setMethod] = useState("crypto");

  // ADR 0014 — referral preview. The `isrib_ref` cookie is the source of truth (the
  // server reads it at submit); here we only mirror it for a preview. `refValid` is a
  // best-effort exists-check via /api/referral/validate (self-referral is enforced
  // server-side). We NEVER post a hidden ref field — the cookie drives the discount.
  const [refCode, setRefCode] = useState<string | null>(null);
  const [refValid, setRefValid] = useState(false);

  // ADR 0016 — promo-code preview. Cosmetic only: the server re-validates the code in
  // submitOrder and is authoritative on price. On Apply we hit /api/promo/validate to
  // learn valid + discountPct; the code entered is posted to the action via a hidden field.
  const [promoCode, setPromoCode] = useState("");
  const [promoPct, setPromoPct] = useState(0);
  const [promoValid, setPromoValid] = useState<boolean | null>(null);

  function applyPromo(): void {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoValid(null);
      setPromoPct(0);
      return;
    }
    fetch("/api/promo/validate?code=" + encodeURIComponent(code))
      .then((r) => r.json())
      .then((data: { valid?: boolean; discountPct?: number }) => {
        setPromoValid(!!data.valid);
        setPromoPct(data.valid ? data.discountPct ?? 0 : 0);
      })
      .catch(() => {
        // Best-effort — a failed preview never blocks checkout (server re-validates).
        setPromoValid(null);
        setPromoPct(0);
      });
  }

  // Hidden inputs for the Meta _fbp/_fbc cookies — populated from document.cookie at submit
  // (via onSubmit below) so their values are the freshest before the server action posts.
  const fbpRef = useRef<HTMLInputElement>(null);
  const fbcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)isrib_ref=([^;]*)/);
    const code = match ? decodeURIComponent(match[1]).trim().toUpperCase() : "";
    if (!code) return;
    setRefCode(code);
    let cancelled = false;
    fetch("/api/referral/validate?code=" + encodeURIComponent(code))
      .then((r) => r.json())
      .then((data: { valid?: boolean }) => {
        if (!cancelled) setRefValid(!!data.valid);
      })
      .catch(() => {
        // Best-effort — a failed preview never blocks checkout (server re-validates).
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [state, formAction, pending] = useActionState<SubmitState, FormData>(submitOrder, null);

  // Crypto path returns an EXTERNAL NowPayments invoice URL — redirect() can't navigate
  // to it through the action, so we navigate client-side here.
  useEffect(() => {
    if (state && "redirectUrl" in state && state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  const redirecting = state !== null && "redirectUrl" in state;

  const cryptoTotalCents = subtotalCents - Math.round((subtotalCents * CRYPTO_DISCOUNT_PCT) / 100);
  // Non-stacking (ADR 0014): a referral is worth the same flat 10% as crypto, so on the
  // manual path a valid ref previews the same discounted total.
  const referralTotalCents = subtotalCents - Math.round((subtotalCents * CRYPTO_DISCOUNT_PCT) / 100);
  const showReferral = refValid && refCode !== null;
  const showPromo = promoValid === true && promoPct > 0;

  // Non-stacking best-single (ADR 0016) — the previewed discount % is the MAX of every
  // applicable source (crypto / referral / promo). Cosmetic only; the server recomputes.
  const previewDiscountPct = Math.max(
    method === "crypto" ? CRYPTO_DISCOUNT_PCT : 0,
    showReferral ? CRYPTO_DISCOUNT_PCT : 0,
    showPromo ? promoPct : 0,
  );
  const promoTotalCents = subtotalCents - Math.round((subtotalCents * promoPct) / 100);
  // The promo line "wins" (is the best single discount) only when it strictly beats the
  // base 10% either method/referral would already give — that's what the buyer pays.
  const promoIsWinning = showPromo && promoPct > (method === "crypto" || showReferral ? CRYPTO_DISCOUNT_PCT : 0);
  const cartPayload = JSON.stringify(
    lines.map((l) => ({
      productSlug: l.productSlug,
      format: l.format,
      quantity: l.quantity,
      sizeLabel: l.sizeLabel,
    })),
  );

  // Fire the browser Pixel order_submitted with the SAME eventId the server action uses
  // (hidden field above) so Meta dedups the InitiateCheckout against the CAPI event. This
  // runs on the form's onSubmit — before React invokes formAction — and also stamps the
  // _fbp/_fbc hidden inputs from the live cookies. ANALYTICS ONLY: `analyticsValueCents`
  // is read straight from the totals already shown to the user (never recomputed pricing).
  function handleSubmit(): void {
    // Mirror the total displayed above, using the non-stacking best-single discount %
    // (ADR 0016). With no promo this equals the old crypto/referral/subtotal logic.
    const analyticsValueCents =
      subtotalCents - Math.round((subtotalCents * previewDiscountPct) / 100);

    // Stamp the Meta cookies into the hidden fields so the server action forwards them to CAPI.
    if (fbpRef.current) fbpRef.current.value = readCookie("_fbp");
    if (fbcRef.current) fbcRef.current.value = readCookie("_fbc");

    trackEvent(
      "order_submitted",
      {
        value: analyticsValueCents / 100,
        currency: "USD",
        // Real array of product slugs for Meta content_ids (EventParams now allows
        // string[]). Kept as an array — no comma-join — per Slice C.
        content_ids: lines.map((l) => l.productSlug),
        num_items: count,
      },
      eventId,
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-[820px] px-8 py-24">
        <h1 className="mb-4 text-h2 font-bold">{"Your cart"}</h1>
        <p className="text-body text-text-muted">
          {"Your cart is empty. Browse the "}
          <Link href="/products" className="text-primary transition hover:text-primary-hover">
            {"products"}
          </Link>
          {" to get started."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[820px] px-8 py-16">
      <h1 className="mb-2 text-h2 font-bold">{"Your cart"}</h1>
      <p className="mb-8 text-small text-text-subtle">
        {count} {count === 1 ? "item" : "items"}
      </p>

      <ul className="flex flex-col divide-y divide-border-soft border-y border-border">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-text">{productName(line.productSlug)}</p>
              <p className="font-mono text-[12px] text-text-subtle">
                {line.sizeLabel} · {line.format} · {formatCents(line.linePriceCents)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(line.key, line.quantity - 1)}
                  aria-label={`Decrease ${line.sizeLabel} quantity`}
                  className="flex size-7 items-center justify-center rounded-md border border-border font-mono text-[14px] text-text-subtle transition hover:border-primary hover:text-primary"
                >
                  {"−"}
                </button>
                <span className="w-6 text-center font-mono text-[13px] text-text">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.key, line.quantity + 1)}
                  aria-label={`Increase ${line.sizeLabel} quantity`}
                  className="flex size-7 items-center justify-center rounded-md border border-border font-mono text-[14px] text-text-subtle transition hover:border-primary hover:text-primary"
                >
                  {"+"}
                </button>
              </div>

              <span className="w-16 text-right font-mono text-[14px] font-semibold text-text">
                {formatCents(line.linePriceCents * line.quantity)}
              </span>

              <button
                type="button"
                onClick={() => removeLine(line.key)}
                aria-label={`Remove ${productName(line.productSlug)} ${line.sizeLabel}`}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-faint transition hover:text-danger"
              >
                {"Remove"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-body text-text-muted">{"Subtotal"}</span>
        <span className="font-mono text-[20px] font-semibold text-text">{formatCents(subtotalCents)}</span>
      </div>
      {showReferral ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-small text-success">{"Referral code applied: " + refCode}</span>
        </div>
      ) : null}
      {showPromo ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-small text-success">{"Promo code applied: " + promoCode.trim().toUpperCase()}</span>
        </div>
      ) : null}
      {promoIsWinning ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-small text-success">{"Promo total (−" + promoPct + "%)"}</span>
          <span className="font-mono text-[16px] font-semibold text-success">
            {formatCents(promoTotalCents)}
          </span>
        </div>
      ) : method === "crypto" ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-small text-success">{"Crypto total (−10%)"}</span>
          <span className="font-mono text-[16px] font-semibold text-success">
            {formatCents(cryptoTotalCents)}
          </span>
        </div>
      ) : showReferral ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-small text-success">{"Referral total (−10%)"}</span>
          <span className="font-mono text-[16px] font-semibold text-success">
            {formatCents(referralTotalCents)}
          </span>
        </div>
      ) : showPromo ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-small text-success">{"Promo total (−" + promoPct + "%)"}</span>
          <span className="font-mono text-[16px] font-semibold text-success">
            {formatCents(promoTotalCents)}
          </span>
        </div>
      ) : null}

      {/* Checkout form — posts to the server action, which recomputes every price.
          ADR 0010: minimal fields at checkout (first name / email / country); the
          shipping address is collected after payment via /shipping/<token>. */}
      <form action={formAction} onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
        <section className="flex flex-col gap-5">
          <h2 className="text-h4 font-semibold text-text">{"Your details"}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={LABEL_CLASS}>
                {"First name *"}
              </label>
              <input id="name" name="name" type="text" required autoComplete="given-name" className={FIELD_CLASS} />
            </div>
            <div>
              <label htmlFor="email" className={LABEL_CLASS}>
                {"Email *"}
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" className={FIELD_CLASS} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="country" className={LABEL_CLASS}>
                {"Country *"}
              </label>
              <input id="country" name="country" type="text" required autoComplete="country-name" className={FIELD_CLASS} />
            </div>
          </div>
          <p className="text-caption text-text-faint">
            {"Shipping details are collected after payment is confirmed."}
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="text-h4 font-semibold text-text">{"Payment method"}</h2>
          <PaymentSelector value={method} onChange={setMethod} />
        </section>

        {/* ADR 0016 — promo code. Cosmetic preview only; the server re-validates and is
            authoritative on price. Non-stacking (best single) with the crypto discount. */}
        <section className="flex flex-col gap-5">
          <h2 className="text-h4 font-semibold text-text">{"Promo code"}</h2>
          <div>
            <label htmlFor="promoCode" className={LABEL_CLASS}>
              {"Have a code?"}
            </label>
            <div className="flex items-start gap-2">
              <input
                id="promoCode"
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoValid(null);
                  setPromoPct(0);
                }}
                autoComplete="off"
                className={FIELD_CLASS}
              />
              <Button type="button" variant="secondary" onClick={applyPromo} className="shrink-0">
                {"Apply"}
              </Button>
            </div>
            {showPromo ? (
              <p className="mt-1.5 text-small text-success">
                {"Code applied — " + promoPct + "% off."}
              </p>
            ) : promoValid === false ? (
              <p className="mt-1.5 text-small text-text-muted">{"That code is not valid."}</p>
            ) : null}
          </div>
        </section>

        {/* Hidden fields consumed by the server action. */}
        <input type="hidden" name="paymentMethod" value={method} />
        <input type="hidden" name="idempotencyKey" value={idem} />
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="cart" value={cartPayload} />
        {/* ADR 0016 — promo code entered above; server re-validates (client preview is cosmetic). */}
        <input type="hidden" name="promoCode" value={promoCode} />
        {/* Meta _fbp/_fbc cookies — value set from document.cookie in handleSubmit (CAPI match quality). */}
        <input ref={fbpRef} type="hidden" name="fbp" defaultValue="" />
        <input ref={fbcRef} type="hidden" name="fbc" defaultValue="" />

        {state && "error" in state ? (
          <p role="alert" aria-live="assertive" className="text-small font-medium text-red-600">
            {state.error}
          </p>
        ) : null}

        <div>
          <Button type="submit" variant="primary" disabled={pending || redirecting || lines.length === 0} className="w-full sm:w-auto">
            {pending || redirecting
              ? method === "crypto"
                ? "Redirecting to payment…"
                : "Placing order…"
              : method === "crypto"
                ? "Continue to crypto payment"
                : "Place order — get payment details"}
          </Button>
          <p className="mt-3 text-caption text-text-faint">
            {method === "crypto"
              ? "You'll be taken straight to our secure crypto payment page (BTC, ETH, USDT, XMR) to pay with the 10% discount. No card payment."
              : "No card payment. We'll email payment details to arrange payment manually after you place the order."}
          </p>
        </div>
      </form>
    </main>
  );
}
