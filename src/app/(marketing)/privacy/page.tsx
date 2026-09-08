/* AI-DRAFTED TEMPLATE — not legal advice; requires real legal review before launch (CLAUDE.md). */
import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalSubHeading,
  LegalParagraph,
  LegalList,
  LegalStrong,
} from "@/components/marketing/LegalPage";

// Faithful port of the live privacy.html on the locked design system.
// Body copy is verbatim from the source. Header/Footer are global (root layout).
const SUBTITLE = "How we collect, use, and protect your information. Research use only.";

export function generateMetadata(): Metadata {
  return {
    title: "Privacy Policy | ISRIB A15",
    description: "Privacy Policy explaining what data we collect, how we use it, and your rights.",
  };
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" subtitle={SUBTITLE} lastUpdated="Last updated: September 8, 2026">
      <LegalParagraph>
        {"This Privacy Policy explains how "}
        <LegalStrong>{"ISRIB.shop"}</LegalStrong>
        {" (“we”, “us”, “our”) collects, uses, and protects personal data when you visit our website or contact us."}
      </LegalParagraph>

      <LegalHeading>{"1) Data We Collect"}</LegalHeading>
      <LegalList>
        <li>
          <LegalStrong>{"Contact data:"}</LegalStrong>
          {" name, email, messenger handle (e.g., Telegram), and messages you submit via forms or chat."}
        </li>
        <li>
          <LegalStrong>{"Order‑related data:"}</LegalStrong>
          {" product interest and pack/price selections you submit to request a manual order."}
        </li>
        <li>
          <LegalStrong>{"Technical data:"}</LegalStrong>
          {" IP address, browser type, device info, pages visited (via standard server logs and analytics)."}
        </li>
        <li><LegalStrong>{"Account data:"}</LegalStrong>{" if you create an account: your name, email, a hashed password (we never store it in plaintext), email‑verification status, a personal referral code, and your account id and creation date."}</li>
        <li><LegalStrong>{"Order history:"}</LegalStrong>{" orders placed under your account, including earlier orders you placed before accounts existed, so you can view them when signed in."}</li>
      </LegalList>

      <LegalHeading>{"2) Cart & Local Storage"}</LegalHeading>
      <LegalParagraph>
        {"To provide a smooth browsing experience, the site uses the browser’s "}
        <LegalStrong>{"localStorage"}</LegalStrong>
        {" to keep your cart items and preferences on your device. This data is not transmitted to us unless you "}
        <em>{"submit"}</em>
        {" a form (e.g., checkout request) — only then the cart contents are included in the request payload. You can clear this data any time by emptying the cart or clearing your browser storage."}
      </LegalParagraph>

      <LegalHeading>{"Accounts & Sessions"}</LegalHeading>
      <LegalParagraph>{"Accounts are optional. When you register, your password is hashed and salted before storage — we never store or see your plaintext password. Signing in sets a secure, http‑only session cookie (isrib_customer_session) that keeps you logged in for about 30 days. Email‑verification and password‑reset links are single‑use and time‑limited."}</LegalParagraph>

      <LegalHeading>{"3) How We Use Your Data"}</LegalHeading>
      <LegalList>
        <li>{"To respond to inquiries and process manual orders."}</li>
        <li>{"To communicate about availability, payment, and shipping."}</li>
        <li>{"To maintain security, prevent abuse, and improve site performance."}</li>
        <li>{"To comply with legal obligations (e.g., basic record keeping)."}</li>
      </LegalList>

      <LegalHeading>{"4) Legal Bases (GDPR‑style)"}</LegalHeading>
      <LegalList>
        <li>
          <LegalStrong>{"Contract/steps prior to contract:"}</LegalStrong>
          {" handling your request and order details."}
        </li>
        <li>
          <LegalStrong>{"Legitimate interests:"}</LegalStrong>
          {" operating, improving, and securing our website/services."}
        </li>
        <li>
          <LegalStrong>{"Consent:"}</LegalStrong>
          {" where required (e.g., certain cookies and analytics/marketing)."}
        </li>
        <li>
          <LegalStrong>{"Legal obligation:"}</LegalStrong>
          {" where retention is required by law."}
        </li>
      </LegalList>

      <LegalHeading>{"5) Data Retention"}</LegalHeading>
      <LegalParagraph>
        {"We keep personal data only as long as necessary for the purposes described above, then delete or anonymize it, unless a longer retention is required by law or to establish, exercise, or defend legal claims."}
      </LegalParagraph>

      <LegalHeading>{"6) Sharing of Data"}</LegalHeading>
      <LegalParagraph>{"We do not sell personal data. We may share limited data with:"}</LegalParagraph>
      <LegalList>
        <li>
          <LegalStrong>{"Service providers"}</LegalStrong>
          {" (e.g., hosting, serverless form handlers, live chat) strictly to operate the site and answer your requests."}
        </li>
        <li>
          <LegalStrong>{"Authorities"}</LegalStrong>
          {" when required by law or to protect our rights and safety."}
        </li>
        <li><LegalStrong>{"Sub‑processors"}</LegalStrong>{" listed below in “Third‑Party Services”, each strictly to operate the store, take payment, send email, and measure performance."}</li>
      </LegalList>
      <LegalSubHeading>{"Email Communications"}</LegalSubHeading>
      <LegalParagraph>
        {"We may send you transactional emails related to your orders and cart recovery reminders. You can unsubscribe from marketing emails at any time by clicking the \"Unsubscribe\" link at the bottom of any email or visiting our unsubscribe page."}
      </LegalParagraph>

      <LegalHeading>{"7) International Transfers"}</LegalHeading>
      <LegalParagraph>
        {"Some providers may process data in other countries. Where applicable, we rely on appropriate safeguards (e.g., standard contractual clauses)."}
      </LegalParagraph>

      <LegalHeading>{"8) Your Rights"}</LegalHeading>
      <LegalParagraph>
        {"Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, object, port your data, or withdraw consent. To exercise these rights, contact us via the details below."}
      </LegalParagraph>

      <LegalHeading>{"Referral Program Data"}</LegalHeading>
      <LegalParagraph>{"If you take part in the referral program, we store your referral code, a record of which orders were referred, and any discount credits you earn, so we can run the program and apply your rewards."}</LegalParagraph>

      <LegalHeading>{"9) Cookies & Analytics"}</LegalHeading>
      <LegalParagraph>{"We use cookies that are essential to operate the site — including your sign‑in session (isrib_customer_session) and, where relevant, referral and promo cookies (isrib_ref, isrib_promo) that remember a code you arrived with."}</LegalParagraph>
      <LegalParagraph>{"We also use analytics and advertising measurement: Meta Pixel and Conversions API (which may set _fbp/_fbc cookies), Google Analytics 4, and Microsoft Clarity. These help us understand traffic and improve the site. You can limit cookies via your browser settings."}</LegalParagraph>

      <LegalHeading>{"10) Security"}</LegalHeading>
      <LegalParagraph>{"We implement reasonable technical and organizational measures to protect personal data: passwords are hashed and salted, data is encrypted in transit (HTTPS), and access is limited to what is needed to operate the store. However, no online transmission or storage system is 100% secure."}</LegalParagraph>

      <LegalHeading>{"11) Third‑Party Services"}</LegalHeading>
      <LegalList>
        <li><LegalStrong>{"Hosting:"}</LegalStrong>{" Vercel — serves the website and runs our server functions."}</li>
        <li><LegalStrong>{"Database:"}</LegalStrong>{" Neon (PostgreSQL) — stores orders, account, and referral data."}</li>
        <li><LegalStrong>{"Email:"}</LegalStrong>{" Resend — sends order, verification, and account emails; Upstash schedules order‑reminder emails."}</li>
        <li><LegalStrong>{"Payments:"}</LegalStrong>{" NowPayments — processes cryptocurrency payments; we receive confirmation of payment status."}</li>
        <li><LegalStrong>{"Analytics/Advertising:"}</LegalStrong>{" Meta, Google Analytics, and Microsoft Clarity — measure site usage and marketing performance."}</li>
      </LegalList>

      <LegalHeading>{"12) Contact"}</LegalHeading>
      <LegalParagraph>
        {"For privacy requests or questions, contact us via the contact page or Telegram. We reply as soon as possible."}
      </LegalParagraph>

      <LegalHeading>{"13) Changes to This Policy"}</LegalHeading>
      <LegalParagraph>
        {"We may update this Privacy Policy from time to time. The “Last updated” date reflects the latest version. Continued use of the site after changes means you accept the updated Policy."}
      </LegalParagraph>
    </LegalPage>
  );
}
