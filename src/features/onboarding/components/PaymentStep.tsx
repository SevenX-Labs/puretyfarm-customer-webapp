"use client";

import React, { useState } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PlanDefinition } from "@/features/plans";
import { PlanQuote } from "@/features/plans/api/plansApi";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
  FiLock,
  FiPlusCircle,
} from "react-icons/fi";
import { LuWallet, LuBanknote } from "react-icons/lu";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

const EmailVerificationModal = dynamic(
  () =>
    import("@/components/pf/EmailVerificationModal").then(
      (mod) => mod.EmailVerificationModal
    ),
  { ssr: false }
);

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

function PaymentStepComponent({
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
  const { user } = useAuth();
  const [method, setMethod] = useState<Method>("WALLET");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!quote) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-3">
        <p className="text-sm font-semibold text-[#24130F]">
          No plan quote found. Please choose a plan first.
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onBackToPlans}
          className="rounded-xl bg-[#5C1B13] hover:bg-[#48150F] px-5 text-xs font-bold cursor-pointer"
        >
          Select Milk Plan
        </Button>
      </div>
    );
  }

  const totalPaise = quote.totalSellingAmount;
  const shortfallPaise = Math.max(totalPaise - walletBalancePaise, 0);
  const hasWalletBalance = walletBalancePaise > 0;
  const isWalletSufficient = walletBalancePaise >= totalPaise;
  const walletBelowPlanTotal = !isWalletSufficient;

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

  const handleOnlinePaymentClick = () => {
    // Email is not mandatory for online payment (PhonePe) — proceed directly to payment
    onPayOnline();
  };

  const walletUrl = `/wallet?amount=${Math.ceil(shortfallPaise / 100)}`;

  return (
    <m.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col justify-between w-full md:h-full space-y-3 pb-3 sm:pb-0"
    >
      <div className="space-y-3.5">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-[#eee5db] pb-2.5 sm:pb-3">
          <div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#7a2417] block">
              Step 4 of 4 • Secure Checkout
            </span>
            <h1 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#24130F] mt-0.5">
              Complete Payment
            </h1>
            <p className="mt-1 text-xs sm:text-[13px] text-[#715E50]">
              Choose your payment method to activate daily doorstep milk delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToPlans}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#7a2417]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#7a2417] hover:bg-[#7a2417]/8 transition-colors cursor-pointer shadow-2xs"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Change Plan</span>
          </button>
        </header>

        {/* Selected Plan Summary Banner */}
        <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF7F2] p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#5C1B13]">
                  {planTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] font-bold">
                  Raw A2 Gir Cow Milk
                </span>
              </div>
              <p className="text-xs text-[#715E50]">
                {occurrencesText} • {quote.totalLitres}L total • Fresh morning delivery before 10 AM
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-serif text-2xl sm:text-3xl font-black text-[#5C1B13] leading-none block">
                {paise(totalPaise)}
              </span>
              {quote.discountAmount > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[10.5px] font-bold text-emerald-800">
                  Save {paise(quote.discountAmount)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error / Notice Banners */}
        {paymentError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 rounded-2xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-800 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span className="font-semibold">{paymentError}</span>
            </div>
            {paymentError.toLowerCase().includes("email") && (
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="shrink-0 rounded-xl bg-[#5C1B13] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#48150F] shadow-2xs cursor-pointer"
              >
                Verify Email
              </button>
            )}
          </div>
        )}

        {paymentNotice && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 p-2.5 text-xs text-amber-900 shadow-2xs"
          >
            <span>{paymentNotice}</span>
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C1B13] block">
            Select Payment Method
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Wallet Option */}
            <button
              type="button"
              onClick={() => setMethod("WALLET")}
              aria-pressed={method === "WALLET"}
              className={`relative flex items-start gap-3 rounded-2xl border-2 p-3 sm:p-3.5 text-left transition-all cursor-pointer shadow-2xs ${
                method === "WALLET"
                  ? "border-[#5C1B13] bg-white ring-4 ring-[#5C1B13]/10 shadow-sm"
                  : "border-[#E8DFD4] bg-[#FDFBF7] hover:border-[#5C1B13]/40 hover:bg-white"
              }`}
            >
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
                  <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F8E94E] text-[#5C1B13]">
                    Instant
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[#715E50]">Balance:</span>
                  <span className="font-bold font-mono text-[#5C1B13]">
                    {walletLoading ? "..." : paise(walletBalancePaise)}
                  </span>
                </div>
                <span className="text-[10.5px] text-[#715E50]/80 block">
                  UPI • Cards • NetBanking supported
                </span>
              </div>
            </button>

            {/* 2. Cash on Delivery Option */}
            <button
              type="button"
              onClick={() => setMethod("CASH")}
              aria-pressed={method === "CASH"}
              className={`relative flex items-start gap-3 rounded-2xl border-2 p-3 sm:p-3.5 text-left transition-all cursor-pointer shadow-2xs ${
                method === "CASH"
                  ? "border-[#5C1B13] bg-white ring-4 ring-[#5C1B13]/10 shadow-sm"
                  : "border-[#E8DFD4] bg-[#FDFBF7] hover:border-[#5C1B13]/40 hover:bg-white"
              }`}
            >
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
                <span className="text-xs sm:text-[13px] font-bold text-[#24130F] flex items-center gap-1.5">
                  <LuBanknote className="h-4 w-4 text-[#5C1B13] shrink-0" />
                  <span>Cash on Delivery</span>
                </span>
                <p className="text-xs text-[#715E50] pt-0.5">
                  Top up cash directly to delivery partner
                </p>
                <span className="text-[10.5px] text-[#715E50]/80 block">
                  Collected on 1st morning delivery
                </span>
              </div>
            </button>
          </div>

          {/* WALLET BREAKDOWN & REMAINING TOP-UP CALLOUT */}
          {method === "WALLET" && !walletLoading && (
            <>
              {walletBelowPlanTotal && hasWalletBalance ? (
                /* User has partial wallet balance: Show remaining top-up calculation */
                <div className="rounded-2xl border border-amber-200/90 bg-[#FFFDF7] p-3.5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#E8DFD4]/80">
                    <span className="text-[#715E50]">Plan Total Amount:</span>
                    <span className="font-semibold text-[#24130F]">{paise(totalPaise)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#E8DFD4]/80">
                    <span className="text-[#715E50] flex items-center gap-1.5">
                      <LuWallet className="h-4 w-4 text-emerald-700 shrink-0" />
                      <span>Existing Wallet Balance:</span>
                    </span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {paise(walletBalancePaise)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C1B13] block">
                        Remaining Balance to Add
                      </span>
                      <span className="text-[10.5px] text-[#715E50]">
                        (Top up only remainder, not full {paise(totalPaise)})
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-black font-mono text-[#5C1B13] bg-[#F8E94E] px-2.5 py-0.5 rounded-lg shadow-2xs">
                      +{paise(shortfallPaise)}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#715E50] leading-snug pt-1.5 border-t border-[#E8DFD4]/60">
                    You already have <strong>{paise(walletBalancePaise)}</strong> in your wallet.
                    You only need to add <strong className="text-[#5C1B13]">{paise(shortfallPaise)}</strong> to ensure uninterrupted daily milk deliveries.
                  </p>
                </div>
              ) : isWalletSufficient ? (
                /* User has full balance */
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-start gap-2.5 text-xs text-emerald-900 shadow-2xs">
                  <FiCheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Sufficient Balance Available</span>
                    <span className="text-xs text-emerald-800">
                      Your wallet has {paise(walletBalancePaise)}, which covers this entire plan ({paise(totalPaise)}). Deliveries will be charged per delivery.
                    </span>
                  </div>
                </div>
              ) : (
                /* Zero balance */
                <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF7F2] p-3 text-xs text-[#715E50] space-y-1">
                  <span className="font-bold text-[#24130F] block">Pay-as-you-drink Wallet:</span>
                  <p className="text-[11.5px] leading-relaxed">
                    Nothing is locked up permanently. Deliveries are deducted from your Purety wallet only on the morning they are delivered at your doorstep. Plan total: <strong>{paise(totalPaise)}</strong>.
                  </p>
                </div>
              )}
            </>
          )}

          {method === "CASH" && (
            <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF7F2] p-3.5 text-xs text-[#715E50] space-y-1">
              <span className="font-bold text-[#24130F] block">Doorstep Cash Collection:</span>
              <p className="text-[11.5px] leading-relaxed">
                {hasWalletBalance
                  ? `Your wallet currently has ${paise(walletBalancePaise)}. Our delivery partner can collect either the remaining ${paise(shortfallPaise)} or cash to top up your wallet during milk delivery.`
                  : `Our delivery partner will collect cash to top up your Purety wallet during your first morning delivery.`}
              </p>
            </div>
          )}

          {/* Action Button Area */}
          <div className="pt-2 space-y-2.5">
            {method === "WALLET" ? (
              walletBelowPlanTotal ? (
                /* Shortfall Action Area: Primary action is adding remaining balance online */
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={paymentSubmitting}
                    onClick={handleOnlinePaymentClick}
                    className="h-11 sm:h-12 w-full rounded-xl bg-[#5C1B13] hover:bg-[#48150F] active:scale-[0.98] text-xs sm:text-[13.5px] font-bold text-white cursor-pointer disabled:opacity-60 shadow-md shadow-[#5C1B13]/25 hover:shadow-lg hover:shadow-[#5C1B13]/35 transition-all"
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
                          : hasWalletBalance
                          ? `Add Remaining ${paise(shortfallPaise)} Online`
                          : `Add ${paise(totalPaise)} Online & Activate`}
                      </span>
                    </div>
                  </Button>

                  <div className="flex items-center justify-between px-1 text-xs pt-0.5">
                    <button
                      type="button"
                      disabled={paymentSubmitting}
                      onClick={onPayFromWallet}
                      className="font-bold text-[#5C1B13] hover:underline cursor-pointer disabled:opacity-50 text-left"
                    >
                      {hasWalletBalance
                        ? `Or confirm with existing wallet (${paise(walletBalancePaise)}) →`
                        : `Confirm Plan (Pay per delivery) →`}
                    </button>
                    <a
                      href={walletUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#715E50] hover:text-[#5C1B13] hover:underline text-right"
                    >
                      Add in Wallet page ↗
                    </a>
                  </div>
                </div>
              ) : (
                /* Full Balance Available: Normal wallet confirmation */
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={paymentSubmitting}
                  onClick={onPayFromWallet}
                  className="h-11 sm:h-12 w-full rounded-xl bg-[#5C1B13] hover:bg-[#48150F] active:scale-[0.98] text-xs sm:text-[13.5px] font-bold text-white cursor-pointer disabled:opacity-60 shadow-md shadow-[#5C1B13]/25 hover:shadow-lg hover:shadow-[#5C1B13]/35 transition-all"
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
                        : "Confirm Plan — Charged per Delivery"}
                    </span>
                  </div>
                </Button>
              )
            ) : (
              /* Cash on Delivery Button */
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={paymentSubmitting}
                onClick={onPayCash}
                className="h-11 sm:h-12 w-full rounded-xl bg-[#5C1B13] hover:bg-[#48150F] active:scale-[0.98] text-xs sm:text-[13.5px] font-bold text-white cursor-pointer disabled:opacity-60 shadow-md shadow-[#5C1B13]/25 hover:shadow-lg hover:shadow-[#5C1B13]/35 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  {paymentSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LuBanknote className="h-4 w-4" />
                  )}
                  <span>
                    {paymentSubmitting
                      ? "Registering Order..."
                      : "Confirm Plan — Pay by Cash Top-up"}
                  </span>
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      {isEmailModalOpen && (
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
      )}

      {/* Footer Trust Guarantee */}
      <footer className="pt-3 border-t border-[#E8DFD4] flex items-center justify-between text-xs text-[#715E50]">
        <div className="flex items-center gap-1.5 font-medium">
          <FiShield className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>100% Satisfaction Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
          <FiLock className="w-3.5 h-3.5 shrink-0" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </footer>
    </m.section>
  );
}

export const PaymentStep = React.memo(PaymentStepComponent);
