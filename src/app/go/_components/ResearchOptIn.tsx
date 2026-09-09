"use client";

// S8.5 · "Get the research" soft opt-in (renders between FAQ and Final CTA). The DR
// secondary path for scrollers not ready to order. Lead magnet is research/education
// ONLY — no results/timeframe/health-outcome claims, no testimonials, no guarantee. On
// success it persists to marketing_contacts via the subscribeResearch server action and
// fires trackEvent("email_subscribed") (the only sanctioned analytics API — never raw
// fbq/dataLayer). Copy verbatim from go-rewrite.md S8.5.
import { useState } from "react";
import { Button } from "@/components/ui";
import { trackEvent } from "@/lib/analytics/client";
import { subscribeResearch } from "@/app/actions/subscribeResearch";

const INPUT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-body text-text transition placeholder:text-text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";

export default function ResearchOptIn() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const result = await subscribeResearch({
      email,
      firstName: firstName.trim() || undefined,
    });

    if ("ok" in result) {
      trackEvent("email_subscribed", { email });
      setDone(true);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <section id="research" className="border-t border-border bg-surface-soft py-[90px]">
      <div className="mx-auto max-w-[640px] px-8">
        <div className="rounded-xl border border-border border-t-[3px] border-t-accent bg-surface p-8 shadow-sm sm:p-10">
          <p className="mb-3 text-center font-mono text-mono-label uppercase tracking-[0.06em] text-text-subtle">
            NOT READY TO ORDER?
          </p>
          <h2 className="mb-4 text-center text-h2 font-bold">Get the research first.</h2>
          <p className="mx-auto mb-8 max-w-[52ch] text-center text-body-lg text-text-muted">
            No hype, no health claims — just the science. We'll send you how the ISR brake works,
            the UCSF findings behind ISRIB A15, and how to judge a research compound's purity before
            you buy one.
          </p>

          {done ? (
            <p className="text-center text-body-lg font-semibold text-text">
              You're on the list. We'll send the research to your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-[420px]">
              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="research-first-name">
                  Your first name
                </label>
                <input
                  id="research-first-name"
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={INPUT_CLASSES}
                />
                <label className="sr-only" htmlFor="research-email">
                  Your email
                </label>
                <input
                  id="research-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASSES}
                />
                <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                  {submitting ? "Sending…" : "Send me the research"}
                </Button>
              </div>

              {error ? (
                <p className="mt-3 text-center text-small text-danger" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="mt-4 text-center text-small text-text-muted">
                Plain-English emails. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
