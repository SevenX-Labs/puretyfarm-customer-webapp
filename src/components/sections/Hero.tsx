"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { handleTrialClick, handleDownloadClick } from "@/lib/cta";
import { useHeroEntrance, useParallax } from "@/lib/animations";
import { FLAGS } from "@/config/flags";

const ThreeBackgroundCanvas = dynamic(
  () => import("@/components/ui/ThreeBackgroundCanvas").then((mod) => mod.ThreeBackgroundCanvas),
  { ssr: false }
);

const HeroBottle3D = dynamic(
  () => import("@/components/sections/HeroBottle3D").then((mod) => mod.HeroBottle3D),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full max-w-lg mx-auto flex items-center justify-center py-4">
        <Image
          src="/pure-milk-bottle-3d.webp"
          alt="PuretyFarm Pure A2 Gir Cow Milk - 3D Glass Bottle"
          width={450}
          height={608}
          priority
          loading="eager"
          className="w-auto h-[360px] sm:h-[430px] md:h-[470px] max-w-full object-contain"
        />
      </div>
    ),
  }
);

const TRUST_METRICS = [
  { label: "100% Desi Gir Cows", icon: "🌿" },
  { label: "Sanitized Glass", icon: "🍶" },
  { label: "Chilled to 4°C", icon: "❄️" },
  { label: "Dawn Milked Daily", icon: "🌅" },
] as const;

export function Hero() {
  const heroRef = useHeroEntrance<HTMLElement>();
  const bgBlob1 = useParallax<HTMLDivElement>(-0.2);
  const bgBlob2 = useParallax<HTMLDivElement>(0.15);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full bg-[#FFFDF7] overflow-hidden"
    >
      {/* Three.js 3D droplet canvas: desktop only, strictly right side behind bottle, never overlapping text */}
      <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none -z-10">
        <ThreeBackgroundCanvas particleCount={24} />
      </div>

      {/* Decorative ambient color blur blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <div ref={bgBlob1} className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F5E729]/12 blur-3xl" />
        <div ref={bgBlob2} className="absolute -bottom-48 -left-48 w-[520px] h-[520px] rounded-full bg-[#5C1B13]/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero content */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14 py-10 md:py-16 lg:py-20">
          {/* Text content - strictly z-10 above all background layers */}
          <div className="flex-1 text-center lg:text-left relative z-10">
            {/* Trust badge with live delivery indicator */}
            <div
              data-hero-anim
              className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-[#E8DFD4] shadow-sm rounded-full pl-3 pr-4 py-1.5 mb-6"
            >
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#5C1B13] tracking-wide uppercase">
                Dawn Milked Today
              </span>
              {FLAGS.SHOW_500_FAMILIES_BADGE && (
                <>
                  <span className="text-[#3A241C]/30 text-xs">•</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5 text-[#F5E729]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#1A1008] border-l border-[#E8DFD4] pl-2.5">
                    500+ Families in Raipur
                  </span>
                </>
              )}
            </div>

            <h1
              data-hero-anim
              className="text-4xl sm:text-5xl lg:text-[3.85rem] font-bold text-[#1A1008] leading-[1.12] tracking-tight font-[family-name:var(--font-heading)]"
            >
              Pure A2 Cow Milk,{" "}
              <span className="text-[#5C1B13] relative inline-block font-serif italic">
                Delivered Fresh
                <span className="absolute bottom-1.5 left-0 right-0 h-2 bg-[#F5E729]/30 -z-10 rounded-sm" />
              </span>{" "}
              to Your Doorstep
            </h1>

            <p
              data-hero-anim
              className="mt-6 text-lg sm:text-xl text-[#3A241C]/85 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal"
            >
              Farm-fresh, 100% unadulterated Gir cow milk delivered before 7:00 AM daily
              across Shankar Nagar, VIP Road, Samta Colony, Civil Lines &amp; all Raipur localities.
            </p>

            {/* CTA group */}
            <div
              data-hero-anim
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleTrialClick}
                className="w-full sm:w-auto shadow-lg shadow-[#5C1B13]/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Start My 7-Day Trial
              </Button>
              {FLAGS.SHOW_APP_FEATURES && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleDownloadClick}
                  className="w-full sm:w-auto"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Our App
                </Button>
              )}
            </div>

            {/* Micro Trust Feature Chips Strip */}
            <div
              data-hero-anim
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
            >
              {TRUST_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#E8DFD4] shadow-xs text-xs font-semibold text-[#1A1008]"
                >
                  <span>{metric.icon}</span>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>

            {/* Social proof micro guarantees */}
            <div
              data-hero-anim
              className="mt-5 flex items-center gap-4 justify-center lg:justify-start text-xs sm:text-sm text-[#3A241C]/75"
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Zero deposit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free morning delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero visual: 3D Floating Milk Bottle */}
          <div className="flex-1 relative max-w-md lg:max-w-lg w-full">
            <HeroBottle3D />
          </div>
        </div>
      </div>
    </section>
  );
}
