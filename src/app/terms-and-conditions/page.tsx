import { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { TERMS_CONDITIONS_DATA } from "@/data/termsContent";
import type { HighlightIconType } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions | PuretyFarm Raipur",
  description:
    "Official Terms and Conditions of Puretyfarms (Raipur, Chhattisgarh). Governed under the Information Technology Act, 2000 and Companies Act, 2013.",
  openGraph: {
    title: "Terms & Conditions | PuretyFarm Raipur",
    description:
      "Official Customer Service Agreement and Terms of Use for Puretyfarm A2 milk subscriptions, cancellations, and delivery services.",
    url: "https://puretyfarm.com/terms-and-conditions",
    type: "website",
  },
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

const TERMS_HIGHLIGHTS: {
  icon: HighlightIconType;
  tag: string;
  title: string;
  description: string;
}[] = [
  {
    icon: "clock",
    tag: "Flexible Control",
    title: "11:00 PM IST Daily Cut-Off",
    description:
      "Modify, pause deliveries, or set Vacation Mode anytime before 11:00 PM IST on the preceding evening with zero penalty fees.",
  },
  {
    icon: "check",
    tag: "Cold Chain",
    title: "4°C Freshness Standards",
    description:
      "All milk is dawn-milked and farm-chilled; please store in the refrigerator and consume within 1–2 days of doorstep delivery.",
  },
  {
    icon: "card",
    tag: "Credit Facility",
    title: "Purety Credit Scheme",
    description:
      "Approved no-advance credit requires settling outstanding invoice amounts strictly before the due date.",
  },
  {
    icon: "map",
    tag: "Legal Venue",
    title: "Courts of Raipur, CG",
    description:
      "Operated by Puretyfarms under Indian law, with legal proceedings subject to the exclusive jurisdiction of the courts at Raipur, Chhattisgarh, India.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageShell
      document={TERMS_CONDITIONS_DATA}
      activeSlug="terms-and-conditions"
      highlights={TERMS_HIGHLIGHTS}
    />
  );
}
