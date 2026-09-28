import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";

// How to Pay with Crypto — crypto-conversion recovery guide (PayPal removed; crypto is
// now the primary rail). Static Server Component mirroring the About page's structure and
// locked design-system class strings. Header/Footer are global (root layout); this page
// renders only the page body.
//
// Compliance: no card fields / Pay-Now / Stripe; no guarantee / refund / money-back
// language; no efficacy or health-outcome claims; providers (Trust Wallet, Paybis,
// Binance, Coinbase, Kraken) are named only as examples, never endorsed as "best".
const HERO_SUBTITLE =
  "New to crypto? It is simpler than it looks. If you have ever paid with a card online, you can do this in about ten minutes. Below are three ways to pay — starting with the easiest.";

export function generateMetadata(): Metadata {
  return {
    title: "How to Pay with Crypto | ISRIB A15",
    description:
      "A simple, step-by-step guide to paying for your order with cryptocurrency — even if you have never used crypto before.",
  };
}

// The three payment methods. Method 1 is the recommended path (wallet app) and renders in
// an accent card with a RECOMMENDED pill.
const METHODS: {
  title: string;
  recommended?: boolean;
  summary: string;
  steps: string[];
  warning: string;
}[] = [
  {
    title: "Buy Litecoin in a wallet app and send it",
    recommended: true,
    summary:
      "Best if you have never used crypto. A free wallet app buys the coin with your card, then you send it to us. Litecoin keeps this simple — nothing extra to set up.",
    steps: [
      "Install a free wallet app — for example Trust Wallet. You only need an email to start.",
      "Inside the app, tap Buy and choose Litecoin (LTC). Pay with your Visa or Mastercard. There is a quick one-time ID check for larger amounts.",
      "When the LTC appears in your wallet, tap Send and paste the Litecoin address from your ISRIB order email (or invoice page).",
      "Send it. The payment lands in a few minutes and your order confirms automatically.",
    ],
    warning:
      "⚠ Double-check the address before sending — copy and paste it, never type it by hand. Crypto sent to a wrong address cannot be recovered.",
  },
  {
    title: "Buy and send in one step (no wallet needed)",
    summary:
      "Even faster if you would rather not install a wallet. An on-ramp buys the coin with your card and sends it straight to our address.",
    steps: [
      "Go to an on-ramp such as Paybis (an on-ramp also used by some wallet apps). Choose a coin your order email lists — USDT on the TRON (TRC-20) network, or Litecoin.",
      "Paste our matching address from your order email as the recipient, and enter the amount shown.",
      "Pay with your card. The coin is delivered directly to us, usually within minutes, and your order confirms automatically.",
    ],
    warning:
      "⚠ Copy and paste the address, and if you pick USDT make sure the network is TRON (TRC-20).",
  },
  {
    title: "If you already use an exchange",
    summary:
      "Lowest fees if you already have an account somewhere like Binance, Coinbase, or Kraken.",
    steps: [
      "Buy USDT or Litecoin in your exchange account (or use coins you already hold).",
      "Choose Withdraw and paste the matching address from your ISRIB order email. For USDT, select the TRON (TRC-20) network.",
      "Confirm the withdrawal. Your order confirms automatically once it arrives.",
    ],
    warning:
      "⚠ For USDT, make sure you pick the TRON (TRC-20) network on withdrawal — the wrong network means the funds will not arrive.",
  },
];

const SAFETY_CHECKS: string[] = [
  "You picked the right network — for USDT that is TRON (TRC-20); Litecoin and Bitcoin each have only one network.",
  "The address matches the one in your order email, character-for-character (copy-paste, do not retype).",
  "You are sending the same coin the address is for — Litecoin to a Litecoin address, and so on.",
];

