"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { onboardingApi } from "../api/onboardingApi";
import { locationApi, CustomerAddress } from "@/features/location/api/locationApi";
import { plansApi, PlanQuote } from "@/features/plans/api/plansApi";
import { paymentsApi } from "@/features/payments/api/paymentsApi";
import { walletApi } from "@/features/wallet/api/walletApi";
import { Address } from "@/types/models";
import { PlanDefinition } from "@/features/plans";
import { StepKey } from "../types";

export function useOnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Step state (1: Profile, 2: Service Area, 3: Address Details, 4: Plan, 5: Payment)
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [maxAllowedStep, setMaxAllowedStep] = useState<StepKey>(1);
  const [initialLoading, setInitialLoading] = useState(true);

  // Step 1: Profile form state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Step 2: Location / Service Area selection state
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedAreaPincode, setSelectedAreaPincode] = useState("");
  const [selectedAreaName, setSelectedAreaName] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

  // Step 3: Address state
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);

  // Step 4: Plan selection state
  const [selectedPlanId, setSelectedPlanId] = useState<"trial" | "monthly" | "single">("monthly");
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Step 5: Payment & quote state
  const [pendingQuote, setPendingQuote] = useState<PlanQuote | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PlanDefinition | null>(null);
  const [walletBalancePaise, setWalletBalancePaise] = useState<number>(0);
  const [walletAutoCredit, setWalletAutoCredit] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
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
        setMaxAllowedStep(4);
        if (
          requestedStep === "1" ||
          requestedStep === "2" ||
          requestedStep === "3" ||
          requestedStep === "4" ||
          requestedStep === "5"
        ) {
          setCurrentStep(parseInt(requestedStep, 10) as StepKey);
        } else {
          setCurrentStep(4);
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

  // ─── STEP 3 HANDLER: Address Saved (Immediate Transition) ───
  const handleSaveVerifiedAddress = (createdAddr?: CustomerAddress) => {
    if (createdAddr) {
      setSavedAddress({
        id: createdAddr.id,
        userId: createdAddr.userId,
        fullName: createdAddr.fullName,
        phone: createdAddr.mobile,
        street: `${createdAddr.houseNumber}, ${
          createdAddr.buildingName ? createdAddr.buildingName + ", " : ""
        }${createdAddr.streetName || ""}`.trim(),
        locality: createdAddr.area || selectedAreaName || "Area",
        landmark: createdAddr.landmark,
        city: createdAddr.city || selectedCityName || "City",
        pincode: createdAddr.pincode || selectedAreaPincode || "",
        isDefault: true,
        isServiceable: true,
        createdAt: createdAddr.createdAt || new Date().toISOString(),
      });
    }
    setMaxAllowedStep((prev) => Math.max(prev, 4) as StepKey);
    setCurrentStep(4);
    void refreshUser().catch(() => {});
    void locationApi.getAddresses().catch(() => []);
  };

  // Helper to load wallet balance
  const reloadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const summary = await walletApi.getWallet();
      setWalletBalancePaise(summary.balancePaise || 0);
      setWalletAutoCredit(summary.autoCreditEnabled ?? false);
    } catch (err) {
      console.warn("Could not load wallet balance:", err);
      setWalletBalancePaise(0);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ─── STEP 4 HANDLER: Select Plan → Build Quote → Advance to Payment ───
  const handleCompletePlanSelection = async (plan: PlanDefinition) => {
    if (!savedAddress) {
      setCurrentStep(3);
      return;
    }

    setSelectedPlanId(plan.id);
    setPlanSubmitting(true);
    setPlanError(null);

    try {
      let quote: PlanQuote | null = null;

      if (plan.id === "trial") {
        quote = await plansApi.createTrialQuote(1);
      } else if (plan.id === "single") {
        quote = await plansApi.createBuyOnceQuote(1);
      } else {
        let draft = null;
        try {
          const raw =
            typeof window !== "undefined"
              ? localStorage.getItem("pf_subscription_draft_v2") ||
                localStorage.getItem("pf_subscription_draft")
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

      if (!quote) {
        throw new Error("Could not calculate pricing quote for the selected plan.");
      }

      setPendingQuote(quote);
      setPendingPlan(plan);
      await reloadWallet();

      setMaxAllowedStep((prev) => Math.max(prev, 5) as StepKey);
      setCurrentStep(5);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to proceed with selected plan.";
      setPlanError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setPlanSubmitting(false);
    }
  };

  // ─── STEP 5 HANDLERS: Payment Methods ───
  const handlePayFromWallet = async () => {
    if (!pendingQuote || !pendingPlan) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    setPaymentNotice(null);

    try {
      await plansApi.confirmPlanQuote({
        quoteId: pendingQuote.quoteId,
        paymentMethod: "WALLET",
      });

      try {
        await onboardingApi.completePlanSelection({
          planId: pendingPlan.id,
          addressId: savedAddress?.id || "",
        });
      } catch {}

      await refreshUser();
      router.replace("/account?welcome=1");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Wallet payment failed. Please recharge or choose another payment method.";
      setPaymentError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handlePayOnline = async () => {
    if (!pendingQuote || !pendingPlan) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    setPaymentNotice(null);

    try {
      const res = await paymentsApi.initiateOnlineTopup(pendingQuote.totalSellingAmount, {
        autoRedirect: true,
      });

      if (!res.checkout) {
        setPaymentNotice("Payment initialized. Redirecting to payment gateway...");
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Could not connect to payment gateway. Please check your connection or choose Cash.";
      setPaymentError(Array.isArray(msg) ? msg.join(", ") : String(msg));
      setPaymentSubmitting(false);
    }
  };

  const handlePayCash = async () => {
    if (!pendingQuote || !pendingPlan) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    setPaymentNotice(null);

    try {
      await plansApi.confirmPlanQuote({
        quoteId: pendingQuote.quoteId,
        paymentMethod: "CASH",
      });

      try {
        await onboardingApi.completePlanSelection({
          planId: pendingPlan.id,
          addressId: savedAddress?.id || "",
        });
      } catch {}

      await refreshUser();
      router.replace("/account?welcome=1");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Cash request could not be registered.";
      setPaymentError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleCancelPendingQuote = () => {
    setPendingQuote(null);
    setPendingPlan(null);
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
    reloadWallet,
    handlePayFromWallet,
    handlePayOnline,
    handlePayCash,
    handleCancelPendingQuote,
  };
}
