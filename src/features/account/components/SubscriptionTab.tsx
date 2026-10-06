"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Subscription } from "@/types/models";
import { FiPause, FiPlay, FiShield, FiCheck, FiTruck, FiClock, FiCalendar } from "react-icons/fi";

export interface SubscriptionTabProps {
  subscription: Subscription | null;
  subLoading: boolean;
  subUpdating: boolean;
  onToggleSubPause: () => void;
  onActivatePlan: (planId: "trial" | "monthly" | "single") => void;
}

export function SubscriptionTab({
  subscription,
  subLoading,
  subUpdating,
  onToggleSubPause,
  onActivatePlan,
}: SubscriptionTabProps) {
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
      name: "Monthly Subscription",
      price: 2250,
      rate: "₹75 / delivery",
      tag: "MOST POPULAR",
      isPopular: true,
      desc: "Daily 1L delivery (30 litres / month) with seamless pause mode for vacations.",
      features: [
        "Daily morning delivery (30L / mo)",
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
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      {/* ─── SECTION TITLE ─── */}
      <div className="pb-6 border-b border-[#E8DFD4]">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
          Milk Subscription & Vacation Schedule
        </h2>
        <p className="text-sm sm:text-base text-[#6B584C] mt-1">
          Delivered chilled every morning before 10:00 AM across Raipur in sanitized glass bottles.
        </p>
      </div>

      {subLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-base text-[#1A1008] font-bold">Checking subscription details...</p>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-1">Retrieving farm dispatch schedule</p>
        </div>
      ) : subscription ? (
        /* ─── ACTIVE SUBSCRIPTION CARD ─── */
        <div className="bg-[#FAF8F5] rounded-[28px] sm:rounded-[34px] border border-[#E8DFD4] p-7 sm:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-7 border-b border-[#E8DFD4] gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2.5">
                <span className="w-10 h-10 rounded-2xl bg-[#FAF3EA] border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] shrink-0">
                  <FiCalendar className="w-5 h-5" />
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
                  {subscription.planName}
                </h3>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-2 ${
                    subscription.status === "active"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-900 border border-amber-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      subscription.status === "active" ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
                    }`}
                  />
                  {subscription.status === "active" ? "Active Daily Delivery" : "Paused (Vacation Mode)"}
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#6B584C] pl-0 sm:pl-13">
                Plan Rate: <strong className="text-[#5C1B13] font-mono font-bold text-lg">₹{subscription.price}</strong> • {subscription.dailyQuantity}
              </p>
            </div>

            {/* Vacation Pause / Resume Control */}
            <div className="self-start lg:self-auto shrink-0">
              <Button
                variant={subscription.status === "active" ? "secondary" : "primary"}
                size="md"
                disabled={subUpdating}
                onClick={onToggleSubPause}
                className="rounded-2xl px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2.5 cursor-pointer shadow-sm transition-all"
              >
                {subscription.status === "active" ? (
                  <>
                    <FiPause className="w-4 h-4 text-[#5C1B13]" />
                    <span>Pause Delivery (Vacation Mode)</span>
                  </>
                ) : (
                  <>
                    <FiPlay className="w-4 h-4 text-white" />
                    <span>Resume Morning Deliveries</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Key Delivery Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-7">
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#E8DFD4] shadow-xs">
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-2">
                <FiTruck className="w-4 h-4 text-[#5C1B13]" /> Next Delivery
              </span>
              <p className="text-lg font-bold text-[#1A1008] mt-2">
                {subscription.status === "active" ? "Tomorrow before 10 AM" : "Paused on Vacation"}
              </p>
              <p className="text-xs sm:text-sm text-[#8C7A6B] mt-1">Sunrise route van dispatch</p>
            </div>

            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#E8DFD4] shadow-xs">
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-2">
                <FiShield className="w-4 h-4 text-[#5C1B13]" /> Packaging Standard
              </span>
              <p className="text-lg font-bold text-[#1A1008] mt-2">
                Chilled Glass Bottles
              </p>
              <p className="text-xs sm:text-sm text-[#8C7A6B] mt-1">Zero microplastics • Sanitized at dawn</p>
            </div>

            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#E8DFD4] shadow-xs">
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-2">
                <FiClock className="w-4 h-4 text-[#5C1B13]" /> Daily Cut-Off Time
              </span>
              <p className="text-lg font-bold text-[#5C1B13] mt-2 font-mono">
                10:00 PM Tonight
              </p>
              <p className="text-xs sm:text-sm text-[#8C7A6B] mt-1">Pause/modify before 10 PM for next morning</p>
            </div>
          </div>

          {/* Vacation Policy Note */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#E8DFD4] text-xs sm:text-sm text-[#6B584C] flex items-start gap-3">
            <FiShield className="w-5 h-5 text-[#5C1B13] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#1A1008]">Vacation Flexibility:</strong> Traveling outside Raipur? Pause your bottles anytime before 10:00 PM without any fee. Unused bottle quota remains credited in your PuretyFarm account.
            </p>
          </div>
        </div>
      ) : null}

      {/* ─── AVAILABLE PLANS SECTION (EXPANSIVE 3-COLUMN CARDS) ─── */}
      <div className="space-y-6 pt-2">
        <div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
            {subscription ? "Switch or Upgrade Plan" : "Choose Your PuretyFarm Plan"}
          </h3>
          <p className="text-sm sm:text-base text-[#6B584C] mt-1">
            Select a pure delivery plan tailored to your family&apos;s morning routine in Raipur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {availablePlans.map((plan) => {
            const isCurrent = subscription?.planId === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-[28px] sm:rounded-[34px] p-7 sm:p-8 lg:p-9 border flex flex-col justify-between transition-all duration-300 relative ${
                  plan.isPopular
                    ? "bg-[#FFFDF9] border-[#5C1B13] shadow-xl shadow-[#5C1B13]/10 ring-2 ring-[#5C1B13]"
                    : "bg-white border-[#E8DFD4] hover:border-[#5C1B13]/40 hover:shadow-lg"
                }`}
              >
                <div>
                  {/* Popular / Starter Tag on top */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${
                        plan.isPopular
                          ? "bg-[#5C1B13] text-white shadow-xs"
                          : "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]"
                      }`}
                    >
                      {plan.tag}
                    </span>

                    {isCurrent && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Current Plan ✓
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-2xl sm:text-[26px] text-[#1A1008] tracking-tight">
                    {plan.name}
                  </h4>

                  {/* Price Block */}
                  <div className="mt-4 mb-5 pb-5 border-b border-[#E8DFD4]/70">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-[#5C1B13] font-mono tracking-tight">
                        ₹{plan.price}
                      </span>
                      <span className="text-sm sm:text-base text-[#8C7A6B] font-medium font-sans">
                        / {plan.rate}
                      </span>
                    </div>
                    <p className="text-sm text-[#4A3225] mt-3 leading-relaxed min-h-[44px]">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Feature Checkmarks List */}
                  <div className="space-y-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] text-[#2C1810]">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                          <FiCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  size="md"
                  fullWidth
                  disabled={subUpdating || isCurrent}
                  onClick={() => onActivatePlan(plan.id)}
                  className={`rounded-2xl py-4 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4] cursor-default"
                      : "bg-[#5C1B13] hover:bg-[#48150f] text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {isCurrent
                    ? "Currently Active Plan"
                    : plan.id === "trial"
                    ? "Start 7-Day Trial (₹525)"
                    : plan.id === "monthly"
                    ? "Subscribe Monthly (₹2,250)"
                    : "Order 1 Litre Bottle (₹85)"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </m.div>
  );
}
