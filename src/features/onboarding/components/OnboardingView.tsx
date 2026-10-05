"use client";

import React from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { ProfileStep } from "./ProfileStep";
import { LocationStep } from "./LocationStep";
import { PlanStep } from "./PlanStep";
import { StepKey } from "../types";
import { FiCheck } from "react-icons/fi";

export function OnboardingView() {
  const {
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
    profileSaving,
    profileError,
    setProfileError,
    handleSaveProfile,
    // Step 2
    savedAddress,
    autoChecking,
    autoCheckError,
    manualPincode,
    setManualPincode,
    manualLocality,
    setManualLocality,
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
  } = useOnboardingFlow();

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
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
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
          <ProfileStep
            user={user}
            profileName={profileName}
            profileEmail={profileEmail}
            profileAvatar={profileAvatar}
            profileSaving={profileSaving}
            profileError={profileError}
            onNameChange={setProfileName}
            onEmailChange={setProfileEmail}
            onAvatarChange={setProfileAvatar}
            onProfileError={setProfileError}
            onSubmit={handleSaveProfile}
          />
        )}

        {/* ─── STEP 2: DELIVERY LOCATION + SERVICEABILITY ─── */}
        {currentStep === 2 && (
          <LocationStep
            user={user}
            autoChecking={autoChecking}
            autoCheckError={autoCheckError}
            manualPincode={manualPincode}
            manualLocality={manualLocality}
            manualChecking={manualChecking}
            serviceCheckResult={serviceCheckResult}
            addressDetails={addressDetails}
            addressSaving={addressSaving}
            addressSaveError={addressSaveError}
            waitlistJoining={waitlistJoining}
            waitlistJoined={waitlistJoined}
            onGoBack={() => handleGoToStep(1)}
            onAutoLocationCheck={handleAutoLocationCheck}
            onManualPincodeChange={setManualPincode}
            onManualLocalityChange={setManualLocality}
            onManualCheck={handleManualCheck}
            onJoinWaitlist={handleJoinWaitlist}
            onResetServiceCheck={() => {
              setServiceCheckResult(null);
              setManualPincode("");
              setManualLocality("");
            }}
            onAddressDetailsChange={setAddressDetails}
            onSaveAddress={handleSaveVerifiedAddress}
          />
        )}

        {/* ─── STEP 3: ORDER SECTION / PLAN SELECTION ─── */}
        {currentStep === 3 && (
          <PlanStep
            savedAddress={savedAddress}
            selectedPlanId={selectedPlanId}
            planSubmitting={planSubmitting}
            planError={planError}
            onSelectPlanId={setSelectedPlanId}
            onCompletePlanSelection={handleCompletePlanSelection}
            onGoToStep={handleGoToStep}
          />
        )}
      </main>
    </div>
  );
}
