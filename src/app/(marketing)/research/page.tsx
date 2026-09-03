/* AI-DRAFTED TEMPLATE — not legal advice; requires real legal review before launch (CLAUDE.md). */
import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalParagraph,
  LegalList,
  LegalStrong,
} from "@/components/marketing/LegalPage";

// Faithful port of the live research.html on the locked design system.
// Body copy is verbatim from the source. Header/Footer are global (root layout).
const SUBTITLE = "All compounds are strictly for laboratory research. Not for human or animal use.";

export function generateMetadata(): Metadata {
  return {
    title: "Research Use Only | ISRIB A15",
    description:
      "All compounds from ISRIB.shop are strictly for laboratory research use only. Not for human or animal consumption.",
  };
}

export default function ResearchPage() {
  return (
    <LegalPage title="Research Use Only" subtitle={SUBTITLE}>
      <LegalParagraph>
        {"All compounds offered by "}
        <LegalStrong>{"ISRIB.shop"}</LegalStrong>
        {" are intended "}
        <LegalStrong>{"strictly for laboratory research use only"}</LegalStrong>
        {"."}
      </LegalParagraph>

      <LegalHeading>{"Not for Human or Animal Use"}</LegalHeading>
      <LegalParagraph>
        {"These products are not designed, intended, or approved for human or animal consumption. They are not dietary supplements, drugs, cosmetics, or therapeutic substances. Do not ingest, inject, inhale, or apply to the body under any circumstances."}
      </LegalParagraph>

      <LegalHeading>{"Intended Users"}</LegalHeading>
      <LegalParagraph>
        {"Our products are sold only to qualified professionals, institutions, researchers, and labs that understand how to handle research materials safely and responsibly. By placing a request or inquiry, you confirm that you are aware of the correct use and limitations of the substances involved."}
      </LegalParagraph>

      <LegalHeading>{"Handling Requirements"}</LegalHeading>
      <LegalList>
        <li>{"Use only in controlled lab environments by trained personnel."}</li>
        <li>{"Follow proper safety protocols, including PPE and containment procedures."}</li>
        <li>{"Store securely and restrict access to unauthorized individuals."}</li>
      </LegalList>

      <LegalHeading>{"Liability & Compliance"}</LegalHeading>
      <LegalParagraph>
        {"ISRIB.shop assumes no responsibility for misuse, handling outside of research settings, or violation of any applicable laws or regulations. It is your responsibility to ensure compliance with all local and national rules related to purchasing, importing, and using research materials."}
      </LegalParagraph>

      <LegalHeading>{"Documentation"}</LegalHeading>
      <LegalParagraph>
        {"If requested, we may provide a brief “For Research Use Only” letter for customs or internal compliance, but no product sold constitutes a controlled substance or regulated drug (unless stated otherwise)."}
      </LegalParagraph>
    </LegalPage>
  );
}
