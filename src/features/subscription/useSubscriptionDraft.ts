"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  buildBreakdown,
  getDeliverySchedulePreview,
  sanitizeLitres,
  MIN_LITRES,
  MAX_LITRES,
} from "./pricing";
import { plansApi, PlanQuote } from "@/features/plans/api/plansApi";

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

  const [serverQuote, setServerQuote] = useState<PlanQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const quoteRequestIdRef = useRef(0);

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
      const draft = {
        frequency,
        mode,
        fixedLitres,
        day1Litres,
        day2Litres,
        lastQuotedPrice: serverQuote ? Math.round(serverQuote.totalSellingAmount / 100) : undefined,
        lastQuotedLitres: serverQuote ? serverQuote.totalLitres : undefined,
        lastDeliveries: serverQuote ? serverQuote.deliveryOccurrences : undefined,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage quota or restriction
    }
  }, [hasLoadedDraft, frequency, mode, fixedLitres, day1Litres, day2Litres, serverQuote]);

  // 3. Fetch server-calculated monthly quote asynchronously (debounced).
  //    Invalidate stale quote immediately and mark loading so UI never presents
  //    an old quote as current while a new selection is in flight.
  useEffect(() => {
    if (!hasLoadedDraft) return;

    setIsQuoteLoading(true);
    setQuoteError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const requestId = ++quoteRequestIdRef.current;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const backendFreq = frequency === "daily" ? "DAILY" : "ALTERNATE_DAYS";
        const backendMode = mode === "fixed" ? "FIXED" : "ALTERNATING";

        const quote = await plansApi.createMonthlyQuote({
          frequency: backendFreq,
          quantityMode: backendMode,
          quantity: mode === "fixed" ? fixedLitres : undefined,
          quantityA: mode === "pattern" ? day1Litres : undefined,
          quantityB: mode === "pattern" ? day2Litres : undefined,
        });

        // Race protection: ignore responses for superseded requests
        if (requestId !== quoteRequestIdRef.current) return;

        if (quote && quote.quoteId) {
          setServerQuote(quote);
          setQuoteError(null);
        } else {
          setQuoteError("Unable to calculate subscription quote.");
        }
      } catch (err: unknown) {
        if (requestId !== quoteRequestIdRef.current) return;
        console.warn("Could not fetch server-side monthly quote:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Could not calculate quote. Please check connection.";
        setQuoteError(msg);
      } finally {
        if (requestId === quoteRequestIdRef.current) {
          setIsQuoteLoading(false);
        }
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [hasLoadedDraft, frequency, mode, fixedLitres, day1Litres, day2Litres, retryTrigger]);

  // 4. Compute derived pricing result (with server quote overrides)
  const pricingResult = useMemo<PricingResult>(() => {
    const local = calculateSubscriptionPricing({
      frequency,
      mode,
      fixedLitres,
      day1Litres,
      day2Litres,
    });

    if (serverQuote) {
      const qtyA = mode === "fixed" ? fixedLitres : day1Litres;
      const qtyB = mode === "fixed" ? fixedLitres : day2Litres;
      const bd = buildBreakdown(
        mode,
        serverQuote.deliveryOccurrences,
        fixedLitres,
        qtyA,
        qtyB
      );

      return {
        ...local,
        totalDeliveries: serverQuote.deliveryOccurrences,
        totalLitres: serverQuote.totalLitres,
        pricePerLitre: Math.round(serverQuote.sellingPricePerLitre / 100),
        totalPrice: Math.round(serverQuote.totalSellingAmount / 100),
        breakdownText: bd.breakdownText,
        oddDeliveriesCount: bd.oddDeliveriesCount,
        evenDeliveriesCount: bd.evenDeliveriesCount,
        isValid: local.isValid && !quoteError,
      };
    }

    return {
      ...local,
      isValid: false,
    };
  }, [frequency, mode, fixedLitres, day1Litres, day2Litres, serverQuote, quoteError]);

  // 5. Compute first 4 delivery dates preview
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

  // Synchronous invalidation helper: immediately activates loading state on user action
  const markQuotePending = useCallback(() => {
    setIsQuoteLoading(true);
    setQuoteError(null);
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  // 6. Safe setters enforcing MIN_LITRES (1) and MAX_LITRES (5)
  const handleSetFrequency = useCallback(
    (freq: DeliveryFrequency) => {
      setFrequency((prev) => {
        if (prev !== freq) {
          markQuotePending();
        }
        return freq;
      });
    },
    [markQuotePending]
  );

  const handleSetMode = useCallback(
    (m: DeliveryMode) => {
      setMode((prev) => {
        if (prev !== m) {
          markQuotePending();
        }
        return m;
      });
    },
    [markQuotePending]
  );

  const handleSetFixedLitres = useCallback(
    (qty: number) => {
      const check = sanitizeLitres(qty, 1);
      setFixedLitres((prev) => {
        if (prev !== check.clamped) {
          markQuotePending();
        }
        return check.clamped;
      });
    },
    [markQuotePending]
  );

  const handleSetDay1Litres = useCallback(
    (qty: number) => {
      const check = sanitizeLitres(qty, 1);
      setDay1Litres((prev) => {
        if (prev !== check.clamped) {
          markQuotePending();
        }
        return check.clamped;
      });
    },
    [markQuotePending]
  );

  const handleSetDay2Litres = useCallback(
    (qty: number) => {
      const check = sanitizeLitres(qty, 2);
      setDay2Litres((prev) => {
        if (prev !== check.clamped) {
          markQuotePending();
        }
        return check.clamped;
      });
    },
    [markQuotePending]
  );

  const retryQuote = useCallback(() => {
    setIsQuoteLoading(true);
    setQuoteError(null);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  const resetSuccess = useCallback(() => {
    setIsSuccess(false);
  }, []);

  // 7. Submit handler with server quote confirmation and double-submit guard
  const handleConfirmSubscription = useCallback(async () => {
    if (isSubmitting || isQuoteLoading || !serverQuote || !pricingResult.isValid) return;

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
        await new Promise((resolve) => setTimeout(resolve, 500));
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
    isQuoteLoading,
    serverQuote,
    pricingResult,
    frequency,
    mode,
    fixedLitres,
    day1Litres,
    day2Litres,
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
    serverQuote,
    isQuoteLoading,
    quoteError,
    retryQuote,
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
