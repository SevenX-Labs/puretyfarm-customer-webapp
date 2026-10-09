"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/types/models";
import { PlanDefinition } from "@/features/plans";
import { onboardingApi } from "../api/onboardingApi";
import { locationApi } from "@/features/location/api/locationApi";
import { StepKey } from "../types";

export function useOnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Current active step in UI
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  // Highest unlocked step derived from backend data
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

  // ─── STEP 2: Location & Address State ───
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);

  // ─── STEP 3: Plan Selection State ───
  const [selectedPlanId, setSelectedPlanId] = useState<"trial" | "monthly" | "single">("trial");
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

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
      // Fetch user's saved addresses from the backend location/address API
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
        setMaxAllowedStep(3);
        if (requestedStep === "1" || requestedStep === "2" || requestedStep === "3") {
          setCurrentStep(parseInt(requestedStep, 10) as StepKey);
        } else {
          setCurrentStep(3);
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
        name: profileName.trim(),
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
      setMaxAllowedStep(2);
      setCurrentStep(2);
    } catch {
      setProfileError("Network error while updating profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── STEP 2 HANDLER: Address Saved ───
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
      setMaxAllowedStep(3);
      setCurrentStep(3);
    } catch {
      setMaxAllowedStep(3);
      setCurrentStep(3);
    }
  };

  // ─── STEP 3 HANDLER: Select Plan & Complete Onboarding ───
  const handleCompletePlanSelection = async (plan: PlanDefinition) => {
    if (!savedAddress) {
      setPlanError("Please verify and save a delivery address first.");
      setCurrentStep(2);
      return;
    }

    setSelectedPlanId(plan.id);
    setPlanSubmitting(true);
    setPlanError(null);

    try {
      const data = await onboardingApi.completePlanSelection({
        planId: plan.id,
        addressId: savedAddress.id,
      });

      if (!data.success) {
        setPlanError(data.error || "Failed to complete plan order.");
        if (data.redirectStep === "location_pending") {
          setCurrentStep(2);
        }
        return;
      }

      await refreshUser();
      router.replace("/account?welcome=1");
    } catch {
      setPlanError("Network error completing order. Please try again.");
    } finally {
      setPlanSubmitting(false);
    }
  };

  return {
    user,
    authLoading,
    initialLoading,
    currentStep,
    maxAllowedStep,
    handleGoToStep,
    // Step 1
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
    // Step 2
    savedAddress,
    handleSaveVerifiedAddress,
    // Step 3
    selectedPlanId,
    setSelectedPlanId,
    planSubmitting,
    planError,
    handleCompletePlanSelection,
  };
}
