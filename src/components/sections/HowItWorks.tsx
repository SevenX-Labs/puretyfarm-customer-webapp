"use client";

import { Section } from "@/components/ui/Section";
import { useScrollReveal, useStaggerReveal, useDrawLine } from "@/lib/animations";

const STEPS = [
  {
    number: 1,
    title: "Download the App",
    description: "Get PuretyFarm from the Google Play Store in seconds",
  },
  {
    number: 2,
    title: "Choose Your Plan",
    description: "Pick from 7-day trial, monthly, or quarterly subscriptions",
  },
  {
    number: 3,
    title: "Start Your Trial",
    description: "Begin with our risk-free 7-day trial — no commitment needed",
  },
  {
    number: 4,
    title: "Set Delivery Preference",
    description: "Choose your daily quantity and preferred delivery time slot",
  },
  {
    number: 5,
    title: "Receive Fresh Milk",
    description: "Wake up to pure A2 milk at your doorstep before 7:00 AM",
  },
] as const;

export function HowItWorks() {
  const badgeRef = useScrollReveal<HTMLSpanElement>({ y: 20, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const lineRef = useDrawLine<HTMLDivElement>();
  const stepsRef = useStaggerReveal<HTMLDivElement>("[data-step]", {
    y: 50,
    stagger: 0.18,
    duration: 0.7,
    ease: "back.out(1.3)",
  });

  return (
    <Section id="how-it-works">
      <div className="text-center mb-12">
        <span ref={badgeRef} className="inline-block text-sm font-semibold text-[#5C1B13] bg-[#5C1B13]/10 rounded-full px-4 py-1.5 mb-4">
          Simple & Easy
        </span>
        <h2 ref={headingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
          How It Works
        </h2>
      </div>

      {/* Mobile: vertical stack with connecting line; Desktop: horizontal timeline */}
      <div className="relative">
        {/* Desktop connector line — animated draw with gold accent */}
        <div
          ref={lineRef}
          className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-1 bg-gradient-to-r from-[#5C1B13] via-[#F5E729] to-[#5C1B13] rounded-full shadow-sm"
        />

        {/* Mobile vertical connector line */}
        <div
          aria-hidden="true"
          className="lg:hidden absolute top-6 bottom-6 left-6 w-0.5 bg-gradient-to-b from-[#5C1B13] via-[#F5E729]/60 to-[#5C1B13] -translate-x-1/2"
        />

        <div ref={stepsRef} className="grid gap-8 lg:grid-cols-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              data-step
              className="group flex flex-row lg:flex-col items-start lg:items-center gap-4 lg:gap-3 text-left lg:text-center"
            >
              {/* Step number with pulsing ring */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[#5C1B13] text-white flex items-center justify-center font-bold text-lg lg:text-xl shadow-lg shadow-[#5C1B13]/25 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4A1510]">
                  {step.number}
                </div>
                {/* Subtle pulse ring on active step numbers */}
                <div className="absolute inset-0 rounded-full border-2 border-[#F5E729]/60 animate-ping pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity" />
              </div>
              <div className="flex-1 bg-white/70 lg:bg-transparent backdrop-blur-xs p-3.5 lg:p-0 rounded-xl border border-[#E8DFD4]/60 lg:border-none shadow-xs lg:shadow-none transition-transform duration-200 group-hover:translate-x-1 lg:group-hover:translate-x-0 lg:group-hover:-translate-y-1">
                <h3 className="font-bold text-[#1A1008] text-base lg:text-lg group-hover:text-[#5C1B13] transition-colors">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-[#3A241C]/75 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
