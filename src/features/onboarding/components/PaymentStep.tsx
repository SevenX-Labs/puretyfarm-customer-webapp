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
  FiClock,
  FiDollarSign,
  FiPlusCircle,
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
          className="rounded-xl bg-[#7a2417] px-4 text-xs cursor-pointer"
        >
          Back to plans
        </Button>
      </div>
    );
  }

  const totalPaise = quote.totalSellingAmount;
  const sufficient = walletBalancePaise >= totalPaise;
  const shortfallPaise = Math.max(totalPaise - walletBalancePaise, 0);
  // Backend minimum top-up is ₹100 (10000 paise)
  const topupPaise = Math.max(shortfallPaise, 10000);
  const isFirstTopup = !walletAutoCredit;

  const planTitle =
    plan?.name?.toUpperCase() ||
    (quote.deliveryOccurrences === 1
      ? "BUY ONCE (1 LITRE)"
      : quote.deliveryOccurrences === 7
      ? "7-DAY TRIAL PLAN"
      : "MONTHLY SUBSCRIPTION");

  return (
    <m.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col justify-between"
    >
      <div className="space-y-2.5 sm:space-y-3">
        {/* Header */}
        <header className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#24130f] lg:text-[22px]">
              Pay for your plan
            </h1>
            <p className="mt-0.5 text-[11px] text-[#715e50] sm:text-xs">
              Choose Wallet or Cash. If your wallet is short, add money online — your plan is paid from the wallet right after.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToPlans}
            className="inline-flex min-h-7 shrink-0 items-center gap-1.5 text-[11.5px] font-semibold text-[#7a2417] transition-colors hover:text-[#5f1b12] cursor-pointer"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Change plan</span>
          </button>
        </header>

        {/* Selected Plan Summary Banner */}
        <div className="flex items-center justify-between rounded-xl border border-[#e8dfd4] bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xs">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#715e50] sm:text-[11px]">
              {planTitle}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#24130f]/80">
              {quote.deliveryOccurrences} delivery{quote.deliveryOccurrences === 1 ? "" : "ies"} · {quote.totalLitres}L total
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#5C1B13]">
              {paise(totalPaise)}
            </p>
            {quote.discountAmount > 0 && (
              <p className="text-[10.5px] font-medium text-emerald-700">
                You save {paise(quote.discountAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Method Toggle: Wallet | Cash on delivery */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("WALLET")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              method === "WALLET"
                ? "border-[#5C1B13] bg-[#5C1B13] text-white"
                : "border-[#e8dfd4] bg-white text-[#24130f] hover:border-[#5C1B13]/40"
            }`}
          >
            <LuWallet className="h-4 w-4" />
            <span>Wallet</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod("CASH")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              method === "CASH"
                ? "border-[#5C1B13] bg-[#5C1B13] text-white"
                : "border-[#e8dfd4] bg-white text-[#24130f] hover:border-[#5C1B13]/40"
            }`}
          >
            <FiDollarSign className="h-4 w-4" />
            <span>Cash on delivery</span>
          </button>
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

        {/* WALLET METHOD PANEL */}
        {method === "WALLET" && (
          <div className="space-y-2.5">
            {/* Wallet balance box */}
            <div className="rounded-xl border border-[#e8dfd4] bg-[#faf8f5] p-3 sm:p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-[#5C1B13]/10 p-2 text-[#5C1B13]">
                    <LuWallet className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                      Your wallet balance
                    </p>
                    <p className="font-mono text-base font-bold text-[#24130f]">
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
                  <FiRefreshCw
                    className={`h-3 w-3 ${walletLoading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
              </div>
              {!sufficient && (
                <p className="mt-2 text-[11px] text-[#715e50]">
                  You need <strong>{paise(shortfallPaise)}</strong> more. Add it
                  online below and the plan is auto-paid from your wallet.
                </p>
              )}
            </div>

            {/* Action button: Pay from Wallet OR Add Money via PayU */}
            {sufficient ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={paymentSubmitting}
                onClick={onPayFromWallet}
                className="h-10 sm:h-11 w-full rounded-xl bg-[#5C1B13] text-xs font-bold text-white hover:bg-[#48150f] cursor-pointer disabled:opacity-60 shadow-xs"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiCheckCircle className="h-4 w-4" />
                  <span>
                    {paymentSubmitting
                      ? "Confirming..."
                      : `Pay ${paise(totalPaise)} from Wallet`}
                  </span>
                </div>
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={paymentSubmitting}
                  onClick={onPayOnline}
                  className="h-10 sm:h-11 w-full rounded-xl bg-[#5C1B13] text-xs font-bold text-white hover:bg-[#48150f] cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiPlusCircle className="h-4 w-4" />
                    <span>
                      {paymentSubmitting
                        ? "Redirecting to PayU..."
                        : `Add ${paise(topupPaise)} via PayU`}
                    </span>
                  </div>
                </Button>

                <div className="rounded-xl border border-[#e8dfd4] bg-white p-2.5 sm:p-3 text-[11px] leading-relaxed text-[#715e50]">
                  <p className="font-semibold text-[#24130f]">What happens next</p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                    <li>You pay {paise(topupPaise)} on PayU and return here.</li>
                    <li>
                      {isFirstTopup ? (
                        <>
                          First top-up: you&apos;ll see <em>&ldquo;Payment Successful · Wallet Credit Pending Admin Approval&rdquo;</em>. Once admin approves, your wallet is credited and the plan is paid automatically.
                        </>
                      ) : (
                        <>
                          Wallet credits instantly, then {paise(totalPaise)} is debited for your plan.
                        </>
                      )}
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CASH METHOD PANEL */}
        {method === "CASH" && (
          <div className="space-y-2.5">
            <div className="rounded-xl border border-[#e8dfd4] bg-[#faf8f5] p-3 sm:p-3.5 text-[11.5px] leading-relaxed text-[#3a241c]/90">
              Our delivery partner collects <strong>{paise(totalPaise)}</strong> in
              cash. Your deliveries start as soon as the admin confirms the
              collection.
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={paymentSubmitting}
              onClick={onPayCash}
              className="h-10 sm:h-11 w-full rounded-xl bg-[#5C1B13] text-xs font-bold text-white hover:bg-[#48150f] cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <div className="flex items-center justify-center gap-2">
                <FiDollarSign className="h-4 w-4" />
                <span>
                  {paymentSubmitting
                    ? "Requesting..."
                    : `Confirm Cash on Delivery (${paise(totalPaise)})`}
                </span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </m.section>
  );
}
