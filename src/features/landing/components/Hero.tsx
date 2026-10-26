"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { FiArrowRight, FiPlay, FiShield } from "react-icons/fi";
import { HeroBenefitBar } from "./HeroBenefitBar";

export function Hero() {
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const [ctaScale, setCtaScale] = useState(1);

  // Dynamic logic: ensures "View Pricing" and "Watch How It Works" ALWAYS stay on a single line across any screen width
  useEffect(() => {
    const updateCtaScale = () => {
      if (!ctaContainerRef.current || !ctaRowRef.current) return;
      const containerWidth = ctaContainerRef.current.clientWidth;
      const rowWidth = ctaRowRef.current.scrollWidth;

      if (containerWidth > 0 && rowWidth > 0) {
        if (rowWidth > containerWidth) {
          // Downscale smoothly so both CTAs fit within the exact container width
          setCtaScale(Math.min(1, Math.max(0.55, (containerWidth - 2) / rowWidth)));
        } else {
          setCtaScale(1);
        }
      }
    };

    updateCtaScale();
    window.addEventListener("resize", updateCtaScale);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && ctaContainerRef.current) {
      resizeObserver = new ResizeObserver(updateCtaScale);
      resizeObserver.observe(ctaContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateCtaScale);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <section
        id="hero"
        aria-label="PuretyFarm A2 Cow Milk Hero"
        className="relative w-full bg-[#FFFDF7] overflow-hidden flex flex-col justify-between min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] pt-18 sm:pt-20 lg:pt-16 pb-0"
      >
        {/* ─── FULL-SCREEN CINEMATIC FARM BACKGROUND (SCALES TO ENTIRE SCREEN, NO BOX) ─── */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Full-bleed cinematic photo from documentation/images/herobg.png */}
          <Image
            src="/herobg.png"
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
                Farm-fresh, 100% unadulterated Gir cow milk delivered . Order before 10 pm get it before 11 am next day morning across
                Shankar Nagar, VIP Road, Samta Colony, Civil Lines &amp; all Raipur localities.
              </m.p>

              {/* 4. Action CTAs: Guaranteed to ALWAYS remain on one single line on all screen sizes */}
              <m.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                ref={ctaContainerRef}
                className="mt-3.5 sm:mt-5 w-full max-w-full overflow-visible flex items-center justify-center lg:justify-start"
              >
                <div
                  style={{
                    transform: ctaScale < 1 ? `scale(${ctaScale})` : undefined,
                    transformOrigin: "center center",
                  }}
                  className="lg:!origin-left transition-transform duration-100 ease-out shrink-0"
                >
                  <div
                    ref={ctaRowRef}
                    className="inline-flex flex-row items-center gap-2 sm:gap-3.5 md:gap-4 flex-nowrap whitespace-nowrap"
                  >
                    {/* Primary Dominant CTA: View Pricing */}
                    <m.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                      <Link
                        href="/#pricing"
                        className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3.5 rounded-full bg-[#541711] hover:bg-[#40110D] active:bg-[#40110D] text-white font-bold text-xs sm:text-sm md:text-base shadow-xl shadow-[#541711]/25 hover:shadow-2xl hover:shadow-[#541711]/35 transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] sm:min-h-[46px]"
                      >
                        <span className="whitespace-nowrap">View Pricing</span>
                        <FiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
                      </Link>
                    </m.div>

                    {/* Secondary CTA: How It Works */}
                    <Link
                      href="/#how-it-works"
                      className="group inline-flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-white/80 active:bg-white/90 transition-all duration-200 cursor-pointer text-left shrink-0 whitespace-nowrap min-h-[40px] sm:min-h-[46px]"
                      aria-label="See how PuretyFarm works"
                    >
                      <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#F2ECE1] border border-[#E3D7C9] flex items-center justify-center text-[#541711] shadow-xs group-hover:scale-105 group-hover:bg-[#EFE4D6] transition-transform duration-200 shrink-0">
                        <FiPlay className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ml-0.5 fill-current" />
                      </span>
                      <div className="flex flex-col whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-bold text-[#1A1008] group-hover:text-[#541711] transition-colors leading-tight whitespace-nowrap">
                          How It Works
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-[#6B584C] font-medium mt-0.5 whitespace-nowrap">
                          5 simple steps
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </m.div>

            </div>

            {/* Spacer for desktop layout (the right side bottle visual is rendered as full-stage overlay) */}
            <div className="hidden lg:block lg:col-span-6 xl:col-span-7" aria-hidden="true" />

          </div>
        </div>

        {/* ─── BOTTOM RIGHT FSSAI BADGE (Dark Background) ─── */}
        <div className="absolute bottom-[98px] sm:bottom-[70px] lg:bottom-[72px] right-3 sm:right-6 lg:right-8 z-20 pointer-events-auto">
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 sm:gap-2.5 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl bg-[#1A1008]/92 hover:bg-[#1A1008] border border-[#3E2D24] shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md text-white transition-all duration-200 select-none"
          >
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 rounded-md sm:rounded-lg bg-[#541711] border border-[#7A281E] items-center justify-center shrink-0 shadow-2xs">
              <FiShield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F5E729]" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[8.5px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#D1B89D] leading-none">
                FSSAI Certified
              </span>
              <span className="text-[10.5px] sm:text-xs font-bold font-mono tracking-wide text-white leading-tight mt-0.5">
                Lic. No. 20526048000180
              </span>
            </div>
          </m.div>
        </div>

        {/* ─── BOTTOM HERO BENEFIT BAR ─── */}
        <HeroBenefitBar />
      </section>
  );
}
