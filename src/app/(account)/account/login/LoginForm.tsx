"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInCustomer,
  resendVerification,
  type SignInState,
  type ResendState,
} from "@/app/actions/customerAuth";

const initialSignIn: SignInState = null;
const initialResend: ResendState = null;

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2.5 text-body text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "font-mono text-mono-label uppercase tracking-[0.16em] text-text-muted";

// Inline "resend verification" affordance shown when sign-in returns {needsVerify}.
function ResendVerification({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendVerification, initialResend);

  if (state && "ok" in state) {
    return (
      <p className="mt-2 text-small text-text-muted" role="status">
        {state.ok}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="email" value={email} />
      {state && "error" in state ? (
        <p className="mb-2 text-small text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="text-small font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(signInCustomer, initialSignIn);

  const needsVerify = state && "needsVerify" in state ? state : null;
  const error = state && "error" in state ? state.error : null;

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

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

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2.5 text-body font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {needsVerify ? (
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-small text-text">
            Please confirm your email before signing in.
          </p>
          <ResendVerification email={needsVerify.email} />
        </div>
      ) : null}

      <div className="flex items-center justify-between text-small text-text-muted">
        <Link
          href="/account/reset-password"
          className="font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover"
        >
          Forgot password?
        </Link>
        <Link
          href="/account/register"
          className="font-semibold text-primary underline underline-offset-2 transition hover:text-primary-hover"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
