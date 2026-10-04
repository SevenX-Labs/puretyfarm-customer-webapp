import { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { PRIVACY_POLICY_DATA } from "@/data/privacyContent";
import type { HighlightIconType } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | PuretyFarm Raipur",
  description:
    "Official Privacy Policy of PURETYFARM (Raipur, Chhattisgarh). Learn how we collect, process, and protect your information under the Information Technology Act, 2000.",
  openGraph: {
    title: "Privacy Policy | PuretyFarm Raipur",
    description:
      "Official Privacy Policy of PURETYFARM. Information collection, zero-selling guarantee, and data protection policies.",
    url: "https://puretyfarm.com/privacy-policy",
    type: "website",
  },
  alternates: {
    canonical: "/privacy-policy",
  },
};

const PRIVACY_HIGHLIGHTS: {
  icon: HighlightIconType;
  tag: string;
  title: string;
  description: string;
}[] = [
  {
    icon: "shield",
    tag: "Strict Guarantee",
    title: "Zero Third-Party Selling",
    description:
      "We never sell, rent, or trade your contact info or personal identifiers to third-party brokers or advertisers.",
  },
  {
    icon: "lock",
    tag: "Bank Grade",
    title: "PCI-DSS Vault Security",
    description:
      "Payments are tokenized by PCI-compliant gateways. Sensitive card numbers are never stored on local servers.",
  },
  {
    icon: "map",
    tag: "Raipur Delivery",
    title: "Delivery-Only Location Use",
    description:
      "Your address and location permissions are used strictly to route morning deliveries before 10:00 AM.",
  },
  {
    icon: "clock",
    tag: "User Control",
    title: "5-Day Consent Withdrawal",
    description:
      "Withdraw consent or request data removal anytime with our Grievance Desk; requests take effect within 5 business days.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      document={PRIVACY_POLICY_DATA}
      activeSlug="privacy-policy"
      highlights={PRIVACY_HIGHLIGHTS}
    />
  );
}
