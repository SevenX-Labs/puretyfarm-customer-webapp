"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { PLANS, PlanDefinition } from "@/features/plans";
import { plansApi, PlanOverviewItem } from "@/features/plans/api/plansApi";
import { SubscriptionPanel } from "@/features/subscription/components/SubscriptionPanel";
import {
  PricingResult,
  SubscriptionDraft,
  SubscriptionCustomizationPayload,
} from "@/features/subscription/types";
import { calculateSubscriptionPricing } from "@/features/subscription/pricing";
import { FiCheck, FiArrowLeft, FiMapPin, FiSliders, FiAlertCircle } from "react-icons/fi";

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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [planOverviews, setPlanOverviews] = useState<PlanOverviewItem[]>([]);

  // Load backend plan availability & eligibility
  useEffect(() => {
    async function fetchPlanEligibility() {
      try {
        const data = await plansApi.getPlansOverview();
        if (data && data.plans) {
          setPlanOverviews(data.plans);
        }
      } catch (err) {
        console.warn("Could not load plans overview:", err);
      }
    }
    fetchPlanEligibility();
  }, []);

  // Custom schedule pricing result if user customized
  const [customPricing, setCustomPricing] = useState<PricingResult | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("pf_subscription_draft");
      if (stored) {
        const parsed = JSON.parse(stored);
        return calculateSubscriptionPricing(parsed);
      }
    } catch {}
    return null;
  });

  const handleConfirmSchedule = (
    result: PricingResult,
    draft: SubscriptionDraft,
    _payload: SubscriptionCustomizationPayload
  ) => {
    setCustomPricing(result);
    try {
      localStorage.setItem("pf_subscription_draft", JSON.stringify(draft));
    } catch {}
    onSelectPlanId("monthly");
  };

  const handleSelectAndComplete = (plan: PlanDefinition) => {
    onSelectPlanId(plan.id);
    onCompletePlanSelection(plan);
  };

  const getPlanEligibility = (planId: "trial" | "monthly" | "single") => {
    const typeKey =
      planId === "trial"
        ? "SEVEN_DAY_TRIAL"
        : planId === "single"
        ? "BUY_ONCE"
        : "MONTHLY";

    return planOverviews.find((p) => p.type === typeKey);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Top Delivery Address Badge */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFD4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {savedAddress && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center shrink-0">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1008]">
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
              className="min-h-[44px] px-2 text-xs font-bold text-[#5C1B13] hover:underline cursor-pointer shrink-0 flex items-center"
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
          const isMonthly = plan.id === "monthly";
          const displayPrice = isMonthly && customPricing ? customPricing.totalPrice : plan.price;
          const displayQuantity =
            isMonthly && customPricing
              ? `${customPricing.totalLitres}L / mo (${customPricing.breakdownText})`
              : plan.quantity;

          const eligibility = getPlanEligibility(plan.id);
          const isBlocked = eligibility?.available === false;

          return (
            <div
              key={plan.id}
              onClick={() => !isBlocked && onSelectPlanId(plan.id)}
              className={`
                relative rounded-3xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between
                bg-gradient-to-b ${plan.gradient}
                ${
                  isBlocked
                    ? "opacity-60 grayscale-[30%] cursor-not-allowed border-[#E8DFD4]"
                    : isSelected
                    ? "border-[#5C1B13] ring-4 ring-[#5C1B13]/10 shadow-xl shadow-[#5C1B13]/15 -translate-y-1 cursor-pointer"
                    : "border-[#E8DFD4] hover:border-[#5C1B13]/40 shadow-xs cursor-pointer"
                }
              `}
            >
              {/* Top badge */}
              {plan.badge && !isBlocked && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full bg-[#5C1B13] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              {isBlocked && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full bg-stone-700 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    {eligibility?.blockedReason === "BUY_ONCE_ALREADY_USED"
                      ? "Buy Once Used"
                      : eligibility?.blockedReason === "TRIAL_ALREADY_USED"
                      ? "Trial Already Used"
                      : "Plan Unavailable"}
                  </span>
                </div>
              )}

              <div>
                {/* Plan header */}
                <div className="flex items-center justify-between mb-4 mt-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  {isMonthly && customPricing ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <FiCheck className="w-3 h-3" /> Customized
                    </span>
                  ) : eligibility?.remainingUses !== undefined ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                      {eligibility.remainingUses} Uses Left
                    </span>
                  ) : plan.savingsText ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {plan.savingsText}
                    </span>
                  ) : null}
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
                      ₹{displayPrice}
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
                      {displayQuantity}
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

              {/* Actions container */}
              <div className="space-y-2.5">
                {/* Customize Schedule Button for Monthly Plan */}
                {isMonthly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPanelOpen(true);
                    }}
                    aria-label="Customize delivery frequency and quantity schedule"
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl border border-[#5C1B13]/30 bg-white hover:bg-[#FAF3EA] text-[#5C1B13] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FiSliders className="w-3.5 h-3.5 shrink-0" />
                    <span>{customPricing ? "Edit Custom Schedule" : "Customize Frequency & Quantity"}</span>
                  </button>
                )}

                {/* Main Action button */}
                <Button
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  size="md"
                  fullWidth
                  disabled={planSubmitting || isBlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isBlocked) handleSelectAndComplete(plan);
                  }}
                  className="rounded-2xl min-h-[44px] py-3 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {planSubmitting && selectedPlanId === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Activating Delivery...</span>
                    </div>
                  ) : isBlocked ? (
                    <span>Unavailable</span>
                  ) : (
                    <span>{plan.ctaText}</span>
                  )}
                </Button>
              </div>
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
          className="rounded-xl min-h-[44px] px-4 py-2 text-xs font-semibold cursor-pointer"
        >
          <FiArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Location</span>
        </Button>
      </div>

      {/* Subscription Panel Dialog */}
      <SubscriptionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onConfirmPlan={handleConfirmSchedule}
      />
    </m.div>
  );
}
