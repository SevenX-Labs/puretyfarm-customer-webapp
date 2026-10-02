import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getWhatsAppUrl, getPhoneUrl, getEmailUrl } from "@/lib/cta";
import { ENV } from "@/config/env";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist on PuretyFarm.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-between">
      {/* Simple Header */}
      <header className="w-full border-b border-[#E8DFD4] bg-[#FFFDF7]/90 backdrop-blur-sm py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[#5C1B13] hover:text-[#4A1510] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Big friendly 404 visual */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="text-8xl sm:text-9xl font-extrabold text-[#5C1B13]/10 font-[family-name:var(--font-heading)] select-none">
              404
            </span>
            <div className="absolute text-5xl sm:text-6xl animate-bounce">
              🥛
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
            Fresh Milk Not Found
          </h1>

          <p className="mt-3 text-base text-[#3A241C]/80 leading-relaxed max-w-md mx-auto">
            It looks like this page was already picked up for morning delivery or the address is incorrect. Don&apos;t worry, pure A2 milk is still arriving daily in Raipur!
          </p>

          {/* Quick Action Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#5C1B13] text-white font-semibold text-sm hover:bg-[#4A1510] transition-colors shadow-sm"
            >
              Back to Home
            </Link>
            <Link
              href="/#service-area"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#E8DFD4] bg-white text-sm font-semibold text-[#3A241C] hover:bg-[#FBF6EE] transition-colors shadow-sm"
            >
              Check Delivery Areas
            </Link>
          </div>

          {/* Assistance contact block */}
          <div className="mt-10 p-5 rounded-2xl bg-[#FBF6EE] border border-[#E8DFD4]">
            <p className="text-xs font-semibold text-[#3A241C]/70 mb-3">
              Need assistance? We are happy to help:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <a
                href={getPhoneUrl()}
                className="text-[#5C1B13] hover:underline flex items-center gap-1"
              >
                📞 {ENV.PHONE_DISPLAY}
              </a>
              <span className="text-[#3A241C]/30">•</span>
              <a
                href={getWhatsAppUrl("Hi PuretyFarm, I reached a 404 page and need help.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline flex items-center gap-1"
              >
                💬 WhatsApp Support
              </a>
              <span className="text-[#3A241C]/30">•</span>
              <a
                href={getEmailUrl("Help with PuretyFarm Website")}
                className="text-[#3A241C] hover:underline flex items-center gap-1"
              >
                ✉️ {ENV.SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E8DFD4] text-center text-xs text-[#3A241C]/50">
        © {new Date().getFullYear()} PuretyFarm · Farm-Fresh Pure A2 Cow Milk in Raipur
      </footer>
    </div>
  );
}
