"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { PLANS, PlanDefinition } from "@/features/plans";
import {
  plansApi,
  PlanOverviewItem,
  OrderCutoffPolicy,
  MonthlyConfigResponse,
  PlanQuote,
  BuyOnceEligibilityResponse,
  TrialEligibilityResponse,
} from "@/features/plans/api/plansApi";
import dynamic from "next/dynamic";
import {
  PricingResult,
  SubscriptionDraft,
  SubscriptionCustomizationPayload,
} from "@/features/subscription/types";
import { buildBreakdown } from "@/features/subscription/pricing";
import { FiCheck, FiArrowLeft, FiMapPin, FiSliders, FiAlertCircle } from "react-icons/fi";

const SubscriptionPanel = dynamic(
  () =>
    import("@/features/subscription/components/SubscriptionPanel").then(
      (mod) => mod.SubscriptionPanel
    ),
  { ssr: false }
);

export interface PlanStepProps {
  savedAddress: Address | null;
  selectedPlanId: "trial" | "monthly" | "single";
  planSubmitting: boolean;
  planError: string | null;
  onSelectPlanId: (id: "trial" | "monthly" | "single") => void;
  onCompletePlanSelection: (plan: PlanDefinition, existingQuote?: PlanQuote | null) => void;
  onGoToStep: (step: 1 | 2 | 3 | 4) => void;
}

function PlanCardSkeleton() {
  return (
    <div className="relative rounded-xl border-2 border-[#E8DFD4] bg-[#FAF5EE]/80 p-2.5 sm:p-3 lg:p-3.5 flex flex-col justify-between animate-pulse">
      <div>
        {/* Skeleton Top Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-6 h-6 rounded-lg bg-[#E2D5C7]" />
          <div className="w-14 h-4 rounded-full bg-[#E2D5C7]" />
        </div>

        {/* Skeleton Title & Description */}
        <div className="w-28 h-4 rounded bg-[#E2D5C7] mb-1.5" />
        <div className="w-full h-3 rounded bg-[#E2D5C7]/70 mb-1" />
        <div className="w-4/5 h-3 rounded bg-[#E2D5C7]/60 mb-2.5" />

        {/* Skeleton Pricing Block */}
        <div className="py-2 my-1.5 border-y border-[#E2D5C7]/50 space-y-1">
          <div className="w-20 h-6 rounded bg-[#E2D5C7]" />
          <div className="w-28 h-3 rounded bg-[#E2D5C7]/70" />
        </div>

        {/* Skeleton Features */}
        <div className="space-y-1.5 mb-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E2D5C7] shrink-0" />
            <div className="w-full h-2.5 rounded bg-[#E2D5C7]/70" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E2D5C7] shrink-0" />
            <div className="w-5/6 h-2.5 rounded bg-[#E2D5C7]/70" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E2D5C7] shrink-0" />
            <div className="w-4/5 h-2.5 rounded bg-[#E2D5C7]/70" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E2D5C7] shrink-0" />
            <div className="w-3/4 h-2.5 rounded bg-[#E2D5C7]/70" />
          </div>
        </div>
      </div>

      {/* Skeleton Action Button */}
      <div className="w-full h-8 sm:h-8.5 rounded-lg bg-[#E2D5C7] mt-2" />
    </div>
  );
}

