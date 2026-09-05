"use server";

// Customer-accounts auth flows (ADR 0013). Server Actions + plain server helpers for
// register / verify / sign-in / sign-out / password-reset. Mirrors the admin login
// Server Action shape (src/app/(admin)/admin/login/actions.ts): a discriminated result
// union for `useActionState`, cookies() awaited in Next 16, and every redirect() guarded
// by isRedirectError re-throw (redirect() signals success by THROWING NEXT_REDIRECT).
//
// SECURITY POSTURE:
// - Passwords are never logged; errors are generic so we never reveal which field failed
//   (email vs password) or whether an account exists (register/reset/resend).
// - node:crypto / db access lives in server-only modules (this file is "use server");
//   the "use client" form components import ONLY these action functions, nothing else.
// - verificationTokens is the dual-use one-time token table: email-verification rows use
//   the "verify:"+email identifier; password-reset rows store the bare email. Rows are
//   deleted on use.

import { db } from "@/lib/db";
import { customers, verificationTokens } from "@/lib/db/schema";
import {
  CUSTOMER_COOKIE,
  hashPassword,
  verifyPassword,
  createCustomerSession,
  clearCustomerSession,
} from "@/lib/customer/auth";
import { sendToCustomer } from "@/lib/email/send";
import { generateUniqueReferralCode } from "@/lib/referral";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Same source submitOrder uses for absolute links — keep verify/reset links consistent.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const MIN_PASSWORD = 8;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

// ── Result unions (shaped for useActionState) ────────────────────────────────
export type RegisterState = { error: string } | null;
export type SignInState =
  | { error: string }
  | { needsVerify: true; email: string }
  | null;
export type ResendState = { error: string } | { ok: string } | null;
export type RequestResetState = { sent: true } | { error: string } | null;
export type ResetState = { error: string } | null;

// ── Shared helpers ────────────────────────────────────────────────────────────

// Only allow an internal callback (starts with a single "/") to prevent open-redirect;
// "//evil.com" and absolute URLs are rejected. Falls back to the account root.
function safeCallback(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw.startsWith("/account") ? raw : "/account";
}

// Create-and-send an email-verification token for `email`. NON-FATAL send: a mail
// failure is logged and swallowed so it never breaks the calling action.
async function issueVerificationEmail(email: string): Promise<void> {
  const token = nanoid(32);
  const expires = new Date(Date.now() + VERIFY_TTL_MS);
  await db.insert(verificationTokens).values({
    identifier: "verify:" + email,
    token,
    expires,
  });

  const link = `${BASE_URL}/account/verify-email/${token}`;
  const html = verifyEmailHtml(link);
  try {
    await sendToCustomer(
      email,
      "Confirm your email to activate your ISRIB Shop account",
      html,
    );
  } catch (err) {
    console.error("verification email failed (non-fatal):", err);
  }
}

// ── HTML templates (light theme, inline, transactional voice) ────────────────

function shellHtml(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:32px;">
      ${inner}
    </div>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#78716c;text-align:center;">
      ISRIB Shop &middot; Research compounds for laboratory use only.
    </p>
  </div>
</body></html>`;
}

function buttonHtml(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:8px;">${label}</a>`;
}

function verifyEmailHtml(link: string): string {
  return shellHtml(`
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Confirm your email</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#44403c;">
      Confirm your email to activate your ISRIB Shop account. This link expires in 24 hours.
    </p>
    <p style="margin:0 0 24px;">${buttonHtml(link, "Confirm email")}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;">
      If the button does not work, paste this link into your browser:<br />
      <span style="color:#44403c;word-break:break-all;">${link}</span>
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#78716c;">
      If you did not create this account, you can safely ignore this email.
    </p>
  `);
}

function resetPasswordHtml(link: string): string {
  return shellHtml(`
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Reset your password</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#44403c;">
      We received a request to reset the password for your ISRIB Shop account. This link
      expires in 1 hour.
    </p>
    <p style="margin:0 0 24px;">${buttonHtml(link, "Reset password")}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;">
      If the button does not work, paste this link into your browser:<br />
      <span style="color:#44403c;word-break:break-all;">${link}</span>
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#78716c;">
      If you did not request this, you can safely ignore this email and your password will
      remain unchanged.
    </p>
  `);
}

