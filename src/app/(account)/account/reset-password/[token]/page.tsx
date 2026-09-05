import type { Metadata } from "next";
import { resetPassword } from "@/app/actions/customerAuth";
import { ConfirmResetForm } from "./ConfirmResetForm";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

// params is a Promise in Next 16 — must be awaited.
export default async function ConfirmResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Pre-bind the token to the Server Action so the client form never handles it directly.
  const boundAction = resetPassword.bind(null, token);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-h3 font-semibold text-text">Set new password</h1>
        <p className="mb-6 text-small text-text-muted">
          Choose a new password for your account. Use at least 8 characters.
        </p>
        <ConfirmResetForm action={boundAction} />
      </div>
    </div>
  );
}
