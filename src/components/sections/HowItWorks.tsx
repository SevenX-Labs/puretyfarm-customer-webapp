"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { ShinyText, Magnet } from "@/components/reactbits";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import { handleTrialClick, handleDownloadClick, getWhatsAppUrl } from "@/lib/cta";
import {
  FiShield,
  FiClock,
  FiSun,
  FiArrowRight,
  FiSmartphone,
  FiCheckCircle,
  FiMapPin,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { FaGooglePlay, FaWhatsapp } from "react-icons/fa";

interface StepData {
  number: string;
  badge: string;
  title: string;
  description: string;
  accentBg: string;
  accentColor: string;
  accentBorder: string;
  position: "left" | "right" | "center";
}

const STEPS: StepData[] = [
  {
    number: "01",
    badge: "Instant 45s Setup",
    title: "Download App or Register on WhatsApp",
    description: "Enter your phone number for instant OTP verification with zero paperwork or credit card.",
    accentBg: "bg-blue-600",
    accentColor: "text-blue-600",
    accentBorder: "border-blue-200",
    position: "left",
  },
  {
    number: "02",
    badge: "Flexible Volume",
    title: "Select Daily Milk Subscription",
    description: "Choose 0.5L, 1L, or 2L+ tailored to your home with 1-tap vacation pause anytime.",
    accentBg: "bg-amber-600",
    accentColor: "text-amber-600",
    accentBorder: "border-amber-200",
    position: "right",
  },
  {
    number: "03",
    badge: "100% Risk Free",
    title: "Claim Your 7-Day Taste Trial",
    description: "Taste fresh unadulterated Gir cow milk with ₹0 bottle deposit & money-back pledge.",
    accentBg: "bg-emerald-600",
    accentColor: "text-emerald-600",
    accentBorder: "border-emerald-300",
    position: "center",
  },
  {
    number: "04",
    badge: "Before 7:00 AM",
    title: "Set Delivery Location & Doorstep Notes",
    description: "Insulated temperature-controlled chilled dispatch straight to your Raipur doorstep.",
    accentBg: "bg-purple-600",
    accentColor: "text-purple-600",
    accentBorder: "border-purple-200",
    position: "left",
  },
  {
    number: "05",
    badge: "Farm To Kitchen",
    title: "Savor Pure A2 Milk & Swap Bottles",
    description: "Enjoy thick golden malai for homemade ghee with effortless daily circular glass bottle swap.",
    accentBg: "bg-[#5C1B13]",
    accentColor: "text-[#5C1B13]",
    accentBorder: "border-[#5C1B13]/30",
    position: "right",
  },
];

/**
 * Compact animated SVG S-Curve thread connecting staggered steps across the desktop layout.
 */
function ConnectingThread({
  from,
  to,
  id,
}: {
  from: "left" | "right" | "center";
  to: "left" | "right" | "center";
  id: string;
}) {
  const xCoords = { left: 160, center: 300, right: 440 };
  const x1 = xCoords[from];
  const x2 = xCoords[to];
  const y1 = 0;
  const y2 = 60;

  // Smooth S-Curve control points for compact height
  const cy1 = 35;
  const cy2 = 25;
  const pathD = `M ${x1},${y1} C ${x1},${cy1} ${x2},${cy2} ${x2},${y2}`;

  return (
    <>
      {/* Desktop Animated Winding Thread */}
      <div className="hidden md:flex justify-center -my-1 relative z-0 h-14 sm:h-16 pointer-events-none select-none">
        <svg
          viewBox="0 0 600 60"
          className="w-full max-w-3xl h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`thread-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5C1B13" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F5E729" stopOpacity="1" />
              <stop offset="100%" stopColor="#5C1B13" stopOpacity="0.8" />
            </linearGradient>
            <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base guide track */}
          <path
            d={pathD}
            fill="none"
            stroke="#E8DFD4"
            strokeWidth="2.5"
            strokeDasharray="5 5"
          />

          {/* Animated flowing thread */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#thread-grad-${id})`}
            strokeWidth="3"
            strokeDasharray="16 10"
            className="animate-thread-flow"
          />

          {/* Traveling glowing pulse droplet */}
          <circle r="3.5" fill="#F5E729" stroke="#5C1B13" strokeWidth="1.5" filter={`url(#glow-${id})`}>
            <animateMotion
              path={pathD}
              dur="2.8s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Mobile Vertical Flow Line */}
      <div className="md:hidden flex justify-center py-1 pointer-events-none" aria-hidden="true">
        <div className="w-0.5 h-6 bg-gradient-to-b from-[#5C1B13] via-[#F5E729] to-[#5C1B13] relative">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5E729] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
        </div>
      </div>
    </>
  );
}

