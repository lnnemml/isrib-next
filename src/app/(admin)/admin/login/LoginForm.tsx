"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-mono-label uppercase tracking-[0.16em] text-text-muted">
          Password
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          className="rounded-md border border-border bg-surface px-3 py-2.5 text-body text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
