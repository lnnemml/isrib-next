import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";

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
