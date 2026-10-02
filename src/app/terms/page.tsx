import { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getWhatsAppUrl, getPhoneUrl, getEmailUrl } from "@/lib/cta";
import { ENV } from "@/config/env";
import { FiArrowLeft } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for PuretyFarm A2 Gir cow milk subscription, 7-day trial, morning delivery, and bottle return policy in Raipur.",
};

export default function TermsPage() {
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
            Customer Agreement
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-[#3A241C]/60">
            Last Updated: January 2025 · Applicable for Raipur, Chhattisgarh
          </p>
        </div>

        <div className="space-y-8 text-[#3A241C] text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              1. Service Overview & Subscription
            </h2>
            <p className="text-[#3A241C]/85">
              PuretyFarm provides fresh, unadulterated A2 Gir cow milk delivered in sanitized glass bottles directly to registered households across serviceable localities in Raipur, Chhattisgarh. By initiating a 7-day trial or recurring milk subscription, you agree to these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              2. 7-Day Risk-Free Trial Offer
            </h2>
            <ul className="list-disc list-inside space-y-2 text-[#3A241C]/85">
              <li>First-time customers are eligible for a 7-day trial at introductory rates with zero security deposit required.</li>
              <li>Delivery is conducted daily between 5:30 AM and 7:00 AM.</li>
              <li>If you are not satisfied with the purity or taste of our A2 milk during the trial, you are covered by our 100% money-back guarantee.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              3. Glass Bottle Return & Care Policy
            </h2>
            <p className="text-[#3A241C]/85 mb-3">
              To eliminate single-use plastics and protect milk quality, all PuretyFarm milk is delivered in sterilized glass bottles.
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#3A241C]/85">
              <li>Customers must rinse and place the previous day&apos;s empty glass bottle at their doorstep for morning collection by our delivery partner.</li>
              <li>Bottles remain the property of PuretyFarm. Damaged or lost bottles may incur a nominal replacement fee of ₹50 per bottle after notice.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              4. Pausing, Skipping & Vacation Mode
            </h2>
            <p className="text-[#3A241C]/85">
              Subscribers can pause or resume deliveries anytime through the PuretyFarm mobile app or by messaging our WhatsApp support before 8:00 PM on the preceding evening. There are zero cancellation charges or penalty fees for pauses.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              5. Quality Guarantee & FSSAI Standards
            </h2>
            <p className="text-[#3A241C]/85">
              Our milk is milked at dawn from ethically tended indigenous Desi Gir cows, tested with 40+ rigorous quality checks, cold-chained at 4°C, and delivered without preservatives or synthetic adulteration. All processes comply with FSSAI regulations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 rounded-2xl border border-[#E8DFD4]">
            <h2 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)]">
              6. Customer Support & Contact
            </h2>
            <p className="text-[#3A241C]/85 mb-3">
              For any queries regarding deliveries, schedule adjustments, or billing inquiries, reach out to our Raipur farm support:
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <a href={getPhoneUrl()} className="text-[#5C1B13] hover:underline">
                📞 {ENV.PHONE_DISPLAY}
              </a>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                💬 WhatsApp: {ENV.PHONE_DISPLAY}
              </a>
              <a href={getEmailUrl()} className="text-[#3A241C] hover:underline">
                ✉️ {ENV.SUPPORT_EMAIL}
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
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/service-area" className="hover:underline">Service Areas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
