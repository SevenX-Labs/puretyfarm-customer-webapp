"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import { handleTrialClick, handleDownloadClick, getWhatsAppUrl } from "@/lib/cta";
import {
  FiDownload,
  FiCalendar,
  FiShield,
  FiClock,
  FiSun,
  FiCheck,
  FiArrowRight,
  FiSmartphone,
  FiCheckCircle,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import { FaGooglePlay, FaWhatsapp, FaStar } from "react-icons/fa";

interface StepData {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  perks: string[];
  icon: typeof FiDownload;
  accentBg: string;
  accentColor: string;
  accentBorder: string;
  widgetType: "download" | "plan" | "trial" | "delivery" | "savor";
}

const STEPS: StepData[] = [
  {
    number: "01",
    badge: "Instant 45s Setup",
    title: "Download App or Register on WhatsApp",
    subtitle: "Quick mobile onboarding with zero paperwork",
    description:
      "Get the PuretyFarm app from Google Play or simply send a hi on WhatsApp. Enter your phone number, verify OTP, and you're instantly ready.",
    perks: [
      "Instant 1-tap OTP verification",
      "No advance payment or credit card required",
      "Live service area confirmation across Raipur",
    ],
    icon: FiSmartphone,
    accentBg: "bg-blue-500",
    accentColor: "text-blue-600",
    accentBorder: "border-blue-200",
    widgetType: "download",
  },
  {
    number: "02",
    badge: "Tailored For Your Home",
    title: "Select Your Daily Milk Subscription",
    subtitle: "Custom quantities from 0.5L to 2L+ with flexible schedules",
    description:
      "Choose the volume that fits your family's daily tea, coffee, and cooking routine. Switch between daily, alternate days, or weekday-only delivery anytime.",
    perks: [
      "Starter (0.5L), Family (1.0L), or Joint Family (2.0L)",
      "1-tap vacation pause with zero penalty",
      "Weekend extra milk adjustments directly in app",
    ],
    icon: FiCalendar,
    accentBg: "bg-amber-500",
    accentColor: "text-amber-600",
    accentBorder: "border-amber-200",
    widgetType: "plan",
  },
  {
    number: "03",
    badge: "100% Risk Free",
    title: "Claim Your 7-Day Taste Trial",
    subtitle: "Taste the golden malai difference with zero commitment",
    description:
      "Experience 7 days of farm-fresh A2 milk before committing to a monthly plan. Glass bottle security deposits are completely waived for all trial orders.",
    perks: [
      "Zero security deposit on sterilized glass bottles",
      "Pay at the end of 7 days only if delighted",
      "100% money-back satisfaction pledge",
    ],
    icon: FiShield,
    accentBg: "bg-emerald-500",
    accentColor: "text-emerald-600",
    accentBorder: "border-emerald-200",
    widgetType: "trial",
  },
  {
    number: "04",
    badge: "Before 7:00 AM",
    title: "Set Delivery Location & Notes",
    subtitle: "Insulated temperature-controlled dispatch to your doorstep",
    description:
      "Pin your Raipur address and specify doorstep instructions. Our chilled vans ensure your tamper-sealed glass bottles arrive before 7:00 AM every morning.",
    perks: [
      "Guaranteed early morning arrival (5:30 AM – 7:00 AM)",
      "Choice of silent doorstep drop or gentle doorbell",
      "Daily automated dispatch ping on WhatsApp",
    ],
    icon: FiClock,
    accentBg: "bg-purple-600",
    accentColor: "text-purple-600",
    accentBorder: "border-purple-200",
    widgetType: "delivery",
  },
  {
    number: "05",
    badge: "Farm To Kitchen",
    title: "Savor Pure A2 Milk & Swap Bottles",
    subtitle: "Thick golden malai, effortless digestion & zero plastic",
    description:
      "Boil once to lift a velvety disc of authentic cow malai for homemade ghee. Rinse the empty glass bottle and leave it outside for effortless daily swap.",
    perks: [
      "4.2%+ natural butterfat with genuine beta-carotene glow",
      "Zero stomach heaviness thanks to pure A2 proline bond",
      "Eco-friendly sanitized circular glass bottle return",
    ],
    icon: FiSun,
    accentBg: "bg-[#5C1B13]",
    accentColor: "text-[#5C1B13]",
    accentBorder: "border-[#5C1B13]/30",
    widgetType: "savor",
  },
];

export function HowItWorks() {
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<"0.5L" | "1L" | "2L">("1L");

  const badgeRef = useScrollReveal<HTMLSpanElement>({ y: 20, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const timelineRef = useStaggerReveal<HTMLDivElement>("[data-step-card]", {
    y: 50,
    stagger: 0.15,
    duration: 0.7,
    ease: "back.out(1.2)",
  });

  return (
    <Section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FAF6F0] to-[#FFFDF7]">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#F5E729]/10 via-[#FAF3EA]/40 to-transparent blur-3xl pointer-events-none -z-10"
      />

      {/* ─── HEADER ─── */}
      <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
        <span
          ref={badgeRef}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 border border-[#5C1B13]/20 rounded-full px-4 py-1.5 mb-4 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#5C1B13] animate-pulse" />
          The Raipur Morning Flow
        </span>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight leading-tight"
        >
          How PuretyFarm Reaches Your{" "}
          <span className="text-[#5C1B13] font-serif italic relative inline-block">
            Morning Table
            <span className="absolute bottom-1.5 left-0 right-0 h-2.5 bg-[#F5E729]/35 -z-10 rounded-sm" />
          </span>
        </h2>

        <p
          ref={subtitleRef}
          className="mt-3.5 text-base sm:text-lg text-[#3A241C]/80 max-w-xl mx-auto leading-relaxed"
        >
          From phone to doorstep in 5 simple, seamless steps. Experience how easy authentic A2 milk delivery in Raipur can be.
        </p>

        {/* Quick Highlights Pill */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-[#E8DFD4] shadow-2xs text-xs font-semibold text-[#1A1008]">
          <span className="flex items-center gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            45-Second Onboarding
          </span>
          <span className="text-[#E8DFD4]">•</span>
          <span className="flex items-center gap-1.5">
            <FiShield className="w-3.5 h-3.5 text-blue-600" />
            Zero Bottle Deposit
          </span>
          <span className="text-[#E8DFD4]">•</span>
          <span className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-[#5C1B13]" />
            Delivered Before 7:00 AM
          </span>
        </div>
      </div>

      {/* ─── VERTICAL ROADMAP SPINE ─── */}
      <div ref={timelineRef} className="relative max-w-4xl mx-auto">
        {/* Glowing Central Vertical Track */}
        <div
          aria-hidden="true"
          className="absolute top-8 bottom-12 left-5 sm:left-8 md:left-1/2 md:-translate-x-1/2 w-1 bg-gradient-to-b from-[#5C1B13] via-[#F5E729] to-[#5C1B13] rounded-full shadow-xs"
        />

        <div className="space-y-10 sm:space-y-14">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 1;

            return (
              <div
                key={step.number}
                data-step-card
                className="relative flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 group"
              >
                {/* ─── Center Node Pin (Positioned on the spine) ─── */}
                <div className="absolute left-5 sm:left-8 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${step.accentBg} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 border-2 border-white`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  {/* Subtle ping aura */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#F5E729]/50 animate-ping opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none" />
                </div>

                {/* ─── Left Column (Desktop alternating) ─── */}
                <div
                  className={`w-full md:w-[calc(50%-2rem)] pl-14 sm:pl-20 md:pl-0 ${
                    isEven ? "md:order-2 md:pl-8 text-left" : "md:order-1 md:pr-8 md:text-right"
                  }`}
                >
                  <TiltCard tiltMaxAngle={4} scale={1.015} glare={true} className="h-full">
                    <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:border-[#5C1B13]/30 relative overflow-hidden text-left">
                      {/* Accent strip */}
                      <div
                        aria-hidden="true"
                        className={`absolute top-0 left-0 right-0 h-1.5 ${step.accentBg}`}
                      />

                      {/* Header Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-black tracking-widest uppercase text-[#5C1B13] bg-[#FAF3EA] px-3 py-1 rounded-full border border-[#E8DFD4]">
                          Step {step.number}
                        </span>
                        <span className="text-[11px] font-bold text-[#1A1008]/75 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {step.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl sm:text-2xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-tight group-hover:text-[#5C1B13] transition-colors">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm font-semibold text-[#5C1B13]/90">
                        {step.subtitle}
                      </p>

                      <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Bullet Highlights */}
                      <ul className="mt-4 pt-4 border-t border-[#E8DFD4]/80 space-y-2">
                        {step.perks.map((perk, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-[#1A1008] font-medium">
                            <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TiltCard>
                </div>

                {/* ─── Right Column: Interactive Micro-Widget Preview ─── */}
                <div
                  className={`w-full md:w-[calc(50%-2rem)] pl-14 sm:pl-20 md:pl-0 ${
                    isEven ? "md:order-1 md:pr-8" : "md:order-2 md:pl-8"
                  }`}
                >
                  <div className="bg-gradient-to-br from-white via-[#FFFDF7] to-[#FAF3EA] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
                    {/* WIDGET 1: Download Preview */}
                    {step.widgetType === "download" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A241C]/60">
                            Available On
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Fast 20 MB App
                          </span>
                        </div>

                        <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFD4] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#1A1008] text-[#F5E729] flex items-center justify-center">
                              <FaGooglePlay className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1A1008]">PuretyFarm Android</p>
                              <p className="text-[10px] text-[#3A241C]/60 flex items-center gap-1">
                                <span>Rated 4.8</span>
                                <FaStar className="w-2.5 h-2.5 text-[#F5E729]" />
                                <span>· Free Install</span>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleDownloadClick}
                            className="px-3 py-1.5 rounded-xl bg-[#5C1B13] hover:bg-[#4A1510] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Get App
                          </button>
                        </div>

                        <p className="text-[11px] text-[#3A241C]/70 text-center">
                          Or order via WhatsApp:{" "}
                          <a
                            href={getWhatsAppUrl("Hi PuretyFarm, I want to start my A2 milk subscription.")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#5C1B13] underline inline-flex items-center gap-1"
                          >
                            <span>Chat Now</span>
                            <FiArrowRight className="w-3 h-3" />
                          </a>
                        </p>
                      </div>
                    )}

                    {/* WIDGET 2: Subscription Plan Selector Preview */}
                    {step.widgetType === "plan" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A241C]/60">
                            Choose Daily Quantity
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            Flexible Schedule
                          </span>
                        </div>

                        {/* Interactive Quantity Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          {(["0.5L", "1L", "2L"] as const).map((qty) => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => setSelectedPlanPreview(qty)}
                              className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                                selectedPlanPreview === qty
                                  ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-xs"
                                  : "bg-white text-[#1A1008] border-[#E8DFD4] hover:bg-[#FAF3EA]"
                              }`}
                            >
                              <p className="text-sm font-black">{qty}</p>
                              <p className={`text-[10px] ${selectedPlanPreview === qty ? "text-[#F5E729]" : "text-[#3A241C]/60"}`}>
                                {qty === "0.5L" ? "Couples" : qty === "1L" ? "Family" : "Large"}
                              </p>
                            </button>
                          ))}
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-[#E8DFD4] flex items-center justify-between text-xs">
                          <span className="text-[#3A241C]/75">Estimated Rate:</span>
                          <span className="font-bold text-[#5C1B13]">
                            {selectedPlanPreview === "0.5L" ? "₹45/day" : selectedPlanPreview === "1L" ? "₹80/day" : "₹150/day"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* WIDGET 3: 7-Day Trial Guarantee Seal */}
                    {step.widgetType === "trial" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A241C]/60">
                            Trial Protection
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Zero Commitment
                          </span>
                        </div>

                        <div className="p-3.5 bg-white rounded-2xl border border-emerald-300 text-center space-y-1.5 shadow-2xs">
                          <p className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                            7-Day Purety Assurance
                          </p>
                          <p className="text-2xl font-black text-[#5C1B13]">₹0 Deposit</p>
                          <p className="text-[11px] text-[#3A241C]/75 leading-tight">
                            Delivered in heavy food-grade glass bottles without advance security deposit.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleTrialClick}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
                        >
                          <span>Activate My 7-Day Trial</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* WIDGET 4: Raipur Morning Route Card */}
                    {step.widgetType === "delivery" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A241C]/60">
                            Raipur Cold Route
                          </span>
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                            4°C Insulated
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-2xl border border-[#E8DFD4] space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[#3A241C]/80">
                            <span className="flex items-center gap-1.5">
                              <FiMapPin className="w-3.5 h-3.5 text-[#5C1B13]" />
                              Raipur Farm Hub
                            </span>
                            <span className="font-mono text-[11px]">04:45 AM</span>
                          </div>
                          <div className="h-px bg-[#E8DFD4]" />
                          <div className="flex items-center justify-between text-[#1A1008] font-bold">
                            <span className="flex items-center gap-1.5 text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              Your Doorstep Drop
                            </span>
                            <span className="font-mono text-emerald-700">By 07:00 AM</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#3A241C]/70 text-center italic">
                          &ldquo;Leave the empty bottle outside, we swap it silently every dawn.&rdquo;
                        </p>
                      </div>
                    )}

                    {/* WIDGET 5: Golden Malai & Eco Swap Preview */}
                    {step.widgetType === "savor" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A241C]/60">
                            Purity Checklist
                          </span>
                          <span className="text-[10px] font-bold text-[#5C1B13] bg-[#FAF3EA] px-2 py-0.5 rounded-full border border-[#E8DFD4]">
                            100% Desi Gir
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2.5 bg-white rounded-xl border border-[#E8DFD4]">
                            <p className="text-base font-black text-[#5C1B13]">4.2%+</p>
                            <p className="text-[10px] font-bold text-[#3A241C]/70">Thick Malai Crust</p>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-[#E8DFD4]">
                            <p className="text-base font-black text-emerald-700">100%</p>
                            <p className="text-[10px] font-bold text-[#3A241C]/70">Glass Sanitized</p>
                          </div>
                        </div>

                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                          <p className="text-[11px] font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                            <FiRefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Effortless Daily Bottle Exchange</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── BOTTOM CALL TO ACTION ─── */}
      <div className="mt-16 text-center max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DFD4] shadow-sm relative">
        <h3 className="text-2xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
          Ready to Start Your Morning Subscription?
        </h3>
        <p className="mt-2 text-sm text-[#3A241C]/80 leading-relaxed">
          Join 500+ families across Shankar Nagar, Telibandha & VIP Road who wake up to PuretyFarm.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="lg" onClick={handleTrialClick} className="shadow-md shadow-[#5C1B13]/20">
            <span>Start My 7-Day Trial</span>
            <FiArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <a
            href={getWhatsAppUrl("Hi PuretyFarm, I would like to start my 7-day milk trial.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-5 py-3 rounded-xl transition-colors shadow-2xs"
          >
            <FaWhatsapp className="w-4 h-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </Section>
  );
}