function PlanStepComponent({
  savedAddress,
  selectedPlanId,
  planSubmitting,
  planError,
  onSelectPlanId,
  onCompletePlanSelection,
  onGoToStep,
}: PlanStepProps) {
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [planOverviews, setPlanOverviews] = useState<PlanOverviewItem[]>([]);
  const [orderCutoff, setOrderCutoff] = useState<OrderCutoffPolicy | null>(null);
  const [monthlyConfig, setMonthlyConfig] = useState<MonthlyConfigResponse | null>(null);
  const [buyOnceElig, setBuyOnceElig] = useState<BuyOnceEligibilityResponse | null>(null);
  const [trialElig, setTrialElig] = useState<TrialEligibilityResponse | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<{
    trial?: PlanQuote | null;
    single?: PlanQuote | null;
    monthly?: PlanQuote | null;
  }>({});

  // Custom schedule pricing result if user customized.
  // `customPricing` holds the server-authoritative pricing result from the
  // SubscriptionPanel (which already incorporates the server quote values).
  const [customPricing, setCustomPricing] = useState<PricingResult | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored =
        localStorage.getItem("pf_subscription_draft_v2") ||
        localStorage.getItem("pf_subscription_draft");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastQuotedPrice && parsed.lastDeliveries) {
          const isDailyPattern = parsed.frequency !== "alternate" && parsed.mode === "pattern";
          const bd = buildBreakdown(
            isDailyPattern ? "pattern" : "fixed",
            parsed.lastDeliveries,
            parsed.fixedLitres || 1,
            isDailyPattern ? (parsed.day1Litres || 1) : (parsed.fixedLitres || 1),
            isDailyPattern ? (parsed.day2Litres || 2) : (parsed.fixedLitres || 1),
          );
          return {
            frequency: parsed.frequency || "daily",
            mode: isDailyPattern ? "pattern" : "fixed",
            fixedLitres: parsed.fixedLitres || 1,
            day1Litres: parsed.day1Litres || 1,
            day2Litres: parsed.day2Litres || 2,
            totalDeliveries: parsed.lastDeliveries,
            totalLitres: parsed.lastQuotedLitres || bd.totalLitres,
            pricePerLitre: 75,
            totalPrice: parsed.lastQuotedPrice,
            breakdownText: bd.breakdownText,
            oddDeliveriesCount: bd.oddDeliveriesCount,
            evenDeliveriesCount: bd.evenDeliveriesCount,
            isValid: true,
          };
        }
      }
    } catch {}
    return null;
  });

  // Load backend plan availability, eligibility & live pricing quotes.
  // For the monthly card, use the saved draft parameters so the displayed
  // price matches the user's customized schedule.
  useEffect(() => {
    let isMounted = true;
    async function fetchLivePlanData() {
      setLoadingPlans(true);
      try {
        let draft: { frequency?: string; mode?: string; fixedLitres?: number; day1Litres?: number; day2Litres?: number } | null = null;
        try {
          const raw = typeof window !== "undefined"
            ? localStorage.getItem("pf_subscription_draft_v2") || localStorage.getItem("pf_subscription_draft")
            : null;
          if (raw) draft = JSON.parse(raw);
        } catch {}

        const monthlyFreq = draft?.frequency === "alternate" ? "ALTERNATE_DAYS" as const : "DAILY" as const;
        const monthlyMode = (monthlyFreq === "DAILY" && draft?.mode === "pattern") ? "ALTERNATING" as const : "FIXED" as const;
        const monthlyQuotePayload = {
          frequency: monthlyFreq,
          quantityMode: monthlyMode,
          quantity: monthlyMode === "FIXED" ? (draft?.fixedLitres || 1) : undefined,
          quantityA: monthlyMode === "ALTERNATING" ? (draft?.day1Litres || 1) : undefined,
          quantityB: monthlyMode === "ALTERNATING" ? (draft?.day2Litres || 2) : undefined,
        };

        // Fetch configs, eligibilities, and quotes in a single parallel burst
        const [
          overviewRes,
          monthlyRes,
          buyOnceRes,
          trialRes,
          trialQ,
          singleQ,
          monthlyQ,
        ] = await Promise.allSettled([
          plansApi.getPlansOverview(),
          plansApi.getMonthlyConfig(),
          plansApi.getBuyOnceEligibility(),
          plansApi.getTrialEligibility(),
          plansApi.createTrialQuote(1),
          plansApi.createBuyOnceQuote(1),
          plansApi.createMonthlyQuote(monthlyQuotePayload),
        ]);

        if (!isMounted) return;

        let overviews: PlanOverviewItem[] = [];
        if (overviewRes.status === "fulfilled" && overviewRes.value?.plans) {
          overviews = overviewRes.value.plans;
          setPlanOverviews(overviews);
          setOrderCutoff(overviewRes.value.orderCutoff ?? null);
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

        const mq = monthlyQ.status === "fulfilled" ? monthlyQ.value : null;
        setLiveQuotes({
          trial: trialQ.status === "fulfilled" ? trialQ.value : null,
          single: singleQ.status === "fulfilled" ? singleQ.value : null,
          monthly: mq,
        });

        if (draft && mq) {
          const bd = buildBreakdown(
            draft.mode === "pattern" ? "pattern" : "fixed",
            mq.deliveryOccurrences,
            draft.fixedLitres || 1,
            draft.mode === "pattern" ? (draft.day1Litres || 1) : (draft.fixedLitres || 1),
            draft.mode === "pattern" ? (draft.day2Litres || 2) : (draft.fixedLitres || 1),
          );
          setCustomPricing({
            frequency: (draft.frequency as "daily" | "alternate") || "daily",
            mode: (draft.mode as "fixed" | "pattern") || "fixed",
            fixedLitres: draft.fixedLitres || 1,
            day1Litres: draft.day1Litres || 1,
            day2Litres: draft.day2Litres || 2,
            totalDeliveries: mq.deliveryOccurrences,
            totalLitres: mq.totalLitres,
            pricePerLitre: Math.round(mq.sellingPricePerLitre / 100),
            totalPrice: Math.round(mq.totalSellingAmount / 100),
            breakdownText: bd.breakdownText,
            oddDeliveriesCount: bd.oddDeliveriesCount,
            evenDeliveriesCount: bd.evenDeliveriesCount,
            isValid: true,
          });
        }
      } catch (err) {
        console.warn("Could not load plans overview:", err);
      } finally {
        if (isMounted) setLoadingPlans(false);
      }
    }
    fetchLivePlanData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmSchedule = async (
    result: PricingResult,
    draft: SubscriptionDraft,
    _payload: SubscriptionCustomizationPayload
  ) => {
    setCustomPricing(result);
    try {
      localStorage.setItem("pf_subscription_draft", JSON.stringify(draft));
      localStorage.setItem("pf_subscription_draft_v2", JSON.stringify({
        ...draft,
        lastQuotedPrice: result.totalPrice,
        lastQuotedLitres: result.totalLitres,
        lastDeliveries: result.totalDeliveries,
      }));
    } catch {}

    try {
      const freq = draft.frequency === "alternate" ? "ALTERNATE_DAYS" as const : "DAILY" as const;
      const qMode = (freq === "DAILY" && draft.mode === "pattern") ? "ALTERNATING" as const : "FIXED" as const;
      const freshQuote = await plansApi.createMonthlyQuote({
        frequency: freq,
        quantityMode: qMode,
        quantity: qMode === "FIXED" ? draft.fixedLitres : undefined,
        quantityA: qMode === "ALTERNATING" ? draft.day1Litres : undefined,
        quantityB: qMode === "ALTERNATING" ? draft.day2Litres : undefined,
      });
      if (freshQuote?.quoteId) {
        setLiveQuotes((prev) => ({ ...prev, monthly: freshQuote }));
      }
    } catch {}

    onSelectPlanId("monthly");
  };

  const handleSelectAndComplete = (plan: PlanDefinition) => {
    onSelectPlanId(plan.id);
    const existingQuote = liveQuotes[plan.id as "trial" | "single" | "monthly"];
    onCompletePlanSelection(plan, existingQuote);
  };

  const getPlanEligibility = (planId: "trial" | "monthly" | "single") => {
    const typeKey =
      planId === "trial"
        ? "SEVEN_DAY_TRIAL"
        : planId === "single"
        ? "BUY_ONCE"
        : "MONTHLY";

    const found = planOverviews.find((p) => p.type === typeKey);

    const hasUsedBuyOnce = Boolean(
      (buyOnceElig?.usageCount !== undefined && buyOnceElig.usageCount > 0) ||
      (buyOnceElig?.remainingUses !== undefined && buyOnceElig.remainingUses <= 0) ||
      trialElig?.blockedReason === "BUY_ONCE_ALREADY_USED" ||
      found?.blockedReason === "BUY_ONCE_ALREADY_USED"
    );

    const hasUsedTrial = Boolean(
      trialElig?.used === true ||
      trialElig?.blockedReason === "TRIAL_ALREADY_USED" ||
      buyOnceElig?.blockedReason === "TRIAL_ALREADY_USED" ||
      found?.blockedReason === "TRIAL_ALREADY_USED"
    );

    if (planId === "trial") {
      if (hasUsedBuyOnce) {
        return {
          type: "SEVEN_DAY_TRIAL" as const,
          available: false,
          used: false,
          blockedReason: "BUY_ONCE_ALREADY_USED",
        };
      }
      if (hasUsedTrial) {
        return {
          type: "SEVEN_DAY_TRIAL" as const,
          available: false,
          used: true,
          blockedReason: "TRIAL_ALREADY_USED",
        };
      }
      if (found) return found;
      if (trialElig) {
        return {
          type: "SEVEN_DAY_TRIAL" as const,
          available: trialElig.eligible,
          used: trialElig.used,
          blockedReason: trialElig.blockedReason,
        };
      }
      return undefined;
    }

    if (planId === "single") {
      if (hasUsedTrial) {
        return {
          type: "BUY_ONCE" as const,
          available: false,
          remainingUses: 0,
          usageCount: 1,
          blockedReason: "TRIAL_ALREADY_USED",
        };
      }
      if (hasUsedBuyOnce) {
        return {
          type: "BUY_ONCE" as const,
          available: false,
          remainingUses: 0,
          usageCount: 1,
          blockedReason: "BUY_ONCE_ALREADY_USED",
        };
      }
      if (found) return found;
      if (buyOnceElig) {
        return {
          type: "BUY_ONCE" as const,
          available: buyOnceElig.eligible,
          remainingUses: buyOnceElig.remainingUses,
          usageCount: buyOnceElig.usageCount,
          blockedReason: buyOnceElig.blockedReason,
        };
      }
      return undefined;
    }

    return found;
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col justify-between w-full md:h-full space-y-2.5 sm:space-y-3 pb-3 sm:pb-0"
    >
      {/* Header with Back Navigation */}
      <header className="flex items-start justify-between gap-3 shrink-0 border-b border-[#eee5db] pb-2.5 sm:pb-3">
        <div>
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#7a2417] block">
            Step 3 of 4 • Choose Your Plan
          </span>
          <h1 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#24130f] mt-0.5">
            Select Your Milk Plan
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-[#715e50]">
            Choose the plan that best fits your household. Flexible pause & cancel anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onGoToStep(2)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#7a2417]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#7a2417] hover:bg-[#7a2417]/8 transition-colors cursor-pointer shadow-2xs"
        >
          <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Address</span>
        </button>
      </header>

      {/* Top Delivery Address Badge */}
      {savedAddress && (
        <div className="rounded-2xl bg-[#FAF7F2] border border-[#E8DFD4] px-3.5 py-2 shadow-2xs flex items-center justify-between gap-3 text-xs text-[#3A241C] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <FiMapPin className="h-4 w-4 text-[#5C1B13] shrink-0" />
            <span className="truncate text-xs sm:text-[12.5px]">
              Delivering to: <strong className="font-semibold text-[#24130F]">{savedAddress.street}</strong>, {savedAddress.locality} ({savedAddress.pincode})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="font-bold text-[#5C1B13] hover:underline cursor-pointer shrink-0 text-xs px-2 py-0.5 rounded-md hover:bg-[#5C1B13]/8 transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {planError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 shrink-0 shadow-2xs"
        >
          <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{planError}</span>
        </div>
      )}

      {/* Plans Grid: Skeleton Loader when loading, Live Cards when loaded */}
      {loadingPlans ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-3.5 lg:grid-cols-3 flex-1">
          <PlanCardSkeleton />
          <PlanCardSkeleton />
          <PlanCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-3.5 lg:grid-cols-3 flex-1">
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

            const displayOriginalPrice = liveQuote && liveQuote.totalActualAmount > liveQuote.totalSellingAmount
              ? Math.round(liveQuote.totalActualAmount / 100)
              : plan.originalPrice;

            const displaySavingsText = liveQuote && liveQuote.discountAmount > 0
              ? `Save ₹${Math.round(liveQuote.discountAmount / 100)}`
              : plan.savingsText;

            const serverRateText =
              plan.id === "monthly" && monthlyConfig
                ? `₹${Math.round(monthlyConfig.sellingPricePerLitre / 100)}/L`
                : liveQuote
                ? `₹${Math.round(liveQuote.sellingPricePerLitre / 100)}/${plan.id === "single" ? "bottle" : "L"}`
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
                  relative rounded-2xl border-2 transition-all duration-200 p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between
                  bg-gradient-to-b ${plan.gradient}
                  ${
                    isBlocked
                      ? "opacity-60 grayscale-[30%] cursor-not-allowed border-[#E8DFD4]"
                      : isSelected
                      ? "border-[#5C1B13] ring-4 ring-[#5C1B13]/15 shadow-md shadow-[#5C1B13]/15 cursor-pointer bg-white"
                      : "border-[#E8DFD4] hover:border-[#5C1B13]/50 shadow-2xs hover:shadow-sm cursor-pointer"
                  }
                `}
              >
                {/* Top badge */}
                {plan.badge && !isBlocked && (
                  <div className="absolute -top-3 left-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs ${
                        isMonthly
                          ? "bg-[#5C1B13] text-[#F8E94E] border border-[#F8E94E]/30"
                          : "bg-[#7a2417] text-white"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {isBlocked && (
                  <div className="absolute -top-3 left-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-700 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
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
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <div className="w-7 h-7 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    {isMonthly && customPricing ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> Customized
                      </span>
                    ) : eligibility?.remainingUses !== undefined ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10.5px] font-bold">
                        {eligibility.remainingUses} Left
                      </span>
                    ) : displaySavingsText ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                        {displaySavingsText}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#1A1008] leading-tight mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#3A241C]/75 leading-relaxed line-clamp-2 min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* Pricing block */}
                  <div className="py-2 my-2 border-y border-[#E8DFD4]/80">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-[#5C1B13]">
                        ₹{displayPrice}
                      </span>
                      {displayOriginalPrice && (
                        <span className="text-xs text-[#3A241C]/50 line-through">
                          ₹{displayOriginalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-[#1A1008] bg-black/[0.04] px-2 py-0.5 rounded-md whitespace-nowrap">
                        {serverRateText}
                      </span>
                      <span className="text-xs text-[#3A241C]/50">•</span>
                      <span className="text-xs text-[#3A241C]/70 whitespace-nowrap">
                        {displayQuantity}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-1.5 mb-3 text-xs text-[#3A241C]/85">
                    {plan.features.slice(0, 4).map((feat, idx) => {
                      const FeatIcon = feat.icon;
                      return (
                        <li key={idx} className="flex items-center gap-2 truncate">
                          <FeatIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Actions container */}
                <div className="space-y-2 mt-1">
                  {/* Customize Schedule Button for Monthly Plan */}
                  {isMonthly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPanelOpen(true);
                      }}
                      aria-label="Customize delivery frequency and quantity schedule"
                      className="w-full h-8 px-2.5 rounded-xl border border-[#5C1B13]/30 bg-[#FAF3EA] hover:bg-[#F3E7D7] text-[#5C1B13] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <FiSliders className="w-3.5 h-3.5 shrink-0" />
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
                    className={`rounded-xl h-9 sm:h-9.5 text-xs font-bold cursor-pointer transition-all disabled:opacity-50 ${
                      isSelected
                        ? "bg-[#5C1B13] text-white hover:bg-[#48150F] shadow-sm"
                        : "border-2 border-[#5C1B13] text-[#5C1B13] hover:bg-[#5C1B13]/8"
                    }`}
                  >
                    {planSubmitting && selectedPlanId === plan.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
      )}

      {/* Subscription Panel Dialog - mounted only when opened */}
      {isPanelOpen && (
        <SubscriptionPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onConfirmPlan={handleConfirmSchedule}
          deliveryStartTime={planOverviews.find((p: any) => p.type === "MONTHLY")?.deliveryStartTime}
          deliveryEndTime={planOverviews.find((p: any) => p.type === "MONTHLY")?.deliveryEndTime}
          orderCutoff={orderCutoff}
        />
      )}
    </m.div>
  );
}

export const PlanStep = React.memo(PlanStepComponent);
