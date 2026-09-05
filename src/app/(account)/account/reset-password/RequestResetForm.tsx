"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type RequestResetState } from "@/app/actions/customerAuth";

const initialState: RequestResetState = null;

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2.5 text-body text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "font-mono text-mono-label uppercase tracking-[0.16em] text-text-muted";

export function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state && "sent" in state) {
    return (
      <div className="flex flex-col gap-4">
        <p
          className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-small text-text"
          role="status"
        >
          If an account exists for that email, we have sent a link to reset your password.
          The link expires in 1 hour.
        </p>
        <p className="text-small text-text-muted">
          <Link
            href="/account/login"
            className="font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </label>

        {state && "error" in state ? (
          <p className="text-small text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2.5 text-body font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-small text-text-muted">
        Remembered it?{" "}
        <Link
          href="/account/login"
          className="font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
