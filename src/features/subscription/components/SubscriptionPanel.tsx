"use client";

import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useSubscriptionDraft } from "../useSubscriptionDraft";
import { FrequencyRadioGroup } from "./FrequencyRadioGroup";
import { ModeSegmentedControl } from "./ModeSegmentedControl";
import { QuantityStepper } from "./QuantityStepper";
import { PricingSummary } from "./PricingSummary";
import {
  PricingResult,
  SubscriptionDraft,
  SubscriptionCustomizationPayload,
} from "../types";

export interface SubscriptionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPlan?: (
    result: PricingResult,
    draft: SubscriptionDraft,
    payload: SubscriptionCustomizationPayload
  ) => Promise<void> | void;
  title?: string;
  startDate?: Date | string;
  inline?: boolean;
}

export function SubscriptionPanel({
  isOpen,
  onClose,
  onConfirmPlan,
  title = "Customize Milk Delivery Schedule",
  startDate,
  inline = false,
}: SubscriptionPanelProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    frequency,
    mode,
    fixedLitres,
    day1Litres,
    day2Litres,
    pricingResult,
    schedulePreview,
    isSubmitting,
    submitError,
    isSuccess,
    setFrequency,
    setMode,
    setFixedLitres,
    setDay1Litres,
    setDay2Litres,
    confirmSubscription,
    resetSuccess,
  } = useSubscriptionDraft({
    onConfirm: async (result, draft, payload) => {
      if (onConfirmPlan) {
        await onConfirmPlan(result, draft, payload);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    },
    mockSubmission: true,
    startDate,
  });

  // 1. Return focus on close & Body scroll lock (mobile only) & Save initial focus
  useEffect(() => {
    if (!isOpen) return;

    resetSuccess();
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Body scroll lock on mobile only (<768px)
    let originalOverflow = "";
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    // Set initial focus inside dialog
    const timer = setTimeout(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]:not([disabled])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 60);

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined" && originalOverflow) {
        document.body.style.overflow = originalOverflow;
      }
      if (
        previouslyFocusedElement.current &&
        typeof previouslyFocusedElement.current.focus === "function"
      ) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, resetSuccess]);

  // 2. Focus Trap & Escape key listener
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (!isSubmitting) {
        onClose();
      }
      return;
    }

    if (e.key === "Tab") {
      if (!dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]:not([disabled])'
        )
      );

      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (inline) {
    if (!isOpen) return null;
    return (
      <div
        ref={dialogRef}
        role="region"
        aria-label={title}
        className="w-full flex flex-col space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DFD4] gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#5C1B13] uppercase tracking-wider block">
              PuretyFarm Schedule Customization
            </span>
            <h3
              id="subscription-inline-title"
              className="text-base sm:text-lg font-serif font-bold text-[#1A1008] truncate"
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close schedule customization"
            className="w-10 h-10 rounded-xl border border-[#E8DFD4] flex items-center justify-center text-[#1A1008] hover:bg-[#FAF3EA] transition-colors cursor-pointer shrink-0 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Delivery Frequency */}
        <FrequencyRadioGroup
          value={frequency}
          onChange={setFrequency}
          disabled={isSubmitting}
        />

        {/* 2. Quantity Pattern Mode */}
        <ModeSegmentedControl
          value={mode}
          onChange={setMode}
          day1Litres={day1Litres}
          day2Litres={day2Litres}
          disabled={isSubmitting}
        />

        {/* 3. Quantity Steppers */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#1A1008] uppercase tracking-wider block">
            {mode === "pattern" ? "Delivery Volume by Sequence" : "Daily Delivery Volume"}
          </label>

          {mode === "fixed" ? (
            <QuantityStepper
              label="Delivery Volume"
              sublabel={
                frequency === "daily"
                  ? "Same litres delivered every single day"
                  : "Same litres delivered every alternate day"
              }
              value={fixedLitres}
              onChange={setFixedLitres}
              showChips={true}
              disabled={isSubmitting}
            />
          ) : (
            <div className="space-y-3">
              <QuantityStepper
                label="Day 1 Delivery"
                sublabel={
                  frequency === "daily"
                    ? "Day 1: odd days (1st, 3rd, 5th delivery...)"
                    : "Day 1: 1st, 3rd, 5th... delivery"
                }
                value={day1Litres}
                onChange={setDay1Litres}
                showChips={true}
                disabled={isSubmitting}
              />

              <QuantityStepper
                label="Day 2 Delivery"
                sublabel={
                  frequency === "daily"
                    ? "Day 2: even days (2nd, 4th, 6th...)"
                    : "Day 2: 2nd, 4th, 6th... delivery"
                }
                value={day2Litres}
                onChange={setDay2Litres}
                showChips={true}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* 4. Pricing Summary & 4-Delivery Date Preview */}
        <PricingSummary
          result={pricingResult}
          schedulePreview={schedulePreview}
        />

        {/* Error Alert if any */}
        {submitError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5"
          >
            <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Footer with Total and Primary CTA */}
        <div className="pt-4 border-t border-[#E8DFD4] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A241C]/70 block">
              30-Day Plan Total
            </span>
            <span className="text-xl sm:text-2xl font-serif font-extrabold text-[#5C1B13] font-mono leading-none block mt-0.5">
              ₹{pricingResult.totalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8DFD4] text-xs font-bold text-[#3A241C] hover:bg-[#FAF3EA] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={confirmSubscription}
              disabled={isSubmitting || !pricingResult.isValid}
              aria-label={`Confirm and apply schedule for ₹${pricingResult.totalPrice.toLocaleString("en-IN")}`}
              className={`
                min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all
                flex items-center justify-center gap-2 cursor-pointer shadow-sm
                ${
                  isSuccess
                    ? "bg-emerald-700"
                    : isSubmitting || !pricingResult.isValid
                    ? "bg-[#5C1B13]/70 cursor-not-allowed"
                    : "bg-[#5C1B13] hover:bg-[#48150f] active:scale-[0.99]"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isSuccess ? (
                <>
                  <FiCheck className="w-4 h-4 stroke-[3]" />
                  <span>Schedule Saved!</span>
                </>
              ) : (
                <span>
                  Apply (₹{pricingResult.totalPrice.toLocaleString("en-IN")})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Backdrop: translucent on mobile/tablet (<1024px), transparent on desktop (>=1024px)
              Ensures the subscription card on desktop remains completely unobstructed */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 lg:bg-transparent pointer-events-auto transition-colors cursor-default"
          />

          {/* Right-docked drawer on desktop (w-[460px]), bottom-sheet on mobile (<768px) */}
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-panel-title"
            onKeyDown={handleKeyDown}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : isMobile
                ? { y: "100%", opacity: 1 }
                : { x: "100%", opacity: 1 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : isMobile
                ? { y: 0, opacity: 1 }
                : { x: 0, opacity: 1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : isMobile
                ? { y: "100%", opacity: 1 }
                : { x: "100%", opacity: 1 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { type: "spring", damping: 28, stiffness: 260 }
            }
            className={`
              fixed z-50 pointer-events-auto bg-white border-[#E8DFD4] shadow-2xl flex flex-col outline-none
              ${
                /* Mobile: Bottom-sheet style; Desktop: Right-docked full height drawer */
                isMobile
                  ? "bottom-0 left-0 right-0 max-h-[92vh] rounded-t-3xl border-t"
                  : "top-0 right-0 bottom-0 h-full w-[460px] max-w-[100vw] border-l"
              }
            `}
          >
            {/* Header - Sticky */}
            <div className="p-4 sm:p-5 border-b border-[#E8DFD4] flex items-center justify-between gap-3 bg-[#FFFDF7] shrink-0">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#5C1B13] uppercase tracking-wider block">
                  PuretyFarm Schedule Customization
                </span>
                <h2
                  id="subscription-panel-title"
                  className="text-base sm:text-lg font-serif font-bold text-[#1A1008] truncate"
                >
                  {title}
                </h2>
              </div>

              {/* Close Button - min 44x44px tap target */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close subscription customize panel"
                className="w-11 h-11 rounded-xl border border-[#E8DFD4] flex items-center justify-center text-[#1A1008] hover:bg-[#FAF3EA] transition-colors cursor-pointer shrink-0 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 overscroll-contain">
              {/* 1. Delivery Frequency (Every day vs Alternate days) */}
              <FrequencyRadioGroup
                value={frequency}
                onChange={setFrequency}
                disabled={isSubmitting}
              />

              {/* 2. Quantity Pattern Mode (Fixed vs Day 1 -> Day 2) */}
              <ModeSegmentedControl
                value={mode}
                onChange={setMode}
                day1Litres={day1Litres}
                day2Litres={day2Litres}
                disabled={isSubmitting}
              />

              {/* 3. Quantity Steppers based on mode */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1A1008] uppercase tracking-wider block">
                  {mode === "pattern" ? "Delivery Volume by Sequence" : "Daily Delivery Volume"}
                </label>

                {mode === "fixed" ? (
                  <QuantityStepper
                    label="Delivery Volume"
                    sublabel={
                      frequency === "daily"
                        ? "Same litres delivered every single day"
                        : "Same litres delivered every alternate day"
                    }
                    value={fixedLitres}
                    onChange={setFixedLitres}
                    showChips={true}
                    disabled={isSubmitting}
                  />
                ) : (
                  <div className="space-y-3">
                    <QuantityStepper
                      label="Day 1 Delivery"
                      sublabel={
                        frequency === "daily"
                          ? "Day 1: odd days (1st, 3rd, 5th delivery...)"
                          : "Day 1: 1st, 3rd, 5th... delivery"
                      }
                      value={day1Litres}
                      onChange={setDay1Litres}
                      showChips={true}
                      disabled={isSubmitting}
                    />

                    <QuantityStepper
                      label="Day 2 Delivery"
                      sublabel={
                        frequency === "daily"
                          ? "Day 2: even days (2nd, 4th, 6th...)"
                          : "Day 2: 2nd, 4th, 6th... delivery"
                      }
                      value={day2Litres}
                      onChange={setDay2Litres}
                      showChips={true}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>

              {/* 4. Pricing Summary & 4-Delivery Date Preview */}
              <PricingSummary
                result={pricingResult}
                schedulePreview={schedulePreview}
              />

              {/* Error Alert if any */}
              {submitError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5"
                >
                  <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Sticky Footer with Total and Primary CTA - Never scrolls away */}
            <div className="p-4 sm:p-5 border-t border-[#E8DFD4] bg-[#FFFDF7] shrink-0 flex items-center justify-between gap-3 shadow-lg">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A241C]/70 block">
                  30-Day Plan Total
                </span>
                <span className="text-xl sm:text-2xl font-serif font-extrabold text-[#5C1B13] font-mono leading-none block mt-0.5">
                  ₹{pricingResult.totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8DFD4] text-xs font-bold text-[#3A241C] hover:bg-[#FAF3EA] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmSubscription}
                  disabled={isSubmitting || !pricingResult.isValid}
                  aria-label={`Confirm and apply schedule for ₹${pricingResult.totalPrice.toLocaleString("en-IN")}`}
                  className={`
                    min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all
                    flex items-center justify-center gap-2 cursor-pointer shadow-sm
                    ${
                      isSuccess
                        ? "bg-emerald-700"
                        : isSubmitting || !pricingResult.isValid
                        ? "bg-[#5C1B13]/70 cursor-not-allowed"
                        : "bg-[#5C1B13] hover:bg-[#48150f] active:scale-[0.99]"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <FiCheck className="w-4 h-4 stroke-[3]" />
                      <span>Schedule Saved!</span>
                    </>
                  ) : (
                    <span>
                      Apply Schedule (₹{pricingResult.totalPrice.toLocaleString("en-IN")})
                    </span>
                  )}
                </button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
