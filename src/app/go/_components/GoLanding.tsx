import Hero from "./Hero";
import Agitation from "./Agitation";
import Mechanism from "./Mechanism";
import Differentiation from "./Differentiation";
import TrustSafety from "./TrustSafety";
import IdentityCta from "./IdentityCta";
import Offer from "./Offer";
import Faq from "./Faq";
import ResearchOptIn from "./ResearchOptIn";
import FinalCta from "./FinalCta";

// Shell for the /go paid-traffic landing. Belief-gate order (go-rewrite.md): Hero →
// Agitation → Mechanism (dark) → Differentiation → Trust/Safety → Identity CTA → Offer →
// FAQ → Research opt-in (S8.5, soft secondary path for non-buyers) → Final CTA. Chrome
// (Header/Footer) is hidden for /go via ChromeGate, so this is the entire visible page.
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
      <ResearchOptIn />
      <FinalCta />
    </main>
  );
}