// ── 1. registerCustomer ───────────────────────────────────────────────────────
export async function registerCustomer(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  try {
    const name = ((formData.get("name") as string | null) ?? "").trim();
    const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
    const password = (formData.get("password") as string | null) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

    if (!name || !email || !password) {
      return { error: "Please fill in all fields." };
    }
    if (password.length < MIN_PASSWORD) {
      return { error: "Password must be at least 8 characters." };
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    const [existing] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (existing && existing.passwordHash != null) {
      return { error: "An account with this email already exists. Please sign in." };
    }

    const passwordHash = hashPassword(password);

    if (existing) {
      // Legacy/imported row with no password — CLAIM it. Preserve their existing name
      // (if any), clientType, firstOrderAt and history; only set the password. Assign a
      // referral code IF the row lacks one — never overwrite an existing code (ADR 0014).
      await db
        .update(customers)
        .set({
          passwordHash,
          name: existing.name || name,
          referralCode: existing.referralCode ?? (await generateUniqueReferralCode()),
        })
        .where(eq(customers.id, existing.id));
    } else {
      await db.insert(customers).values({
        id: nanoid(),
        email,
        name,
        clientType: "lead",
        source: "signup",
        passwordHash,
        emailVerifiedAt: null,
        referralCode: await generateUniqueReferralCode(),
      });
    }

    await issueVerificationEmail(email);

    redirect("/account/login?registered=1");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("registerCustomer failed:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// ── 2. verifyEmail (plain helper, called by the verify page) ──────────────────
export async function verifyEmail(
  token: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const [row] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);

    if (
      !row ||
      !row.identifier.startsWith("verify:") ||
      row.expires.getTime() <= Date.now()
    ) {
      return { error: "This verification link is invalid or has expired." };
    }

    const email = row.identifier.slice("verify:".length);
    await db
      .update(customers)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(customers.email, email));

    // Delete-on-use.
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return { ok: true };
  } catch (err) {
    console.error("verifyEmail failed:", err);
    return { error: "This verification link is invalid or has expired." };
  }
}

// ── 3. resendVerification ─────────────────────────────────────────────────────
export async function resendVerification(
  _prev: ResendState,
  formData: FormData,
): Promise<ResendState> {
  // Neutral message returned in ALL paths — never leak whether an account exists or is
  // already verified.
  const neutral: ResendState = {
    ok: "If that email needs verification, we have sent a new confirmation link.",
  };
  try {
    const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
    if (!email) return { error: "Please enter your email." };

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (customer && customer.emailVerifiedAt == null) {
      await issueVerificationEmail(email);
    }
    return neutral;
  } catch (err) {
    console.error("resendVerification failed:", err);
    return neutral;
  }
}

// ── 4. signInCustomer ─────────────────────────────────────────────────────────
export async function signInCustomer(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
    const password = (formData.get("password") as string | null) ?? "";
    const callbackUrl = formData.get("callbackUrl") as string | null;

    if (!email || !password) {
      return { error: "Invalid email or password." };
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    // Generic error for any of: no row, no password set (legacy/guest), wrong password —
    // never reveal which.
    if (
      !customer ||
      customer.passwordHash == null ||
      !verifyPassword(password, customer.passwordHash)
    ) {
      return { error: "Invalid email or password." };
    }

    if (customer.emailVerifiedAt == null) {
      return { needsVerify: true, email };
    }

    const token = await createCustomerSession(customer.id);
    (await cookies()).set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    redirect(safeCallback(callbackUrl));
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("signInCustomer failed:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// ── 5. signOutCustomer ────────────────────────────────────────────────────────
export async function signOutCustomer(): Promise<void> {
  try {
    await clearCustomerSession();
    redirect("/account/login");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("signOutCustomer failed:", err);
    throw err;
  }
}

// ── 6. requestPasswordReset ───────────────────────────────────────────────────
export async function requestPasswordReset(
  _prev: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  try {
    const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
    if (!email) return { error: "Please enter your email." };

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    // Only issue a reset for a real, password-bearing account — but ALWAYS return {sent}
    // regardless, so we never leak account existence.
    if (customer && customer.passwordHash != null) {
      const token = nanoid(32);
      const expires = new Date(Date.now() + RESET_TTL_MS);
      await db.insert(verificationTokens).values({
        identifier: email, // NO "verify:" prefix — this marks it as a reset token
        token,
        expires,
      });
      const link = `${BASE_URL}/account/reset-password/${token}`;
      try {
        await sendToCustomer(email, "Reset your ISRIB Shop password", resetPasswordHtml(link));
      } catch (err) {
        console.error("reset email failed (non-fatal):", err);
      }
    }

    return { sent: true };
  } catch (err) {
    console.error("requestPasswordReset failed:", err);
    // Still neutral — do not leak that anything went wrong for a specific email.
    return { sent: true };
  }
}

// ── 7. resetPassword (token bound via .bind(null, token)) ────────────────────
export async function resetPassword(
  token: string,
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  try {
    const password = (formData.get("password") as string | null) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

    if (password.length < MIN_PASSWORD) {
      return { error: "Password must be at least 8 characters." };
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    // Valid reset token: matches, is NOT a verify token, and not expired.
    const [row] = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), gt(verificationTokens.expires, new Date())))
      .limit(1);

    if (!row || row.identifier.startsWith("verify:")) {
      return { error: "This reset link is invalid or has expired." };
    }

    const email = row.identifier;
    await db
      .update(customers)
      .set({ passwordHash: hashPassword(password) })
      .where(eq(customers.email, email));

    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    redirect("/account/login?reset=1");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("resetPassword failed:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
