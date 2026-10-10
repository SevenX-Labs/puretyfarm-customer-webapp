"use client";

import React from "react";
import Image from "next/image";
import { FiCheck, FiAward, FiClock, FiPackage } from "react-icons/fi";
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

export function OnboardingSidebar({
  currentStep,
  maxAllowedStep,
  onGoToStep,
}: OnboardingSidebarProps) {
  const currentStepConfig =
    ONBOARDING_STEPS.find((s) => s.num === currentStep) || ONBOARDING_STEPS[0];
  const progressPercent = Math.round((currentStep / 4) * 100);

  return (
    <aside
      className="relative flex flex-col justify-between shrink-0 text-white w-full md:w-[320px] lg:w-[340px] xl:w-[360px] h-auto md:h-full select-none overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #681F16 0%, #5C1B13 50%, #4A1510 100%)",
      }}
    >
      {/* Subtle radial ambient highlight for rich depth */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #F8E94E 0%, rgba(92,27,19,0) 70%)",
        }}
        aria-hidden="true"
      />

      {/* ──────────────────────────────────────────────────────────
          1. MOBILE VIEW (< 768px): Slim top bar
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col p-3.5 sm:p-4 md:hidden relative z-10 gap-2 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-[110px] h-[34px] shrink-0">
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
            <span className="text-[11px] font-bold text-[#F8E94E] uppercase tracking-wider shrink-0">
              Step {currentStep} of 4
            </span>
            <span className="text-white/40 text-[10px]">•</span>
            <span className="text-xs font-semibold text-[#FFFDF7] truncate">
              {currentStepConfig.title}
            </span>
          </div>
        </div>

        {/* Progress bar fill */}
        <div
          className="h-1 w-full bg-black/25 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-label={`Onboarding progress: Step ${currentStep} of 5`}
        >
          <div
            className="h-full bg-[#F8E94E] rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. TABLET VIEW (768px – 1023px): Compact top banner
      ────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex lg:hidden flex-col p-4 relative z-10 gap-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="relative w-[130px] h-[38px]">
            <Image
              src="/newimge/logo-removebg-preview.png"
              alt="Purety Farm"
              fill
              sizes="130px"
              className="object-contain object-left brightness-0 invert"
              priority
            />
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#F8E94E] uppercase tracking-wider block">
              Step {currentStep} of 4
            </span>
            <span className="text-xs font-semibold text-[#FFFDF7]">
              {currentStepConfig.title}
            </span>
          </div>
        </div>

        {/* Horizontal 4-dot stepper indicator */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const isInteractive =
              step.num <= maxAllowedStep && onGoToStep !== undefined;

            return (
              <button
                key={step.num}
                type="button"
                disabled={!isInteractive}
                onClick={() => isInteractive && onGoToStep?.(step.num)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-1 px-1 rounded-lg transition-colors ${
                  isInteractive
                    ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F8E94E]"
                    : "cursor-default"
                }`}
              >
                <div
                  className={`h-2.5 w-full rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    isCompleted
                      ? "bg-[#F8E94E]"
                      : isCurrent
                      ? "bg-[#F8E94E] shadow-[0_0_8px_rgba(248,233,78,0.5)]"
                      : "bg-white/20"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold truncate ${
                    isCurrent
                      ? "text-[#F8E94E]"
                      : isCompleted
                      ? "text-[#FFFDF7]"
                      : "text-white/40"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. DESKTOP VIEW (≥ 1024px): Premium full-height sidebar
      ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between h-full p-6 xl:p-7 relative z-10 overflow-hidden">
        {/* Top Section: Brand + Progress + Stepper */}
        <div className="space-y-6">
          {/* Brand Logo: ~154px width, generous breathing room */}
          <div className="pt-1">
            <div className="relative w-[154px] h-[52px]">
              <Image
                src="/newimge/logo-removebg-preview.png"
                alt="Purety Farm"
                fill
                sizes="154px"
                className="object-contain object-left brightness-0 invert"
                priority
              />
            </div>
          </div>

          {/* Progress Section: Step counter and smooth yellow progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-[#F8E94E]">Step {currentStep} of 4</span>
              <span className="text-white/70 tabular-nums">{progressPercent}%</span>
            </div>
            <div
              className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10"
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={4}
              aria-label={`Onboarding progress: Step ${currentStep} of 5`}
            >
              <div
                className="h-full bg-[#F8E94E] rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Vertical Stepper */}
          <nav aria-label="Onboarding progress" className="pt-2">
            <ol className="space-y-2.5 xl:space-y-3">
              {ONBOARDING_STEPS.map((step, idx) => {
                const isCompleted = currentStep > step.num;
                const isCurrent = currentStep === step.num;
                const isUpcoming = currentStep < step.num;
                const isInteractive =
                  step.num <= maxAllowedStep && onGoToStep !== undefined;
                const isLast = idx === ONBOARDING_STEPS.length - 1;

                const content = (
                  <div
                    className={`group relative flex items-start gap-3.5 p-2 rounded-xl transition-all duration-200 ${
                      isCurrent
                        ? "bg-white/[0.09] shadow-sm"
                        : isInteractive
                        ? "hover:bg-white/[0.04]"
                        : ""
                    }`}
                  >
                    {/* Circle Indicator with connector line */}
                    <div className="relative flex flex-col items-center shrink-0 pt-0.5">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 select-none ${
                          isCompleted
                            ? "bg-[#F8E94E] text-[#5C1B13] shadow-xs"
                            : isCurrent
                            ? "bg-[#F8E94E] text-[#5C1B13] ring-4 ring-[#F8E94E]/25 shadow-md"
                            : "border-2 border-white/35 text-white/75 bg-transparent"
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

                      {/* Vertical connector line */}
                      {!isLast && (
                        <span
                          className={`w-0.5 h-6 mt-1 transition-colors duration-300 motion-reduce:transition-none ${
                            isCompleted
                              ? "bg-[#F8E94E]/80"
                              : "bg-white/20 border-l border-dashed border-white/25"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="min-w-0 pt-0.5">
                      <span
                        className={`block text-sm leading-tight transition-colors ${
                          isCurrent
                            ? "font-bold text-[#FFFDF7]"
                            : isCompleted
                            ? "font-semibold text-[#FFFDF7]"
                            : "font-medium text-white/70"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span
                        className={`block text-xs leading-normal mt-0.5 transition-colors ${
                          isCurrent
                            ? "text-[#F8E94E] font-medium"
                            : isCompleted
                            ? "text-[#E8DFD4]"
                            : "text-white/55"
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
                        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F8E94E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#5C1B13] rounded-xl cursor-pointer block"
                      >
                        {content}
                      </button>
                    ) : (
                      <div aria-current={isCurrent ? "step" : undefined}>
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Bottom Section: Brand Value Proposition + Tagline */}
        <div className="space-y-4 pt-4 border-t border-white/15">
          {/* Value block: short authentic brand pillars from live product */}
          <div className="space-y-2.5 hidden [@media(min-height:680px)]:block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F8E94E] block">
              Why Families Choose Purety Farm
            </span>
            <ul className="space-y-2 text-xs text-[#FFFDF7]/90">
              <li className="flex items-center gap-2.5">
                <FiAward className="w-3.5 h-3.5 text-[#F8E94E] shrink-0" />
                <span>100% Raw A2 Gir Cow Milk</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiClock className="w-3.5 h-3.5 text-[#F8E94E] shrink-0" />
                <span>Delivered Fresh Before 10:00 AM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiPackage className="w-3.5 h-3.5 text-[#F8E94E] shrink-0" />
                <span>Sealed in Reusable Glass Bottles</span>
              </li>
            </ul>
          </div>

          {/* Tagline footer */}
          <div className="flex items-center gap-2 text-[11px] text-[#FFFDF7]/75 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F8E94E] shrink-0" />
            <span>Purety Farm • Fresh Daily A2 Milk</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
