"use server";

// ADR 0025 — partner magic-link request. The caller gets the same message whatever happens, and
// everything that depends on the email runs in after(), so neither the words nor the response
// time can show whether an address belongs to a partner.

import { headers } from "next/headers";
import { after } from "next/server";
import { computeVisitorHash } from "@/lib/affiliate/click";
import { affiliatesEnabled } from "@/lib/affiliate/flag";
import {
  EMAILED_LINK_TTL_MINUTES,
  buildPartnerLoginUrl,
  deleteOldLoginAttempts,
  issueEmailedLoginToken,
  recordLoginAttempt,
} from "@/lib/affiliate/session";
import { sendToCustomer } from "@/lib/email/send";
import { partnerLoginLink } from "@/lib/email/templates";
import { safeErrorTag } from "@/lib/marketing/addContact";

export type PartnerLoginState = { message: string } | null;

const SENT_MESSAGE = "If that email belongs to a partner, a sign-in link is on its way.";
const EMAIL_MAX_LENGTH = 254;

function normalizeEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= EMAIL_MAX_LENGTH ? email : null;
}

// The IP goes into the hash and nowhere else. Without the secret the hash would be guessable from
// the IP, so nothing is stored and no link goes out.
async function currentVisitorHash(): Promise<string | null> {
  const secret = (process.env.AFFILIATE_HASH_SECRET ?? "").trim();
  if (!secret) {
    console.error("Partner login refused: AFFILIATE_HASH_SECRET is not set");
    return null;
  }

  const requestHeaders = await headers();
  return computeVisitorHash({
    secret,
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
    userAgent: requestHeaders.get("user-agent") ?? "",
  });
}

async function sendLoginLink(email: string): Promise<void> {
  try {
    const issued = await issueEmailedLoginToken(email);
    if (!issued) return;

    const { subject, html } = partnerLoginLink({
      loginUrl: buildPartnerLoginUrl(issued.rawToken),
      expiresInMinutes: EMAILED_LINK_TTL_MINUTES,
    });
    await sendToCustomer(issued.notifyEmail, subject, html);
  } catch (err) {
    console.error("Partner login link failed (non-fatal):", safeErrorTag(err));
  }
}

async function cleanUpLoginAttempts(): Promise<void> {
  try {
    await deleteOldLoginAttempts();
  } catch (err) {
    console.error("Partner login attempt cleanup failed (non-fatal):", safeErrorTag(err));
  }
}

export async function requestPartnerLoginLink(
  _prev: PartnerLoginState,
  formData: FormData,
): Promise<PartnerLoginState> {
  // A Server Action is reachable by POST without its page rendering, so the layout's flag check
  // does not cover it.
  if (!affiliatesEnabled()) return { message: SENT_MESSAGE };

  try {
    const email = normalizeEmail(formData.get("email"));
    const visitorHash = await currentVisitorHash();

    if (visitorHash && (await recordLoginAttempt(visitorHash))) {
      if (email) after(() => sendLoginLink(email));
    }
    after(cleanUpLoginAttempts);
  } catch (err) {
    console.error("Partner login request failed (non-fatal):", safeErrorTag(err));
  }

  return { message: SENT_MESSAGE };
}
