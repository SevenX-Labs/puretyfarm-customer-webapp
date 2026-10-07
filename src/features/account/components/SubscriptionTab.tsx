"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Subscription } from "@/types/models";
import { FiPause, FiPlay, FiShield, FiCheck, FiTruck, FiClock, FiCalendar, FiSliders, FiAlertCircle } from "react-icons/fi";
import {
  SubscriptionPanel,
  PricingResult,
  SubscriptionDraft,
  SubscriptionCustomizationPayload,
} from "@/features/subscription";
import { plansApi, PlanOverviewItem } from "@/features/plans/api/plansApi";

export interface SubscriptionTabProps {
  subscription: Subscription | null;
  subLoading: boolean;
  subUpdating: boolean;
  onToggleSubPause: () => void;
  onActivatePlan: (planId: "trial" | "monthly" | "single") => void;
  customPlan?: {
    price: number;
    dailyQuantity: string;
    breakdownText?: string;
  } | null;
  onConfirmPlan?: (
    result: PricingResult,
    draft: SubscriptionDraft,
    payload: SubscriptionCustomizationPayload
  ) => Promise<void> | void;
  isPanelOpen?: boolean;
  onOpenPanel?: () => void;
  onClosePanel?: () => void;
}

export function SubscriptionTab({
  subscription,
  subLoading,
  subUpdating,
  onToggleSubPause,
  onActivatePlan,
  customPlan,
  onConfirmPlan,
  isPanelOpen: externalIsOpen,
  onOpenPanel,
  onClosePanel,
}: SubscriptionTabProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isPanelOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleOpenPanel = onOpenPanel || (() => setInternalIsOpen(true));
  const handleClosePanel = onClosePanel || (() => setInternalIsOpen(false));

  const [planOverviews, setPlanOverviews] = useState<PlanOverviewItem[]>([]);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await plansApi.getPlansOverview();
        if (res?.plans) {
          setPlanOverviews(res.plans);
        }
      } catch (err) {
        console.warn("Could not fetch plans overview:", err);
      }
    }
    loadPlans();
  }, []);

  const getPlanEligibility = (id: "trial" | "monthly" | "single") => {
    const backendType =
      id === "trial" ? "SEVEN_DAY_TRIAL" : id === "single" ? "BUY_ONCE" : "MONTHLY";
    return planOverviews.find((p) => p.type === backendType);
  };

  const availablePlans = [
    {
      id: "trial" as const,
      name: "7-Day Trial Plan",
      price: 525,
      rate: "₹75 / litre",
      tag: "ONE-TIME STARTER",
      isPopular: false,
      desc: "7 consecutive mornings of chilled, fresh A2 Gir cow milk delivered in glass bottles.",
      features: [
        "7 x 1 Litre sealed glass bottles",
        "Sunrise doorstep delivery before 10 AM",
        "Untouched cold-chain at 4°C",
        "Includes glass bottle doorstep exchange",
      ],
    },
    {
      id: "monthly" as const,
      name: customPlan ? "Customized Monthly Plan" : "Monthly Subscription",
      price: customPlan ? customPlan.price : 2250,
      rate: "₹75 / litre",
      tag: customPlan ? "CUSTOM SCHEDULE" : "MOST POPULAR",
      isPopular: true,
      desc: customPlan
        ? `Custom delivery schedule (${customPlan.dailyQuantity}) with seamless pause mode for vacations.`
        : "Daily 1L delivery (30 litres / month) with seamless pause mode for vacations.",
      features: [
        customPlan?.breakdownText ? `Custom schedule: ${customPlan.breakdownText}` : "Daily morning delivery (30L / mo)",
        "Zero-penalty vacation pause anytime",
        "Free doorstep insulated carry bag",
        "Priority batch reservation from farm",
      ],
    },
    {
      id: "single" as const,
      name: "Buy Once (1 Litre)",
      price: 85,
      rate: "₹85 / bottle",
      tag: "TASTE SAMPLE",
      isPopular: false,
      desc: "Taste test our rich, unadulterated farm milk before committing to a daily subscription.",
      features: [
        "1 Litre chilled sample bottle",
        "Next-morning doorstep delivery",
        "100% natural Gir cow A2 milk",
        "No subscription commitment required",
      ],
    },
  ];

  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* ─── SECTION TITLE ─── */}
      <div className="pb-5 border-b border-[#E8DFD4]">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1008]">
          Milk Subscription & Vacation Schedule
        </h2>
        <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
          Delivered chilled every morning before 10:00 AM across Raipur in sanitized glass bottles.
        </p>
      </div>

      {subLoading ? (
        <div className="py-20 text-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#1A1008] font-bold">Checking subscription details...</p>
          <p className="text-xs text-[#6B584C] mt-1">Retrieving farm dispatch schedule</p>
        </div>
      ) : subscription ? (
        /* ─── CURRENT ACTIVE SUBSCRIPTION CARD ─── */
        <div className="rounded-2xl border-2 border-[#5C1B13] bg-[#FFFDF9] p-5 sm:p-6 shadow-md shadow-[#5C1B13]/8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD4]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5C1B13] text-white">
                  Active Subscription
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    subscription.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {subscription.status === "active" ? "Morning Dispatch ON" : "Vacation Paused"}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1A1008]">
                {subscription.planName}
              </h3>
              <p className="text-xs text-[#6B584C] mt-0.5">
                {subscription.dailyQuantity} •{" "}
                <span className="font-semibold text-[#5C1B13]">
                  ₹{subscription.price}/month
                </span>
              </p>
            </div>

            {/* Pause / Resume Button */}
            <div className="flex items-center gap-2">
              {subscription.planId === "monthly" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenPanel}
                  className="rounded-xl min-h-[44px] px-3.5 py-2 text-xs font-bold border-[#E8DFD4] text-[#5C1B13] hover:bg-[#FAF3EA] cursor-pointer"
                >
                  <FiSliders className="w-3.5 h-3.5 mr-1" />
                  <span>Edit Schedule</span>
                </Button>
              )}

              <Button
                variant={subscription.status === "active" ? "secondary" : "primary"}
                size="sm"
                disabled={subUpdating}
                onClick={onToggleSubPause}
                className={`rounded-xl min-h-[44px] px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subscription.status === "active"
                    ? "border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                    : "bg-[#5C1B13] hover:bg-[#48150f] text-white"
                }`}
              >
                {subUpdating ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : subscription.status === "active" ? (
                  <>
                    <FiPause className="w-3.5 h-3.5" />
                    <span>Pause Deliveries</span>
                  </>
                ) : (
                  <>
                    <FiPlay className="w-3.5 h-3.5 text-white" />
                    <span>Resume Deliveries</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Key Delivery Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8DFD4] shadow-2xs">
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                <FiTruck className="w-3.5 h-3.5 text-[#5C1B13]" /> Next Delivery
              </span>
              <p className="text-sm font-bold text-[#1A1008] mt-1">
                {subscription.status === "active" ? "Tomorrow before 10 AM" : "Paused on Vacation"}
              </p>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">Sunrise van route</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8DFD4] shadow-2xs">
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-[#5C1B13]" /> Packaging Standard
              </span>
              <p className="text-sm font-bold text-[#1A1008] mt-1">
                Chilled Glass Bottles
              </p>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">Sanitized at dawn</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8DFD4] shadow-2xs">
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-[#5C1B13]" /> Cut-Off Time
              </span>
              <p className="text-sm font-bold text-[#5C1B13] mt-1 font-mono">
                10:00 PM Tonight
              </p>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">Modify for tomorrow morning</p>
            </div>
          </div>

          {/* Vacation Policy Note */}
          <div className="mt-4 p-3.5 rounded-xl bg-white border border-[#E8DFD4] text-xs text-[#6B584C] flex items-start gap-2.5">
            <FiShield className="w-4 h-4 text-[#5C1B13] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#1A1008]">Vacation Flexibility:</strong> Pause your daily bottles anytime before 10:00 PM without fee. Unused quota stays credited in your account.
            </p>
          </div>
        </div>
      ) : null}

      {/* ─── AVAILABLE PLANS SECTION (SPACIOUS HORIZONTAL CARDS) ─── */}
      <div className="space-y-3.5 pt-1">
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1A1008]">
            {subscription ? "Switch or Upgrade Plan" : "Choose Your PuretyFarm Plan"}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
            Select a pure delivery plan tailored to your family&apos;s morning routine in Raipur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-4.5">
          {availablePlans.map((plan) => {
            const isCurrent = subscription?.planId === plan.id;
            const eligibility = getPlanEligibility(plan.id);
            const isBlocked = eligibility?.available === false;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  isBlocked
                    ? "bg-[#FAF7F2]/60 border-[#E8DFD4] opacity-70"
                    : plan.isPopular
                    ? "bg-[#FFFDF9] border-[#5C1B13] shadow-md shadow-[#5C1B13]/8 ring-1 ring-[#5C1B13]"
                    : "bg-white border-[#E8DFD4] hover:border-[#5C1B13]/40 shadow-2xs"
                }`}
              >
                <div>
                  {/* Header: Tag + Current Plan Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    {isBlocked ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
                        {eligibility?.blockedReason === "BUY_ONCE_ALREADY_USED"
                          ? "Trial Ineligible"
                          : eligibility?.blockedReason === "TRIAL_ALREADY_USED"
                          ? "Trial Used"
                          : eligibility?.blockedReason === "MAX_USES_REACHED"
                          ? "Limit Reached"
                          : "Unavailable"}
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          plan.isPopular
                            ? "bg-[#5C1B13] text-white"
                            : "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]"
                        }`}
                      >
                        {plan.tag}
                      </span>
                    )}

                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Current Plan ✓
                      </span>
                    ) : eligibility?.remainingUses !== undefined && !isBlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {eligibility.remainingUses} Left
                      </span>
                    ) : null}
                  </div>

                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#1A1008] leading-snug">
                    {plan.name}
                  </h4>

                  {/* Price display */}
                  <div className="mt-2 mb-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#5C1B13] font-mono">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-[#8C7A6B] font-medium font-sans">
                      / {plan.rate}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B584C] leading-relaxed mb-4">
                    {plan.desc}
                  </p>

                  {/* Features list */}
                  <div className="space-y-2 pt-3 border-t border-[#E8DFD4]/70 mb-5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#2C1810]">
                        <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-2 space-y-2">
                  {plan.id === "monthly" && !isBlocked && (
                    <button
                      type="button"
                      onClick={handleOpenPanel}
                      className="w-full min-h-[44px] py-2 px-3 rounded-xl border border-[#5C1B13]/30 bg-white hover:bg-[#FAF3EA] text-[#5C1B13] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FiSliders className="w-3.5 h-3.5 shrink-0" />
                      <span>Customize Schedule</span>
                    </button>
                  )}

                  <Button
                    variant={isCurrent || isBlocked ? "secondary" : "primary"}
                    size="sm"
                    fullWidth
                    disabled={subUpdating || isCurrent || isBlocked}
                    onClick={() => onActivatePlan(plan.id)}
                    className={`rounded-xl py-2.5 min-h-[44px] text-xs font-bold transition-all cursor-pointer ${
                      isBlocked
                        ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : isCurrent
                        ? "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4] cursor-default"
                        : "bg-[#5C1B13] hover:bg-[#48150f] text-white shadow-2xs"
                    }`}
                  >
                    {isBlocked
                      ? "Unavailable"
                      : isCurrent
                      ? "Currently Active"
                      : plan.id === "trial"
                      ? "Start 7-Day Trial"
                      : plan.id === "monthly"
                      ? "Subscribe Monthly"
                      : "Order 1 Litre Bottle"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessible Subscription Panel Dialog - when not managed as side card */}
      {!onOpenPanel && (
        <SubscriptionPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onConfirmPlan={onConfirmPlan}
          title="Customize Milk Subscription"
        />
      )}
    </m.div>
  );
}
