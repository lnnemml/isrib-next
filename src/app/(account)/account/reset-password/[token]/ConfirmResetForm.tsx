"use client";

import { useActionState } from "react";
import { resetPassword, type ResetState } from "@/app/actions/customerAuth";

const initialState: ResetState = null;

const inputClass =
  "rounded-md border border-border bg-surface px-3 py-2.5 text-body text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "font-mono text-mono-label uppercase tracking-[0.16em] text-text-muted";

// `action` is resetPassword pre-bound with the token (see the page) so this client
// component never receives a server-only reference beyond the action function itself.
export function ConfirmResetForm({
  action,
}: {
  action: (prev: ResetState, formData: FormData) => Promise<ResetState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>New password</span>
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
        <span className={labelClass}>Confirm new password</span>
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
        {pending ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
