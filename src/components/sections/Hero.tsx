"use client";

import { useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { FiZap, FiArrowRight, FiPlay } from "react-icons/fi";
import { handleTrialClick } from "@/lib/cta";
import { HeroBenefitBar } from "./HeroBenefitBar";
import { HeroVideoModal } from "./HeroVideoModal";

export function Hero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <section
        id="hero"
        aria-label="PuretyFarm A2 Cow Milk Hero"
        className="relative w-full bg-[#FFFDF7] overflow-hidden flex flex-col justify-between min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] pt-18 sm:pt-20 lg:pt-16 pb-0"
      >
        {/* ─── FULL-SCREEN CINEMATIC FARM BACKGROUND (SCALES TO ENTIRE SCREEN, NO BOX) ─── */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Full-bleed cinematic photo from documentation/images/herobg.png */}
          <Image
            src="/herobg.webp"
            alt="PuretyFarm Pure A2 Gir Cow Milk on Scenic Raipur Farmland"
            fill
            priority
            quality={95}
            className="object-cover object-[68%_46%] lg:object-[68%_46%] select-none pointer-events-none"
          />

          {/* Desktop Left-to-Right Luminous Sunrise Mist — preserves green hills while ensuring 100% text contrast */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#FFFDF7]/85 via-[#FFFDF7]/50 via-40% to-transparent pointer-events-none z-[1]" />

          {/* Mobile Luminous Morning Light — keeps the full pasture image visible while maintaining contrast */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-[#FFFDF7]/75 via-[#FFFDF7]/50 via-50% to-[#FFFDF7]/25 pointer-events-none z-[1]" />
        </div>

        {/* ─── MAIN CONTENT COMPOSITION ─── */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-2 sm:py-3 lg:py-1 min-w-0 min-h-0">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center min-w-0">

            {/* ─── LEFT COLUMN: EDITORIAL TYPOGRAPHY & CTAs ─── */}
            <div className="lg:col-span-6 xl:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0 w-full min-w-0">

              {/* 1. Status Badge: DAWN MILKED TODAY */}
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7EE] border border-[#BCE5C8] shadow-2xs backdrop-blur-md mb-2.5 sm:mb-3"
              >
                <span className="flex h-3.5 w-3.5 rounded-full border-[1.5px] border-emerald-600 items-center justify-center shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#166534] tracking-[0.16em] uppercase">
                  Dawn Milked Today
                </span>
              </m.div>

              {/* 2. Main Headline: Editorial Serif */}
              <m.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[1.75rem] sm:text-4xl md:text-[2.85rem] lg:text-[clamp(2.3rem,3.1vw,3.65rem)] font-bold text-[#1A1008] leading-[1.14] tracking-tight font-[family-name:var(--font-heading)] max-w-full"
              >
                <span className="block">Pure A2 Cow Milk,</span>
                <span className="text-[#541711] relative inline-block font-serif italic my-0.5">
                  Delivered Fresh
                  {/* Subtle warm golden brush underline */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 sm:bottom-1.5 left-0 right-0 h-3 sm:h-3.5 bg-[#F6E575]/85 -z-10 rounded-xs"
                  />
                </span>
                <span className="block">to Your Doorstep</span>
              </m.h1>

              {/* 3. Supporting Text */}
              <m.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#3E2D24] leading-relaxed max-w-xl font-normal px-2"
              >
                Farm-fresh, 100% unadulterated Gir cow milk delivered before 7:00 AM daily across
                Shankar Nagar, VIP Road, Samta Colony, Civil Lines &amp; all Raipur localities.
              </m.p>

              {/* 4. Desktop Action CTAs (Pill-shaped matching reference design) */}
              <m.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="hidden lg:flex mt-4 sm:mt-5 flex-row items-center gap-4"
              >
                {/* Primary Dominant CTA: Start My 7-Day Trial */}
                <m.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTrialClick}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full bg-[#541711] hover:bg-[#40110D] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#541711]/25 hover:shadow-2xl hover:shadow-[#541711]/35 transition-all duration-200 cursor-pointer min-h-[46px]"
                >
                  <FiZap className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5E729] shrink-0" />
                  <span>Start My 7-Day Trial</span>
                  <FiArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </m.button>

                {/* Secondary CTA: Watch How It Works (1 min video) */}
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="group inline-flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/80 transition-all duration-200 cursor-pointer text-left min-h-[46px]"
                  aria-label="Watch how PuretyFarm works, 1 minute video"
                >
                  <span className="w-10 h-10 rounded-full bg-[#F2ECE1] border border-[#E3D7C9] flex items-center justify-center text-[#541711] shadow-xs group-hover:scale-105 group-hover:bg-[#EFE4D6] transition-transform duration-200 shrink-0">
                    <FiPlay className="w-4 h-4 ml-0.5 fill-current" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1A1008] group-hover:text-[#541711] transition-colors leading-tight">
                      Watch How It Works
                    </span>
                    <span className="text-[11px] text-[#6B584C] font-medium mt-0.5">
                      1 min video
                    </span>
                  </div>
                </button>
              </m.div>

              {/* ─── MOBILE ONLY ACTION CTAs ─── */}
              <m.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="lg:hidden w-full max-w-md flex flex-col items-stretch gap-2.5 mt-3.5 px-2"
              >
                <m.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTrialClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#541711] active:bg-[#40110D] text-white font-bold text-sm shadow-xl shadow-[#541711]/25 min-h-[46px] cursor-pointer"
                >
                  <FiZap className="w-4 h-4 text-[#F5E729] shrink-0" />
                  <span>Start My 7-Day Trial</span>
                  <FiArrowRight className="w-4 h-4" />
                </m.button>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-[#ECE5DC] text-[#1A1008] font-bold text-xs shadow-xs min-h-[40px] cursor-pointer hover:bg-white active:scale-98 transition-all"
                >
                  <span className="w-5 h-5 rounded-full bg-[#F2ECE1] border border-[#E3D7C9] text-[#541711] flex items-center justify-center shrink-0">
                    <FiPlay className="w-2.5 h-2.5 ml-0.5 fill-current" />
                  </span>
                  <span>Watch How It Works</span>
                  <span className="text-[10px] text-[#6B584C] font-medium">• 1 min video</span>
                </button>
              </m.div>

            </div>

            {/* Spacer for desktop layout (the right side bottle visual is rendered as full-stage overlay) */}
            <div className="hidden lg:block lg:col-span-6 xl:col-span-7" aria-hidden="true" />

          </div>
        </div>

        {/* ─── BOTTOM HERO BENEFIT BAR ─── */}
        <HeroBenefitBar />
      </section>

      {/* ─── INTERACTIVE 1-MINUTE STORY VIDEO MODAL ─── */}
      <HeroVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </>
  );
}
