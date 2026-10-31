import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { affiliatesEnabled } from "@/lib/affiliate/flag";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Partner sign in",
};

export default function PartnerLoginPage() {
  // Next renders this alongside the layout, so without this the copy below reaches the layout's
  // 404 response in the RSC payload.
  if (!affiliatesEnabled()) notFound();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-h3 font-semibold text-text">{"Partner sign in"}</h1>
        <p className="mb-6 text-small text-text-muted">
          {"Enter your partner email and we will send you a sign-in link."}
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
