"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PlanDefinition } from "@/features/plans";
import { PlanQuote } from "@/features/plans/api/plansApi";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPlusCircle,
  FiRefreshCw,
  FiShield,
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiLock,
} from "react-icons/fi";
import { LuWallet, LuBanknote, LuSparkles } from "react-icons/lu";
import { EmailVerificationModal } from "@/components/pf/EmailVerificationModal";

export interface PaymentStepProps {
  quote: PlanQuote | null;
  plan: PlanDefinition | null;
  walletBalancePaise: number;
  walletAutoCredit: boolean;
  walletLoading: boolean;
  paymentSubmitting: boolean;
  paymentError: string | null;
  paymentNotice: string | null;
  onReloadWallet: () => void;
  onPayFromWallet: () => void;
  onPayOnline: () => void;
  onPayCash: () => void;
  onBackToPlans: () => void;
}

type Method = "WALLET" | "CASH";

function paise(amount: number): string {
  return `₹${(amount / 100).toFixed(2)}`;
}

export function PaymentStep({
  quote,
  plan,
  walletBalancePaise,
  walletAutoCredit,
  walletLoading,
  paymentSubmitting,
  paymentError,
  paymentNotice,
  onReloadWallet,
  onPayFromWallet,
  onPayOnline,
  onPayCash,
  onBackToPlans,
}: PaymentStepProps) {
  const [method, setMethod] = useState<Method>("WALLET");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!quote) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#7A2417]">
          <FiAlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-base font-bold text-[#24130F]">
          No Pending Plan to Pay For
        </h2>
        <p className="text-xs text-[#715E50] max-w-xs">
          Please select a milk delivery plan first to view your customized payment options.
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onBackToPlans}
          className="rounded-xl bg-[#5C1B13] hover:bg-[#48150F] px-5 text-xs font-bold cursor-pointer mt-1"
        >
          Select Milk Plan
        </Button>
      </div>
    );
  }

  const totalPaise = quote.totalSellingAmount;
  const sufficient = walletBalancePaise >= totalPaise;
  const shortfallPaise = Math.max(totalPaise - walletBalancePaise, 0);
  const topupPaise = shortfallPaise;
  const isFirstTopup = !walletAutoCredit;

  const planTitle =
    plan?.name?.toUpperCase() ||
    (quote.deliveryOccurrences === 1
      ? "BUY ONCE (1 LITRE)"
      : quote.deliveryOccurrences === 7
      ? "7-DAY TRIAL PLAN"
      : "MONTHLY SUBSCRIPTION");

  const occurrencesText = `${quote.deliveryOccurrences} ${
    quote.deliveryOccurrences === 1 ? "delivery" : "deliveries"
  }`;

  return (
    <m.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col justify-between overflow-y-auto custom-scrollbar space-y-3.5 sm:space-y-4"
    >
      <div className="space-y-3 sm:space-y-3.5">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 pb-0.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#5C1B13]/10 text-[#5C1B13] text-[10px] font-bold uppercase tracking-wider">
                Step 4 • Final Step
              </span>
              <span className="text-[11px] text-[#715E50] font-medium hidden sm:inline">
                Secure Checkout
              </span>
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#24130F] lg:text-[22px] mt-1 tracking-tight">
              Pay for your plan
            </h1>
            <p className="text-xs text-[#715E50] mt-0.5 leading-relaxed">
              Choose your payment method below to activate daily doorstep milk delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToPlans}
            aria-label="Change selected plan"
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFD4] bg-white text-xs font-bold text-[#5C1B13] transition-all hover:bg-[#FAF6F0] hover:border-[#5C1B13]/40 cursor-pointer shadow-2xs"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Change plan</span>
          </button>
        </header>

        {/* Selected Plan Summary Banner */}
        <div className="rounded-2xl border border-[#E8DFD4] bg-gradient-to-r from-[#FAF6F0] via-[#FFFDF9] to-[#FBF4EC] p-3.5 sm:p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-[#5C1B13]">
                  {planTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] font-bold">
                  Raw A2 Gir Cow Milk
                </span>
              </div>
              <p className="text-xs font-semibold text-[#24130F] mt-0.5">
                {occurrencesText} • {quote.totalLitres} Litres total
              </p>
              <p className="text-[11px] text-[#715E50]">
                Morning delivery slot • Sterilized glass bottles
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-serif text-2xl sm:text-[26px] font-black text-[#5C1B13] leading-none block">
                {paise(totalPaise)}
              </span>
              {quote.discountAmount > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-emerald-800 shadow-2xs">
                  You save {paise(quote.discountAmount)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method Selector Cards */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#715E50] block">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* 1. Wallet Option */}
            <button
              type="button"
              onClick={() => setMethod("WALLET")}
              aria-pressed={method === "WALLET"}
              className={`relative flex items-start gap-3 rounded-2xl border-2 p-3 sm:p-3.5 text-left transition-all cursor-pointer shadow-2xs ${
                method === "WALLET"
                  ? "border-[#5C1B13] bg-[#FFFDF9] ring-2 ring-[#5C1B13]/15 shadow-sm"
                  : "border-[#E8DFD4] bg-white hover:border-[#5C1B13]/40 hover:bg-[#FAF8F5]"
              }`}
            >
              {/* Radio check indicator */}
              <div
                className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                  method === "WALLET"
                    ? "border-[#5C1B13] bg-[#5C1B13]"
                    : "border-[#D5C7B8] bg-white"
                }`}
              >
                {method === "WALLET" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-[13px] font-bold text-[#24130F] flex items-center gap-1.5">
                    <LuWallet className="h-4 w-4 text-[#5C1B13] shrink-0" />
                    <span>Purety Wallet</span>
                  </span>
                  <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#F8E94E] text-[#5C1B13] tracking-wider shrink-0">
                    Fastest
                  </span>
                </div>
                <p className="text-[11px] text-[#715E50] leading-snug">
                  Auto-debit with daily pause credit & zero transaction fees.
                </p>
                <div className="pt-0.5 flex items-center gap-1.5 text-[11px]">
                  <span className="text-[#715E50]">Balance:</span>
                  <span className="font-bold font-mono text-[#5C1B13]">
                    {walletLoading ? "..." : paise(walletBalancePaise)}
                  </span>
                </div>
              </div>
            </button>

            {/* 2. Cash on Delivery Option */}
            <button
              type="button"
              onClick={() => setMethod("CASH")}
              aria-pressed={method === "CASH"}
              className={`relative flex items-start gap-3 rounded-2xl border-2 p-3 sm:p-3.5 text-left transition-all cursor-pointer shadow-2xs ${
                method === "CASH"
                  ? "border-[#5C1B13] bg-[#FFFDF9] ring-2 ring-[#5C1B13]/15 shadow-sm"
                  : "border-[#E8DFD4] bg-white hover:border-[#5C1B13]/40 hover:bg-[#FAF8F5]"
              }`}
            >
              {/* Radio check indicator */}
              <div
                className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                  method === "CASH"
                    ? "border-[#5C1B13] bg-[#5C1B13]"
                    : "border-[#D5C7B8] bg-white"
                }`}
              >
                {method === "CASH" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-[13px] font-bold text-[#24130F] flex items-center gap-1.5">
                    <LuBanknote className="h-4 w-4 text-[#5C1B13] shrink-0" />
                    <span>Cash on Delivery</span>
                  </span>
                  <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-stone-100 text-[#5C1B13] tracking-wider shrink-0">
                    Pay at Door
                  </span>
                </div>
                <p className="text-[11px] text-[#715E50] leading-snug">
                  Pay cash directly to our delivery partner upon first delivery.
                </p>
                <div className="pt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>No advance payment needed</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {paymentNotice && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/90 p-3 text-xs text-sky-900 shadow-2xs"
          >
            <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <span className="leading-relaxed">{paymentNotice}</span>
          </div>
        )}

        {paymentError && (method === "WALLET" || !(paymentError.toLowerCase().includes("email") || paymentError.toLowerCase().includes("gateway") || paymentError.toLowerCase().includes("wallet") || paymentError.toLowerCase().includes("insufficient") || paymentError.toLowerCase().includes("recharge"))) && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-700 shadow-2xs"
          >
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="flex-1 space-y-1.5">
              <span className="leading-relaxed block">{paymentError}</span>
              {paymentError.toLowerCase().includes("email") && (
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5C1B13] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#48150F] transition-colors cursor-pointer"
                >
                  <span>Verify Email Address Now</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Payment Panel */}
        <AnimatePresence mode="wait">
          {method === "WALLET" ? (
            <m.div
              key="wallet-method"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Wallet Status Details */}
              <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF8F5] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#E8DFD4]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0">
                      <LuWallet className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#715E50] block">
                        Your Purety Wallet
                      </span>
                      <span className="font-mono text-base font-bold text-[#24130F] block">
                        {walletLoading ? "Updating..." : paise(walletBalancePaise)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onReloadWallet}
                    disabled={walletLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E8DFD4] bg-white text-[11px] font-bold text-[#5C1B13] hover:bg-[#FAF6F0] cursor-pointer disabled:opacity-60 transition-colors shadow-2xs"
                  >
                    <FiRefreshCw
                      className={`h-3 w-3 ${walletLoading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>

                {sufficient ? (
                  /* Case A: Sufficient Wallet Balance */
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/80">
                      <FiCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Sufficient balance available! Your plan will activate immediately upon confirmation.
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]/80">
                        <span className="text-[9.5px] font-bold text-[#715E50] uppercase block">Current Balance</span>
                        <span className="font-bold font-mono text-[#24130F] mt-0.5 block">{paise(walletBalancePaise)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]/80">
                        <span className="text-[9.5px] font-bold text-[#715E50] uppercase block">Plan Total</span>
                        <span className="font-bold font-mono text-[#5C1B13] mt-0.5 block">-{paise(totalPaise)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]/80">
                        <span className="text-[9.5px] font-bold text-[#715E50] uppercase block">Remaining</span>
                        <span className="font-bold font-mono text-emerald-700 mt-0.5 block">{paise(walletBalancePaise - totalPaise)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Case B: Insufficient Wallet Balance (Need Top-up) */
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD4]/80">
                        <span className="text-[9.5px] font-bold text-[#715E50] uppercase block">Wallet Balance</span>
                        <span className="font-bold font-mono text-[#24130F] mt-0.5 block">{paise(walletBalancePaise)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD4]/80">
                        <span className="text-[9.5px] font-bold text-[#715E50] uppercase block">Plan Amount</span>
                        <span className="font-bold font-mono text-[#24130F] mt-0.5 block">{paise(totalPaise)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#5C1B13]/5 border border-[#5C1B13]/25">
                        <span className="text-[9.5px] font-bold text-[#5C1B13] uppercase block">Shortfall Required</span>
                        <span className="font-bold font-mono text-[#5C1B13] mt-0.5 block">{paise(topupPaise)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#715E50] leading-relaxed">
                      You need <strong className="text-[#5C1B13]">{paise(topupPaise)}</strong> more to activate this plan. Add it securely online below, and your subscription starts immediately.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {sufficient ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={paymentSubmitting}
                  onClick={onPayFromWallet}
                  className="h-11 sm:h-12 w-full rounded-xl bg-[#5C1B13] hover:bg-[#48150F] text-xs sm:text-sm font-bold text-white cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    {paymentSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCheckCircle className="h-4 w-4" />
                    )}
                    <span>
                      {paymentSubmitting
                        ? "Confirming Subscription..."
                        : `Pay ${paise(totalPaise)} from Wallet & Activate`}
                    </span>
                  </div>
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={paymentSubmitting}
                    onClick={onPayOnline}
                    className="h-11 sm:h-12 w-full rounded-xl bg-[#5C1B13] hover:bg-[#48150F] text-xs sm:text-sm font-bold text-white cursor-pointer disabled:opacity-60 shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {paymentSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiPlusCircle className="h-4 w-4" />
                      )}
                      <span>
                        {paymentSubmitting
                          ? "Connecting to Payment Gateway..."
                          : `Add ${paise(topupPaise)} Online & Activate Plan`}
                      </span>
                    </div>
                  </Button>

                  {/* Payment Methods Supported Chips */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#715E50] flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <FiCreditCard className="w-3.5 h-3.5 text-[#5C1B13]" />
                      UPI • Cards • NetBanking
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <FiLock className="w-3.5 h-3.5" />
                      256-Bit SSL Encrypted
                    </span>
                  </div>

                  {/* What happens next note */}
                  <div className="rounded-xl border border-[#E8DFD4] bg-white p-3 text-xs leading-relaxed text-[#715E50] space-y-1">
                    <span className="font-bold text-[#24130F] block text-[11.5px]">
                      Simple 2-Step Activation:
                    </span>
                    <ol className="list-decimal space-y-1 pl-4 text-[11px]">
                      <li>
                        Pay exact shortfall of <strong>{paise(topupPaise)}</strong> via UPI (GPay/PhonePe/Paytm) or Cards.
                      </li>
                      <li>
                        {isFirstTopup ? (
                          <span>
                            First top-up is verified by admin, and your daily doorstep milk delivery activates automatically.
                          </span>
                        ) : (
                          <span>
                            Wallet credits instantly, your plan fee is debited, and morning delivery starts seamlessly.
                          </span>
                        )}
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </m.div>
          ) : (
            <m.div
              key="cash-method"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Cash Instructions Card */}
              <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF8F5] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E8DFD4]/80">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#5C1B13] flex items-center justify-center shrink-0">
                    <FiTruck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#715E50] block">
                      Doorstep Cash Collection
                    </span>
                    <span className="text-xs font-bold text-[#24130F] block">
                      No advance payment needed today
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E8DFD4]/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#715E50]">Amount to keep ready:</span>
                    <span className="font-bold font-mono text-base text-[#5C1B13]">
                      {paise(totalPaise)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#715E50] leading-snug pt-0.5">
                    Our delivery partner will collect this amount during your first morning delivery. You will receive an instant digital receipt.
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-[#715E50] pt-0.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <FiCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Free doorstep milk bottle delivery included</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <FiCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Deliveries begin immediately upon admin confirmation</span>
                  </div>
                </div>
              </div>

              {/* Confirm Cash Action Button */}
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={paymentSubmitting}
                onClick={onPayCash}
                className="h-11 sm:h-12 w-full rounded-xl bg-[#5C1B13] hover:bg-[#48150F] text-xs sm:text-sm font-bold text-white cursor-pointer disabled:opacity-60 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  {paymentSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering Cash Order...</span>
                    </>
                  ) : (
                    <>
                      <LuBanknote className="h-4 w-4" />
                      <span>Confirm Cash on Delivery ({paise(totalPaise)})</span>
                    </>
                  )}
                </div>
              </Button>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <EmailVerificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={async () => {
          setIsEmailModalOpen(false);
          await onReloadWallet();
          onPayOnline();
        }}
        title="Verify Email for Online Payment"
        description="PhonePe requires a verified email address on your account to proceed with online payment."
        successMessage="Email verified successfully! Resuming payment..."
      />

      {/* Footer Trust & Guarantee */}
      <footer className="pt-2 border-t border-[#E8DFD4]/80 flex items-center justify-between text-[10.5px] text-[#715E50] flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <FiShield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>100% Satisfaction Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LuSparkles className="w-3.5 h-3.5 text-[#5C1B13] shrink-0" />
          <span>Pause, skip or cancel anytime</span>
        </div>
      </footer>
    </m.section>
  );
}
