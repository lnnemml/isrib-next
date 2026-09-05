import type { Metadata } from "next";
import { RequestResetForm } from "./RequestResetForm";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-h3 font-semibold text-text">Reset password</h1>
        <p className="mb-6 text-small text-text-muted">
          Enter the email on your account and we will send you a reset link.
        </p>
        <RequestResetForm />
      </div>
    </div>
  );
}
