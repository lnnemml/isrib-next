import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmail } from "@/app/actions/customerAuth";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

// params is a Promise in Next 16 — must be awaited. Server component: it runs the
// verification once on load and renders the result.
export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await verifyEmail(token);
  const ok = "ok" in result;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        {ok ? (
          <>
            <h1 className="mb-2 text-h3 font-semibold text-text">Email confirmed</h1>
            <p className="mb-6 text-small text-text-muted">
              Your email is confirmed. You can now sign in to your account.
            </p>
            <Link
              href="/account/login?verified=1"
              className="inline-block rounded-md bg-primary px-4 py-2.5 text-body font-semibold text-white transition hover:bg-primary-hover"
            >
              Continue to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-h3 font-semibold text-text">Link expired</h1>
            <p className="mb-6 text-small text-text-muted">{result.error}</p>
            <Link
              href="/account/login"
              className="inline-block rounded-md bg-primary px-4 py-2.5 text-body font-semibold text-white transition hover:bg-primary-hover"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
