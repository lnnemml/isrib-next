import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { RefCapture } from "@/components/RefCapture";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/analytics/GoogleTagManager";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { RouteChangeTracker } from "@/components/analytics/RouteChangeTracker";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ISRIB A15",
  description: "Research compound platform — placeholder metadata.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-text antialiased">
        {/* GTM <noscript> iframe — GTM install guidance places it immediately after the
            opening <body>. No-op (renders null) until NEXT_PUBLIC_GTM_ID is set. */}
        <GoogleTagManagerNoScript />
        {/* Analytics bootstraps (afterInteractive). GTM container + Meta Pixel base
            code. GA4/Clarity are GTM tags, not injected here (ADR 0005 hybrid model).
            Both render null when their env ID is absent. */}
        <GoogleTagManager />
        <MetaPixel />
        <CartProvider>
          {/* ADR 0014 — capture a `?ref` code into a cookie from any landing page.
              useSearchParams needs a Suspense boundary so prerendered (static)
              marketing pages aren't bailed out of static rendering. Renders no UI. */}
          <Suspense fallback={null}>
            <RefCapture />
            {/* Fires GA4-only page_view on SPA route changes (client nav doesn't reload
                the document). Suspense-wrapped alongside RefCapture — consistent and safe
                if cacheComponents is later enabled (usePathname can suspend). Renders no UI. */}
            <RouteChangeTracker />
          </Suspense>
          {/* ChromeGate hides Header/Footer on /admin* (dense internal tool owns the
              viewport); every other route keeps the marketing chrome. The <main> wrapper
              is shared — flex-1 full-width is harmless for the admin dashboard. */}
          <ChromeGate header={<Header />} footer={<Footer />}>
            <main className="flex-1">{children}</main>
          </ChromeGate>
        </CartProvider>
      </body>
    </html>
  );
}
