"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { handleTrialClick } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import { FLAGS } from "@/config/flags";
import { FiCheck } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const BENEFITS = [
  "Delivered daily before 7:00 AM in sanitized glass bottles",
  "Free home delivery across Raipur — zero deposit required",
  "Daily morning WhatsApp updates with live route status",
  ...(FLAGS.SHOW_MONEY_BACK_GUARANTEE
    ? ["100% money-back guarantee if you don't taste the difference"]
    : []),
];

const TRIAL_VOLUMES = [
  {
    id: "half",
    label: "0.5 L",
    sub: "Couples",
    volumeStr: "0.5 Litre Daily (3.5L total)",
    bottles: "1 sanitized 500ml glass bottle",
    dailyPrice: 45,
    totalPrice: 315,
    popular: false,
  },
  {
    id: "one",
    label: "1.0 L",
    sub: "Family",
    volumeStr: "1.0 Litre Daily (7.0L total)",
    bottles: "1 sanitized 1000ml glass bottle",
    dailyPrice: 80,
    totalPrice: 560,
    popular: true,
  },
  {
    id: "two",
    label: "2.0 L",
    sub: "Joint",
    volumeStr: "2.0 Litres Daily (14.0L total)",
    bottles: "2 sanitized 1000ml glass bottles",
    dailyPrice: 150,
    totalPrice: 1050,
    popular: false,
  },
] as const;

export function TrialOffer() {
  const [selectedVolume, setSelectedVolume] = useState<typeof TRIAL_VOLUMES[number]>(TRIAL_VOLUMES[1]);
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.6 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.2 });
  const benefitsRef = useStaggerReveal<HTMLDivElement>("[data-benefit]", {
    y: 40,
    x: -20,
    stagger: 0.15,
    duration: 0.6,
  });
  const ctaRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0.1 });

  return (
    <Section background="cream" id="trial-offer">
      <div className="max-w-5xl mx-auto">
        {/* Main Starter Experience Box */}
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#E8DFD4] shadow-xl shadow-[#5C1B13]/5 overflow-hidden">
          {/* Subtle warm decorative glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#F5E729]/15 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: The Offer & Guarantees */}
            <div className="lg:col-span-7 text-left">
              <div ref={badgeRef} className="inline-flex items-center gap-2 bg-[#F5E729] text-[#1A1008] text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-5 shadow-xs">
                <FaStar className="w-3.5 h-3.5 text-[#1A1008]" />
                <span>No-Risk 7-Day Starter Experience</span>
              </div>

              <h2 ref={headingRef} className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-tight tracking-tight">
                Taste Pure A2 Milk for 7 Days at Your Doorstep
              </h2>

              <p ref={subtitleRef} className="mt-4 text-base sm:text-lg text-[#3A241C]/85 leading-relaxed">
                Experience the authentic natural aroma, thick cream layer (malai), and light digestion of raw Gir cow milk. Zero commitment, zero bottle deposit.
              </p>

              {/* Volume selector tabs */}
              <div className="mt-6">
                <p className="text-xs font-bold text-[#5C1B13] uppercase tracking-wider mb-2.5">
                  Select Your Daily Quantity:
                </p>
                <div className="grid grid-cols-3 gap-2.5 max-w-sm">
                  {TRIAL_VOLUMES.map((vol) => (
                    <button
                      key={vol.id}
                      type="button"
                      onClick={() => setSelectedVolume(vol)}
                      className={`relative px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedVolume.id === vol.id
                          ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-md shadow-[#5C1B13]/20 scale-102"
                          : "bg-[#FAF3EA] text-[#3A241C] border-[#E8DFD4] hover:bg-white"
                      }`}
                    >
                      {vol.popular && selectedVolume.id !== vol.id && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase bg-[#F5E729] text-[#1A1008] px-1.5 py-0.2 rounded-full">
                          POPULAR
                        </span>
                      )}
                      <p className="text-sm font-bold leading-tight">{vol.label}</p>
                      <p className={`text-[10px] ${selectedVolume.id === vol.id ? "text-white/80" : "text-[#3A241C]/60"}`}>
                        {vol.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefits list */}
              <div ref={benefitsRef} className="mt-6 space-y-3">
                {BENEFITS.map((benefit, i) => (
                  <div
                    key={i}
                    data-benefit
                    className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FAF3EA]/60 border border-[#E8DFD4]/70 hover:bg-[#FAF3EA] transition-colors"
                  >
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#5C1B13] text-white flex items-center justify-center mt-0.5 shadow-xs">
                      <FiCheck className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#1A1008] leading-snug">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button variant="primary" size="lg" onClick={handleTrialClick} className="w-full sm:w-auto shadow-lg shadow-[#5C1B13]/20">
                  Start 7-Day Trial ({selectedVolume.label})
                </Button>
                <span className="text-xs text-[#3A241C]/70 font-medium">
                  Instant WhatsApp setup · Zero paperwork
                </span>
              </div>
            </div>

            {/* Right Column: Dynamic Tasting Breakdown Summary Card */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-2xl bg-gradient-to-b from-[#FFFDF7] to-[#FAF3EA] border-2 border-[#5C1B13]/15 p-6 shadow-md">
                <div className="flex items-center justify-between border-b border-[#E8DFD4] pb-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-[#5C1B13]">
                      7-Day Trial Package
                    </p>
                    <h3 className="text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                      {selectedVolume.label} Fresh A2 Daily
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Active in Raipur
                  </span>
                </div>

                <div className="space-y-3 text-sm text-[#3A241C]/80">
                  <div className="flex justify-between py-1 border-b border-[#E8DFD4]/50">
                    <span>Daily Volume</span>
                    <span className="font-bold text-[#1A1008]">{selectedVolume.volumeStr}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DFD4]/50">
                    <span>Packaging</span>
                    <span className="font-bold text-[#1A1008]">{selectedVolume.bottles}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DFD4]/50">
                    <span>Morning Window</span>
                    <span className="font-bold text-[#1A1008]">5:30 – 7:00 AM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DFD4]/50">
                    <span>Rate</span>
                    <span className="font-bold text-[#5C1B13]">₹{selectedVolume.dailyPrice}/day</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DFD4]/50">
                    <span>Bottle Deposit</span>
                    <span className="font-bold text-emerald-700">₹0 (Deposit Waived)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DFD4]/50">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-emerald-700">FREE Across Raipur</span>
                  </div>
                  {FLAGS.SHOW_MONEY_BACK_GUARANTEE && (
                    <div className="flex justify-between py-2 bg-white/90 rounded-xl px-3 border border-[#E8DFD4] mt-2">
                      <span className="font-bold text-[#1A1008]">Guarantee</span>
                      <span className="font-bold text-[#5C1B13]">100% Money-Back</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 text-center">
                  <p className="text-[11px] text-[#3A241C]/60">
                    No lock-in contracts · Pause or cancel anytime via app or WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
