"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PlanDefinition } from "@/features/plans";
import { PlanQuote } from "@/features/plans/api/plansApi";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

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
  if (!quote) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <FiAlertCircle className="h-6 w-6 text-[#7a2417]" />
        <p className="text-sm font-semibold text-[#24130f]">
          No pending plan to pay for.
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onBackToPlans}
          className="rounded-xl bg-[#7a2417] px-4 text-xs"
        >
          Back to plans
        </Button>
      </div>
    );
  }

  const totalPaise = quote.totalSellingAmount;
  const sufficient = walletBalancePaise >= totalPaise;
  const shortfallPaise = Math.max(totalPaise - walletBalancePaise, 0);
  const isFirstTopup = !walletAutoCredit;

  return (
    <m.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col gap-3"
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-serif text-base font-bold text-[#24130f] sm:text-lg lg:text-xl">
            Pay for your plan
          </h1>
          <p className="text-[11px] text-[#715e50] sm:text-xs">
            Choose how you want to pay. First online top-ups wait for a quick
            admin check before the wallet is credited.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToPlans}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#7a2417] transition-colors hover:bg-[#7a2417]/10 cursor-pointer"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          <span>Change plan</span>
        </button>
      </header>

      {/* Summary card */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-3.5 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              {plan?.name || quote.plan}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[#3A241C]/80">
              {quote.deliveryOccurrences} delivery
              {quote.deliveryOccurrences === 1 ? "" : "ies"} · {quote.totalLitres}L total
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif text-xl font-bold text-[#5C1B13] sm:text-2xl">
              {paise(totalPaise)}
            </p>
            {quote.discountAmount > 0 && (
              <p className="text-[10.5px] text-emerald-700">
                You save {paise(quote.discountAmount)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wallet status */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF8F5] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#5C1B13]/10 p-2 text-[#5C1B13]">
              <LuWallet className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                Your wallet
              </p>
              <p className="font-mono text-base font-bold text-[#1A1008]">
                {walletLoading ? "..." : paise(walletBalancePaise)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReloadWallet}
            disabled={walletLoading}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C1B13] hover:underline cursor-pointer disabled:opacity-60"
          >
            <FiRefreshCw className={`h-3 w-3 ${walletLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
        {!sufficient && (
          <p className="mt-2 text-[11px] text-[#715e50]">
            You need {paise(shortfallPaise)} more to cover this plan from wallet.
          </p>
        )}
      </div>

      {paymentNotice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-[11.5px] text-sky-900"
        >
          <FiClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
          <span>{paymentNotice}</span>
        </div>
      )}

      {paymentError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[11.5px] text-red-700"
        >
          <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Payment options */}
      <div className="flex flex-col gap-2.5">
        {/* Option 1: Pay from wallet */}
        <button
          type="button"
          disabled={paymentSubmitting || !sufficient}
          onClick={onPayFromWallet}
          className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
            sufficient
              ? "border-[#5C1B13] bg-[#5C1B13] text-white hover:bg-[#48150f]"
              : "border-[#E8DFD4] bg-white text-[#1A1008] opacity-60"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`rounded-xl p-2 ${
                sufficient ? "bg-white/15 text-white" : "bg-[#FAF3EA] text-[#5C1B13]"
              }`}
            >
              <FiCheckCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold">Pay from wallet</p>
              <p className={`text-[10.5px] ${sufficient ? "text-white/80" : "text-[#715e50]"}`}>
                {sufficient
                  ? `Deducts ${paise(totalPaise)} and starts deliveries immediately.`
                  : "Not enough balance — top up first below."}
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold">{paise(totalPaise)}</span>
        </button>

        {/* Option 2: Pay online (top up wallet via PayU) */}
        <button
          type="button"
          disabled={paymentSubmitting}
          onClick={onPayOnline}
          className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#E8DFD4] bg-white p-3.5 text-left text-[#1A1008] hover:border-[#5C1B13]/40 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-[#FAF3EA] p-2 text-[#5C1B13]">
              <FiCreditCard className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold">
                {sufficient ? "Add more money (optional)" : "Pay online via PayU"}
              </p>
              <p className="text-[10.5px] text-[#715e50]">
                {isFirstTopup
                  ? "First top-up is reviewed by admin. You will see ‘Payment Successful · Wallet Credit Pending Admin Approval’; the plan activates automatically once approved."
                  : "Verified top-ups credit your wallet instantly, then your plan is paid from it."}
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold">
            {sufficient ? paise(10000) : paise(Math.max(shortfallPaise, 10000))}
          </span>
        </button>

        {/* Option 3: Cash on delivery */}
        <button
          type="button"
          disabled={paymentSubmitting}
          onClick={onPayCash}
          className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#E8DFD4] bg-white p-3.5 text-left text-[#1A1008] hover:border-[#5C1B13]/40 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-[#FAF3EA] p-2 text-[#5C1B13]">
              <FiDollarSign className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold">Pay cash on delivery</p>
              <p className="text-[10.5px] text-[#715e50]">
                Our partner collects {paise(totalPaise)} in cash. Deliveries start
                once the admin confirms the collection.
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold">{paise(totalPaise)}</span>
        </button>
      </div>

      {paymentSubmitting && (
        <p className="text-center text-[11px] font-semibold text-[#715e50]">
          Processing...
        </p>
      )}
    </m.section>
  );
}
