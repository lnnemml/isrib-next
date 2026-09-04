import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-h3 font-semibold text-text">Admin</h1>
        <p className="mb-6 text-small text-text-muted">
          Enter the admin password to continue.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
