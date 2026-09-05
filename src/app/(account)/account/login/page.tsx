import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// searchParams is a Promise in Next 16 — must be awaited.
export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;
  const registered = sp.registered === "1";
  const verified = sp.verified === "1";
  const reset = sp.reset === "1";

  const banner = registered
    ? "Account created. Please check your email to confirm your address before signing in."
    : verified
      ? "Your email is confirmed. You can now sign in."
      : reset
        ? "Your password has been reset. Please sign in with your new password."
        : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-h3 font-semibold text-text">Sign in</h1>
        <p className="mb-6 text-small text-text-muted">
          Access your ISRIB Shop account and order history.
        </p>

        {banner ? (
          <p
            className="mb-6 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-small text-text"
            role="status"
          >
            {banner}
          </p>
        ) : null}

        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
