"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MarqueeTicker } from "@/components/ui/MarqueeTicker";
import { handleTrialClick, handleDownloadClick } from "@/lib/cta";
import { useHeroEntrance, useParallax } from "@/lib/animations";
import { FLAGS } from "@/config/flags";
import { ShinyText, Magnet } from "@/components/reactbits";
import { FiZap, FiDownload } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const ThreeBackgroundCanvas = dynamic(
  () => import("@/components/ui/ThreeBackgroundCanvas").then((mod) => mod.ThreeBackgroundCanvas),
  { ssr: false }
);

const HeroBottle3D = dynamic(
  () => import("@/components/sections/HeroBottle3D").then((mod) => mod.HeroBottle3D),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full max-w-md lg:max-w-lg mx-auto flex items-center justify-center py-2">
        <Image
          src="/pure-milk-bottle-3d.webp"
          alt="PuretyFarm Pure A2 Gir Cow Milk - 3D Glass Bottle"
          width={450}
          height={608}
          priority
          loading="eager"
          className="w-auto h-[270px] sm:h-[340px] md:h-[390px] lg:h-[clamp(320px,41vh,430px)] max-w-full object-contain"
        />
      </div>
    ),
  }
);

export function Hero() {
  const heroRef = useHeroEntrance<HTMLElement>();
  const bgBlob1 = useParallax<HTMLDivElement>(-0.2);
  const bgBlob2 = useParallax<HTMLDivElement>(0.15);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full bg-[#FFFDF7] overflow-hidden flex flex-col justify-between min-h-[calc(100dvh-4.5rem)] lg:h-[calc(100dvh-5.25rem)] lg:min-h-[580px] lg:max-h-[960px]"
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

      {/* Centered Hero Content */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-4 lg:py-2">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 w-full">
          {/* Text content - strictly z-10 above all background layers */}
          <div className="flex-1 text-center lg:text-left relative z-10">
            {/* Trust badge with live delivery indicator */}
            <div
              data-hero-anim
              className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E8DFD4] shadow-xs rounded-full pl-3 pr-3.5 py-1 mb-3 lg:mb-4"
            >
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <ShinyText
                text="Dawn Milked Today"
                speed={3.5}
                className="text-[11px] sm:text-xs font-bold text-[#5C1B13] tracking-wide uppercase"
              />
              {FLAGS.SHOW_500_FAMILIES_BADGE && (
                <>
                  <span className="text-[#3A241C]/30 text-xs">•</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="w-3 h-3 text-[#F5E729]" />
                    ))}
                  </div>
                  <ShinyText
                    text="500+ Families in Raipur"
                    speed={4}
                    className="text-xs font-bold text-[#1A1008] border-l border-[#E8DFD4] pl-2.5"
                  />
                </>
              )}
            </div>

            <h1
              data-hero-anim
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[clamp(2.4rem,3.6vw,3.5rem)] font-bold text-[#1A1008] leading-[1.12] tracking-tight font-[family-name:var(--font-heading)]"
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
              className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-[1.05rem] text-[#3A241C]/85 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal"
            >
              Farm-fresh, 100% unadulterated Gir cow milk delivered before 7:00 AM daily
              across Shankar Nagar, VIP Road, Samta Colony, Civil Lines &amp; all Raipur localities.
            </p>

            {/* CTA group with React Bits Magnet interaction */}
            <div
              data-hero-anim
              className="mt-5 sm:mt-6 lg:mt-7 flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start"
            >
              <Magnet magnetStrength={0.25} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleTrialClick}
                  className="w-full sm:w-auto shadow-lg shadow-[#5C1B13]/20"
                >
                  <FiZap className="w-5 h-5" />
                  Start My 7-Day Trial
                </Button>
              </Magnet>
              {FLAGS.SHOW_APP_FEATURES && (
                <Magnet magnetStrength={0.2} className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleDownloadClick}
                    className="w-full sm:w-auto"
                  >
                    <FiDownload className="w-5 h-5" />
                    Download Our App
                  </Button>
                </Magnet>
              )}
            </div>
          </div>

          {/* Hero visual: 3D Floating Milk Bottle */}
          <div className="flex-1 relative max-w-md lg:max-w-lg w-full flex items-center justify-center">
            <HeroBottle3D />
          </div>
        </div>
      </div>

      {/* MarqueeTicker anchored at the base of the Hero fold */}
      <div className="w-full shrink-0 relative z-20">
        <MarqueeTicker />
      </div>
    </section>
  );
}
