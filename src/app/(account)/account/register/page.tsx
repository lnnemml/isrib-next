import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function AccountRegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-h3 font-semibold text-text">Create account</h1>
        <p className="mb-6 text-small text-text-muted">
          Create an account to track your orders and reorder faster.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
