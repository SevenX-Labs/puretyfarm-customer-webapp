"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { ShinyText, Magnet } from "@/components/reactbits";
import { handleTrialClick } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import {
  FiTruck,
  FiMessageCircle,
  FiX,
  FiClock,
  FiCalendar,
  FiStar,
  FiCheck,
  FiShield,
  FiAward,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";

const PLANS = [
  {
    name: "Starter",
    quantity: "0.5 Litre Daily",
    price: 45,
    originalPrice: null,
    description: "Perfect for couples & small families",
    icon: FiStar,
    gradient: "from-slate-50 to-white",
    borderColor: "border-[#E8DFD4]",
    features: [
      { text: "Free morning delivery", icon: FiTruck },
      { text: "Glass bottle packaging", icon: FiShield },
      { text: "WhatsApp updates", icon: FiMessageCircle },
      { text: "Cancel anytime", icon: FiX },
    ],
    highlighted: false,
  },
  {
    name: "Family",
    quantity: "1 Litre Daily",
    price: 80,
    originalPrice: 90,
    description: "Most popular for families of 3-4",
    icon: FiAward,
    gradient: "from-[#FAF3EA] via-white to-[#FFFDF7]",
    borderColor: "border-[#5C1B13]",
    features: [
      { text: "Free morning delivery", icon: FiTruck },
      { text: "Glass bottle packaging", icon: FiShield },
      { text: "WhatsApp updates", icon: FiMessageCircle },
      { text: "Priority morning slot", icon: FiClock },
    ],
    highlighted: true,
  },
  {
    name: "Joint Family",
    quantity: "2 Litres Daily",
    price: 150,
    originalPrice: 170,
    description: "Best value for large families",
    icon: FiUsers,
    gradient: "from-slate-50 to-white",
    borderColor: "border-[#E8DFD4]",
    features: [
      { text: "Free morning delivery", icon: FiTruck },
      { text: "Glass bottle packaging", icon: FiShield },
      { text: "Dedicated delivery partner", icon: FiUsers },
      { text: "Bulk savings (₹75/litre)", icon: FiAward },
    ],
    highlighted: false,
  },
] as const;

const INCLUDED_PERKS = [
  { icon: FiTruck, label: "Free 7 AM Delivery" },
  { icon: FiShield, label: "Zero Plastic Glass" },
  { icon: FiMessageCircle, label: "WhatsApp Pause/Skip" },
  { icon: FiCheck, label: "Money-Back Promise" },
];

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
        <span className="inline-flex items-center gap-2 bg-[#F5E729] text-[#1A1008] text-sm font-bold px-5 py-2 rounded-full shadow-sm border border-[#F5E729]/60">
          <FiAward className="w-4 h-4" />
          Simple, Transparent Pricing
        </span>
      </div>

      <h2 ref={headingRef} className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
        Choose Your Daily Milk Plan
      </h2>

      <p ref={subtitleRef} className="mt-4 text-base sm:text-lg text-[#3A241C]/80 text-center max-w-xl mx-auto leading-relaxed">
        All plans include free home delivery before 7 AM, sealed glass bottles,
        and 100% pure A2 Gir cow milk.
      </p>

      {/* Daily vs Monthly Billing Switcher */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center bg-white p-1.5 rounded-2xl border border-[#E8DFD4] shadow-xs">
          <button
            type="button"
            onClick={() => setIsMonthly(false)}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
              !isMonthly
                ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/20"
                : "text-[#3A241C]/75 hover:text-[#1A1008] hover:bg-[#FAF3EA]"
            }`}
          >
            Daily Rate
          </button>
          <button
            type="button"
            onClick={() => setIsMonthly(true)}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
              isMonthly
                ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/20"
                : "text-[#3A241C]/75 hover:text-[#1A1008] hover:bg-[#FAF3EA]"
            }`}
          >
            <span>Monthly Subscription</span>
            <span className="bg-[#F5E729] text-[#1A1008] text-[10px] px-2 py-0.5 rounded-full font-black">
              SAVE
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards - Compact sleek design */}
      <div ref={plansRef} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto items-stretch">
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
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.name}
              data-plan-card
              className={`h-full ${plan.highlighted ? "md:-mt-2 md:mb-2" : ""}`}
            >
              <TiltCard
                tiltMaxAngle={plan.highlighted ? 5 : 3}
                scale={plan.highlighted ? 1.015 : 1.01}
                glare={true}
                className="h-full group"
              >
                {/* Highlighted plan ambient aura */}
                {plan.highlighted && (
                  <div
                    aria-hidden="true"
                    className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-[#F5E729]/30 via-[#5C1B13]/15 to-[#F5E729]/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity -z-10"
                  />
                )}

                <div
                  className={`
                    relative flex flex-col h-full bg-gradient-to-br ${plan.gradient} rounded-2xl sm:rounded-3xl p-5 sm:p-6
                    transition-all duration-300
                    ${
                      plan.highlighted
                        ? "border-2 border-[#5C1B13] shadow-xl shadow-[#5C1B13]/12 ring-1 ring-[#5C1B13]/10"
                        : "border border-[#E8DFD4] shadow-xs hover:shadow-lg hover:border-[#5C1B13]/30"
                    }
                  `}
                >
                  {/* Most popular badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                      <span className="inline-flex items-center gap-1.5 bg-[#5C1B13] text-white text-[11px] font-bold px-3.5 py-1 rounded-full whitespace-nowrap shadow-md shadow-[#5C1B13]/25 border border-[#5C1B13]">
                        <FiStar className="w-3 h-3 text-[#F5E729]" />
                        <ShinyText text="RECOMMENDED" speed={3} className="text-white" />
                      </span>
                    </div>
                  )}

                  {/* Plan header with icon */}
                  <div className="mb-3">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2.5 ${plan.highlighted ? "bg-[#5C1B13] text-white" : "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]"} transition-transform duration-300 group-hover:scale-105`}>
                      <PlanIcon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#3A241C]/60 mt-0.5 font-medium">{plan.quantity}</p>
                  </div>

                  {/* Price block */}
                  <div className="mb-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#5C1B13] tracking-tight leading-none">
                        ₹{displayPrice}
                      </span>
                      <span className="text-xs text-[#3A241C]/50 font-medium">
                        /{isMonthly ? "month" : "day"}
                      </span>
                    </div>
                    {displayOriginalPrice && (
                      <span className="text-xs text-[#3A241C]/40 line-through ml-0.5">
                        ₹{displayOriginalPrice}
                      </span>
                    )}
                  </div>

                  {isMonthly && monthlySavings && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <FiCheck className="w-2.5 h-2.5" />
                        Save ₹{monthlySavings}/month
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[#3A241C]/65 mb-3">{plan.description}</p>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#E8DFD4] to-transparent mb-3.5" />

                  {/* Features with icons */}
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {plan.features.map((feature) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <li key={feature.text} className="flex items-center gap-2.5">
                          <span className={`flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0 ${plan.highlighted ? "bg-[#5C1B13]/10 text-[#5C1B13]" : "bg-[#FAF3EA] text-[#5C1B13]/70"}`}>
                            <FeatureIcon className="w-3 h-3" strokeWidth={2.5} />
                          </span>
                          <span className="text-xs text-[#1A1008] font-medium">{feature.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA with React Bits Magnet */}
                  <Magnet magnetStrength={0.16} className="w-full">
                    <Button
                      variant={plan.highlighted ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      onClick={handleTrialClick}
                      className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl ${plan.highlighted ? "shadow-md shadow-[#5C1B13]/20" : ""}`}
                    >
                      Start 7-Day Trial
                    </Button>
                  </Magnet>
                </div>
              </TiltCard>
            </div>
          );
        })}
      </div>

      {/* Included with every plan strip — premium card design */}
      <div className="mt-14 p-6 sm:p-7 rounded-3xl bg-white border border-[#E8DFD4] max-w-5xl mx-auto shadow-xs">
        <p className="text-xs uppercase font-bold text-center text-[#5C1B13] tracking-wider mb-5">
          Every PuretyFarm Subscription Always Includes:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {INCLUDED_PERKS.map((perk) => {
            const PerkIcon = perk.icon;
            return (
              <div
                key={perk.label}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF3EA] to-white border border-[#E8DFD4]/60 hover:shadow-sm hover:border-[#5C1B13]/20 transition-all duration-200 group/perk"
              >
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] mb-2 group-hover/perk:bg-[#5C1B13] group-hover/perk:text-white transition-colors duration-200">
                  <PerkIcon className="w-4 h-4" strokeWidth={2} />
                </div>
                <p className="text-xs font-semibold text-[#1A1008]">{perk.label}</p>
              </div>
            );
          })}
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
            className="font-bold text-[#5C1B13] underline hover:text-[#4A1510] ml-1 inline-flex items-center gap-1"
          >
            <span>Chat with our Raipur Institutional Team</span>
            <FiArrowRight className="w-3.5 h-3.5" />
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
