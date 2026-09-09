import Hero from "./Hero";
import Agitation from "./Agitation";
import Mechanism from "./Mechanism";
import Differentiation from "./Differentiation";
import TrustSafety from "./TrustSafety";
import IdentityCta from "./IdentityCta";
import Offer from "./Offer";
import Faq from "./Faq";
import FinalCta from "./FinalCta";

// Shell for the /go paid-traffic landing. Belief-gate order (go-rewrite.md): Hero →
// Agitation → Mechanism (dark) → Differentiation → Trust/Safety → Identity CTA → Offer →
// FAQ → Final CTA. No email-capture modal (dropped in the belief-gate rewrite), so this
// is a plain shell with no state. Chrome (Header/Footer) is hidden for /go via ChromeGate,
// so this is the entire visible page.
export default function GoLanding() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Agitation />
      <Mechanism />
      <Differentiation />
      <TrustSafety />
      <IdentityCta />
      <Offer />
      <Faq />
      <FinalCta />
    </main>
  );
}