export function HowItWorks() {
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<"0.5L" | "1L" | "2L">("1L");

  const badgeRef = useScrollReveal<HTMLSpanElement>({ y: 20, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const timelineRef = useStaggerReveal<HTMLDivElement>("[data-step-card]", {
    y: 35,
    stagger: 0.1,
    duration: 0.6,
  });

  return (
    <Section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FAF6F0] to-[#FFFDF7]">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-gradient-to-b from-[#F5E729]/10 via-[#FAF3EA]/40 to-transparent blur-3xl pointer-events-none -z-10"
      />

      {/* ─── HEADER ─── */}
      <div className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto">
        <span
          ref={badgeRef}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 border border-[#5C1B13]/20 rounded-full px-4 py-1.5 mb-3 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#5C1B13] animate-pulse" />
          <ShinyText text="The Raipur Morning Flow" speed={3.5} />
        </span>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight leading-tight"
        >
          How PuretyFarm Reaches Your{" "}
          <span className="text-[#5C1B13] font-serif italic relative inline-block">
            Morning Table
            <span className="absolute bottom-1.5 left-0 right-0 h-2.5 bg-[#F5E729]/35 -z-10 rounded-sm" />
          </span>
        </h2>

        <p
          ref={subtitleRef}
          className="mt-3 text-sm sm:text-base text-[#3A241C]/80 max-w-xl mx-auto leading-relaxed"
        >
          From phone to doorstep in 5 simple, seamless steps. Follow the animated journey across our daily Raipur cold chain.
        </p>

        {/* Quick Highlights Pill */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-5 px-3.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-[#E8DFD4] shadow-2xs text-xs font-semibold text-[#1A1008]">
          <span className="flex items-center gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            45-Sec Setup
          </span>
          <span className="text-[#E8DFD4]">•</span>
          <span className="flex items-center gap-1.5">
            <FiShield className="w-3.5 h-3.5 text-blue-600" />
            Zero Deposit
          </span>
          <span className="text-[#E8DFD4]">•</span>
          <span className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-[#5C1B13]" />
            Before 7:00 AM
          </span>
        </div>
      </div>

      {/* ─── COMPACT S-CURVE WINDING STEPS ─── */}
      <div ref={timelineRef} className="relative max-w-4xl mx-auto">
        {/* Step 1: Left */}
        <div data-step-card className="w-full flex justify-start md:pr-8">
          <div className="w-full md:max-w-md lg:max-w-lg">
            <TiltCard glare={true} className="h-full">
              <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 relative overflow-hidden group">
                <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs font-black text-xs">
                      01
                    </div>
                    <ShinyText text="Step 01 • Instant Setup" speed={3.5} className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#3A241C]/60 bg-[#FAF3EA] px-2 py-0.5 rounded-md">
                    App / WhatsApp
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug group-hover:text-blue-900 transition-colors">
                  {STEPS[0].title}
                </h3>
                <p className="mt-1 text-xs text-[#3A241C]/80 leading-relaxed">
                  {STEPS[0].description}
                </p>

                {/* Compact Widget */}
                <div className="mt-3.5 flex items-center justify-between gap-2 p-2 bg-blue-50/70 rounded-xl border border-blue-200/70">
                  <div className="flex items-center gap-1.5 truncate">
                    <FaGooglePlay className="w-3.5 h-3.5 text-[#1A1008] shrink-0" />
                    <span className="font-semibold text-[#1A1008] text-[11px] truncate">Google Play (4.8 ★)</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleDownloadClick}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Get App
                    </button>
                    <a
                      href={getWhatsAppUrl("Hi PuretyFarm, I want to start my A2 milk subscription.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FaWhatsapp className="w-3 h-3" />
                      <span>Chat</span>
                    </a>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Animated Connector Thread: Left -> Right */}
        <ConnectingThread from="left" to="right" id="1-2" />

        {/* Step 2: Right */}
        <div data-step-card className="w-full flex justify-end md:pl-8">
          <div className="w-full md:max-w-md lg:max-w-lg">
            <TiltCard glare={true} className="h-full">
              <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden group">
                <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs font-black text-xs">
                      02
                    </div>
                    <ShinyText text="Step 02 • Tailored Volume" speed={3.5} className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#3A241C]/60 bg-[#FAF3EA] px-2 py-0.5 rounded-md">
                    Flexible Plans
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug group-hover:text-amber-900 transition-colors">
                  {STEPS[1].title}
                </h3>
                <p className="mt-1 text-xs text-[#3A241C]/80 leading-relaxed">
                  {STEPS[1].description}
                </p>

                {/* Compact Widget */}
                <div className="mt-3.5 flex items-center justify-between gap-1 p-1.5 bg-amber-50/70 rounded-xl border border-amber-200/70">
                  {(["0.5L", "1L", "2L"] as const).map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSelectedPlanPreview(qty)}
                      className={`flex-1 py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        selectedPlanPreview === qty
                          ? "bg-[#5C1B13] text-white shadow-2xs font-bold"
                          : "text-[#3A241C] hover:bg-white text-[11px] font-medium"
                      }`}
                    >
                      <span className="text-xs font-bold">{qty}</span>
                      <span className="text-[10px] opacity-80 ml-1">
                        {qty === "0.5L" ? "· ₹45" : qty === "1L" ? "· ₹80" : "· ₹150"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Animated Connector Thread: Right -> Center */}
        <ConnectingThread from="right" to="center" id="2-3" />

        {/* Step 3: Center (Highlighted Milestone) */}
        <div data-step-card className="w-full flex justify-center">
          <div className="w-full md:max-w-md lg:max-w-lg">
            <TiltCard glare={true} className="h-full">
              <div className="bg-white rounded-2xl border-2 border-emerald-400 p-4 sm:p-5 shadow-md shadow-emerald-500/10 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs font-black text-xs">
                      03
                    </div>
                    <ShinyText text="Step 03 • 100% Risk Free" speed={3} className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Zero Deposit
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug group-hover:text-emerald-900 transition-colors">
                  {STEPS[2].title}
                </h3>
                <p className="mt-1 text-xs text-[#3A241C]/80 leading-relaxed">
                  {STEPS[2].description}
                </p>

                {/* Compact Widget */}
                <div className="mt-3.5 flex items-center justify-between gap-2 p-2 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-950 text-[11px]">₹0 Bottle Deposit</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleTrialClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1 text-[11px] font-bold h-7 shadow-xs"
                  >
                    <FiZap className="w-3 h-3" />
                    <span>Claim Trial</span>
                  </Button>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Animated Connector Thread: Center -> Left */}
        <ConnectingThread from="center" to="left" id="3-4" />

        {/* Step 4: Left */}
        <div data-step-card className="w-full flex justify-start md:pr-8">
          <div className="w-full md:max-w-md lg:max-w-lg">
            <TiltCard glare={true} className="h-full">
              <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-purple-400 transition-all duration-300 relative overflow-hidden group">
                <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-purple-600" />

                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs font-black text-xs">
                      04
                    </div>
                    <ShinyText text="Step 04 • Early Arrival" speed={3.5} className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#3A241C]/60 bg-[#FAF3EA] px-2 py-0.5 rounded-md">
                    Before 7:00 AM
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug group-hover:text-purple-900 transition-colors">
                  {STEPS[3].title}
                </h3>
                <p className="mt-1 text-xs text-[#3A241C]/80 leading-relaxed">
                  {STEPS[3].description}
                </p>

                {/* Compact Widget */}
                <div className="mt-3.5 flex items-center justify-between p-2 bg-purple-50/70 rounded-xl border border-purple-200/70 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#3A241C]/80">
                    <FiMapPin className="w-3.5 h-3.5 text-[#5C1B13]" />
                    <span>Farm 04:45 AM</span>
                  </div>
                  <FiArrowRight className="w-3 h-3 text-purple-400" />
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Doorstep by 07:00 AM</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Animated Connector Thread: Left -> Right */}
        <ConnectingThread from="left" to="right" id="4-5" />

        {/* Step 5: Right */}
        <div data-step-card className="w-full flex justify-end md:pl-8">
          <div className="w-full md:max-w-md lg:max-w-lg">
            <TiltCard glare={true} className="h-full">
              <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-[#5C1B13]/40 transition-all duration-300 relative overflow-hidden group">
                <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-[#5C1B13]" />

                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#5C1B13] text-white flex items-center justify-center shadow-xs font-black text-xs">
                      05
                    </div>
                    <ShinyText text="Step 05 • Farm To Kitchen" speed={3.5} className="text-[11px] font-bold text-[#5C1B13] bg-[#FAF3EA] px-2.5 py-0.5 rounded-full border border-[#E8DFD4]" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    100% Gir Milk
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug group-hover:text-[#5C1B13] transition-colors">
                  {STEPS[4].title}
                </h3>
                <p className="mt-1 text-xs text-[#3A241C]/80 leading-relaxed">
                  {STEPS[4].description}
                </p>

                {/* Compact Widget */}
                <div className="mt-3.5 flex items-center justify-between gap-2 p-2 bg-[#FAF3EA] rounded-xl border border-[#E8DFD4] text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5C1B13]">
                    <FiSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>4.2%+ Thick Malai</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                    <FiRefreshCw className="w-3 h-3 text-emerald-600" />
                    <span>Daily Bottle Swap</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM CALL TO ACTION ─── */}
      <div className="mt-12 text-center max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-white border border-[#E8DFD4] shadow-xs relative">
        <h3 className="text-xl sm:text-2xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
          Ready to Start Your Morning Subscription?
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
          Join 500+ families across Shankar Nagar, Telibandha & VIP Road who wake up to PuretyFarm.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Magnet magnetStrength={0.2}>
            <Button variant="primary" size="md" onClick={handleTrialClick} className="shadow-md shadow-[#5C1B13]/20">
              <span>Start My 7-Day Trial</span>
              <FiArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Magnet>
          <Magnet magnetStrength={0.16}>
            <a
              href={getWhatsAppUrl("Hi PuretyFarm, I would like to start my 7-day milk trial.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition-colors shadow-2xs"
            >
              <FaWhatsapp className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </Magnet>
        </div>
      </div>
    </Section>
  );
}
