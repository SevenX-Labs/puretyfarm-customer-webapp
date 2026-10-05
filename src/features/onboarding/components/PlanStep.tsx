"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { PLANS, PlanDefinition } from "@/features/plans";
import {
  FiMapPin,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";

export interface PlanStepProps {
  savedAddress: Address | null;
  selectedPlanId: "trial" | "monthly" | "single";
  planSubmitting: boolean;
  planError: string | null;
  onSelectPlanId: (id: "trial" | "monthly" | "single") => void;
  onCompletePlanSelection: (plan: PlanDefinition) => void;
  onGoToStep: (step: 1 | 2 | 3) => void;
}

export function PlanStep({
  savedAddress,
  selectedPlanId,
  planSubmitting,
  planError,
  onSelectPlanId,
  onCompletePlanSelection,
  onGoToStep,
}: PlanStepProps) {
  return (
    <m.div
      key="step3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header info card */}
      <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#5C1B13]/8 text-[#5C1B13] text-[11px] font-bold tracking-wide mb-2 uppercase">
            Step 3 of 3 · Final Step
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
            Select Your Fresh Milk Plan
          </h1>
          <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
            Bottled fresh after 4:00 AM and delivered chilled in reusable glass bottles to your doorstep.
          </p>
        </div>

        {/* Verified delivery address pill */}
        {savedAddress && (
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] text-xs flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FiMapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#1A1008]">
                  Delivering to: {savedAddress.street}
                </p>
                <p className="text-[11px] text-[#3A241C]/65">
                  {savedAddress.locality}, Raipur ({savedAddress.pincode})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs font-bold text-[#5C1B13] hover:underline cursor-pointer shrink-0"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {planError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
        >
          <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{planError}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlanId(plan.id)}
              className={`
                relative rounded-3xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer
                bg-gradient-to-b ${plan.gradient}
                ${
                  isSelected
                    ? "border-[#5C1B13] ring-4 ring-[#5C1B13]/10 shadow-xl shadow-[#5C1B13]/15 -translate-y-1"
                    : "border-[#E8DFD4] hover:border-[#5C1B13]/40 shadow-xs"
                }
              `}
            >
              {/* Top badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full bg-[#5C1B13] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan header */}
                <div className="flex items-center justify-between mb-4 mt-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  {plan.savingsText && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {plan.savingsText}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-[#1A1008] mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-[#3A241C]/70 mb-4 min-h-[36px]">
                  {plan.description}
                </p>

                {/* Pricing block */}
                <div className="pb-5 mb-5 border-b border-[#E8DFD4]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#5C1B13]">
                      ₹{plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-sm text-[#3A241C]/45 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-[#1A1008]">
                      {plan.rateText}
                    </span>
                    <span className="text-xs text-[#3A241C]/50">•</span>
                    <span className="text-xs text-[#3A241C]/65">
                      {plan.periodLabel}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 mb-6 text-xs text-[#3A241C]/80">
                  {plan.features.map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <li key={idx} className="flex items-center gap-2">
                        <FeatIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action button */}
              <Button
                type="button"
                variant={isSelected ? "primary" : "secondary"}
                size="md"
                fullWidth
                disabled={planSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompletePlanSelection(plan);
                }}
                className="rounded-2xl py-3 text-xs font-bold shadow-md cursor-pointer"
              >
                {planSubmitting && selectedPlanId === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Activating Delivery...</span>
                  </div>
                ) : (
                  <span>{plan.ctaText}</span>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Back button */}
      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onGoToStep(2)}
          className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
        >
          <FiArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Location</span>
        </Button>
      </div>
    </m.div>
  );
}
