"use client";

import React from "react";
import Image from "next/image";
import { FiCheck } from "react-icons/fi";
import { StepKey } from "../types";

export interface OnboardingStepConfig {
  num: StepKey;
  title: string;
  subtitle: string;
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    num: 1,
    title: "Profile Details",
    subtitle: "Tell us about yourself",
  },
  {
    num: 2,
    title: "Delivery Address",
    subtitle: "Select area & house details",
  },
  {
    num: 3,
    title: "Select Plan",
    subtitle: "Start receiving milk",
  },
  {
    num: 4,
    title: "Payment",
    subtitle: "Pay via wallet or cash",
  },
];

export interface OnboardingSidebarProps {
  currentStep: StepKey;
  maxAllowedStep: StepKey;
  onGoToStep?: (step: StepKey) => void;
}

function OnboardingSidebarComponent({
  currentStep,
  maxAllowedStep,
  onGoToStep,
}: OnboardingSidebarProps) {
  const currentStepConfig =
    ONBOARDING_STEPS.find((s) => s.num === currentStep) || ONBOARDING_STEPS[0];
  const progressPercent = Math.round((currentStep / 4) * 100);

  return (
    <aside
      className="relative flex flex-col justify-between shrink-0 text-white w-full md:w-[255px] lg:w-[270px] h-auto md:h-full select-none overflow-hidden rounded-t-2xl md:rounded-l-3xl md:rounded-tr-none"
      style={{
        background:
          "linear-gradient(180deg, #581610 0%, #4B120B 55%, #3B0D08 100%)",
      }}
    >
      {/* Etched cow & farm illustration watermark at bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 overflow-hidden z-0 opacity-20 mix-blend-screen"
        aria-hidden="true"
      >
        <Image
          src="/newimge/sidebar-cow-etching.png"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover object-bottom"
        />
      </div>

      {/* Subtle radial ambient highlight for warmth */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #E5B56E 0%, rgba(88,22,16,0) 70%)",
        }}
        aria-hidden="true"
      />

      {/* ──────────────────────────────────────────────────────────
          1. MOBILE VIEW (< 768px): Slim top bar
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col p-3.5 sm:p-4 md:hidden relative z-10 gap-2 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-[110px] h-[36px] shrink-0">
            <Image
              src="/newimge/logo-removebg-preview.png"
              alt="Purety Farm"
              fill
              sizes="110px"
              className="object-contain object-left brightness-0 invert"
              priority
            />
          </div>

          <div className="flex items-center gap-1.5 text-right min-w-0">
            <span className="text-[11px] font-bold text-[#E5B56E] uppercase tracking-wider shrink-0">
              STEP {currentStep} OF 4
            </span>
            <span className="text-white/40 text-[10px]">•</span>
            <span className="text-xs font-semibold text-[#FFFDF7] truncate">
              {currentStepConfig.title}
            </span>
          </div>
        </div>

        {/* Progress bar fill */}
        <div
          className="h-2 w-full bg-black/35 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-label={`Onboarding progress: Step ${currentStep} of 4`}
        >
          <div
            className="h-full bg-[#E5B56E] rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. TABLET & DESKTOP VIEW (≥ 768px): Premium vertical sidebar
      ────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between h-full p-4.5 sm:p-5 relative z-10 overflow-hidden">
        {/* Top Section: Brand + Progress + Stepper */}
        <div className="space-y-4 lg:space-y-4.5">
          {/* Brand Logo matching reference */}
          <div className="pt-0.5">
            <div className="relative w-[130px] lg:w-[140px] h-[44px] lg:h-[48px]">
              <Image
                src="/newimge/logo-removebg-preview.png"
                alt="Purety Farm — Fresh A2 Gir Cow Milk"
                fill
                sizes="(max-width: 1024px) 130px, 140px"
                className="object-contain object-left brightness-0 invert"
                priority
              />
            </div>
          </div>

          {/* Progress Section: Step counter and smooth golden progress bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-[#E5B56E]">STEP {currentStep} OF 4</span>
              <span className="text-[#E5B56E] tabular-nums font-bold">{progressPercent}%</span>
            </div>
            <div
              className="h-2 w-full bg-black/35 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={4}
              aria-label={`Onboarding progress: Step ${currentStep} of 4`}
            >
              <div
                className="h-full bg-[#E5B56E] rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Vertical Stepper */}
          <nav aria-label="Onboarding progress" className="pt-2">
            <ol>
              {ONBOARDING_STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.num;
                const isCurrent = currentStep === step.num;
                const isInteractive =
                  step.num <= maxAllowedStep && onGoToStep !== undefined;
                const isLast = idx === ONBOARDING_STEPS.length - 1;

                const content = (
                  <div
                    className={`group relative flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 ${
                      isCurrent
                        ? "bg-white/[0.08] border border-white/15 shadow-sm"
                        : isInteractive
                        ? "hover:bg-white/[0.04]"
                        : ""
                    }`}
                  >
                    {/* Circle Indicator */}
                    <div className="relative flex flex-col items-center shrink-0 pt-0.5">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 select-none ${
                          isCompleted
                            ? "bg-[#E5B56E] text-[#3B0D08] shadow-xs"
                            : isCurrent
                            ? "bg-[#E5B56E] text-[#3B0D08] shadow-sm font-extrabold"
                            : "border border-white/40 text-white/80 bg-transparent font-medium"
                        }`}
                      >
                        {isCompleted ? (
                          <FiCheck
                            className="h-4 w-4 stroke-[3]"
                            aria-hidden="true"
                          />
                        ) : (
                          <span>{step.num}</span>
                        )}
                      </span>
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="min-w-0 pt-0.5">
                      <span
                        className={`block text-sm leading-tight transition-colors ${
                          isCurrent
                            ? "font-bold text-white"
                            : isCompleted
                            ? "font-semibold text-white/95"
                            : "font-medium text-white/85"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span
                        className={`block text-xs leading-normal mt-0.5 transition-colors ${
                          isCurrent
                            ? "text-[#E8DAC8] font-medium"
                            : isCompleted
                            ? "text-[#E8DAC8]/80"
                            : "text-white/60"
                        }`}
                      >
                        {step.subtitle}
                      </span>
                    </div>

                    {/* Screen reader state announcement */}
                    <span className="sr-only">
                      {isCompleted
                        ? "(Completed step)"
                        : isCurrent
                        ? "(Current step)"
                        : "(Upcoming step)"}
                    </span>
                  </div>
                );

                return (
                  <li key={step.num} className="relative">
                    {isInteractive ? (
                      <button
                        type="button"
                        onClick={() => onGoToStep?.(step.num)}
                        aria-current={isCurrent ? "step" : undefined}
                        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B56E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#581610] rounded-2xl cursor-pointer block"
                      >
                        {content}
                      </button>
                    ) : (
                      <div aria-current={isCurrent ? "step" : undefined}>
                        {content}
                      </div>
                    )}

                    {/* Vertical connector line centered under the 28px circle */}
                    {!isLast && (
                      <div className="flex justify-start pl-[25px] py-0.5">
                        <div
                          className={`h-5 border-l-2 border-dashed transition-colors duration-300 ${
                            isCompleted
                              ? "border-[#E5B56E]"
                              : "border-white/25"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Bottom Section: Why Families Choose Purety Farm */}
        <div className="pt-5 border-t border-white/15 relative z-10 space-y-3">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#E5B56E] block">
            WHY FAMILIES CHOOSE PURETY FARM
          </span>
          <ul className="space-y-2.5 text-xs text-white/95">
            <li className="flex items-center gap-2.5">
              {/* Leaf Icon */}
              <svg
                className="w-4 h-4 text-[#E5B56E] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              <span>100% Raw A2 Gir Cow Milk</span>
            </li>
            <li className="flex items-center gap-2.5">
              {/* Delivery Truck Icon */}
              <svg
                className="w-4 h-4 text-[#E5B56E] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Delivered Fresh Every Morning</span>
            </li>
            <li className="flex items-center gap-2.5">
              {/* Milk Glass Bottle Icon */}
              <svg
                className="w-4 h-4 text-[#E5B56E] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 2h6v3H9z" />
                <path d="M9 5c-2 0-3 1.5-3 3.5V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8.5C18 6.5 17 5 15 5H9z" />
                <line x1="6" y1="12" x2="18" y2="12" />
              </svg>
              <span>Sealed in Reusable Glass Bottles</span>
            </li>
            <li className="flex items-center gap-2.5">
              {/* Heart Icon */}
              <svg
                className="w-4 h-4 text-[#E5B56E] shrink-0 fill-[#E5B56E]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Purety Farm - Fresh Daily A2 Milk</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export const OnboardingSidebar = React.memo(OnboardingSidebarComponent);

