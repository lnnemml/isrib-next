"use server";

// Soft opt-in server action for the /go "Get the research" section (S8.5). Persists a
// non-buyer's email into the canonical marketing list (marketing_contacts, ADR 0017) so
// the research/education emails the section promises are actually deliverable. Research
// lead magnet ONLY — no results/health claims anywhere in this path. All DB access via
// Drizzle (no raw SQL outside src/lib/db). Idempotent: a repeat submit MUST NOT error.

import { db } from "@/lib/db";
import { marketingContacts } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export interface SubscribeResearchInput {
  email: string;
  firstName?: string;
}

export type SubscribeResearchResult = { ok: true } | { error: string };

// Pragmatic, permissive email shape check (server-authoritative; the client field is
// cosmetic). Not RFC-exhaustive by design — just rejects the obviously malformed.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeResearch(
  input: SubscribeResearchInput,
): Promise<SubscribeResearchResult> {
  try {
    const email = (input?.email ?? "").trim().toLowerCase();
    const firstName = (input?.firstName ?? "").trim() || null;

    if (!email || !EMAIL_RE.test(email)) {
      return { error: "Please enter a valid email address." };
    }

    // Insert as a fresh marketing contact from the /go research funnel. onConflictDoNothing
    // on the unique email column makes a repeat submit a silent no-op success (idempotent) —
    // never surfaces a unique-violation to the visitor. `source` is free text (no migration
    // needed); "go_research" segments these leads for the research broadcast.
    await db
      .insert(marketingContacts)
      .values({
        id: nanoid(),
        email,
        firstName,
        source: "go_research",
      })
      .onConflictDoNothing({ target: marketingContacts.email });

    return { ok: true };
  } catch (err) {
    console.error("subscribeResearch failed:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