export default function HowToPayCryptoPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-16 text-center">
          <h1 className="text-h1 font-extrabold tracking-tight bg-gradient-to-br from-blue-800 to-cyan-500 bg-clip-text text-transparent">
            {"How to Pay with Crypto"}
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-body text-text-muted">{HERO_SUBTITLE}</p>
        </div>
      </section>

      {/* Which coin + 10% — accent card */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <Card accent className="mx-auto max-w-[820px]">
          <h2 className="text-h3 font-semibold text-text">{"Which coin should I use?"}</h2>
          <p className="mt-3 text-body text-text-muted">
            {"It matters less than you might think — we accept Bitcoin, Litecoin, USDT and others, and every payment is automatically converted to its dollar value. Pick whatever your app makes easiest:"}
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            <li className="flex items-start gap-3 text-body text-text-muted">
              <span className="mt-1 shrink-0 font-mono text-success">{"•"}</span>
              <span>
                {"Buying in a wallet app and sending it yourself? Litecoin (LTC) or Bitcoin (BTC) are the simplest — the small network fee comes out of the coin itself, with nothing extra to set up."}
              </span>
            </li>
            <li className="flex items-start gap-3 text-body text-text-muted">
              <span className="mt-1 shrink-0 font-mono text-success">{"•"}</span>
              <span>
                {"Using an exchange, or an on-ramp that sends straight to us? USDT works well and stays stable at about one dollar."}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-small text-text-muted">
            {"Note: USDT on the TRON (TRC-20) network needs a little TRX in your wallet to cover the send fee — an extra step you skip entirely with Litecoin or Bitcoin."}
          </p>
          <p className="mt-4 text-small text-text-muted">
            {"If you chose Crypto at checkout, the automatic payment page also accepts Monero (XMR) and 50+ other coins — handy if you value privacy."}
          </p>
          <p className="mt-4 text-body">
            <span className="font-semibold text-success">
              {"Paying with crypto also takes 10% off your order — applied automatically."}
            </span>
          </p>
        </Card>
      </section>

      {/* Where is my payment address? — plain muted card */}
      <section className="border-y border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-[90px]">
          <Card className="mx-auto max-w-[820px]">
            <h2 className="text-h3 font-semibold text-text">{"First: where do I send payment?"}</h2>
            <p className="mt-3 text-body text-text-muted">
              {"If you chose Crypto at checkout: your payment page (the link in your order email) shows the exact coin, address, amount, and a QR code."}
            </p>
            <p className="mt-3 text-body text-text-muted">
              {"If you chose manual payment: your order email lists addresses for Litecoin, Bitcoin and USDT — send whichever you bought."}
            </p>
          </Card>
        </div>
      </section>

      {/* The three methods */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <h2 className="mb-12 text-center text-h2 font-bold text-text">{"Three ways to pay"}</h2>
        <div className="mx-auto flex max-w-[820px] flex-col gap-8">
          {METHODS.map((m, i) => (
            <Card key={m.title} accent={m.recommended} className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-h3 font-semibold text-text">{m.title}</h3>
                {m.recommended ? (
                  <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-success">
                    {"Recommended"}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-body text-text-muted">{m.summary}</p>
              <ol className="mt-6 flex list-none flex-col gap-5">
                {m.steps.map((step, s) => (
                  <li key={s} className="flex items-start gap-5">
                    <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] bg-primary font-mono text-[17px] font-semibold text-white">
                      {`${s + 1}`}
                    </span>
                    <p className="pt-1.5 text-body text-text-muted">{step}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-small text-text-muted">{m.warning}</p>
              {/* Keep the map index referenced for a stable, meaningful ordering. */}
              <span className="sr-only">{`Method ${i + 1}`}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Safety checklist — surface-soft section */}
      <section className="border-y border-border bg-surface-soft">
        <div className="mx-auto max-w-[--container-page] px-8 py-[90px]">
          <Card className="mx-auto max-w-[820px]">
            <h2 className="text-h3 font-semibold text-text">{"A 20-second safety check"}</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {SAFETY_CHECKS.map((check) => (
                <li key={check} className="flex items-start gap-3 text-body text-text-muted">
                  <span className="mt-1 shrink-0 font-mono text-success">{"✓"}</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA band — dark (inverse Card) */}
      <section className="mx-auto max-w-[--container-page] px-8 py-[90px]">
        <Card inverse className="p-[52px] text-center">
          <h2 className="text-h2 font-bold text-white">{"Stuck? We will walk you through it."}</h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-body text-slate-300">
            {"Crypto can feel unfamiliar the first time. Reply to your order email, or reach us on Telegram or Signal, and we will guide you step by step — no question is too basic."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact">
              <Button variant="primary">{"Get help"}</Button>
            </a>
            <a href="/products">
              <Button variant="secondary">{"Browse products"}</Button>
            </a>
          </div>
        </Card>
      </section>
    </main>
  );
}
