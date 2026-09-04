"use client";

// Post-payment shipping form (ADR 0010). Reached only via the token-gated /shipping/<token>
// link in the payment-confirmed email. Wired to the submitShipping server action via
// useActionState; the country is fixed from the order and shown read-only.

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { submitShipping, type ShippingState } from "@/app/actions/submitShipping";

// Field styling reused verbatim from the checkout form so inputs match the rest of the site.
const FIELD_CLASS =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-body text-text transition placeholder:text-text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";
const LABEL_CLASS = "mb-1.5 block text-small font-medium text-text";

interface ShippingFormProps {
  token: string;
  orderNumber: string;
  country: string;
}

export function ShippingForm({ token, orderNumber, country }: ShippingFormProps) {
  const [state, formAction, pending] = useActionState<ShippingState, FormData>(submitShipping, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <p className="text-body text-text-muted">
        {"Order "}
        <span className="font-mono font-semibold text-text">{orderNumber}</span>
        {" — please provide your delivery details."}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={LABEL_CLASS}>
            {"Full name *"}
          </label>
          <input id="fullName" name="fullName" type="text" required autoComplete="name" className={FIELD_CLASS} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className={LABEL_CLASS}>
            {"Address *"}
          </label>
          <input id="address" name="address" type="text" required autoComplete="street-address" className={FIELD_CLASS} />
        </div>
        <div>
          <label htmlFor="city" className={LABEL_CLASS}>
            {"City *"}
          </label>
          <input id="city" name="city" type="text" required autoComplete="address-level2" className={FIELD_CLASS} />
        </div>
        <div>
          <label htmlFor="postalCode" className={LABEL_CLASS}>
            {"Postal code *"}
          </label>
          <input id="postalCode" name="postalCode" type="text" required autoComplete="postal-code" className={FIELD_CLASS} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="mobile" className={LABEL_CLASS}>
            {"Mobile *"}
          </label>
          <input id="mobile" name="mobile" type="tel" required autoComplete="tel" className={FIELD_CLASS} />
        </div>
      </div>

      <p className="text-small text-text-muted">
        {"Country: "}
        <span className="font-medium text-text">{country}</span>
      </p>

      <input type="hidden" name="token" value={token} />

      {state && "error" in state ? (
        <p role="alert" aria-live="assertive" className="text-small font-medium text-red-600">
          {state.error}
        </p>
      ) : null}

      <div>
        <Button type="submit" variant="primary" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Save shipping details"}
        </Button>
      </div>
    </form>
  );
}
