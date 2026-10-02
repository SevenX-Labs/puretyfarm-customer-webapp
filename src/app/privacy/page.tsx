import { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getWhatsAppUrl, getPhoneUrl, getEmailUrl } from "@/lib/cta";
import { ENV } from "@/config/env";
import { FiArrowLeft, FiMail, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PuretyFarm's privacy policy regarding customer delivery addresses, phone numbers, and data protection in Raipur.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b border-[#E8DFD4] bg-[#FFFDF7]/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#5C1B13] hover:text-[#4A1510] transition-colors font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 px-3 py-1 rounded-full">
            Privacy & Trust
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#3A241C]/60">
            Last Updated: January 2025 · PuretyFarm Raipur
          </p>
        </div>

        <div className="space-y-6 text-[#3A241C] text-sm sm:text-base leading-relaxed">
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              1. Information We Collect
            </h2>
            <p className="text-[#3A241C]/85">
              To fulfill daily morning doorstep milk deliveries in Raipur, we collect essential delivery information including your name, delivery address, locality/landmark, and mobile phone number.
            </p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              2. How We Use Your Data
            </h2>
            <ul className="list-disc list-inside space-y-2 text-[#3A241C]/85">
              <li>To schedule and route daily morning milk dispatches between 5:30 AM and 7:00 AM.</li>
              <li>To send order confirmations and morning dispatch alerts via WhatsApp or SMS.</li>
              <li>To provide customer support for subscription changes, pauses, and billing inquiries.</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              3. Data Security & Zero Selling Policy
            </h2>
            <p className="text-[#3A241C]/85">
              We never sell, rent, or trade your personal information to third parties for marketing purposes. Your contact details are strictly used for your PuretyFarm milk deliveries and customer service.
            </p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              4. Contact Us Regarding Your Privacy
            </h2>
            <p className="text-[#3A241C]/85 mb-3">
              If you have any questions or wish to delete or update your contact information, contact us anytime:
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <a href={getEmailUrl("Privacy Inquiry")} className="text-[#5C1B13] hover:underline inline-flex items-center gap-1.5">
                <FiMail className="w-4 h-4" />
                <span>{ENV.SUPPORT_EMAIL}</span>
              </a>
              <a href={getPhoneUrl()} className="text-[#5C1B13] hover:underline inline-flex items-center gap-1.5">
                <FiPhone className="w-4 h-4" />
                <span>{ENV.PHONE_DISPLAY}</span>
              </a>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1.5">
                <FaWhatsapp className="w-4 h-4" />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E8DFD4] bg-white text-center text-xs text-[#3A241C]/50">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} PuretyFarm. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[#5C1B13]">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link href="/service-area" className="hover:underline">Service Areas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
