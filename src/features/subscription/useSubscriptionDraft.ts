"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DeliveryFrequency,
  DeliveryMode,
  SubscriptionDraft,
  SubscriptionCustomizationPayload,
  PricingResult,
  DeliveryDatePreviewItem,
} from "./types";
import {
  calculateSubscriptionPricing,
  getDeliverySchedulePreview,
  sanitizeLitres,
  MIN_LITRES,
  MAX_LITRES,
} from "./pricing";

export const DRAFT_STORAGE_KEY = "pf_subscription_draft_v2";

const DEFAULT_DRAFT: SubscriptionDraft = {
  frequency: "daily",
  mode: "fixed",
  fixedLitres: 1,
  day1Litres: 1,
  day2Litres: 2,
  updatedAt: new Date().toISOString(),
};

export interface UseSubscriptionDraftOptions {
  onConfirm?: (
    result: PricingResult,
    draft: SubscriptionDraft,
    payload: SubscriptionCustomizationPayload
  ) => Promise<void> | void;
  mockSubmission?: boolean;
  startDate?: Date | string;
}

export function useSubscriptionDraft(options?: UseSubscriptionDraftOptions) {
  const { onConfirm, mockSubmission = true, startDate } = options || {};

  const [frequency, setFrequency] = useState<DeliveryFrequency>(DEFAULT_DRAFT.frequency);
  const [mode, setMode] = useState<DeliveryMode>(DEFAULT_DRAFT.mode);
  const [fixedLitres, setFixedLitres] = useState<number>(DEFAULT_DRAFT.fixedLitres);
  const [day1Litres, setDay1Litres] = useState<number>(DEFAULT_DRAFT.day1Litres);
  const [day2Litres, setDay2Litres] = useState<number>(DEFAULT_DRAFT.day2Litres);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  // 1. Load draft from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed: Partial<SubscriptionDraft> = JSON.parse(stored);
        if (parsed.frequency === "daily" || parsed.frequency === "alternate") {
          setFrequency(parsed.frequency);
        }
        if (parsed.mode === "fixed" || parsed.mode === "pattern") {
          setMode(parsed.mode);
        }
        if (typeof parsed.fixedLitres === "number") {
          setFixedLitres(sanitizeLitres(parsed.fixedLitres, 1).clamped);
        }
        if (typeof parsed.day1Litres === "number") {
          setDay1Litres(sanitizeLitres(parsed.day1Litres, 1).clamped);
        }
        if (typeof parsed.day2Litres === "number") {
          setDay2Litres(sanitizeLitres(parsed.day2Litres, 2).clamped);
        }
      }
    } catch {
      // Storage unavailable or invalid JSON; use default
    } finally {
      setHasLoadedDraft(true);
    }
  }, []);

  // 2. Persist draft whenever choices change
  useEffect(() => {
    if (!hasLoadedDraft) return;
    try {
      const draft: SubscriptionDraft = {
        frequency,
        mode,
        fixedLitres,
        day1Litres,
        day2Litres,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage quota or restriction
    }
  }, [hasLoadedDraft, frequency, mode, fixedLitres, day1Litres, day2Litres]);

  // 3. Compute derived pricing result strictly through pure pricing function
  const pricingResult = useMemo<PricingResult>(() => {
    return calculateSubscriptionPricing({
      frequency,
      mode,
      fixedLitres,
      day1Litres,
      day2Litres,
    });
  }, [frequency, mode, fixedLitres, day1Litres, day2Litres]);

  // 4. Compute first 4 delivery dates preview
  const schedulePreview = useMemo<DeliveryDatePreviewItem[]>(() => {
    return getDeliverySchedulePreview(
      frequency,
      mode,
      fixedLitres,
      day1Litres,
      day2Litres,
      startDate
    );
  }, [frequency, mode, fixedLitres, day1Litres, day2Litres, startDate]);

  // 5. Safe setters enforcing MIN_LITRES (1) and MAX_LITRES (5)
  const handleSetFrequency = useCallback((freq: DeliveryFrequency) => {
    setFrequency(freq);
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  const handleSetMode = useCallback((m: DeliveryMode) => {
    setMode(m);
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  const handleSetFixedLitres = useCallback((qty: number) => {
    const check = sanitizeLitres(qty, 1);
    setFixedLitres(check.clamped);
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  const handleSetDay1Litres = useCallback((qty: number) => {
    const check = sanitizeLitres(qty, 1);
    setDay1Litres(check.clamped);
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  const handleSetDay2Litres = useCallback((qty: number) => {
    const check = sanitizeLitres(qty, 2);
    setDay2Litres(check.clamped);
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  const resetSuccess = useCallback(() => {
    setIsSuccess(false);
  }, []);

  // 6. Submit handler with double-submit guard
  const handleConfirmSubscription = useCallback(async () => {
    if (isSubmitting) return; // Guard against double submission

    setIsSubmitting(true);
    setSubmitError(null);

    const currentDraft: SubscriptionDraft = {
      frequency,
      mode,
      fixedLitres,
      day1Litres,
      day2Litres,
      updatedAt: new Date().toISOString(),
    };

    const payload: SubscriptionCustomizationPayload = {
      frequency,
      mode,
      fixedLitres: mode === "fixed" ? fixedLitres : undefined,
      day1Litres: mode === "pattern" ? day1Litres : undefined,
      day2Litres: mode === "pattern" ? day2Litres : undefined,
      clientTotalAmount: pricingResult.totalPrice,
      clientTotalLitres: pricingResult.totalLitres,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (onConfirm) {
        await onConfirm(pricingResult, currentDraft, payload);
      } else if (mockSubmission) {
        // Mock debounce
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to confirm subscription plan.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    frequency,
    mode,
    fixedLitres,
    day1Litres,
    day2Litres,
    pricingResult,
    onConfirm,
    mockSubmission,
  ]);

  return {
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
    hasLoadedDraft,
    minLitres: MIN_LITRES,
    maxLitres: MAX_LITRES,
    setFrequency: handleSetFrequency,
    setMode: handleSetMode,
    setFixedLitres: handleSetFixedLitres,
    setDay1Litres: handleSetDay1Litres,
    setDay2Litres: handleSetDay2Litres,
    resetSuccess,
    confirmSubscription: handleConfirmSubscription,
  };
}
