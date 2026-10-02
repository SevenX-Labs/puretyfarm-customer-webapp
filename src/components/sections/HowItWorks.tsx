"use client";

import { Section } from "@/components/ui/Section";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import {
  FiDownload,
  FiList,
  FiPlay,
  FiSettings,
  FiSun,
  FiArrowDown,
} from "react-icons/fi";

const STEPS = [
  {
    number: 1,
    title: "Download the App",
    description: "Get PuretyFarm from the Google Play Store in seconds",
    icon: FiDownload,
    accent: "bg-blue-500",
    accentLight: "bg-blue-50 border-blue-200 text-blue-700",
    tag: "Quick Setup",
  },
  {
    number: 2,
    title: "Choose Your Plan",
    description: "Pick from 7-day trial, monthly, or quarterly subscriptions",
    icon: FiList,
    accent: "bg-amber-500",
    accentLight: "bg-amber-50 border-amber-200 text-amber-700",
    tag: "Flexible Plans",
  },
  {
    number: 3,
    title: "Start Your Trial",
    description: "Begin with our risk-free 7-day trial — no commitment needed",
    icon: FiPlay,
    accent: "bg-emerald-500",
    accentLight: "bg-emerald-50 border-emerald-200 text-emerald-700",
    tag: "Zero Risk",
  },
  {
    number: 4,
    title: "Set Delivery Preference",
    description: "Choose your daily quantity and preferred delivery time slot",
    icon: FiSettings,
    accent: "bg-purple-500",
    accentLight: "bg-purple-50 border-purple-200 text-purple-700",
    tag: "Your Way",
  },
  {
    number: 5,
    title: "Receive Fresh Milk",
    description: "Wake up to pure A2 milk at your doorstep before 7:00 AM",
    icon: FiSun,
    accent: "bg-[#5C1B13]",
    accentLight: "bg-[#FAF3EA] border-[#E8DFD4] text-[#5C1B13]",
    tag: "Every Morning",
  },
] as const;

export function HowItWorks() {
  const badgeRef = useScrollReveal<HTMLSpanElement>({ y: 20, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.2 });
  const stepsRef = useStaggerReveal<HTMLDivElement>("[data-step]", {
    y: 50,
    stagger: 0.18,
    duration: 0.7,
    ease: "back.out(1.3)",
  });

  return (
    <Section id="how-it-works">
      <div className="text-center mb-12 sm:mb-16">
        <span
          ref={badgeRef}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 border border-[#5C1B13]/20 rounded-full px-4 py-1.5 mb-4 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#5C1B13] animate-pulse" />
          Simple & Easy
        </span>
        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight"
        >
          How It Works
        </h2>
        <p
          ref={subtitleRef}
          className="mt-3.5 text-base sm:text-lg text-[#3A241C]/80 max-w-xl mx-auto leading-relaxed"
        >
          From download to doorstep in 5 simple steps. Fresh A2 milk, every morning.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div ref={stepsRef} className="relative max-w-2xl mx-auto">
        {/* Central vertical connector line */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-[#5C1B13] via-[#F5E729]/60 to-[#5C1B13] rounded-full"
        />

        <div className="flex flex-col gap-6 sm:gap-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <div
                key={step.number}
                data-step
                className="group relative flex items-start gap-5 sm:gap-6"
              >
                {/* Step node on the timeline */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${step.accent} text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rounded-xl`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  </div>
                  {/* Pulse ring */}
                  {!isLast && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#F5E729]/40 animate-ping pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                </div>

                {/* Content card */}
                <div className="flex-1 pb-2">
                  <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 group-hover:border-[#5C1B13]/25 group-hover:-translate-y-0.5 relative overflow-hidden">
                    {/* Subtle gradient accent */}
                    <div
                      aria-hidden="true"
                      className={`absolute top-0 left-0 w-1 h-full ${step.accent} rounded-r-full`}
                    />

                    <div className="pl-3">
                      {/* Step number badge + tag */}
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3A241C]/50">
                          Step {String(step.number).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.accentLight}`}
                        >
                          {step.tag}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors leading-tight">
                        {step.title}
                      </h3>

                      <p className="mt-1.5 text-sm text-[#3A241C]/75 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting arrow for non-last items */}
                  {!isLast && (
                    <div className="flex items-center gap-1 ml-4 mt-2 text-[#3A241C]/30">
                      <FiArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
