"use client";

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { ShinyText, Magnet } from "@/components/reactbits";
import { handleTrialClick, getWhatsAppUrl } from "@/lib/cta";
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
  FiArrowRight,
  FiPackage,
} from "react-icons/fi";

const PLANS = [
  {
    id: "trial",
    name: "7-Day Trial Plan",
    badge: "ONE-TIME OFFER",
    quantity: "7 consecutive mornings of fresh farm milk delivery",
    price: 525,
    originalPrice: 595,
    savingsText: "Save ₹70",
    rateText: "₹75 / litre",
    periodLabel: "one-time offer",
    description: "7 consecutive mornings of farm-fresh pure A2 Gir cow milk delivered right to your doorstep.",
    icon: FiCalendar,
    gradient: "from-[#FAF6F0] via-white to-[#FFFDF7]",
    borderColor: "border-[#E8DFD4]",
    features: [
      { text: "7 consecutive morning deliveries", icon: FiTruck },
      { text: "Delivered fresh before 10 AM", icon: FiClock },
      { text: "Sealed reusable glass bottles", icon: FiShield },
      { text: "Daily morning WhatsApp updates", icon: FiMessageCircle },
      { text: "Zero commitment • Cancel anytime", icon: FiX },
    ],
    highlighted: false,
    ctaText: "Start 7-Day Trial",
  },
  {
    id: "monthly",
    name: "Monthly Subscription",
    badge: "MOST POPULAR",
    quantity: "1L Daily (30L / mo)",
    price: 2250,
    originalPrice: null,
    savingsText: null,
    rateText: "₹75 / delivery",
    periodLabel: "/ month",
    description: "Our flagship family plan with automatic morning delivery, zero hassle, and total flexibility.",
    icon: FiAward,
    gradient: "from-[#FAF3EA] via-white to-[#FFFDF7]",
    borderColor: "border-[#5C1B13]",
    features: [
      { text: "1L delivered fresh daily before 10 AM", icon: FiTruck },
      { text: "Flexible pause / vacation mode", icon: FiCalendar },
      { text: "Sealed reusable glass bottles", icon: FiShield },
      { text: "WhatsApp updates & instant pause/skip", icon: FiMessageCircle },
      { text: "Priority morning delivery slot", icon: FiClock },
    ],
    highlighted: true,
    ctaText: "Subscribe Monthly",
  },
  {
    id: "single",
    name: "Buy Once (1 Litre)",
    badge: "SAMPLE BOTTLE",
    quantity: "Order single bottles (0 of 7 used)",
    price: 85,
    originalPrice: null,
    savingsText: null,
    rateText: "₹85 / bottle",
    periodLabel: "one-time order",
    description: "Taste test our rich farm milk with a single bottle before starting a daily subscription.",
    icon: FiPackage,
    gradient: "from-slate-50 via-white to-[#FFFDF7]",
    borderColor: "border-[#E8DFD4]",
    features: [
      { text: "1 Litre pure farm A2 Gir cow milk", icon: FiCheck },
      { text: "Morning doorstep delivery before 10 AM", icon: FiClock },
      { text: "Sealed sanitized glass bottle", icon: FiShield },
      { text: "Instant WhatsApp confirmation", icon: FiMessageCircle },
      { text: "Single order • Zero commitment", icon: FiX },
    ],
    highlighted: false,
    ctaText: "Order Single Bottle",
  },
] as const;

const INCLUDED_PERKS = [
  { icon: FiTruck, label: "Free 10 AM Delivery" },
  { icon: FiShield, label: "Zero Plastic Glass" },
  { icon: FiMessageCircle, label: "WhatsApp Pause/Skip" },
  { icon: FiCheck, label: "Money-Back Promise" },
];

export function Pricing() {
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
        Choose Your Milk Plan
      </h2>

      <p ref={subtitleRef} className="mt-4 text-base sm:text-lg text-[#3A241C]/80 text-center max-w-xl mx-auto leading-relaxed">
        All plans include free home delivery before 10 AM, sealed glass bottles,
        and 100% pure A2 Gir cow milk.
      </p>

      {/* Plan cards - 3 distinct options */}
      <div ref={plansRef} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-5 lg:gap-6 max-w-5xl mx-auto items-stretch">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.name}
              data-plan-card
              className={`h-full ${plan.highlighted ? "mt-4 md:-mt-2 md:mb-2" : ""}`}
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
                    ${plan.highlighted
                      ? "border-2 border-[#5C1B13] shadow-xl shadow-[#5C1B13]/12 ring-1 ring-[#5C1B13]/10"
                      : "border border-[#E8DFD4] shadow-xs hover:shadow-lg hover:border-[#5C1B13]/30"
                    }
                  `}
                >
                  {/* Card top badge */}
                  {plan.highlighted ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                      <span className="inline-flex items-center gap-1.5 bg-[#5C1B13] text-white text-[11px] font-bold px-3.5 py-1 rounded-full whitespace-nowrap shadow-md shadow-[#5C1B13]/25 border border-[#5C1B13]">
                        <FiStar className="w-3 h-3 text-[#F5E729]" />
                        <ShinyText text="MOST POPULAR" speed={3} className="text-white" />
                      </span>
                    </div>
                  ) : plan.id === "trial" ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                      <span className="inline-flex items-center gap-1 bg-[#F5E729] text-[#1A1008] text-[10.5px] font-black tracking-wider px-3 py-0.5 rounded-full whitespace-nowrap shadow-xs border border-[#E5D720]">
                        ⚡ ONE-TIME OFFER
                      </span>
                    </div>
                  ) : (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                      <span className="inline-flex items-center gap-1 bg-[#FAF3EA] text-[#5C1B13] text-[10.5px] font-bold tracking-wider uppercase px-3 py-0.5 rounded-full whitespace-nowrap border border-[#E8DFD4] shadow-2xs">
                        BUY ONCE
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
                    <p className="text-xs text-[#3A241C]/75 mt-0.5 font-medium leading-snug">
                      {plan.quantity}
                    </p>
                  </div>

                  {/* Price block */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-[#5C1B13] tracking-tight leading-none">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-[#3A241C]/60 font-semibold">
                        {plan.periodLabel}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-sm text-[#3A241C]/40 line-through font-medium ml-1">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Rate & Savings badges */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center text-[11px] font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#E8DFD4] px-2.5 py-0.5 rounded-full">
                        {plan.rateText}
                      </span>
                      {plan.savingsText && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <FiCheck className="w-3 h-3 text-emerald-600" />
                          {plan.savingsText}
                        </span>
                      )}
                    </div>
                  </div>

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
                      className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl cursor-pointer ${plan.highlighted ? "shadow-md shadow-[#5C1B13]/20" : ""}`}
                    >
                      {plan.ctaText}
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
            href={getWhatsAppUrl("Hi PuretyFarm, I am interested in a society bulk milk subscription.")}
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
