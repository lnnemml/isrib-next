"use server";

// Login Server Action (ADR 0011). No client-side signIn — the password is verified
// server-side, and on success a signed JWT session cookie is set. verifyPassword lives
// in src/lib/admin/auth.ts (node:crypto) and is only ever imported here, never by the
// Edge middleware.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ADMIN_COOKIE, createSessionToken, verifyPassword } from "@/lib/admin/auth";

export type LoginState = { error: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    const password = (formData.get("password") as string | null) ?? "";
    if (!verifyPassword(password)) {
      return { error: "Incorrect password." };
    }

    const token = await createSessionToken();
    // cookies() is async in Next 16 — must be awaited.
    (await cookies()).set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    redirect("/admin");
  } catch (err) {
    // redirect() signals success by throwing NEXT_REDIRECT — must be re-thrown.
    if (isRedirectError(err)) throw err;
    console.error("admin login failed:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
