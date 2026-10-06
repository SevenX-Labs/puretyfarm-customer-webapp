"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { handleTrialClick } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import { HeroVideoModal } from "./HeroVideoModal";
import {
  FiClock,
  FiHome,
  FiPackage,
  FiShield,
  FiThermometer,
  FiTruck,
  FiCheck,
  FiDroplet,
} from "react-icons/fi";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { FaCow, FaLeaf, FaPlay, FaUsers, FaPeopleRoof } from "react-icons/fa6";

function MilkBottleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2h8v2H8z" />
      <path d="M9 4v3l-3 4v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V11l-3-4V4" />
      <line x1="6" y1="14" x2="18" y2="14" />
    </svg>
  );
}

const TRIAL_VOLUMES = [
  {
    id: "half",
    label: "0.5 L",
    sub: "Couples",
    icon: MilkBottleIcon,
    volumeStr: "0.5 Litre Daily (3.5L Total)",
    bottles: "1 sanitized 500ml glass bottle",
    dailyPrice: 45,
    totalPrice: 315,
  },
  {
    id: "one",
    label: "1.0 L",
    sub: "Family",
    icon: FaUsers,
    volumeStr: "1.0 Litre Daily (7.0L Total)",
    bottles: "1 sanitized 1 Liter glass bottle",
    dailyPrice: 90,
    totalPrice: 630,
  },
  {
    id: "two",
    label: "2.0 L",
    sub: "Joint",
    icon: FaPeopleRoof,
    volumeStr: "2.0 Litres Daily (14.0L Total)",
    bottles: "2 sanitized 2 Liter glass bottles",
    dailyPrice: 180,
    totalPrice: 1260,
  },
] as const;

const BOTTOM_BENEFITS = [
  {
    icon: FiShield,
    iconColor: "text-[#5C1B13]",
    iconBg: "bg-[#5C1B13]/10",
    title: "7-Day Trial Plan",
    subtitle: "Non-Refundable Deposit",
  },
  {
    icon: FaCow,
    iconColor: "text-[#8C3A24]",
    iconBg: "bg-[#8C3A24]/10",
    title: "100% Desi Gir Cows",
    subtitle: "A2 Rich Milk",
  },
  {
    icon: FaLeaf,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-700/10",
    title: "Sanitized Eco Glass Bottles",
    subtitle: "Hygienic & Safe",
  },
  {
    icon: FiThermometer,
    iconColor: "text-sky-700",
    iconBg: "bg-sky-700/10",
    title: "Chilled to 4°C",
    subtitle: "Farm-to-Doorstep",
  },
  {
    icon: FiClock,
    iconColor: "text-[#5C1B13]",
    iconBg: "bg-[#5C1B13]/10",
    title: "Delivered Before 10:00 AM",
    subtitle: "Daily",
  },
  {
    icon: FiDroplet,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-700/10",
    title: "Zero Added Water",
    subtitle: "Pure & Natural",
  },
] as const;

// 4 copies create a 2-half set ensuring a seamless infinite loop on any screen width
const LOOPED_BOTTOM_BENEFITS = [
  ...BOTTOM_BENEFITS,
  ...BOTTOM_BENEFITS,
  ...BOTTOM_BENEFITS,
  ...BOTTOM_BENEFITS,
];

