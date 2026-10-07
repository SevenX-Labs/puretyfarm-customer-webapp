export interface NavLink {
  label: string;
  href: string;
  id: string;
}

export const MAIN_NAV_LINKS: readonly NavLink[] = [
  { label: "Why Us", href: "/#why-puretyfarm", id: "nav-why" },
  { label: "How It Works", href: "/#how-it-works", id: "nav-how" },
  { label: "Pricing", href: "/#pricing", id: "nav-pricing" },
  { label: "Testimonials", href: "/#testimonials", id: "nav-testimonials" },
  { label: "Contact", href: "/#contact", id: "nav-contact" },
  { label: "FAQs", href: "/#faq", id: "nav-faq" },
] as const;

export const FOOTER_EXPLORE_LINKS = [
  { label: "Why PuretyFarm", href: "/#why-puretyfarm" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "7-Day Starter Trial", href: "/#trial-offer" },
  { label: "Subscription Plans", href: "/#pricing" },
  { label: "PuretyFarm Mobile App", href: "/#app-showcase" },
  { label: "Frequently Asked Questions", href: "/#faq" },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Delete Account", href: "/delete-account" },
] as const;
