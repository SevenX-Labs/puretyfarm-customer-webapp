"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Subscription } from "@/types/models";
import { FiPause, FiPlay, FiShield } from "react-icons/fi";

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
      tag: "ONE-TIME OFFER",
      desc: "7 consecutive mornings of farm-fresh pure A2 Gir cow milk in glass bottles.",
    },
    {
      id: "monthly" as const,
      name: "Monthly Subscription",
      price: 2250,
      rate: "₹75 / delivery",
      tag: "MOST POPULAR",
      desc: "1L Daily (30L / month) with automatic morning delivery & flexible vacation pause.",
    },
    {
      id: "single" as const,
      name: "Buy Once (1 Litre)",
      price: 85,
      rate: "₹85 / bottle",
      tag: "SAMPLE BOTTLE",
      desc: "Taste test our rich farm milk with a single bottle before subscribing.",
    },
  ];

  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#1A1008]">Daily Milk Plan & Vacation Mode</h2>
        <p className="text-xs text-[#3A241C]/65">
          Delivered fresh every morning before 10:00 AM across Raipur in sanitized glass bottles.
        </p>
      </div>

      {subLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#3A241C]/60">Checking your subscription status...</p>
        </div>
      ) : subscription ? (
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DFD4] gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-xl font-bold text-[#1A1008]">{subscription.planName}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    subscription.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {subscription.status === "active" ? "Active Daily Delivery" : "Paused (Vacation Mode)"}
                </span>
              </div>
              <p className="text-xs text-[#3A241C]/70">
                Rate: <strong className="text-[#5C1B13]">₹{subscription.price}</strong> • {subscription.dailyQuantity}
              </p>
            </div>

            {/* Vacation Pause / Resume Control */}
            <Button
              variant={subscription.status === "active" ? "secondary" : "primary"}
              size="sm"
              disabled={subUpdating}
              onClick={onToggleSubPause}
              className="rounded-2xl px-5 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              {subscription.status === "active" ? (
                <>
                  <FiPause className="w-3.5 h-3.5" />
                  <span>Pause Delivery (Vacation)</span>
                </>
              ) : (
                <>
                  <FiPlay className="w-3.5 h-3.5" />
                  <span>Resume Morning Delivery</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
              <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                Next Delivery
              </span>
              <span className="text-sm font-bold text-[#1A1008] mt-0.5 block">
                {subscription.status === "active" ? "Tomorrow before 10 AM" : "Paused"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
              <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                Bottles Sanitized & Sealed
              </span>
              <span className="text-sm font-bold text-[#1A1008] mt-0.5 block">
                Zero-Plastic Glass
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
              <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                Cut-off for Changes
              </span>
              <span className="text-sm font-bold text-[#5C1B13] mt-0.5 block">
                10:00 PM (night before)
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-[#FAF3EA]/50 border border-[#E8DFD4] text-xs text-[#3A241C]/75 flex items-start gap-2.5">
            <FiShield className="w-4 h-4 text-[#5C1B13] shrink-0 mt-0.5" />
            <p>
              <strong>Vacation Policy:</strong> You can pause deliveries anytime before 10:00 PM for next-day effect.
              Your milk balance remains safely credited in your PuretyFarm account.
            </p>
          </div>
        </div>
      ) : null}

      {/* Available Plans from Pricing section */}
      <div>
        <h3 className="text-base font-bold text-[#1A1008] mb-3">
          {subscription ? "Switch or Upgrade Plan" : "Choose Your PuretyFarm Plan"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                subscription?.planId === plan.id
                  ? "border-[#5C1B13] shadow-md shadow-[#5C1B13]/10"
                  : "border-[#E8DFD4] hover:border-[#5C1B13]/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3EA] text-[#5C1B13]">
                    {plan.tag}
                  </span>
                  {subscription?.planId === plan.id && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Current Plan
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-[#1A1008]">{plan.name}</h4>
                <div className="mt-1 mb-2">
                  <span className="text-xl font-bold text-[#5C1B13]">₹{plan.price}</span>
                  <span className="text-xs text-[#3A241C]/60 ml-1.5 font-medium">({plan.rate})</span>
                </div>
                <p className="text-xs text-[#3A241C]/70 mb-4">{plan.desc}</p>
              </div>

              <Button
                variant={subscription?.planId === plan.id ? "secondary" : "primary"}
                size="sm"
                fullWidth
                disabled={subUpdating || subscription?.planId === plan.id}
                onClick={() => onActivatePlan(plan.id)}
                className="rounded-xl py-2.5 text-xs font-bold"
              >
                {subscription?.planId === plan.id ? "Selected Plan" : `Choose ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </m.div>
  );
}
