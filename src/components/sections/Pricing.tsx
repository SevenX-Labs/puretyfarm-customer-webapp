"use client";

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { handleTrialClick } from "@/lib/cta";

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
  return (
    <Section background="cream" id="pricing">
      {/* Badge */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-2 bg-[#F5E729] text-[#1A1008] text-sm font-bold px-4 py-2 rounded-full">
          💰 Simple, Transparent Pricing
        </span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
        Choose Your Daily Milk Plan
      </h2>

      <p className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
        All plans include free home delivery before 7 AM, sealed glass bottles,
        and 100% pure A2 Gir cow milk.
      </p>

      {/* Plan cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`
              relative flex flex-col bg-white rounded-2xl p-6
              transition-shadow duration-200
              ${
                plan.highlighted
                  ? "border-2 border-[#5C1B13] shadow-xl shadow-[#5C1B13]/10 ring-1 ring-[#5C1B13]/10"
                  : "border border-[#E8DFD4] shadow-sm hover:shadow-md"
              }
            `}
          >
            {/* Most popular badge */}
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F5E729] text-[#1A1008] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                  ⭐ MOST POPULAR
                </span>
              </div>
            )}

            {/* Plan name */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                {plan.name}
              </h3>
              <p className="text-sm text-[#3A241C]/70 mt-1">{plan.quantity}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-[#5C1B13]">
                ₹{plan.price}
              </span>
              <span className="text-sm text-[#3A241C]/60">/day</span>
              {plan.originalPrice && (
                <span className="text-sm text-[#3A241C]/40 line-through ml-1">
                  ₹{plan.originalPrice}
                </span>
              )}
            </div>

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
        ))}
      </div>

      {/* Trust line */}
      <p className="mt-10 text-center text-sm text-[#3A241C]/60">
        No commitment • Cancel anytime • 100% money-back guarantee
      </p>
    </Section>
  );
}
