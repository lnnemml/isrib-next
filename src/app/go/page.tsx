import type { Metadata } from "next";
import GoLanding from "./_components/GoLanding";

// Ad-funnel landing page. robots index:false so it does not compete with the canonical
// /products/isrib-a15 page in search (follow:true so link equity still flows). Title +
// description drawn from the hero.
export const metadata: Metadata = {
  title: "ISRIB A15 — Your Brain Isn't Broken. It's Stuck.",
  description:
    "Under chronic stress, your brain cells slam on a brake — a pathway called the Integrated Stress Response. ISRIB A15 is the research compound built to release it.",
  robots: { index: false, follow: true },
};

export default function GoPage() {
  return <GoLanding />;
}
