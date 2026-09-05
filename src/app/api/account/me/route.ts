import { getCurrentCustomer } from "@/lib/customer/auth";
import { NextResponse } from "next/server";

// Reads the session cookie — must never be statically cached. Isolating this dynamic
// read to a single endpoint keeps the rest of the app statically renderable (the
// AccountWidget fetches it client-side rather than layout.tsx reading the session).
export const dynamic = "force-dynamic";

export async function GET() {
  const c = await getCurrentCustomer();
  if (!c) return NextResponse.json({ customer: null });
  // PUBLIC fields ONLY — never leak passwordHash or any other row column.
  return NextResponse.json({ customer: { name: c.name, email: c.email } });
}
