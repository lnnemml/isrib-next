/* AI-DRAFTED TEMPLATE — not legal advice; requires real legal review before launch (CLAUDE.md). */
import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalParagraph,
  LegalStrong,
} from "@/components/marketing/LegalPage";

// Faithful port of the live terms.html on the locked design system.
// Body copy is verbatim from the source. Header/Footer are global (root layout).
const SUBTITLE = "Please read these terms carefully before placing an order. Research use only.";

export function generateMetadata(): Metadata {
  return {
    title: "Terms of Service | ISRIB A15",
    description: "Legal terms governing the use of ISRIB.shop and purchases of research-use products.",
  };
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" subtitle={SUBTITLE} lastUpdated="Last updated: September 22, 2025">
      <LegalHeading>{"1) Acceptance of Terms"}</LegalHeading>
      <LegalParagraph>
        {"By accessing isrib.shop or placing an order, you agree to these Terms of Service (“Terms”). If you do not agree, please do not use the site."}
      </LegalParagraph>

      <LegalHeading>{"2) Research Use Only"}</LegalHeading>
      <LegalParagraph>
        {"All products are sold strictly for "}
        <LegalStrong>{"laboratory research use only"}</LegalStrong>
        {". They are "}
        <LegalStrong>{"not"}</LegalStrong>
        {" intended for human or animal consumption, medical, diagnostic, or therapeutic use. You confirm that you are a qualified individual or organization capable of safely handling research materials."}
      </LegalParagraph>

      <LegalHeading>{"3) Eligibility"}</LegalHeading>
      <LegalParagraph>
        {"You must be of legal age and legally permitted to purchase and possess the materials in your jurisdiction. You are responsible for compliance with all applicable laws and regulations."}
      </LegalParagraph>

      <LegalHeading>{"4) Ordering & Fulfilment"}</LegalHeading>
      <LegalParagraph>
        {"Orders are requests to purchase and are subject to review and acceptance. We may refuse or cancel any order at our discretion (e.g., due to availability, compliance concerns, or incorrect information)."}
      </LegalParagraph>

      <LegalHeading>{"5) Pricing & Payments"}</LegalHeading>
      <LegalParagraph>
        {"Prices are listed on the site and may change without notice. Unless otherwise stated, payments are processed "}
        <LegalStrong>{"manually"}</LegalStrong>
        {" after your request (you will receive instructions by email or Telegram). Your order is not confirmed until payment is received and verified."}
      </LegalParagraph>

      <LegalHeading>{"6) Shipping, Risk & Delays"}</LegalHeading>
      <LegalParagraph>
        {"Shipping terms and timelines are estimates and not guarantees. Risk of loss passes to you upon transfer to the carrier. You are responsible for import, customs, duties, and ensuring the shipment is lawful in your location."}
      </LegalParagraph>

      <LegalHeading>{"7) Returns & Cancellations"}</LegalHeading>
      <LegalParagraph>
        {"Due to the nature of research materials, returns are generally "}
        <LegalStrong>{"not accepted"}</LegalStrong>
        {" once an order has shipped. If you wish to cancel, contact us immediately; we will attempt to assist if the order has not yet been dispatched."}
      </LegalParagraph>

      <LegalHeading>{"8) Quality & Documentation"}</LegalHeading>
      <LegalParagraph>
        {"Where available, batch identifiers and/or analytical notes may be provided. See Quality Control for our general practices. We make reasonable efforts to ensure accuracy of information, but minor variations may occur."}
      </LegalParagraph>

      <LegalHeading>{"9) No Warranties"}</LegalHeading>
      <LegalParagraph>
        {"Products are provided “as is” for research use only, without any express or implied warranties, including but not limited to merchantability, fitness for a particular purpose, or non‑infringement."}
      </LegalParagraph>

      <LegalHeading>{"10) Limitation of Liability"}</LegalHeading>
      <LegalParagraph>
        {"To the maximum extent permitted by law, isrib.shop shall not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss arising from misuse, improper handling, or unlawful use of products."}
      </LegalParagraph>

      <LegalHeading>{"11) Compliance & Indemnity"}</LegalHeading>
      <LegalParagraph>
        {"You agree to comply with all applicable laws and to indemnify and hold isrib.shop harmless from claims arising out of your use, handling, storage, import, or resale of products."}
      </LegalParagraph>

      <LegalHeading>{"12) Intellectual Property"}</LegalHeading>
      <LegalParagraph>
        {"All site content (text, graphics, logos, layout) is owned by or licensed to isrib.shop and protected by applicable laws. You may not copy or reuse content without permission."}
      </LegalParagraph>

      <LegalHeading>{"13) Privacy"}</LegalHeading>
      <LegalParagraph>
        {"Your use of the site is also subject to our Privacy Policy. By submitting any personal data, you consent to its processing as described there."}
      </LegalParagraph>

      <LegalHeading>{"14) Changes to the Terms"}</LegalHeading>
      <LegalParagraph>
        {"We may update these Terms from time to time. Continued use of the site following changes constitutes acceptance of the revised Terms."}
      </LegalParagraph>
    </LegalPage>
  );
}
