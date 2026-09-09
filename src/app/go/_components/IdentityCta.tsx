"use client";

import { Button } from "@/components/ui";

// S6 · Identity CTA (ch08 identification) [B6]. Voiced H2 + body attach the optimizer
// identity the prospect longs for; CTA → #offer. Copy verbatim from the deck's FINAL
// VOICED LINES block.
export default function IdentityCta() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-surface py-[90px]">
      <div className="mx-auto max-w-[720px] px-8 text-center">
        <h2 className="mb-6 text-h2 font-bold">
          You've optimized everything else. This is the one pathway you haven't touched.
        </h2>
        <p className="mb-10 text-body-lg text-text-muted">
          You've tuned your sleep, your training, your food. And one biological brake has been
          quietly capping the payoff on all of it. Trying A15 isn't reckless. It's just the next
          experiment — for someone who runs on their mind.
        </p>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => scrollTo("offer")}>
          Order ISRIB A15
        </Button>
      </div>
    </section>
  );
}