export function TrialOffer() {
  const [selectedVolume, setSelectedVolume] = useState<typeof TRIAL_VOLUMES[number]>(
    TRIAL_VOLUMES[1]
  );
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.6 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.2 });
  const benefitsRef = useStaggerReveal<HTMLDivElement>("[data-benefit]", {
    y: 30,
    stagger: 0.12,
    duration: 0.5,
  });
  const ctaRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0.1 });

  return (
    <>
      <Section background="cream" id="trial-offer" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          {/* Main Experience Card */}
          <div className="relative bg-white rounded-3xl lg:rounded-[36px] p-6 sm:p-10 lg:p-12 pb-6 lg:pb-8 border border-[#ECE4DA] shadow-[0_10px_35px_rgba(26,16,8,0.04)] overflow-hidden">
            {/* Warm soft glow accent */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#F5E729]/15 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* ─── LEFT COLUMN: Offer Details & Selectors ─── */}
              <div className="lg:col-span-7 text-left">
                {/* Yellow Starter Badge */}
                <div
                  ref={badgeRef}
                  className="inline-flex items-center gap-2 bg-[#FEEF88] text-[#1A1008] text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 shadow-2xs"
                >
                  <FaStar className="w-3.5 h-3.5 text-[#1A1008]" />
                  <span>No-Risk 7-Day Starter Experience</span>
                </div>

                {/* Main Heading with Serif + Underline Accent */}
                <h2
                  ref={headingRef}
                  className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-[1.14] tracking-tight"
                >
                  Taste Pure A2 Milk for 7 Days at{" "}
                  <span className="font-serif italic text-[#632014] relative inline-block whitespace-nowrap">
                    Your Doorstep
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-2.5 text-[#F5E729] -z-10 pointer-events-none"
                      viewBox="0 0 200 12"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 9C50 4 150 4 198 8C160 11 80 11 2 9Z"
                        fill="currentColor"
                        opacity="0.85"
                      />
                    </svg>
                  </span>
                </h2>

                {/* Subtitle */}
                <p
                  ref={subtitleRef}
                  className="mt-4 text-sm sm:text-base text-[#4A3B32] leading-relaxed max-w-xl"
                >
                  Experience the authentic natural aroma, thick cream layer (malai), and light
                  digestion of raw Gir cow milk. Zero commitment, cancel anytime.
                </p>

                {/* Daily Quantity Selector */}
                <div className="mt-7">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B584C] mb-3">
                    SELECT YOUR DAILY QUANTITY:
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-lg">
                    {TRIAL_VOLUMES.map((vol) => {
                      const isSelected = selectedVolume.id === vol.id;
                      const Icon = vol.icon;
                      return (
                        <button
                          key={vol.id}
                          type="button"
                          onClick={() => setSelectedVolume(vol)}
                          className={`relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${isSelected
                            ? "bg-[#3E1610] text-white border-[#3E1610] shadow-md shadow-[#3E1610]/20"
                            : "bg-[#FBF8F3] text-[#1A1008] border-[#ECE4DA] hover:bg-[#FAF4ED]"
                            }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white">
                              <FiCheck className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "text-white" : "text-[#5C4E44]"
                              }`}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold leading-tight">{vol.label}</p>
                            <p
                              className={`text-[10px] sm:text-xs leading-tight mt-0.5 ${isSelected ? "text-white/80" : "text-[#6B584C]"
                                }`}
                            >
                              {vol.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Highlights Rows */}
                <div ref={benefitsRef} className="mt-6 space-y-2.5 max-w-lg">
                  <div
                    data-benefit
                    className="flex items-center gap-3.5 px-4 py-2.5 sm:py-3 rounded-2xl bg-[#FBF8F3] border border-[#ECE4DA]/60"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#ECE4DA] flex items-center justify-center text-[#3E1610] shrink-0 shadow-2xs">
                      <FiClock className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm text-[#1A1008] leading-tight">
                      <span className="font-bold">Delivered daily before 10:00 AM</span>
                      <span className="text-[#6B584C] ml-1.5 font-normal">
                        in sanitized glass bottles
                      </span>
                    </div>
                  </div>

                  <div
                    data-benefit
                    className="flex items-center gap-3.5 px-4 py-2.5 sm:py-3 rounded-2xl bg-[#FBF8F3] border border-[#ECE4DA]/60"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#ECE4DA] flex items-center justify-center text-[#3E1610] shrink-0 shadow-2xs">
                      <FiHome className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm text-[#1A1008] leading-tight">
                      <span className="font-bold">Free home delivery across Raipur</span>
                      <span className="text-[#6B584C] ml-1.5 font-normal">
                        — prompt morning dispatch
                      </span>
                    </div>
                  </div>

                  <div
                    data-benefit
                    className="flex items-center gap-3.5 px-4 py-2.5 sm:py-3 rounded-2xl bg-[#FBF8F3] border border-[#ECE4DA]/60"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#ECE4DA] flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                      <FaWhatsapp className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm text-[#1A1008] leading-tight">
                      <span className="font-bold">Daily morning WhatsApp updates</span>
                      <span className="text-[#6B584C] ml-1.5 font-normal">
                        with live route status
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Row */}
                <div
                  ref={ctaRef}
                  className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 flex-wrap"
                >
                  <button
                    type="button"
                    onClick={handleTrialClick}
                    className="inline-flex items-center justify-center gap-2 bg-[#3E1610] hover:bg-[#501D14] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#3E1610]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Start 7-Day Trial ({selectedVolume.label})</span>
                    <span aria-hidden="true">→</span>
                  </button>

                  <div className="hidden sm:block h-8 w-px bg-[#ECE4DA]" aria-hidden="true" />

                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#1A1008] leading-tight">
                      Instant WhatsApp setup
                    </span>
                    <span className="text-[11px] text-[#6B584C] font-medium leading-tight mt-0.5">
                      Zero paperwork
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── RIGHT COLUMN: 7-Day Trial Package Summary Card ─── */}
              <div className="lg:col-span-5 w-full">
                <div className="rounded-[28px] bg-[#FAF6F0] border border-[#ECE4DA] p-6 sm:p-7 shadow-xs">
                  {/* Top Category and Status Pill */}
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C3A24]">
                      7-DAY TRIAL PACKAGE
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EC] text-emerald-800 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      Active in Raipur
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-[26px] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] mb-6">
                    {selectedVolume.label} Fresh A2 Daily
                  </h3>

                  {/* 6 Key-Value Rows */}
                  <div className="space-y-3.5 text-xs sm:text-sm">
                    {/* Row 1: Daily Volume */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECE4DA]/60">
                      <div className="flex items-center gap-3 text-[#5C4E44]">
                        <MilkBottleIcon className="w-4 h-4 text-[#3E1610] shrink-0" />
                        <span className="font-medium text-[#4A3B32]">Daily Volume</span>
                      </div>
                      <span className="font-bold text-[#1A1008]">
                        {selectedVolume.volumeStr}
                      </span>
                    </div>

                    {/* Row 2: Packaging */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECE4DA]/60">
                      <div className="flex items-center gap-3 text-[#5C4E44]">
                        <FiPackage className="w-4 h-4 text-[#3E1610] shrink-0" />
                        <span className="font-medium text-[#4A3B32]">Packaging</span>
                      </div>
                      <span className="font-bold text-[#1A1008]">{selectedVolume.bottles}</span>
                    </div>

                    {/* Row 3: Morning Window */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECE4DA]/60">
                      <div className="flex items-center gap-3 text-[#5C4E44]">
                        <FiClock className="w-4 h-4 text-[#3E1610] shrink-0" />
                        <span className="font-medium text-[#4A3B32]">Morning Window</span>
                      </div>
                      <span className="font-bold text-[#1A1008]">Before 10:00 AM</span>
                    </div>

                    {/* Row 4: Rate */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECE4DA]/60">
                      <div className="flex items-center gap-3 text-[#5C4E44]">
                        <div className="w-4 h-4 rounded-full border border-[#3E1610] flex items-center justify-center text-[10px] font-bold text-[#3E1610] shrink-0 leading-none">
                          ₹
                        </div>
                        <span className="font-medium text-[#4A3B32]">Rate</span>
                      </div>
                      <span className="font-bold text-[#1A1008]">
                        ₹{selectedVolume.dailyPrice}/day
                      </span>
                    </div>


                    {/* Row 6: Delivery Charges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[#5C4E44]">
                        <FiTruck className="w-4 h-4 text-[#3E1610] shrink-0" />
                        <span className="font-medium text-[#4A3B32]">Delivery Charges</span>
                      </div>
                      <span className="font-bold text-emerald-700">FREE Across Raipur</span>
                    </div>
                  </div>

                  {/* Footer Guarantee Micro-copy */}
                  <div className="mt-6 pt-2 text-center sm:text-left">
                    <p className="text-[11px] sm:text-xs text-[#8C7A6B] leading-relaxed">
                      No lock-in contracts · Non-refundable deposit · Pause or cancel anytime via app or WhatsApp
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── BOTTOM BENEFIT BAR (Always One Line Infinite Marquee) ─── */}
            <div className="border-t border-[#ECE4DA] pt-5 sm:pt-6 mt-8 sm:mt-10 -mx-6 sm:-mx-10 lg:-mx-12 px-6 sm:px-10 lg:px-12 relative overflow-hidden select-none">
              {/* Subtle edge fade gradient masks */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10"
              />

              {/* Infinite right-to-left marquee track - always stays strictly in one line */}
              <div
                className="animate-marquee flex items-center py-1 will-change-transform"
                style={{ animationDuration: "35s" }}
              >
                {LOOPED_BOTTOM_BENEFITS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-1 shrink-0 whitespace-nowrap"
                    >
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.iconColor}`} />
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-xs sm:text-[12.5px] font-bold text-[#1A1008] tracking-tight">
                          {item.title}
                        </span>
                        <span
                          className="text-[#C4B5A5] text-[10px] sm:text-xs select-none"
                          aria-hidden="true"
                        >
                          •
                        </span>
                        <span className="text-[11px] sm:text-xs text-[#6B584C] font-medium">
                          {item.subtitle}
                        </span>
                      </div>
                      <div
                        className="h-3.5 sm:h-4 w-px bg-[#ECE4DA] ml-3 sm:ml-4 select-none shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 1-MINUTE STORY VIDEO MODAL ─── */}
      <HeroVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </>
  );
}
