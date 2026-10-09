"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/types/models";
import { PlanDefinition } from "@/features/plans";
import { onboardingApi } from "../api/onboardingApi";
import { locationApi } from "@/features/location/api/locationApi";
import { plansApi, PlanQuote } from "@/features/plans/api/plansApi";
import { walletApi } from "@/features/wallet";
import { paymentsApi } from "@/features/payments";
import { StepKey } from "../types";

const PENDING_QUOTE_KEY = "pf_onboarding_pending_quote";

export function useOnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Current active step in UI (1: Profile, 2: Service Area, 3: Address, 4: Plan)
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [maxAllowedStep, setMaxAllowedStep] = useState<StepKey>(1);
  const [initialLoading, setInitialLoading] = useState(true);

  // ─── STEP 1: Profile State ───
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ─── STEP 2: Service Area State ───
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedAreaPincode, setSelectedAreaPincode] = useState("");
  const [selectedAreaName, setSelectedAreaName] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

  // ─── STEP 3: Address State ───
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);

  // ─── STEP 4: Plan Selection State ───
  const [selectedPlanId, setSelectedPlanId] = useState<"trial" | "monthly" | "single">("trial");
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // ─── STEP 5: Payment State ───
  const [pendingQuote, setPendingQuote] = useState<PlanQuote | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PlanDefinition | null>(null);
  const [walletBalancePaise, setWalletBalancePaise] = useState<number>(0);
  const [walletAutoCredit, setWalletAutoCredit] = useState<boolean>(false);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Synchronize state with authenticated user
  const hasInitialized = useRef(false);

  const initUserData = useCallback(async () => {
    if (hasInitialized.current) return;
    if (authLoading) return;

    if (!user) {
      router.replace("/auth?redirect=/onboarding");
      return;
    }

    // Prefill profile fields (do not autofill placeholder names like "Customer (1566)")
    const rawName = user.name || "";
    const isPlaceholder = !rawName || rawName.startsWith("Customer (") || rawName.toLowerCase() === "customer";
    setProfileName(isPlaceholder ? "" : rawName);
    setProfileEmail(user.email || "");
    setProfileAvatar(user.avatarUrl || "");
    setProfileGender(user.gender || "");
    setProfileDob(user.dob || "");

    try {
      // Fetch user's saved addresses
      const addresses = await locationApi.getAddresses().catch(() => []);

      if (addresses && addresses.length > 0) {
        const defaultServiceable = addresses[0];
        setSavedAddress({
          id: defaultServiceable.id,
          userId: defaultServiceable.userId,
          fullName: defaultServiceable.fullName,
          phone: defaultServiceable.mobile,
          street: `${defaultServiceable.houseNumber}, ${
            defaultServiceable.buildingName ? defaultServiceable.buildingName + ", " : ""
          }${defaultServiceable.streetName || ""}`.trim(),
          locality: defaultServiceable.area,
          landmark: defaultServiceable.landmark,
          city: defaultServiceable.city,
          pincode: defaultServiceable.pincode,
          isDefault: true,
          isServiceable: true,
          createdAt: defaultServiceable.createdAt,
        });

        setSelectedStateId(defaultServiceable.stateId || "");
        setSelectedCityId(defaultServiceable.cityId || "");
        setSelectedAreaId(defaultServiceable.areaId || "");
        setSelectedAreaPincode(defaultServiceable.pincode || "");
        setSelectedAreaName(defaultServiceable.area || "");
        setSelectedCityName(defaultServiceable.city || "Raipur");
      }

      // Rehydrate any pending plan quote from a prior PayU redirect
      let rehydratedQuote: PlanQuote | null = null;
      try {
        const raw = typeof window !== "undefined"
          ? window.localStorage.getItem(PENDING_QUOTE_KEY)
          : null;
        if (raw) {
          const parsed = JSON.parse(raw) as { quote: PlanQuote; planId: PlanDefinition["id"] };
          if (parsed?.quote?.quoteId && new Date(parsed.quote.expiresAt).getTime() > Date.now()) {
            rehydratedQuote = parsed.quote;
            setPendingQuote(parsed.quote);
            setSelectedPlanId(parsed.planId);
          } else {
            window.localStorage.removeItem(PENDING_QUOTE_KEY);
          }
        }
      } catch {}

      // Determine step based on profile and address existence
      const hasProfile = user.onboardingStep !== "profile_pending" && user.name && !user.name.startsWith("Customer (");
      const hasAddress = addresses && addresses.length > 0;
      const requestedStep = searchParams.get("step");

      if (!hasProfile) {
        setMaxAllowedStep(1);
        setCurrentStep(1);
      } else if (!hasAddress) {
        setMaxAllowedStep(2);
        setCurrentStep(2);
      } else {
        const resumeStep: StepKey = rehydratedQuote ? 5 : 4;
        setMaxAllowedStep(resumeStep);
        if (requestedStep === "1" || requestedStep === "2" || requestedStep === "3" || requestedStep === "4" || requestedStep === "5") {
          setCurrentStep(parseInt(requestedStep, 10) as StepKey);
        } else {
          setCurrentStep(resumeStep);
        }
      }

      hasInitialized.current = true;
    } catch (err) {
      console.error("[initUserData error]", err);
    } finally {
      setInitialLoading(false);
    }
  }, [authLoading, user, router, searchParams]);

  useEffect(() => {
    initUserData();
  }, [initUserData]);

  // Navigate explicitly between unlocked steps
  const handleGoToStep = (stepNum: StepKey) => {
    if (stepNum <= maxAllowedStep) {
      setCurrentStep(stepNum);
    }
  };

  // ─── STEP 1 HANDLER: Save Profile ───
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = profileName.trim();
    if (!cleanName || cleanName.startsWith("Customer (") || cleanName.toLowerCase() === "customer") {
      setProfileError("Please enter your actual full name to continue.");
      return;
    }
    if (cleanName.length < 2) {
      setProfileError("Full name must be at least 2 characters long.");
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const data = await onboardingApi.updateProfile({
        name: cleanName,
        email: profileEmail.trim(),
        avatarUrl: profileAvatar,
        gender: profileGender || undefined,
        dob: profileDob || undefined,
      });

      if (!data.success) {
        setProfileError(data.error || "Failed to update profile. Please try again.");
        return;
      }

      await refreshUser();
      setMaxAllowedStep((prev) => Math.max(prev, 2) as StepKey);
      setCurrentStep(2);
    } catch {
      setProfileError("Network error while updating profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── STEP 2 HANDLER: Service Area Confirmed ───
  const handleContinueToAddress = () => {
    if (!selectedStateId || !selectedCityId || !selectedAreaId) {
      return;
    }
    setMaxAllowedStep((prev) => Math.max(prev, 3) as StepKey);
    setCurrentStep(3);
  };

  // ─── STEP 3 HANDLER: Address Saved ───
  const handleSaveVerifiedAddress = async () => {
    try {
      const addresses = await locationApi.getAddresses();
      if (addresses.length > 0) {
        const defaultAddr = addresses[0];
        setSavedAddress({
          id: defaultAddr.id,
          userId: defaultAddr.userId,
          fullName: defaultAddr.fullName,
          phone: defaultAddr.mobile,
          street: `${defaultAddr.houseNumber}, ${
            defaultAddr.buildingName ? defaultAddr.buildingName + ", " : ""
          }${defaultAddr.streetName || ""}`.trim(),
          locality: defaultAddr.area,
          landmark: defaultAddr.landmark,
          city: defaultAddr.city,
          pincode: defaultAddr.pincode,
          isDefault: true,
          isServiceable: true,
          createdAt: defaultAddr.createdAt,
        });
      }
      await refreshUser();
      setMaxAllowedStep((prev) => Math.max(prev, 4) as StepKey);
      setCurrentStep(4);
    } catch {
      setMaxAllowedStep((prev) => Math.max(prev, 4) as StepKey);
      setCurrentStep(4);
    }
  };

  // ─── STEP 4 HANDLER: Select Plan → Build Quote → Advance to Payment ───
  const handleCompletePlanSelection = async (plan: PlanDefinition) => {
    if (!savedAddress) {
      setCurrentStep(3);
      return;
    }

    setSelectedPlanId(plan.id);
    setPendingPlan(plan);
    setPlanSubmitting(true);
    setPlanError(null);

    try {
      let quote: PlanQuote;
      if (plan.id === "trial") {
        quote = await plansApi.createTrialQuote(1);
      } else if (plan.id === "single") {
        quote = await plansApi.createBuyOnceQuote(1);
      } else {
        let draft: {
          frequency?: string;
          mode?: string;
          fixedLitres?: number;
          day1Litres?: number;
          day2Litres?: number;
        } | null = null;
        try {
          const raw =
            typeof window !== "undefined"
              ? window.localStorage.getItem("pf_subscription_draft_v2") ||
                window.localStorage.getItem("pf_subscription_draft")
              : null;
          if (raw) draft = JSON.parse(raw);
        } catch {}

        const freq = draft?.frequency === "alternate" ? "ALTERNATE_DAYS" : "DAILY";
        const mode = draft?.mode === "pattern" ? "ALTERNATING" : "FIXED";

        quote = await plansApi.createMonthlyQuote({
          frequency: freq,
          quantityMode: mode,
          quantity: mode === "FIXED" ? (draft?.fixedLitres || 1) : undefined,
          quantityA: mode === "ALTERNATING" ? (draft?.day1Litres || 1) : undefined,
          quantityB: mode === "ALTERNATING" ? (draft?.day2Litres || 2) : undefined,
        });
      }

      setPendingQuote(quote);
      try {
        window.localStorage.setItem(
          PENDING_QUOTE_KEY,
          JSON.stringify({ quote, planId: plan.id })
        );
      } catch {}

      setMaxAllowedStep((prev) => Math.max(prev, 5) as StepKey);
      setCurrentStep(5);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not build the pricing quote for this plan. Please try again.";
      setPlanError(msg);
    } finally {
      setPlanSubmitting(false);
    }
  };

  // ─── STEP 5: Load wallet balance whenever we land on the payment step ───
  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const wallet = await walletApi.getWallet();
      setWalletBalancePaise(wallet?.balancePaise ?? 0);
      setWalletAutoCredit(Boolean(wallet?.autoCreditEnabled));
    } catch {
      setWalletBalancePaise(0);
      setWalletAutoCredit(false);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === 5) void loadWallet();
  }, [currentStep, loadWallet]);

  const clearPendingQuote = useCallback(() => {
    setPendingQuote(null);
    setPendingPlan(null);
    try {
      window.localStorage.removeItem(PENDING_QUOTE_KEY);
    } catch {}
  }, []);

  // Resume the pending plan once the wallet shows enough balance (e.g. after a
  // PayU redirect lands back on the onboarding payment step).
  useEffect(() => {
    if (currentStep !== 5) return;
    if (!pendingQuote) return;
    const txnid = searchParams.get("txnid");
    if (!txnid) return;

    (async () => {
      try {
        const res = await paymentsApi.verifyPayment({ transactionId: txnid });
        const walletCredit = res?.payment?.walletCredit;
        const paid = (res?.payment?.amountPaise ?? 0) / 100;

        if (res?.payment?.status === "SUCCESS") {
          if (walletCredit?.status === "COMPLETED" || res?.walletCredited) {
            setPaymentNotice(
              `Payment of ₹${paid.toFixed(0)} verified. Confirming your plan from wallet...`
            );
            await loadWallet();
          } else if (walletCredit?.status === "PENDING" || res?.requiresAdminApproval) {
            setPaymentNotice(
              `Payment of ₹${paid.toFixed(0)} successful. Wallet credit is pending admin approval — your plan will activate automatically once approved.`
            );
          }
        } else if (
          res?.payment?.status === "FAILED" ||
          res?.payment?.status === "CANCELLED" ||
          res?.payment?.status === "EXPIRED"
        ) {
          setPaymentError(
            `Online payment was ${res.payment.status.toLowerCase()}. No money was debited — please try again or choose cash on delivery.`
          );
        }
      } catch {
        /* swallow — user can retry */
      }
    })();
  }, [currentStep, pendingQuote, searchParams, loadWallet]);

  // Once the wallet has enough balance for a pending quote, auto-confirm.
  useEffect(() => {
    if (currentStep !== 5) return;
    if (!pendingQuote) return;
    if (paymentSubmitting) return;
    if (walletBalancePaise < pendingQuote.totalSellingAmount) return;
    if (!searchParams.get("txnid")) return;

    (async () => {
      setPaymentSubmitting(true);
      try {
        const confirmed = await plansApi.confirmPlanQuote({
          quoteId: pendingQuote.quoteId,
          paymentMethod: "WALLET",
        });
        if (confirmed?.status === "CONFIRMED") {
          clearPendingQuote();
          await refreshUser();
          router.replace("/account?welcome=1");
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Could not confirm your plan from wallet. Please retry.";
        setPaymentError(msg);
      } finally {
        setPaymentSubmitting(false);
      }
    })();
  }, [
    currentStep,
    pendingQuote,
    walletBalancePaise,
    paymentSubmitting,
    searchParams,
    clearPendingQuote,
    refreshUser,
    router,
  ]);

  // Pay the quoted amount using the current wallet balance.
  const handlePayFromWallet = async () => {
    if (!pendingQuote) return;
    if (walletBalancePaise < pendingQuote.totalSellingAmount) {
      setPaymentError("Wallet balance is not enough to cover this plan.");
      return;
    }
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const confirmed = await plansApi.confirmPlanQuote({
        quoteId: pendingQuote.quoteId,
        paymentMethod: "WALLET",
      });
      if (confirmed?.status === "CONFIRMED") {
        clearPendingQuote();
        await refreshUser();
        router.replace("/account?welcome=1");
      } else {
        setPaymentError(confirmed?.message || "Wallet payment did not complete.");
      }
    } catch (err: unknown) {
      const data =
        err && typeof err === "object" && "data" in err
          ? ((err as { data: unknown }).data as Record<string, unknown>)
          : undefined;
      const msg =
        (data?.message as string) ||
        (err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not confirm your plan from wallet.");
      setPaymentError(msg);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Top up the wallet via PayU for exactly the shortfall needed, then PayU
  // redirects the browser back here with ?txnid=... to resume the flow.
  const handlePayOnline = async () => {
    if (!pendingQuote) return;
    const shortfall = Math.max(
      pendingQuote.totalSellingAmount - walletBalancePaise,
      10000 // backend minimum is ₹100 — never submit less
    );
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      await paymentsApi.initiateOnlineTopup(shortfall, { autoRedirect: true });
      // Browser is now redirecting to PayU — nothing else to do here.
    } catch (err: unknown) {
      const data =
        err && typeof err === "object" && "data" in err
          ? ((err as { data: unknown }).data as Record<string, unknown>)
          : undefined;
      const msg =
        (data?.message as string) ||
        (err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not start the online payment. Please try again.");
      setPaymentError(msg);
      setPaymentSubmitting(false);
    }
  };

  // Pay the entire plan amount in cash — admin confirms physical collection.
  const handlePayCash = async () => {
    if (!pendingQuote) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const confirmed = await plansApi.confirmPlanQuote({
        quoteId: pendingQuote.quoteId,
        paymentMethod: "CASH",
      });
      if (confirmed?.status === "PENDING_PAYMENT" || confirmed?.status === "CONFIRMED") {
        clearPendingQuote();
        await refreshUser();
        router.replace("/account?welcome=1&pendingCash=1");
      } else {
        setPaymentError(confirmed?.message || "Cash plan request did not go through.");
      }
    } catch (err: unknown) {
      const data =
        err && typeof err === "object" && "data" in err
          ? ((err as { data: unknown }).data as Record<string, unknown>)
          : undefined;
      const msg =
        (data?.message as string) ||
        (err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not request cash collection. Please try again.");
      setPaymentError(msg);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleCancelPendingQuote = () => {
    clearPendingQuote();
    setPaymentError(null);
    setPaymentNotice(null);
    setCurrentStep(4);
  };

  return {
    user,
    authLoading,
    initialLoading,
    currentStep,
    maxAllowedStep,
    handleGoToStep,
    // Step 1: Profile
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    profileAvatar,
    setProfileAvatar,
    profileGender,
    setProfileGender,
    profileDob,
    setProfileDob,
    profileSaving,
    profileError,
    setProfileError,
    handleSaveProfile,
    // Step 2: Service Area
    selectedStateId,
    setSelectedStateId,
    selectedCityId,
    setSelectedCityId,
    selectedAreaId,
    setSelectedAreaId,
    selectedAreaPincode,
    setSelectedAreaPincode,
    selectedAreaName,
    setSelectedAreaName,
    selectedCityName,
    setSelectedCityName,
    coords,
    setCoords,
    handleContinueToAddress,
    // Step 3: Address
    savedAddress,
    handleSaveVerifiedAddress,
    // Step 4: Plan
    selectedPlanId,
    setSelectedPlanId,
    planSubmitting,
    planError,
    handleCompletePlanSelection,
    // Step 5: Payment
    pendingQuote,
    pendingPlan,
    walletBalancePaise,
    walletAutoCredit,
    walletLoading,
    paymentSubmitting,
    paymentError,
    paymentNotice,
    reloadWallet: loadWallet,
    handlePayFromWallet,
    handlePayOnline,
    handlePayCash,
    handleCancelPendingQuote,
  };
}
