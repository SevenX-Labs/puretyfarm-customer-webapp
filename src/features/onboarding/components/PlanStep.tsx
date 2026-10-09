"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { PLANS, PlanDefinition } from "@/features/plans";
import {
  plansApi,
  PlanOverviewItem,
  MonthlyConfigResponse,
  PlanQuote,
  BuyOnceEligibilityResponse,
  TrialEligibilityResponse,
} from "@/features/plans/api/plansApi";
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
  onGoToStep: (step: 1 | 2 | 3 | 4) => void;
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
  const [monthlyConfig, setMonthlyConfig] = useState<MonthlyConfigResponse | null>(null);
  const [buyOnceElig, setBuyOnceElig] = useState<BuyOnceEligibilityResponse | null>(null);
  const [trialElig, setTrialElig] = useState<TrialEligibilityResponse | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<{
    trial?: PlanQuote | null;
    single?: PlanQuote | null;
    monthly?: PlanQuote | null;
  }>({});

  // Load backend plan availability, eligibility & live pricing quotes
  useEffect(() => {
    let isMounted = true;
    async function fetchLivePlanData() {
      try {
        const [overviewRes, monthlyRes, buyOnceRes, trialRes] = await Promise.allSettled([
          plansApi.getPlansOverview(),
          plansApi.getMonthlyConfig(),
          plansApi.getBuyOnceEligibility(),
          plansApi.getTrialEligibility(),
        ]);

        if (!isMounted) return;

        let overviews: PlanOverviewItem[] = [];
        if (overviewRes.status === "fulfilled" && overviewRes.value?.plans) {
          overviews = overviewRes.value.plans;
          setPlanOverviews(overviews);
        }
        if (monthlyRes.status === "fulfilled" && monthlyRes.value) {
          setMonthlyConfig(monthlyRes.value);
        }
        if (buyOnceRes.status === "fulfilled" && buyOnceRes.value) {
          setBuyOnceElig(buyOnceRes.value);
        }
        if (trialRes.status === "fulfilled" && trialRes.value) {
          setTrialElig(trialRes.value);
        }

        const trialAvailable = overviews.find((p) => p.type === "SEVEN_DAY_TRIAL")?.available ?? true;
        const buyOnceAvailable = overviews.find((p) => p.type === "BUY_ONCE")?.available ?? true;

        const [trialQ, singleQ, monthlyQ] = await Promise.allSettled([
          trialAvailable ? plansApi.createTrialQuote(1) : Promise.resolve(null),
          buyOnceAvailable ? plansApi.createBuyOnceQuote(1) : Promise.resolve(null),
          plansApi.createMonthlyQuote({ frequency: "DAILY", quantityMode: "FIXED", quantity: 1 }),
        ]);

        if (!isMounted) return;

        setLiveQuotes({
          trial: trialQ.status === "fulfilled" ? trialQ.value : null,
          single: singleQ.status === "fulfilled" ? singleQ.value : null,
          monthly: monthlyQ.status === "fulfilled" ? monthlyQ.value : null,
        });
      } catch (err) {
        console.warn("Could not load plans overview:", err);
      }
    }
    fetchLivePlanData();
    return () => {
      isMounted = false;
    };
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

    const found = planOverviews.find((p) => p.type === typeKey);
    if (found) return found;

    if (planId === "single" && buyOnceElig) {
      return {
        type: "BUY_ONCE" as const,
        available: buyOnceElig.eligible,
        remainingUses: buyOnceElig.remainingUses,
        usageCount: buyOnceElig.usageCount,
        blockedReason: buyOnceElig.blockedReason,
      };
    }
    if (planId === "trial" && trialElig) {
      return {
        type: "SEVEN_DAY_TRIAL" as const,
        available: trialElig.eligible,
        used: trialElig.used,
        blockedReason: trialElig.blockedReason,
      };
    }
    return undefined;
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col justify-between h-full space-y-2.5 sm:space-y-3"
    >
      {/* Header with Back Navigation */}
      <header className="flex items-start justify-between gap-2 shrink-0">
        <div>
          <h1 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#24130f]">
            Select Your Milk Plan
          </h1>
          <p className="text-[11px] sm:text-xs text-[#715e50]">
            Choose the plan that works best for your home.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onGoToStep(3)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#7a2417] hover:bg-[#7a2417]/10 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Address</span>
        </button>
      </header>

      {/* Top Delivery Address Badge */}
      {savedAddress && (
        <div className="rounded-lg bg-white border border-[#E8DFD4] px-2.5 py-1.5 shadow-2xs flex items-center justify-between gap-2 text-[11px] sm:text-xs text-[#3A241C] shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <FiMapPin className="h-3.5 w-3.5 text-[#5C1B13] shrink-0" />
            <span className="truncate">
              Delivering to: <strong>{savedAddress.street}</strong>, {savedAddress.locality} ({savedAddress.pincode})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="font-bold text-[#5C1B13] hover:underline cursor-pointer shrink-0 text-[10.5px] sm:text-[11px]"
          >
            Change
          </button>
        </div>
      )}

      {planError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 shrink-0"
        >
          <FiAlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
          <span>{planError}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-3 flex-1">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlanId === plan.id;
          const isMonthly = plan.id === "monthly";

          const liveQuote =
            plan.id === "trial"
              ? liveQuotes.trial
              : plan.id === "single"
              ? liveQuotes.single
              : liveQuotes.monthly;

          const serverPrice = liveQuote ? Math.round(liveQuote.totalSellingAmount / 100) : plan.price;
          const displayPrice = isMonthly && customPricing ? customPricing.totalPrice : serverPrice;

          const serverRateText =
            plan.id === "monthly" && monthlyConfig
              ? `₹${Math.round(monthlyConfig.sellingPricePerLitre / 100)} / L`
              : liveQuote
              ? `₹${Math.round(liveQuote.sellingPricePerLitre / 100)} / ${plan.id === "single" ? "bottle" : "L"}`
              : plan.rateText;

          const monthlyDeliveries = liveQuotes.monthly?.deliveryOccurrences || 30;
          const defaultMonthlyQty = `${monthlyDeliveries}L / mo`;

          const displayQuantity =
            isMonthly && customPricing
              ? `${customPricing.totalLitres}L / mo`
              : isMonthly
              ? defaultMonthlyQty
              : plan.quantity;

          const eligibility = getPlanEligibility(plan.id);
          const isBlocked = eligibility?.available === false;

          return (
            <div
              key={plan.id}
              onClick={() => !isBlocked && onSelectPlanId(plan.id)}
              className={`
                relative rounded-xl border-2 transition-all p-2.5 sm:p-3 lg:p-3.5 flex flex-col justify-between
                bg-gradient-to-b ${plan.gradient}
                ${
                  isBlocked
                    ? "opacity-60 grayscale-[30%] cursor-not-allowed border-[#E8DFD4]"
                    : isSelected
                    ? "border-[#5C1B13] ring-2 ring-[#5C1B13]/15 shadow-md shadow-[#5C1B13]/10 cursor-pointer"
                    : "border-[#E8DFD4] hover:border-[#5C1B13]/40 shadow-2xs cursor-pointer"
                }
              `}
            >
              {/* Top badge */}
              {plan.badge && !isBlocked && (
                <div className="absolute -top-2.5 left-4">
                  <span className="px-2 py-0.5 rounded-full bg-[#5C1B13] text-white text-[9px] font-bold tracking-wider uppercase shadow-xs">
                    {plan.badge}
                  </span>
                </div>
              )}

              {isBlocked && (
                <div className="absolute -top-2.5 left-4">
                  <span className="px-2 py-0.5 rounded-full bg-stone-700 text-white text-[9px] font-bold tracking-wider uppercase shadow-xs">
                    {eligibility?.blockedReason === "BUY_ONCE_ALREADY_USED"
                      ? "Used"
                      : eligibility?.blockedReason === "TRIAL_ALREADY_USED"
                      ? "Trial Used"
                      : "Unavailable"}
                  </span>
                </div>
              )}

              <div>
                {/* Plan header */}
                <div className="flex items-center justify-between mb-1.5 mt-0.5">
                  <div className="w-6 h-6 rounded-lg bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {isMonthly && customPricing ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <FiCheck className="w-2.5 h-2.5" /> Customized
                    </span>
                  ) : eligibility?.remainingUses !== undefined ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {eligibility.remainingUses} Left
                    </span>
                  ) : plan.savingsText ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {plan.savingsText}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-sm sm:text-[15px] font-serif font-bold text-[#1A1008] leading-tight mb-0.5">
                  {plan.name}
                </h3>
                <p className="text-[10px] sm:text-[10.5px] text-[#3A241C]/70 leading-snug line-clamp-2 min-h-[26px]">
                  {plan.description}
                </p>

                {/* Pricing block */}
                <div className="py-1.5 my-1.5 border-y border-[#E8DFD4]/70">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#5C1B13]">
                      ₹{displayPrice}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-[11px] text-[#3A241C]/45 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10.5px] font-semibold text-[#1A1008]">
                      {serverRateText}
                    </span>
                    <span className="text-[10.5px] text-[#3A241C]/50">•</span>
                    <span className="text-[10.5px] text-[#3A241C]/65">
                      {displayQuantity}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-1 mb-2 text-[10px] sm:text-[10.5px] text-[#3A241C]/80">
                  {plan.features.slice(0, 4).map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <li key={idx} className="flex items-center gap-1.5 truncate">
                        <FeatIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Actions container */}
              <div className="space-y-1.5 mt-1">
                {/* Customize Schedule Button for Monthly Plan */}
                {isMonthly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPanelOpen(true);
                    }}
                    aria-label="Customize delivery frequency and quantity schedule"
                    className="w-full h-7 sm:h-7.5 px-2 rounded-lg border border-[#5C1B13]/30 bg-white hover:bg-[#FAF3EA] text-[#5C1B13] text-[10.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FiSliders className="w-3 h-3 shrink-0" />
                    <span>{customPricing ? "Edit Schedule" : "Customize Schedule"}</span>
                  </button>
                )}

                {/* Main Action button */}
                <Button
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  size="sm"
                  fullWidth
                  disabled={planSubmitting || isBlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isBlocked) handleSelectAndComplete(plan);
                  }}
                  className="rounded-lg h-8 sm:h-8.5 lg:h-9 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {planSubmitting && selectedPlanId === plan.id ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Activating...</span>
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

      {/* Subscription Panel Dialog */}
      <SubscriptionPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onConfirmPlan={handleConfirmSchedule}
      />
    </m.div>
  );
}
