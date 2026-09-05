"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCustomer, type RegisterState } from "@/app/actions/customerAuth";

const initialState: RegisterState = null;

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2.5 text-body text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "font-mono text-mono-label uppercase tracking-[0.16em] text-text-muted";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerCustomer, initialState);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            className={inputClass}
          />
        </label>

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
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </label>

        {state?.error ? (
          <p className="text-small text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2.5 text-body font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-small text-text-muted">
        Already have an account?{" "}
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
