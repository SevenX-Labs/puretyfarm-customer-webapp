"use client";

import { Button } from "@/components/ui/Button";
import { handleTrialClick, handleDownloadClick } from "@/lib/cta";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full bg-[#FFFDF7] overflow-hidden"
    >
      {/* Subtle decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F5E729]/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#5C1B13]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4 md:py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#5C1B13] flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-[#1A1008] tracking-tight font-[family-name:var(--font-heading)]">
              PuretyFarm
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={handleTrialClick}>
            Start Trial
          </Button>
        </header>

        {/* Hero content */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12 md:py-20 lg:py-24">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-[#F5E729]/20 border border-[#F5E729]/40 rounded-full px-4 py-2 mb-6">
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

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1008] leading-tight tracking-tight font-[family-name:var(--font-heading)]">
              Pure A2 Cow Milk,{" "}
              <span className="text-[#5C1B13]">Delivered Fresh</span> to Your
              Door
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[#3A241C] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Farm-fresh, unadulterated Gir cow milk delivered before 7:00 AM
              across Shankar Nagar, VIP Road, Samta Colony & all major Raipur
              localities.
            </p>

            {/* CTA group */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
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
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-sm text-[#3A241C]/70">
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

          {/* Hero visual */}
          <div className="flex-1 relative max-w-md lg:max-w-lg">
            <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#FBF6EE] to-[#F5E729]/10 border border-[#E8DFD4] overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#5C1B13]/10 flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#5C1B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-[#5C1B13] font-[family-name:var(--font-heading)]">
                  100% Pure A2
                </p>
                <p className="mt-2 text-[#3A241C]">
                  Fresh from our Gir cows, delivered in glass bottles
                </p>
                {/* Decorative badge */}
                <div className="mt-6 inline-flex items-center gap-2 bg-[#F5E729] rounded-full px-4 py-2">
                  <span className="text-sm font-bold text-[#1A1008]">
                    🥛 Delivered before 7 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
