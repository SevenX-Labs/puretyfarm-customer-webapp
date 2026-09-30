import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { SERVICEABLE_AREAS } from "@/data/serviceableAreas";
import { getWhatsAppUrl, getPhoneUrl } from "@/lib/cta";
import { ENV } from "@/config/env";

export const metadata: Metadata = {
  title: "Delivery Coverage Status",
  description:
    "PuretyFarm A2 Cow Milk delivery coverage and empty state inquiry page.",
};

export default function EmptyStatePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFDF7] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DFD4] shadow-sm text-center">
          {/* Friendly Icon */}
          <div className="w-20 h-20 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] mx-auto flex items-center justify-center text-4xl mb-6">
            🥛
          </div>

          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 rounded-full px-3.5 py-1 mb-3">
            Coverage Inquiry
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
            Locality Not Yet Covered
          </h1>

          <p className="mt-3 text-base text-[#3A241C]/80 leading-relaxed">
            We are actively expanding our early-morning cold chain across Raipur. If your colony is not on our current delivery list, let us know!
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppUrl("Hi PuretyFarm, I would like to request A2 milk delivery for my locality.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <span>Request on WhatsApp</span>
            </a>
            <Link
              href="/#service-area"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#E8DFD4] text-sm font-semibold text-[#3A241C] hover:bg-[#FBF6EE] transition-colors"
            >
              Check Active Areas
            </Link>
          </div>

          {/* Active Areas reference */}
          <div className="mt-8 pt-6 border-t border-[#E8DFD4] text-left">
            <p className="text-xs font-bold text-[#1A1008] mb-2 uppercase tracking-wide">
              Currently Servicing 23+ Raipur Localities:
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs text-[#3A241C]/75">
              {SERVICEABLE_AREAS.slice(0, 12).map((a) => (
                <span key={a} className="bg-[#FBF6EE] px-2 py-1 rounded-md border border-[#E8DFD4]/60">
                  {a}
                </span>
              ))}
              <span className="text-[#5C1B13] font-medium self-center pl-1">+ {SERVICEABLE_AREAS.length - 12} more</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
