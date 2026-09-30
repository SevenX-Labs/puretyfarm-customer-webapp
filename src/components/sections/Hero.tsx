"use client";

import { Button } from "@/components/ui/Button";
import { handleTrialClick, handleDownloadClick } from "@/lib/cta";
import { useHeroEntrance, useParallax } from "@/lib/animations";
import { HeroBottle3D } from "@/components/sections/HeroBottle3D";

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
      {/* Subtle decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={bgBlob1} className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F5E729]/10 blur-3xl" />
        <div ref={bgBlob2} className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#5C1B13]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero content */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-8 md:py-16 lg:py-20">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Trust badge */}
            <div data-hero-anim className="inline-flex items-center gap-2 bg-[#F5E729]/20 border border-[#F5E729]/40 rounded-full px-4 py-2 mb-6">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#F5E729]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-[#3A241C]">
                500+ Happy Families in Raipur
              </span>
            </div>

            <h1 data-hero-anim className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1008] leading-tight tracking-tight font-[family-name:var(--font-heading)]">
              Pure A2 Cow Milk,{" "}
              <span className="text-[#5C1B13]">Delivered Fresh</span> to Your
              Door
            </h1>

            <p data-hero-anim className="mt-6 text-lg sm:text-xl text-[#3A241C] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Farm-fresh, unadulterated Gir cow milk delivered before 7:00 AM
              across Shankar Nagar, VIP Road, Samta Colony & all major Raipur
              localities.
            </p>

            {/* CTA group */}
            <div data-hero-anim className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={handleTrialClick}
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
              <Button
                variant="secondary"
                size="lg"
                onClick={handleDownloadClick}
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
            </div>

            {/* Social proof micro */}
            <div data-hero-anim className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-sm text-[#3A241C]/70">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No commitment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
