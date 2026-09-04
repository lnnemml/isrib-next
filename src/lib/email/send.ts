// Resend transport (G2 Step 3). Mirrors the lander's lib/resend.ts: a lazily-created
// Resend client from RESEND_API_KEY, and two thin senders. Neither sender swallows the
// underlying Resend promise rejection — the CALLER (submitOrder) wraps every send in
// Promise.allSettled so a mail failure never breaks the order or the redirect.

import { Resend } from "resend";

let _resend: Resend | undefined;

function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// FROM_EMAIL is Resend's onboarding@resend.dev test sender for now (real sender wired
// at cutover). Kept as a bare address; the display name is added at each call site.
function getFrom(): string {
  return process.env.FROM_EMAIL ?? "onboarding@resend.dev";
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

// Customer-facing transactional mail. replyTo routes buyer replies (payment
// screenshots, shipping details) to the ops inbox regardless of the FROM sender.
export async function sendToCustomer(email: string, subject: string, html: string): Promise<void> {
  await getResend().emails.send({
    from: `ISRIB Shop <${getFrom()}>`,
    to: email,
    replyTo: "isrib.shop@protonmail.com",
    subject,
    html,
  });
}

// Internal ops alert. No-op when ADMIN_EMAIL is unset/empty so local/dev runs and
// misconfiguration never throw.
export async function sendToAdmin(subject: string, html: string): Promise<void> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;
  await getResend().emails.send({
    from: `ISRIB Shop <${getFrom()}>`,
    to: adminEmails,
    subject,
    html,
  });
}
