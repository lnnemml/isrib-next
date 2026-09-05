import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/auth";

// Server-side guard for the cabinet — defence in depth behind the /account proxy
// branch (ADR 0013). `(cabinet)` is a ROUTE GROUP: it does not change the URL, so this
// layout wraps ONLY the guarded pages (/account, /account/orders, /account/orders/[id]).
// The public auth pages (login/register/reset/verify) live OUTSIDE this group and are
// unaffected — placing the guard here (not at the `account` segment) avoids a redirect
// loop on the login page itself.
export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login?callbackUrl=/account");
  }
  return children;
}
