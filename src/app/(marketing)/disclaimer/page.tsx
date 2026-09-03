/* AI-DRAFTED TEMPLATE — not legal advice; requires real legal review before launch (CLAUDE.md). */
import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalParagraph,
  LegalStrong,
} from "@/components/marketing/LegalPage";

// Faithful port of the live disclaimer.html on the locked design system.
// Body copy is verbatim from the source. Header/Footer are global (root layout).
const SUBTITLE =
  "All products are sold strictly for laboratory research use only. No medical advice or claims.";

export function generateMetadata(): Metadata {
  return {
    title: "Disclaimer | ISRIB A15",
    description:
      "Disclaimer: All products are sold strictly for research use only. No medical advice or claims.",
  };
}

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" subtitle={SUBTITLE}>
      <LegalParagraph>
        <LegalStrong>{"ISRIB.shop"}</LegalStrong>
        {" provides access to research compounds for "}
        <LegalStrong>{"laboratory research use only"}</LegalStrong>
        {". Information on this website is for educational and research purposes and must not be interpreted as medical advice."}
      </LegalParagraph>

      <LegalHeading>{"1) No Medical Advice"}</LegalHeading>
      <LegalParagraph>
        {"This website does not provide or endorse medical advice, diagnosis, treatment, or cures. Nothing here should be interpreted as a recommendation to use any substance for therapeutic, performance, or health purposes."}
      </LegalParagraph>

      <LegalHeading>{"2) No Use in Humans or Animals"}</LegalHeading>
      <LegalParagraph>
        {"All materials are "}
        <LegalStrong>{"not intended for human or animal consumption"}</LegalStrong>
        {". Any ingestion, injection, inhalation, or application to the body is strictly prohibited and violates our Terms of Service."}
      </LegalParagraph>

      <LegalHeading>{"3) User Responsibility"}</LegalHeading>
      <LegalParagraph>
        {"The purchaser assumes full responsibility for safe handling, storage, and use of materials. Follow appropriate laboratory safety procedures and adhere to local laws and institutional requirements."}
      </LegalParagraph>

      <LegalHeading>{"4) Legal Compliance"}</LegalHeading>
      <LegalParagraph>
        {"It is your responsibility to determine and comply with all applicable laws and regulations regarding the possession, use, and import of any material ordered. We do not ship or sell to regions where such materials are restricted or prohibited."}
      </LegalParagraph>

      <LegalHeading>{"5) Limitation of Liability"}</LegalHeading>
      <LegalParagraph>
        {"To the maximum extent permitted by law, ISRIB.shop shall not be liable for damages, injuries, or legal consequences resulting from misuse, mishandling, or unauthorized application of products."}
      </LegalParagraph>

      <LegalHeading>{"6) Product Representation"}</LegalHeading>
      <LegalParagraph>
        {"Descriptions are based on internal data, analytical reports, or publicly available scientific literature. Minor batch variations may occur. No guarantees of efficacy, safety, or suitability for any non‑research purpose are made."}
      </LegalParagraph>

      <LegalHeading>{"7) Agreement"}</LegalHeading>
      <LegalParagraph>
        {"By accessing this site and placing an order or inquiry, you confirm your understanding of and agreement to this Disclaimer and related policies."}
      </LegalParagraph>
    </LegalPage>
  );
}
