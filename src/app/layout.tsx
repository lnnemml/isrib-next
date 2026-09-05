import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { RefCapture } from "@/components/RefCapture";

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
        <CartProvider>
          {/* ADR 0014 — capture a `?ref` code into a cookie from any landing page.
              useSearchParams needs a Suspense boundary so prerendered (static)
              marketing pages aren't bailed out of static rendering. Renders no UI. */}
          <Suspense fallback={null}>
            <RefCapture />
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
