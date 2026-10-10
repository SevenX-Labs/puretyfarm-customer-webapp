"use client";

import React, { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  RefreshCw,
} from "lucide-react";
import {
  FrequencyRadioGroup,
  ModeSegmentedControl,
  QuantityStepper,
  PricingSummary,
  useSubscriptionDraft,
} from "@/features/subscription";
import {
  plansApi,
  OrderCutoffPolicy,
} from "@/features/plans/api/plansApi";
import { walletApi } from "@/features/wallet/api/walletApi";
import { CustomerWallet } from "@/features/wallet/types";
import { formatDeliveryWindow } from "@/features/dashboard/utils";

export interface MonthlyUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isMonthlyActive?: boolean;
  deliveryStartTime?: string | null;
  deliveryEndTime?: string | null;
  orderCutoff?: OrderCutoffPolicy | null;
}

export function MonthlyUpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  isMonthlyActive = false,
  deliveryStartTime,
  deliveryEndTime,
  orderCutoff = null,
}: MonthlyUpgradeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "CASH">("WALLET");
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hook encapsulates frequency, mode, volume steppers, debounced quote fetch and pricing calculation
  const {
    frequency,
    mode,
    fixedLitres,
    day1Litres,
    day2Litres,
    pricingResult,
    schedulePreview,
    serverQuote,
    isQuoteLoading,
    quoteError,
    retryQuote,
    setFrequency,
    setMode,
    setFixedLitres,
    setDay1Litres,
    setDay2Litres,
  } = useSubscriptionDraft();

  // Load wallet balance on mount to provide live feedback
  useEffect(() => {
    if (isOpen) {
      walletApi.getWallet().then(setWallet).catch(() => null);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    },
    [submitting, onClose]
  );

  const resolvedDeliveryWindow = formatDeliveryWindow(deliveryStartTime, deliveryEndTime);

  const handleConfirm = async () => {
    if (submitting || isQuoteLoading || !serverQuote || !pricingResult.isValid) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await plansApi.confirmPlanQuote({
        quoteId: serverQuote.quoteId,
        paymentMethod,
      });

      if (res.status === "CONFIRMED" || res.selectionId) {
        setSuccess("Successfully upgraded to Monthly Subscription!");
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1200);
      } else {
        setError(
          res.message ||
            "Failed to confirm plan. Please check wallet balance or choose Doorstep Cash."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to confirm upgrade. Please check your connection and try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const walletBalanceRupees = wallet ? wallet.balancePaise / 100 : 0;
  const isWalletInsufficient =
    paymentMethod === "WALLET" &&
    wallet !== null &&
    walletBalanceRupees < pricingResult.totalPrice;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      onKeyDown={handleKeyDown}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-xl sm:max-w-2xl max-h-[88vh] sm:max-h-[85vh] rounded-3xl bg-white border border-[#E8DFD4] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8DFD4] bg-[#FFFDF7] shrink-0">
          <div className="min-w-0 pr-3">
            <h3
              id="upgrade-modal-title"
              className="text-base sm:text-lg font-bold text-[#1A1008] flex items-center gap-2 truncate"
            >
              <span className="w-7 h-7 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </span>
              <span>{isMonthlyActive ? "Modify Monthly Subscription" : "Upgrade to Monthly Plan"}</span>
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5 truncate">
              Customize schedule, daily volume & payment method
              {resolvedDeliveryWindow ? ` (${resolvedDeliveryWindow})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close upgrade modal"
            className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-5 sm:px-6 py-4.5 overflow-y-auto min-h-0 flex-1 space-y-5 custom-scrollbar overscroll-contain">
          {/* Alerts */}
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertCircle size={17} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Delivery Frequency */}
          <FrequencyRadioGroup
            value={frequency}
            onChange={setFrequency}
            disabled={submitting}
          />

          {/* 2. Quantity Pattern Mode */}
          <ModeSegmentedControl
            value={mode}
            onChange={setMode}
            day1Litres={day1Litres}
            day2Litres={day2Litres}
            disabled={submitting}
          />

          {/* 3. Quantity Steppers */}
          {mode === "fixed" ? (
            <QuantityStepper
              label="Daily Delivery Volume"
              sublabel={
                frequency === "daily"
                  ? "Same litres delivered every single day"
                  : "Same litres delivered every alternate day"
              }
              value={fixedLitres}
              onChange={setFixedLitres}
              showChips={true}
              disabled={submitting}
            />
          ) : (
            <div className="space-y-3.5">
              <QuantityStepper
                label="Day 1 Delivery Volume"
                sublabel={
                  frequency === "daily"
                    ? "Day 1: odd days (1st, 3rd, 5th delivery...)"
                    : "Day 1: 1st, 3rd, 5th... delivery"
                }
                value={day1Litres}
                onChange={setDay1Litres}
                showChips={true}
                disabled={submitting}
              />

              <QuantityStepper
                label="Day 2 Delivery Volume"
                sublabel={
                  frequency === "daily"
                    ? "Day 2: even days (2nd, 4th, 6th...)"
                    : "Day 2: 2nd, 4th, 6th... delivery"
                }
                value={day2Litres}
                onChange={setDay2Litres}
                showChips={true}
                disabled={submitting}
              />
            </div>
          )}

          {/* 4. Live Server Quote Breakdown & Schedule Preview */}
          <PricingSummary
            result={pricingResult}
            schedulePreview={schedulePreview}
            isQuoteLoading={isQuoteLoading}
            quoteError={quoteError}
            onRetryQuote={retryQuote}
            deliveryWindow={resolvedDeliveryWindow}
            orderCutoff={orderCutoff}
          />

          {/* 5. Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1008] uppercase tracking-wider block">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                disabled={submitting}
                className={
                  "p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative " +
                  (paymentMethod === "WALLET"
                    ? "border-[#5C1B13] bg-[#FAF3EA] ring-2 ring-[#5C1B13]/10"
                    : "border-[#E8DFD4] bg-white hover:border-[#5C1B13]/40")
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      size={16}
                      className={
                        paymentMethod === "WALLET" ? "text-[#5C1B13]" : "text-[#8C7A6B]"
                      }
                    />
                    <span className="text-xs font-bold text-[#1A1008]">Prepaid Wallet</span>
                  </div>
                  {wallet && (
                    <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      ₹{walletBalanceRupees.toFixed(0)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#715E50]">
                  Instant confirmation & auto-deduction from wallet.
                </p>
                {isWalletInsufficient && (
                  <p className="text-[10.5px] text-amber-700 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>Balance lower than plan total.</span>
                  </p>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                disabled={submitting}
                className={
                  "p-3.5 rounded-2xl border text-left transition-all cursor-pointer " +
                  (paymentMethod === "CASH"
                    ? "border-[#5C1B13] bg-[#FAF3EA] ring-2 ring-[#5C1B13]/10"
                    : "border-[#E8DFD4] bg-white hover:border-[#5C1B13]/40")
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Banknote
                      size={16}
                      className={
                        paymentMethod === "CASH" ? "text-[#5C1B13]" : "text-[#8C7A6B]"
                      }
                    />
                    <span className="text-xs font-bold text-[#1A1008]">Doorstep Cash</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#715E50]">
                  Collect cash on order confirmation at doorstep.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E8DFD4] bg-[#FFFDF7] shrink-0 flex items-center justify-between gap-4 shadow-lg z-10">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#715E50] block">
              Monthly Plan Total
            </span>
            {isQuoteLoading ? (
              <div className="h-6 w-24 bg-[#E8DFD4]/70 animate-pulse rounded-md mt-0.5" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-[#5C1B13] tabular-nums leading-none block mt-0.5">
                ₹{pricingResult.totalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl border border-[#E8DFD4] text-xs font-bold text-[#3A241C] hover:bg-[#FAF3EA] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                submitting ||
                isQuoteLoading ||
                !pricingResult.isValid ||
                !serverQuote ||
                Boolean(quoteError)
              }
              className="min-h-[40px] px-4 sm:px-5 py-2 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Activating...</span>
                </>
              ) : isQuoteLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Updating Quote...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Confirm & Activate (₹{pricingResult.totalPrice.toLocaleString("en-IN")})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
