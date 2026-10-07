"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import {
  FiCheck,
  FiClock,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { FaWhatsapp, FaApple } from "react-icons/fa";

function WindingConnector({
  direction,
  id,
}: {
  direction: "left-to-right" | "right-to-left";
  id: string;
}) {
  const isL2R = direction === "left-to-right";
  const pathD = isL2R
    ? "M 160 5 C 160 38, 380 18, 380 55"
    : "M 380 5 C 380 38, 160 18, 160 55";

  return (
    <>
      {/* Desktop Animated Winding Thread */}
      <div className="hidden md:flex justify-center -my-2.5 relative z-0 h-16 pointer-events-none select-none">
        <svg
          viewBox="0 0 540 60"
          className="w-full max-w-2xl h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`thread-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8C3A24" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F5E729" stopOpacity="1" />
              <stop offset="100%" stopColor="#8C3A24" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id={`drop-glow-${id}`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F5E729" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
          </defs>

          {/* Background guide track */}
          <path
            d={pathD}
            fill="none"
            stroke="#E2D7CC"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Animated flowing thread */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#thread-grad-${id})`}
            strokeWidth="2.5"
            strokeDasharray="14 10"
            className="animate-thread-flow"
          />

          {/* Midpoint waypoint pin with concentric SVG pulse (strictly centered, zero drift) */}
          <circle cx="270" cy="28" r="4.5" fill="#8C3A24" stroke="#FAF5EE" strokeWidth="2">
            <animate
              attributeName="r"
              values="4;5.5;4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Traveling illuminated purity droplet (clean, zero offset or dark shadow artifacts) */}
          <circle r="4.5" fill={`url(#drop-glow-${id})`} stroke="#B45309" strokeWidth="1">
            <animateMotion
              path={pathD}
              dur="2.8s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Mobile Animated Connecting Thread */}
      <div className="md:hidden flex justify-center py-2 pointer-events-none select-none" aria-hidden="true">
        <div className="w-0.5 h-7 bg-gradient-to-b from-[#8C3A24] via-[#F5E729] to-[#8C3A24] relative rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5E729] shadow-xs" />
        </div>
      </div>
    </>
  );
}

export function HowItWorks() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 20, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const stepsContainerRef = useStaggerReveal<HTMLDivElement>("[data-step-card]", {
    y: 35,
    stagger: 0.12,
    duration: 0.6,
  });

  return (
    <Section
      id="how-it-works"
      className="relative overflow-hidden bg-[#FAF5EE] py-14 sm:py-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ─── HEADER ─── */}
        <div className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 bg-white/90 border border-[#E8DFD4] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#8C3A24] mb-4 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C3A24]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C1B13]" />
            <span className="tracking-wider uppercase">5 SIMPLE STEPS</span>
          </div>

          {/* Heading */}
          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight leading-[1.15]"
          >
            How PuretyFarm Reaches Your{" "}
            <span className="font-serif italic text-[#632014] relative inline-block whitespace-nowrap">
              Morning Table
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
            className="mt-3 text-sm sm:text-base text-[#6B584C] max-w-xl mx-auto leading-relaxed"
          >
            From farm to your door in 5 simple steps. Fresh, pure and hassle-free.
          </p>
        </div>

        {/* ─── 5-STEP ROADMAP TIMELINE ─── */}
        <div ref={stepsContainerRef} className="relative max-w-4xl mx-auto mt-8 sm:mt-10 space-y-4 md:space-y-0">
          {/* ══════════ STEP 01: Left Aligned ══════════ */}
          <div
            id="how-it-works-step-1"
            data-step-card
            className="w-full flex items-center justify-start md:pr-12"
          >
            {/* Outer Number Node on Desktop (Left) */}
            <div className="hidden md:flex items-center mr-4 shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                01
              </div>
              <div className="w-6 h-px bg-blue-300 relative flex items-center justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shadow-[0_0_6px_rgba(37,99,235,0.7)]" />
              </div>
            </div>

            {/* Card Content */}
            <div className="w-full md:max-w-lg bg-white rounded-2xl border border-blue-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Mobile Number Badge */}
              <div className="md:hidden flex items-center gap-2 w-full border-b border-blue-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <span className="text-xs font-bold text-blue-700">Step 1</span>
              </div>

              {/* Illustration: Phone Mockup */}
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl bg-[#F0F6FE] border border-blue-100 p-2.5 flex flex-col justify-between shrink-0 shadow-2xs mx-auto sm:mx-0">
                <div className="rounded-lg bg-white border border-blue-200/60 p-2 shadow-2xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                      <FaWhatsapp className="w-3 h-3" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-2xs">
                      <FaApple className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#6B584C] tracking-wider uppercase">
                      OTP
                    </span>
                    <div className="flex gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-blue-50 text-[#2563EB] border border-blue-200/80 rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1.5">
                  Instant 45s Setup
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] leading-snug">
                  Download App or Register on WhatsApp
                </h3>
                <p className="mt-1 text-xs sm:text-[13px] text-[#6B584C] leading-relaxed">
                  Enter your phone number for instant OTP verification with zero paperwork or credit card.
                </p>
              </div>
            </div>
          </div>

          {/* Connecting Curved Thread: Left -> Right */}
          <WindingConnector direction="left-to-right" id="1-2" />

          {/* ══════════ STEP 02: Right Aligned ══════════ */}
          <div
            id="how-it-works-step-2"
            data-step-card
            className="w-full flex items-center justify-end md:pl-12"
          >
            {/* Card Content */}
            <div className="w-full md:max-w-lg bg-white rounded-2xl border border-amber-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Mobile Number Badge */}
              <div className="md:hidden flex items-center gap-2 w-full border-b border-amber-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <span className="text-xs font-bold text-amber-700">Step 2</span>
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 order-2 sm:order-1">
                <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1.5">
                  Flexible Volume
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] leading-snug">
                  Select Daily Milk Subscription
                </h3>
                <p className="mt-1 text-xs sm:text-[13px] text-[#6B584C] leading-relaxed">
                  Choose 0.5L, 1L, or 2L+ tailored to your home with 1-tap vacation pause anytime.
                </p>
              </div>

              {/* Illustration: 3 Bottles & Pause Badge */}
              <div className="w-32 sm:w-36 rounded-xl bg-[#FFFBF5] border border-amber-200/70 p-2.5 flex flex-col justify-between shrink-0 shadow-2xs order-1 sm:order-2 mx-auto sm:mx-0">
                <div className="flex items-end justify-center gap-2 pt-1">
                  {/* 0.5L Bottle */}
                  <div className="flex flex-col items-center">
                    <svg className="w-4 h-7 text-amber-700" viewBox="0 0 24 38" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="7" y="1" width="10" height="3" rx="1" />
                      <path d="M8 4v5l-3 4v22a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13l-3-4V4" />
                    </svg>
                    <span className="text-[10px] font-bold text-[#6B584C] mt-1">0.5L</span>
                  </div>

                  {/* 1L Bottle (Primary) */}
                  <div className="flex flex-col items-center">
                    <svg className="w-5 h-9 text-amber-800" viewBox="0 0 24 38" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="7" y="1" width="10" height="3" rx="1" />
                      <path d="M8 4v5l-4 4v22a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V13l-4-4V4" />
                      <line x1="4" y1="22" x2="20" y2="22" strokeDasharray="2 2" />
                    </svg>
                    <span className="text-[10px] font-black text-[#1A1008] mt-1">1L</span>
                  </div>

                  {/* 2L+ Bottle */}
                  <div className="flex flex-col items-center">
                    <svg className="w-5 h-10 text-amber-700" viewBox="0 0 26 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="8" y="1" width="10" height="3" rx="1" />
                      <path d="M9 4v5l-5 5v23a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V14l-5-5V4" />
                    </svg>
                    <span className="text-[10px] font-bold text-[#6B584C] mt-1">2L+</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 bg-[#FAF4ED] border border-amber-200/80 rounded-md py-1 px-1.5 text-[9.5px] font-bold text-amber-900 mt-2">
                  <FiCalendar className="w-3 h-3 text-amber-700" />
                  <span>Pause anytime</span>
                </div>
              </div>
            </div>

            {/* Outer Number Node on Desktop (Right) */}
            <div className="hidden md:flex items-center ml-4 shrink-0">
              <div className="w-6 h-px bg-amber-300 relative flex items-center justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shadow-[0_0_6px_rgba(234,88,12,0.7)]" />
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                02
              </div>
            </div>
          </div>

          {/* Connecting Curved Thread: Right -> Left */}
          <WindingConnector direction="right-to-left" id="2-3" />

          {/* ══════════ STEP 03: Left Aligned ══════════ */}
          <div
            id="how-it-works-step-3"
            data-step-card
            className="w-full flex items-center justify-start md:pr-12"
          >
            {/* Outer Number Node on Desktop (Left) */}
            <div className="hidden md:flex items-center mr-4 shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                03
              </div>
              <div className="w-6 h-px bg-emerald-300 relative flex items-center justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shadow-[0_0_6px_rgba(22,163,74,0.7)]" />
              </div>
            </div>

            {/* Card Content */}
            <div className="w-full md:max-w-lg bg-white rounded-2xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Mobile Number Badge */}
              <div className="md:hidden flex items-center gap-2 w-full border-b border-emerald-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-[#16A34A] text-white font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <span className="text-xs font-bold text-emerald-700">Step 3</span>
              </div>

              {/* Illustration: 7-Day Taste Trial Badge */}
              <Link
                href="/account?tab=subscription"
                className="w-28 sm:w-32 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] transition-colors border border-emerald-200/80 p-3 flex flex-col items-center justify-center text-center shrink-0 shadow-2xs mx-auto sm:mx-0 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <FiCheck className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-[#064E3B] leading-tight">
                  7 Day
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#064E3B] leading-tight">
                  Taste Trial
                </span>
                <span className="text-[9px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-2 py-0.5 rounded-full mt-2 leading-none whitespace-nowrap shadow-2xs">
                  Non-Refundable Deposit
                </span>
              </Link>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1.5">
                  Fresh Daily
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] leading-snug">
                  Claim Your 7-Day Taste Trial
                </h3>
                <p className="mt-1 text-xs sm:text-[13px] text-[#6B584C] leading-relaxed">
                  Taste fresh unadulterated Gir cow milk with convenient daily morning delivery (non-refundable deposit applies).
                </p>
                <div className="mt-2.5">
                  <Link
                    href="/account?tab=subscription"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    <span>Start 7-Day Trial on Account →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Connecting Curved Thread: Left -> Right */}
          <WindingConnector direction="left-to-right" id="3-4" />

          {/* ══════════ STEP 04: Right Aligned ══════════ */}
          <div
            id="how-it-works-step-4"
            data-step-card
            className="w-full flex items-center justify-end md:pl-12"
          >
            {/* Card Content */}
            <div className="w-full md:max-w-lg bg-white rounded-2xl border border-purple-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Mobile Number Badge */}
              <div className="md:hidden flex items-center gap-2 w-full border-b border-purple-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <span className="text-xs font-bold text-purple-700">Step 4</span>
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 order-2 sm:order-1">
                <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200/80 rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1.5">
                  Before 10:00 AM
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] leading-snug">
                  Set Delivery Location & Doorstep Notes
                </h3>
                <p className="mt-1 text-xs sm:text-[13px] text-[#6B584C] leading-relaxed">
                  Insulated temperature-controlled chilled dispatch straight to your Raipur doorstep.
                </p>
              </div>

              {/* Illustration: Map & Delivery Notes */}
              <div className="w-32 sm:w-36 rounded-xl bg-[#FAF5FF] border border-purple-200/80 p-2.5 flex flex-col justify-between shrink-0 shadow-2xs gap-1.5 order-1 sm:order-2 mx-auto sm:mx-0">
                <div className="flex items-center gap-1 text-xs font-bold text-purple-950">
                  <FiMapPin className="w-3.5 h-3.5 text-purple-600" />
                  <span>Raipur</span>
                </div>

                <div className="bg-white rounded-md border border-purple-200/70 px-2 py-1 text-[10px] text-purple-800/80 flex items-center justify-between">
                  <span>Add delivery notes</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700">
                  <FiClock className="w-3 h-3 text-purple-600" />
                  <span>Before 10:00 AM</span>
                </div>
              </div>
            </div>

            {/* Outer Number Node on Desktop (Right) */}
            <div className="hidden md:flex items-center ml-4 shrink-0">
              <div className="w-6 h-px bg-purple-300 relative flex items-center justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] shadow-[0_0_6px_rgba(124,58,237,0.7)]" />
              </div>
              <div className="w-9 h-9 rounded-full bg-[#7C3AED] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                04
              </div>
            </div>
          </div>

          {/* Connecting Curved Thread: Right -> Left */}
          <WindingConnector direction="right-to-left" id="4-5" />

          {/* ══════════ STEP 05: Left Aligned ══════════ */}
          <div
            id="how-it-works-step-5"
            data-step-card
            className="w-full flex items-center justify-start md:pr-12"
          >
            {/* Outer Number Node on Desktop (Left) */}
            <div className="hidden md:flex items-center mr-4 shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#5C1B13] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                05
              </div>
              <div className="w-6 h-px bg-[#5C1B13]/30 relative flex items-center justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5C1B13] shadow-[0_0_6px_rgba(92,27,19,0.7)]" />
              </div>
            </div>

            {/* Card Content */}
            <div className="w-full md:max-w-lg bg-white rounded-2xl border border-[#5C1B13]/30 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Mobile Number Badge */}
              <div className="md:hidden flex items-center gap-2 w-full border-b border-[#5C1B13]/20 pb-2">
                <span className="w-7 h-7 rounded-full bg-[#5C1B13] text-white font-bold text-xs flex items-center justify-center">
                  05
                </span>
                <span className="text-xs font-bold text-[#5C1B13]">Step 5</span>
              </div>

              {/* Illustration: PuretyFarm Glass Milk Bottle */}
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl bg-[#FAF4ED] border border-[#E8DFD4] p-1.5 flex items-center justify-center relative shrink-0 shadow-2xs overflow-hidden mx-auto sm:mx-0">
                <div className="relative w-16 h-24">
                  <Image
                    src="/puretyfarm-bottle-isolated.webp"
                    alt="PuretyFarm Sanitized Glass Milk Bottle"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-[#5C1B13]/10 text-[#5C1B13] border border-[#5C1B13]/20 rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1.5">
                  Farm To Kitchen
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1008] leading-snug">
                  Savor Pure A2 Milk & Swap Bottles
                </h3>
                <p className="mt-1 text-xs sm:text-[13px] text-[#6B584C] leading-relaxed">
                  Enjoy thick golden malai for homemade ghee with effortless daily circular glass bottle swap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
