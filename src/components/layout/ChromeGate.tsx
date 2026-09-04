"use client";

// Chrome isolation gate (task 1.7 C2 · admin-panel.md §5). The marketing Header/Footer
// must NOT render on /admin* — the admin dashboard is a dense internal tool that owns the
// full viewport. This runs client-side (usePathname) so the root layout can stay a Server
// Component and the chrome is server-rendered for every non-admin route.
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ChromeGate({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
