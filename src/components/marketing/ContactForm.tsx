"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

// Interim contact form. There is no /api/contact backend yet (Day-2: POST /api/contact
// + Resend). On submit we validate the required fields + the research-use checkbox, then
// compose a mailto: to isrib.shop@protonmail.com and open the user's email client.
const CONTACT_EMAIL = "isrib.shop@protonmail.com";

const SUBJECT_OPTIONS: { value: string; label: string }[] = [
  { value: "Product order", label: "Product order" },
  { value: "Product inquiry", label: "Product inquiry" },
  { value: "Technical support", label: "Technical support" },
  { value: "Custom synthesis", label: "Custom synthesis" },
  { value: "Bulk order (>10g)", label: "Bulk order (>10g)" },
  { value: "Quality question", label: "Quality question" },
  { value: "Shipping & delivery", label: "Shipping & delivery" },
  { value: "Payment methods", label: "Payment methods" },
  { value: "Other", label: "Other" },
];

const MESSAGE_PLACEHOLDER =
  "Please provide details about your inquiry. For orders, include: product name, quantity, shipping location, and any special requirements.";

const FIELD_CLASS =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-body text-text transition placeholder:text-text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";
const LABEL_CLASS = "mb-1.5 block text-small font-medium text-text";

export function ContactForm() {
  const [error, setError] = useState<string>("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const researchUse = data.get("research-use") === "on";

    if (!name || !email || !subject || !message) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!researchUse) {
      setError("Please confirm these compounds are for research use only.");
      return;
    }

    setError("");
    const mailSubject = `[${subject}] ${name}`;
    const mailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      mailSubject,
    )}&body=${encodeURIComponent(mailBody)}`;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL_CLASS}>
            {"Name *"}
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className={FIELD_CLASS} />
        </div>
        <div>
          <label htmlFor="email" className={LABEL_CLASS}>
            {"Email *"}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={FIELD_CLASS} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={LABEL_CLASS}>
          {"Subject *"}
        </label>
        <select id="subject" name="subject" required defaultValue="" className={FIELD_CLASS}>
          <option value="" disabled>
            {"Select a topic"}
          </option>
          {SUBJECT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={LABEL_CLASS}>
          {"Message *"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder={MESSAGE_PLACEHOLDER}
          className={`${FIELD_CLASS} resize-y`}
        />
      </div>

      <label className="flex items-start gap-2.5 text-small text-text-muted">
        <input type="checkbox" name="research-use" required className="mt-0.5 size-4 shrink-0 accent-primary" />
        <span>{"I confirm these compounds are for research use only *"}</span>
      </label>

      {error ? (
        <p role="alert" aria-live="assertive" className="text-small font-medium text-red-600">
          {error}
        </p>
      ) : (
        <p aria-live="polite" className="sr-only" />
      )}

      <Button type="submit" variant="primary" className="w-full">
        {"Send message"}
      </Button>

      <p className="text-small text-text-faint">
        {"This opens your email client. Or email us directly at "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary transition hover:text-primary-hover">
          {CONTACT_EMAIL}
        </a>
        {"."}
      </p>
    </form>
  );
}
