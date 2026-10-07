"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/types/models";
import { PlanDefinition } from "@/features/plans";
import { onboardingApi } from "../api/onboardingApi";
import { StepKey, ServiceCheckResult, AddressDetailsFormData } from "../types";

export function useOnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser, setUser } = useAuth();

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

  // ─── STEP 2: Location & Serviceability State ───
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [autoChecking, setAutoChecking] = useState(false);
  const [autoCheckError, setAutoCheckError] = useState<string | null>(null);

  // Manual Check Form
  const [manualPincode, setManualPincode] = useState("");
  const [manualLocality, setManualLocality] = useState("");
  const [manualStreet, setManualStreet] = useState("");
  const [manualChecking, setManualChecking] = useState(false);

  // Serviceability Result
  const [serviceCheckResult, setServiceCheckResult] = useState<ServiceCheckResult | null>(null);

  // Address Details Form (shown once area is confirmed serviceable)
  const [addressDetails, setAddressDetails] = useState<AddressDetailsFormData>({
    houseNo: "",
    street: "",
    locality: "",
    landmark: "",
    addressType: "Home",
    receiverName: "",
    alternatePhone: "",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressSaveError, setAddressSaveError] = useState<string | null>(null);

  // Waitlist State (when unserviceable)
  const [waitlistJoining, setWaitlistJoining] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  // ─── STEP 3: Plan Selection State ───
  const [selectedPlanId, setSelectedPlanId] = useState<"trial" | "monthly" | "single">("trial");
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Synchronize state with authenticated user
  const hasInitialized = useRef(false);

  const initUserData = useCallback(async () => {
    // Only run initialization once — subsequent step changes are handled
    // explicitly by action handlers (handleSaveProfile, handleSaveVerifiedAddress, etc.)
    // This prevents refreshUser() from re-triggering initUserData and resetting currentStep.
    if (hasInitialized.current) return;
    if (authLoading) return;

    if (!user) {
      router.replace("/auth?redirect=/onboarding");
      return;
    }

    // Prefill profile fields
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    setProfileAvatar(user.avatarUrl || "");
    setProfileGender(user.gender || "");
    setProfileDob(user.dob || "");
    setAddressDetails((prev) => ({
      ...prev,
      receiverName: prev.receiverName || user.name || "",
    }));

    try {
      // Fetch user's saved addresses to check if a serviceable address already exists
      const addrData = await onboardingApi.getAddresses();
      let addresses: Address[] = [];
      if (addrData.success && addrData.addresses) {
        addresses = addrData.addresses;
      }

      const defaultServiceable =
        addresses.find((a) => a.isDefault && a.isServiceable) ||
        addresses.find((a) => a.isServiceable);
      if (defaultServiceable) {
        setSavedAddress(defaultServiceable);
      }

      // Determine step based on derived server state
      const serverStep = user.onboardingStep || "profile_pending";

      if (serverStep === "complete") {
        router.replace("/account");
        return;
      }

      if (serverStep === "plan_pending" && defaultServiceable) {
        setMaxAllowedStep(3);
        const requestedStep = searchParams.get("step");
        if (requestedStep === "1" || requestedStep === "2") {
          setCurrentStep(parseInt(requestedStep, 10) as StepKey);
        } else {
          setCurrentStep(3);
        }
      } else if (serverStep === "location_pending" || Boolean(user.name?.trim())) {
        setMaxAllowedStep(2);
        const requestedStep = searchParams.get("step");
        if (requestedStep === "1") {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }
      } else {
        setMaxAllowedStep(1);
        setCurrentStep(1);
      }
    } catch (err) {
      console.error("Failed to load onboarding status:", err);
    } finally {
      hasInitialized.current = true;
      setInitialLoading(false);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    initUserData();
  }, [initUserData]);


  // Handle Step Navigation (Back / Forward)
  const handleGoToStep = (targetStep: StepKey) => {
    if (targetStep > maxAllowedStep) return;
    setCurrentStep(targetStep);
  };

  // ─── STEP 1 HANDLER: Save Profile ───
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError("Please enter your full name.");
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const data = await onboardingApi.updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        avatarUrl: profileAvatar,
        gender: profileGender,
        dob: profileDob,
      });

      if (!data.success) {
        setProfileError(data.error || "Failed to update profile.");
        return;
      }

      setAddressDetails((prev) => ({
        ...prev,
        receiverName: prev.receiverName || profileName.trim(),
      }));

      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: profileName.trim(),
              email: profileEmail.trim(),
              avatarUrl: profileAvatar,
              gender: profileGender,
              dob: profileDob,
            }
          : null
      );

      await refreshUser();
      setMaxAllowedStep((prev) => Math.max(prev, 2) as StepKey);
      setCurrentStep(2);
    } catch {
      setProfileError("Network error. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── STEP 2 HANDLER: Auto Geolocation Check ───
  const handleAutoLocationCheck = (): Promise<boolean> => {
    setAutoChecking(true);
    setAutoCheckError(null);
    setServiceCheckResult(null);

    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        setAutoCheckError(
          "Location detection is not supported by your browser. Please enter your address below."
        );
        setAutoChecking(false);
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            const data = await onboardingApi.checkServiceability({ lat, lng });

            if (!data.success && data.error) {
              setAutoCheckError(
                data.error ||
                  "Could not detect address from location. Please enter your pincode below."
              );
              resolve(false);
              return;
            }

            setServiceCheckResult({
              performed: true,
              serviceable: data.serviceable,
              areaName: data.areaName,
              pincode: data.pincode,
              reason: data.reason,
            });

            if (data.serviceable) {
              setManualPincode("");
              setManualLocality("");
              setAddressDetails((prev) => ({
                ...prev,
                locality: data.areaName || prev.locality,
                street: data.formattedAddress ? data.formattedAddress.split(",")[0] : prev.street,
              }));
              resolve(true);
            } else {
              setManualPincode(data.pincode || "");
              setManualLocality(data.areaName || "");
              resolve(false);
            }
          } catch {
            setAutoCheckError(
              "Could not connect to service check. Please enter your address details below."
            );
            resolve(false);
          } finally {
            setAutoChecking(false);
          }
        },
        (err) => {
          let errorMsg = "Couldn't detect your location. Enter your address below.";
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = "Location access was denied. Enter your address below.";
          } else if (err.code === err.TIMEOUT) {
            errorMsg = "Location detection timed out. Enter your address below.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMsg = "Current location unavailable. Enter your address below.";
          }
          setAutoCheckError(errorMsg);
          setAutoChecking(false);
          resolve(false);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });
  };

  // ─── STEP 2 HANDLER: Manual Pincode & Locality Check ───
  const handleManualCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = manualPincode.replace(/\D/g, "");

    if (cleanPin.length !== 6) {
      setAutoCheckError("Please enter a valid 6-digit Indian postal code.");
      return;
    }

    setManualChecking(true);
    setAutoCheckError(null);
    setServiceCheckResult(null);

    try {
      const data = await onboardingApi.checkServiceability({
        pincode: cleanPin,
        addressText: `${manualLocality} ${manualStreet}`.trim(),
      });

      if (!data.success && data.error) {
        setAutoCheckError(data.error || "Failed to check serviceability.");
        return;
      }

      setServiceCheckResult({
        performed: true,
        serviceable: data.serviceable,
        areaName: data.areaName,
        pincode: cleanPin,
        reason: data.reason,
      });

      if (data.serviceable) {
        setAddressDetails((prev) => ({
          ...prev,
          locality: data.areaName || manualLocality || prev.locality,
          street: manualStreet || prev.street,
        }));
      }
    } catch {
      setAutoCheckError("Network error checking serviceability. Please try again.");
    } finally {
      setManualChecking(false);
    }
  };

  // ─── STEP 2 HANDLER: Save Address ───
  const handleSaveVerifiedAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const pincode = manualPincode.trim() || serviceCheckResult?.pincode || "492001";
    const locality = addressDetails.locality.trim() || manualLocality.trim() || serviceCheckResult?.areaName || "Raipur Central";
    const streetPart = addressDetails.street.trim() || "Main Road";
    const housePart = addressDetails.houseNo.trim() || "Flat 101";

    setAddressSaving(true);
    setAddressSaveError(null);

    try {
      const fullStreet = `${housePart}, ${streetPart}`;
      const payload = {
        fullName: addressDetails.receiverName.trim() || user?.name || "Customer",
        phone: user?.phone || "+919876543210",
        alternatePhone: addressDetails.alternatePhone.trim() || undefined,
        street: fullStreet,
        locality: locality,
        landmark: addressDetails.landmark.trim() || undefined,
        city: "Raipur",
        pincode: pincode.length === 6 ? pincode : "492001",
        addressType: addressDetails.addressType,
        isDefault: true,
      };

      const data = await onboardingApi.saveAddress(payload);

      if (!data.success) {
        setAddressSaveError(data.error || "Failed to save address. Please check details.");
        return;
      }

      setSavedAddress(data.address);
      await refreshUser();
      setMaxAllowedStep(3);
      setCurrentStep(3);
    } catch {
      setAddressSaveError("Network error while saving address.");
    } finally {
      setAddressSaving(false);
    }
  };

  // ─── STEP 2 HANDLER: Join Waitlist (When Unserviceable) ───
  const handleJoinWaitlist = async () => {
    if (!user?.phone) return;
    const pin = serviceCheckResult?.pincode || manualPincode;

    setWaitlistJoining(true);
    try {
      const data = await onboardingApi.joinWaitlist({
        phone: user.phone,
        pincode: pin,
        locality: serviceCheckResult?.areaName || manualLocality || "Raipur",
      });

      if (data.success) {
        setWaitlistJoined(true);
      } else {
        alert(data.error || "Could not register for waitlist.");
      }
    } catch {
      alert("Error submitting request. Please try again.");
    } finally {
      setWaitlistJoining(false);
    }
  };

  // ─── STEP 3 HANDLER: Select Plan & Complete Onboarding ───
  const handleCompletePlanSelection = async (plan: PlanDefinition) => {
    if (!savedAddress) {
      setPlanError("Please verify and save a serviceable delivery address first.");
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
      // Redirect to account with welcome banner
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
    setSavedAddress,
    autoChecking,
    autoCheckError,
    manualPincode,
    setManualPincode,
    manualLocality,
    setManualLocality,
    manualStreet,
    setManualStreet,
    manualChecking,
    serviceCheckResult,
    setServiceCheckResult,
    addressDetails,
    setAddressDetails,
    addressSaving,
    addressSaveError,
    waitlistJoining,
    waitlistJoined,
    handleAutoLocationCheck,
    handleManualCheck,
    handleSaveVerifiedAddress,
    handleJoinWaitlist,
    // Step 3
    selectedPlanId,
    setSelectedPlanId,
    planSubmitting,
    planError,
    handleCompletePlanSelection,
  };
}
