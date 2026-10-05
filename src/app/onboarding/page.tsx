"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { useAuth } from "@/context/AuthContext";
import { PLANS, PlanDefinition } from "@/data/plans";
import { Address } from "@/lib/db/types";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiUser,
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiCrosshair,
  FiSearch,
  FiBell,
  FiCheck,
  FiClock,
  FiTruck,
  FiShield,
  FiPhone,
  FiHelpCircle,
  FiPackage,
} from "react-icons/fi";

type StepKey = 1 | 2 | 3;

function OnboardingContent() {
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
  const [serviceCheckResult, setServiceCheckResult] = useState<{
    performed: boolean;
    serviceable: boolean;
    areaName?: string;
    pincode?: string;
    reason?: string;
  } | null>(null);

  // Address Details Form (shown once area is confirmed serviceable)
  const [addressDetails, setAddressDetails] = useState({
    houseNo: "",
    street: "",
    locality: "",
    landmark: "",
    addressType: "Home" as "Home" | "Work" | "Other",
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
  const initUserData = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      router.replace("/auth?redirect=/onboarding");
      return;
    }

    // Prefill profile fields
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    setProfileAvatar(user.avatarUrl || "");
    setAddressDetails((prev) => ({
      ...prev,
      receiverName: prev.receiverName || user.name || "",
    }));

    try {
      // Fetch user's saved addresses to check if a serviceable address already exists
      const addrRes = await fetch("/api/addresses");
      let addresses: Address[] = [];
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        if (addrData.success && addrData.addresses) {
          addresses = addrData.addresses;
        }
      }

      const defaultServiceable = addresses.find((a) => a.isDefault && a.isServiceable) || addresses.find((a) => a.isServiceable);
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
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
          avatarUrl: profileAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfileError(data.error || "Failed to update profile.");
        return;
      }

      // Prefill receiver name in address form if blank
      setAddressDetails((prev) => ({
        ...prev,
        receiverName: prev.receiverName || profileName.trim(),
      }));

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
  const handleAutoLocationCheck = () => {
    setAutoChecking(true);
    setAutoCheckError(null);
    setServiceCheckResult(null);

    if (!navigator.geolocation) {
      setAutoCheckError("Location detection is not supported by your browser. Please enter your address below.");
      setAutoChecking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const res = await fetch("/api/serviceability/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });

          const data = await res.json();
          if (!res.ok) {
            setAutoCheckError(data.error || "Could not detect address from location. Please enter your pincode below.");
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
            setAddressDetails((prev) => ({
              ...prev,
              locality: data.areaName || prev.locality,
              street: data.formattedAddress ? data.formattedAddress.split(",")[0] : prev.street,
            }));
          } else {
            setManualPincode(data.pincode || "");
            setManualLocality(data.areaName || "");
          }
        } catch {
          setAutoCheckError("Could not connect to service check. Please enter your address details below.");
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
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
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
      const res = await fetch("/api/serviceability/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: cleanPin,
          addressText: `${manualLocality} ${manualStreet}`.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
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

  // ─── STEP 2 HANDLER: Save Verified Address ───
  const handleSaveVerifiedAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressDetails.houseNo.trim()) {
      setAddressSaveError("Please enter your flat, house, or apartment number.");
      return;
    }
    if (!addressDetails.street.trim()) {
      setAddressSaveError("Please enter your street or building name.");
      return;
    }

    const pincode = serviceCheckResult?.pincode || manualPincode;
    if (!pincode) {
      setAddressSaveError("Serviceable pincode is missing. Please re-check your area.");
      return;
    }

    setAddressSaving(true);
    setAddressSaveError(null);

    try {
      const fullStreet = `${addressDetails.houseNo.trim()}, ${addressDetails.street.trim()}`;
      const payload = {
        fullName: addressDetails.receiverName.trim() || user?.name || "Customer",
        phone: user?.phone || "",
        alternatePhone: addressDetails.alternatePhone.trim() || undefined,
        street: fullStreet,
        locality: addressDetails.locality.trim() || serviceCheckResult?.areaName || "Raipur",
        landmark: addressDetails.landmark.trim() || undefined,
        city: "Raipur",
        pincode: pincode.trim(),
        addressType: addressDetails.addressType,
        isDefault: true,
      };

      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
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
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phone,
          pincode: pin,
          locality: serviceCheckResult?.areaName || manualLocality || "Raipur",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
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
      const res = await fetch("/api/onboarding/complete-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          addressId: savedAddress.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
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

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#3A241C]/65 font-medium">Setting up your PuretyFarm journey...</p>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1 as StepKey, title: "Profile Details", desc: "Name & Avatar" },
    { num: 2 as StepKey, title: "Delivery Location", desc: "Raipur Serviceability" },
    { num: 3 as StepKey, title: "Select Plan", desc: "Morning Deliveries" },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col selection:bg-[#5C1B13]/15 selection:text-[#5C1B13]">
      {/* ─── HEADER BAR ─── */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-[#E8DFD4] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" priority />
            <div className="hidden sm:block h-4 w-px bg-[#E8DFD4]" />
            <span className="hidden sm:inline-block text-xs font-semibold text-[#3A241C]/70">
              Welcome Onboarding
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#3A241C]/70 font-mono font-medium">
              {user?.phone}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Verified ✓
            </span>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ─── STEP PROGRESS INDICATOR ─── */}
        <nav aria-label="Onboarding Progress" className="mb-10">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto px-2">
            {/* Background connecting track */}
            <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-[#E8DFD4] -z-0" />
            {/* Active connecting progress */}
            <div
              className="absolute top-1/2 left-8 -translate-y-1/2 h-1 bg-[#5C1B13] -z-0 transition-all duration-300"
              style={{
                width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "calc(100% - 4rem)",
              }}
            />

            {stepsList.map((s) => {
              const isPassed = s.num < currentStep;
              const isCurrent = s.num === currentStep;
              const isClickable = s.num <= maxAllowedStep;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => isClickable && handleGoToStep(s.num)}
                  disabled={!isClickable}
                  className={`relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs
                      ${
                        isCurrent
                          ? "bg-[#5C1B13] text-white ring-4 ring-[#5C1B13]/15 scale-110"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-[#3A241C]/40 border-2 border-[#E8DFD4]"
                      }
                      ${isClickable && !isCurrent ? "hover:border-[#5C1B13]/60 group-hover:scale-105" : ""}
                    `}
                  >
                    {isPassed ? <FiCheck className="w-5 h-5 stroke-[2.5]" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-bold mt-2 text-center transition-colors ${
                      isCurrent ? "text-[#5C1B13]" : isPassed ? "text-[#1A1008]" : "text-[#3A241C]/50"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="text-[10px] text-[#3A241C]/50 hidden sm:block">
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ─── STEP 1: PROFILE DETAILS ─── */}
        {currentStep === 1 && (
          <m.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-9 shadow-xs"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#5C1B13]/8 text-[#5C1B13] text-[11px] font-bold tracking-wide mb-2 uppercase">
                Step 1 of 3
              </span>
              <h1 className="text-2xl font-serif font-bold text-[#1A1008]">
                Complete Your Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
                Tell us who to address daily morning milk dispatches to.
              </p>
            </div>

            {profileError && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
              >
                <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Upload with Square Crop & Resize */}
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                <AvatarUpload
                  initialUrl={profileAvatar}
                  name={profileName || user?.name || "Purety"}
                  onUploaded={(url) => setProfileAvatar(url)}
                  onError={(msg) => setProfileError(msg)}
                />
              </div>

              {/* Verified Phone (Read-Only) */}
              <div>
                <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Mobile Number (Verified)
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FBF6EE] border border-[#E8DFD4] text-xs font-mono font-semibold text-[#1A1008]">
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-3.5 h-3.5 text-[#5C1B13]" />
                    <span>{user?.phone}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Phone Verified ✓
                  </span>
                </div>
                <p className="text-[11px] text-[#3A241C]/50 mt-1">
                  Daily delivery SMS & morning notifications will be sent to this number.
                </p>
              </div>

              {/* Full Name (Required) */}
              <div>
                <label
                  htmlFor="profileNameInput"
                  className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
                >
                  Full Name *
                </label>
                <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-4 py-3 transition-colors">
                  <FiUser className="w-4 h-4 text-[#3A241C]/40 mr-3 shrink-0" />
                  <input
                    id="profileNameInput"
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setProfileError(null);
                    }}
                    placeholder="e.g. Anand Agrawal"
                    className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Email Address (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="profileEmailInput"
                    className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <span className="text-[10px] text-[#3A241C]/55 italic">Optional (for invoices)</span>
                </div>
                <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-4 py-3 transition-colors">
                  <FiMail className="w-4 h-4 text-[#3A241C]/40 mr-3 shrink-0" />
                  <input
                    id="profileEmailInput"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="e.g. anand@puretyfarm.com"
                    className="w-full bg-transparent text-sm font-medium text-[#1A1008] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#3A241C]/50 mt-1">
                  Used optionally for monthly billing summaries and tax invoices.
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={profileSaving}
                  className="rounded-2xl py-3.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{profileSaving ? "Saving Details..." : "Continue to Delivery Location"}</span>
                  <FiArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </m.div>
        )}

        {/* ─── STEP 2: DELIVERY LOCATION + SERVICEABILITY ─── */}
        {currentStep === 2 && (
          <m.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-9 shadow-xs"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#5C1B13]/8 text-[#5C1B13] text-[11px] font-bold tracking-wide mb-2 uppercase">
                  Step 2 of 3
                </span>
                <h1 className="text-2xl font-serif font-bold text-[#1A1008]">
                  Delivery Location & Service Check
                </h1>
                <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
                  We currently deliver before 10 AM across major residential sectors in Raipur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleGoToStep(1)}
                className="text-xs text-[#5C1B13] hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer shrink-0 ml-2"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Auto check banner / Error notification */}
            {autoCheckError && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2"
              >
                <FiAlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{autoCheckError}</span>
              </div>
            )}

            {/* A) AUTO CHECK OPTION */}
            {!serviceCheckResult?.serviceable && (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#FAF3EA] to-[#FFFDF7] border border-[#E8DFD4] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1008] flex items-center gap-2">
                      <FiCrosshair className="w-4 h-4 text-[#5C1B13]" />
                      <span>Detect Location Automatically</span>
                    </h3>
                    <p className="text-xs text-[#3A241C]/70 mt-0.5">
                      Check your device GPS coordinates to quickly detect your Raipur sector.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAutoLocationCheck}
                    disabled={autoChecking}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {autoChecking ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Detecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <FiCrosshair className="w-3.5 h-3.5" />
                        <span>Use My Current Location</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* B) MANUAL CHECK OPTION (Always available as visible alternative) */}
            {!serviceCheckResult?.serviceable && (
              <div className="mb-6 pb-6 border-b border-[#E8DFD4]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[#1A1008] uppercase tracking-wider">
                    Or Enter Raipur Postal Code Manually
                  </span>
                  <div className="flex-1 h-px bg-[#E8DFD4]" />
                </div>

                <form onSubmit={handleManualCheck} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pincodeInput" className="block text-[11px] font-bold text-[#1A1008] mb-1">
                        6-Digit Pincode *
                      </label>
                      <input
                        id="pincodeInput"
                        type="text"
                        maxLength={6}
                        required
                        value={manualPincode}
                        onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="e.g. 492001 or 492007"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-sm font-mono font-semibold text-[#1A1008] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="localityInput" className="block text-[11px] font-bold text-[#1A1008] mb-1">
                        Locality / Area Name
                      </label>
                      <input
                        id="localityInput"
                        type="text"
                        value={manualLocality}
                        onChange={(e) => setManualLocality(e.target.value)}
                        placeholder="e.g. Shankar Nagar, Civil Lines"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-sm font-semibold text-[#1A1008] focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    disabled={manualChecking || manualPincode.length !== 6}
                    className="rounded-xl py-2.5 text-xs font-bold border-[#5C1B13] text-[#5C1B13] hover:bg-[#5C1B13]/8 cursor-pointer"
                  >
                    {manualChecking ? "Checking Delivery Availability..." : "Check Availability"}
                  </Button>
                </form>
              </div>
            )}

            {/* C) RESULT: UNSERVICEABLE STATE */}
            {serviceCheckResult?.performed && !serviceCheckResult.serviceable && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-3xl bg-amber-50/70 border border-amber-200 p-6 sm:p-7 text-center space-y-4 mb-6"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <FiMapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1A1008]">
                    We Haven’t Reached Your Area Just Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3A241C]/75 max-w-md mx-auto mt-1.5 leading-relaxed">
                    PuretyFarm milk delivery hasn’t reached pincode <strong>{serviceCheckResult.pincode}</strong> yet.
                    We are expanding our cold-chain morning milk routes across Raipur soon!
                  </p>
                </div>

                {waitlistJoined ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>You’re on the priority waitlist! We will notify {user?.phone} when routes open.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleJoinWaitlist}
                      disabled={waitlistJoining}
                      className="rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 cursor-pointer w-full sm:w-auto"
                    >
                      <FiBell className="w-3.5 h-3.5" />
                      <span>{waitlistJoining ? "Saving Request..." : "Notify Me When You're Available"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setServiceCheckResult(null);
                        setManualPincode("");
                        setManualLocality("");
                      }}
                      className="rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer w-full sm:w-auto"
                    >
                      Try a Different Address
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* C) RESULT: SERVICEABLE STATE -> REVEAL REMAINING ADDRESS FIELDS */}
            {serviceCheckResult?.serviceable && (
              <div
                role="status"
                aria-live="polite"
                className="space-y-6"
              >
                {/* Success Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">
                        Serviceable Area: {serviceCheckResult.areaName || "Raipur Sector"} ({serviceCheckResult.pincode})
                      </p>
                      <p className="text-emerald-700/80 text-[11px]">
                        Pure cold-chain milk delivery is active before 10 AM every morning.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCheckResult(null);
                      setSavedAddress(null);
                    }}
                    className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0 cursor-pointer"
                  >
                    Change Area
                  </button>
                </div>

                {/* Remaining Address Fields Form */}
                <form onSubmit={handleSaveVerifiedAddress} className="space-y-4">
                  {addressSaveError && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
                    >
                      <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{addressSaveError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="houseNoInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        House / Flat / Villa No. *
                      </label>
                      <input
                        id="houseNoInput"
                        type="text"
                        required
                        value={addressDetails.houseNo}
                        onChange={(e) => setAddressDetails({ ...addressDetails, houseNo: e.target.value })}
                        placeholder="e.g. Flat 302, Tower B"
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label htmlFor="streetInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        Building / Society / Street *
                      </label>
                      <input
                        id="streetInput"
                        type="text"
                        required
                        value={addressDetails.street}
                        onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                        placeholder="e.g. Palm Springs Residency"
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="localityInputFinal" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        Locality / Area Name
                      </label>
                      <input
                        id="localityInputFinal"
                        type="text"
                        readOnly
                        value={addressDetails.locality || serviceCheckResult.areaName || ""}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] bg-[#FBF6EE] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="landmarkInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        Landmark (Optional)
                      </label>
                      <input
                        id="landmarkInput"
                        type="text"
                        value={addressDetails.landmark}
                        onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                        placeholder="e.g. Near City Center Mall"
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-medium text-[#1A1008] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="addressLabelSelect" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        Address Label
                      </label>
                      <select
                        id="addressLabelSelect"
                        value={addressDetails.addressType}
                        onChange={(e) =>
                          setAddressDetails({
                            ...addressDetails,
                            addressType: e.target.value as "Home" | "Work" | "Other",
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="receiverNameInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        Receiver Name
                      </label>
                      <input
                        id="receiverNameInput"
                        type="text"
                        value={addressDetails.receiverName}
                        onChange={(e) => setAddressDetails({ ...addressDetails, receiverName: e.target.value })}
                        placeholder="Name of receiver"
                        className="w-full px-3 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="alternatePhoneInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                        Alt Phone (Optional)
                      </label>
                      <input
                        id="alternatePhoneInput"
                        type="tel"
                        maxLength={10}
                        value={addressDetails.alternatePhone}
                        onChange={(e) =>
                          setAddressDetails({
                            ...addressDetails,
                            alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                        placeholder="Secondary contact"
                        className="w-full px-3 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-mono font-semibold text-[#1A1008] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={addressSaving}
                      className="rounded-2xl py-3.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{addressSaving ? "Verifying & Saving Address..." : "Save Address & Choose Milk Plan"}</span>
                      <FiArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </m.div>
        )}

        {/* ─── STEP 3: ORDER SECTION / PLAN SELECTION ─── */}
        {currentStep === 3 && (
          <m.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header info card */}
            <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#5C1B13]/8 text-[#5C1B13] text-[11px] font-bold tracking-wide mb-2 uppercase">
                  Step 3 of 3 · Final Step
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
                  Select Your Fresh Milk Plan
                </h1>
                <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
                  Bottled fresh after 4:00 AM and delivered chilled in reusable glass bottles to your doorstep.
                </p>
              </div>

              {/* Verified delivery address pill */}
              {savedAddress && (
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] text-xs flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <FiMapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1008]">
                        Delivering to: {savedAddress.street}
                      </p>
                      <p className="text-[11px] text-[#3A241C]/65">
                        {savedAddress.locality}, Raipur ({savedAddress.pincode})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoToStep(2)}
                    className="text-xs font-bold text-[#5C1B13] hover:underline cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {planError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
              >
                <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{planError}</span>
              </div>
            )}

            {/* Plans Grid (reusing PLANS data from src/data/plans.ts) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`
                      relative rounded-3xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer
                      bg-gradient-to-b ${plan.gradient}
                      ${
                        isSelected
                          ? "border-[#5C1B13] ring-4 ring-[#5C1B13]/10 shadow-xl shadow-[#5C1B13]/15 -translate-y-1"
                          : "border-[#E8DFD4] hover:border-[#5C1B13]/40 shadow-xs"
                      }
                    `}
                  >
                    {/* Top badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-6">
                        <span className="px-3 py-1 rounded-full bg-[#5C1B13] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Plan header */}
                      <div className="flex items-center justify-between mb-4 mt-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        {plan.savingsText && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            {plan.savingsText}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-serif font-bold text-[#1A1008] mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#3A241C]/70 mb-4 min-h-[36px]">
                        {plan.description}
                      </p>

                      {/* Pricing block */}
                      <div className="pb-5 mb-5 border-b border-[#E8DFD4]">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-serif font-bold text-[#5C1B13]">
                            ₹{plan.price}
                          </span>
                          {plan.originalPrice && (
                            <span className="text-sm text-[#3A241C]/45 line-through">
                              ₹{plan.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-[#1A1008]">
                            {plan.rateText}
                          </span>
                          <span className="text-xs text-[#3A241C]/50">•</span>
                          <span className="text-xs text-[#3A241C]/65">
                            {plan.periodLabel}
                          </span>
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="space-y-2.5 mb-6 text-xs text-[#3A241C]/80">
                        {plan.features.map((feat, idx) => {
                          const FeatIcon = feat.icon;
                          return (
                            <li key={idx} className="flex items-center gap-2">
                              <FeatIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{feat.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Action button */}
                    <Button
                      type="button"
                      variant={isSelected ? "primary" : "secondary"}
                      size="md"
                      fullWidth
                      disabled={planSubmitting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompletePlanSelection(plan);
                      }}
                      className="rounded-2xl py-3 text-xs font-bold shadow-md cursor-pointer"
                    >
                      {planSubmitting && selectedPlanId === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Activating Delivery...</span>
                        </div>
                      ) : (
                        <span>{plan.ctaText}</span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Back button */}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleGoToStep(2)}
                className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                <FiArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back to Location</span>
              </Button>
            </div>
          </m.div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
