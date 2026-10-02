"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { handleTrialClick } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";

const PLANS = [
  {
    name: "Starter",
    quantity: "0.5 Litre Daily",
    price: 45,
    originalPrice: null,
    description: "Perfect for couples & small families",
    features: [
      "Free morning delivery",
      "Glass bottle packaging",
      "WhatsApp updates",
      "Cancel anytime",
    ],
    highlighted: false,
  },
  {
    name: "Family",
    quantity: "1 Litre Daily",
    price: 80,
    originalPrice: 90,
    description: "Most popular for families of 3-4",
    features: [
      "Free morning delivery",
      "Glass bottle packaging",
      "WhatsApp updates",
      "Cancel anytime",
      "Priority morning slot",
      "Weekend quantity change",
    ],
    highlighted: true,
  },
  {
    name: "Joint Family",
    quantity: "2 Litres Daily",
    price: 150,
    originalPrice: 170,
    description: "Best value for large families",
    features: [
      "Free morning delivery",
      "Glass bottle packaging",
      "WhatsApp updates",
      "Cancel anytime",
      "Dedicated delivery partner",
      "Bulk pricing savings",
    ],
    highlighted: false,
  },
] as const;

export function Pricing() {
  const [isMonthly, setIsMonthly] = useState(false);
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.2 });
  const plansRef = useStaggerReveal<HTMLDivElement>("[data-plan-card]", {
    y: 60,
    stagger: 0.18,
    duration: 0.8,
    ease: "back.out(1.3)",
  });
  const trustRef = useScrollReveal<HTMLParagraphElement>({ y: 20, delay: 0.1 });

  return (
    <Section background="cream" id="pricing">
      {/* Badge */}
      <div ref={badgeRef} className="text-center mb-6">
        <span className="inline-flex items-center gap-2 bg-[#F5E729] text-[#1A1008] text-sm font-bold px-4 py-2 rounded-full">
          💰 Simple, Transparent Pricing
        </span>
      </div>

      <h2 ref={headingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
        Choose Your Daily Milk Plan
      </h2>

      <p ref={subtitleRef} className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
        All plans include free home delivery before 7 AM, sealed glass bottles,
        and 100% pure A2 Gir cow milk.
      </p>

      {/* Daily vs Monthly Billing Switcher */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center bg-[#FAF3EA] p-1.5 rounded-full border border-[#E8DFD4] shadow-xs">
          <button
            type="button"
            onClick={() => setIsMonthly(false)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              !isMonthly
                ? "bg-[#5C1B13] text-white shadow-sm"
                : "text-[#3A241C]/75 hover:text-[#1A1008]"
            }`}
          >
            Daily Rate
          </button>
          <button
            type="button"
            onClick={() => setIsMonthly(true)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isMonthly
                ? "bg-[#5C1B13] text-white shadow-sm"
                : "text-[#3A241C]/75 hover:text-[#1A1008]"
            }`}
          >
            <span>Monthly Subscription</span>
            <span className="bg-[#F5E729] text-[#1A1008] text-[10px] px-2 py-0.5 rounded-full font-black">
              SAVE
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div ref={plansRef} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const displayPrice = isMonthly ? plan.price * 30 : plan.price;
          const displayOriginalPrice = plan.originalPrice
            ? isMonthly
              ? plan.originalPrice * 30
              : plan.originalPrice
            : null;
          const monthlySavings = plan.originalPrice
            ? (plan.originalPrice - plan.price) * 30
            : null;

          return (
            <div
              key={plan.name}
              data-plan-card
              className="h-full"
            >
              <TiltCard
                tiltMaxAngle={plan.highlighted ? 8 : 6}
                scale={plan.highlighted ? 1.03 : 1.015}
                glare={true}
                className="h-full group"
              >
                {/* Highlighted plan ambient aura */}
                {plan.highlighted && (
                  <div
                    aria-hidden="true"
                    className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#F5E729]/30 via-[#5C1B13]/15 to-[#F5E729]/30 blur-md opacity-75 group-hover:opacity-100 transition-opacity -z-10"
                  />
                )}

                <div
                  className={`
                    relative flex flex-col h-full bg-white rounded-2xl p-6
                    transition-shadow duration-300
                    ${
                      plan.highlighted
                        ? "border-2 border-[#5C1B13] shadow-xl shadow-[#5C1B13]/15 ring-1 ring-[#5C1B13]/15"
                        : "border border-[#E8DFD4] shadow-sm hover:shadow-lg hover:border-[#5C1B13]/30"
                    }
                  `}
                >
                  {/* Most popular badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                      <span className="inline-flex items-center gap-1.5 bg-[#F5E729] text-[#1A1008] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm border border-[#F5E729]/60">
                        ⭐ RECOMMENDED
                      </span>
                    </div>
                  )}

                  {/* Plan name */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-[#3A241C]/70 mt-1">{plan.quantity}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#5C1B13] tracking-tight">
                      ₹{displayPrice}
                    </span>
                    <span className="text-sm text-[#3A241C]/65 font-medium">
                      /{isMonthly ? "month" : "day"}
                    </span>
                    {displayOriginalPrice && (
                      <span className="text-sm text-[#3A241C]/40 line-through ml-1">
                        ₹{displayOriginalPrice}
                      </span>
                    )}
                  </div>

                  {isMonthly && monthlySavings && (
                    <div className="mb-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                        Save ₹{monthlySavings}/month
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-[#3A241C]/70 mb-6">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <svg
                        className="w-5 h-5 text-[#5C1B13] flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-[#1A1008]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  fullWidth
                  onClick={handleTrialClick}
                >
                  Start 7-Day Trial
                </Button>
              </div>
            </TiltCard>
          </div>
        );
      })}
      </div>

      {/* Included with every plan strip */}
      <div className="mt-12 p-5 rounded-2xl bg-white/80 border border-[#E8DFD4] max-w-4xl mx-auto shadow-xs">
        <p className="text-xs uppercase font-bold text-center text-[#5C1B13] tracking-wider mb-3">
          Every PuretyFarm Subscription Always Includes:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-semibold text-[#1A1008]">
          <div className="p-2 rounded-xl bg-[#FAF3EA]/80 border border-[#E8DFD4]/70">
            🚚 Free 7 AM Delivery
          </div>
          <div className="p-2 rounded-xl bg-[#FAF3EA]/80 border border-[#E8DFD4]/70">
            🍶 Zero Plastic Glass
          </div>
          <div className="p-2 rounded-xl bg-[#FAF3EA]/80 border border-[#E8DFD4]/70">
            ⏸️ WhatsApp Pause/Skip
          </div>
          <div className="p-2 rounded-xl bg-[#FAF3EA]/80 border border-[#E8DFD4]/70">
            💯 Money-Back Promise
          </div>
        </div>
      </div>

      {/* Society / Bulk Enquiry banner */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#3A241C]/80">
          Need bulk supply for your residential society, apartment complex, or event in Raipur?{" "}
          <a
            href="https://wa.me/919131920708?text=Hi%20PuretyFarm%2C%20I%20am%20interested%20in%20a%20society%20bulk%20milk%20subscription."
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#5C1B13] underline hover:text-[#4A1510] ml-1"
          >
            Chat with our Raipur Institutional Team →
          </a>
        </p>
      </div>

      {/* Trust line */}
      <p ref={trustRef} className="mt-6 text-center text-xs sm:text-sm text-[#3A241C]/60">
        No commitment • Cancel anytime • 100% money-back guarantee
      </p>
    </Section>
  );
}
