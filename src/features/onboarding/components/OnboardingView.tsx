"use client";

import React from "react";
import { AnimatePresence, m } from "framer-motion";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { ProfileStep } from "./ProfileStep";
import { AddressDetailsStep } from "./AddressDetailsStep";
import { PlanStep } from "./PlanStep";
import { PaymentStep } from "./PaymentStep";
import { StepKey } from "../types";
import { OnboardingSidebar } from "./OnboardingSidebar";

export function OnboardingView() {
  const {
    user,
    refreshUser,
    authLoading,
    initialLoading,
    currentStep,
    maxAllowedStep,
    handleGoToStep,
    // Step 1: Profile
    profileName,
    setProfileName,
    profileWhatsapp,
    setProfileWhatsapp,
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
    // Step 2: Location & Delivery Address
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
    savedAddress,
    handleSaveVerifiedAddress,
    // Step 3: Plan
    selectedPlanId,
    setSelectedPlanId,
    planSubmitting,
    planError,
    handleCompletePlanSelection,
    // Step 4: Payment
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
  } = useOnboardingFlow();

  const isStepMounted = (step: StepKey) => {
    return Math.abs(currentStep - step) <= 1;
  };

  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#faf7f2]">
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#7a2417] border-t-transparent" />
          <p className="text-xs font-semibold text-[#715e50]">
            Preparing your onboarding...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-[#faf7f2] font-sans text-[#24130f] flex flex-col justify-center py-2 sm:py-3">
      <main className="mx-auto w-full max-w-5xl px-2.5 sm:px-4 flex flex-col justify-center items-center">
        <section
          aria-label="Account setup and subscription workflow"
          className="relative flex flex-col md:flex-row w-full min-h-[560px] md:h-[600px] lg:h-[620px] md:max-h-[94vh] rounded-2xl md:rounded-3xl border border-[#e2d5c7] bg-[#fffdf8] shadow-xl overflow-hidden"
        >
          {/* Left Sidebar - Shared across all 4 onboarding steps */}
          <OnboardingSidebar
            currentStep={currentStep}
            maxAllowedStep={maxAllowedStep}
            onGoToStep={handleGoToStep}
          />

          {/* Right Content Panel - Smooth transition only within right side */}
          <div className="relative flex flex-col flex-1 min-h-0 bg-[#fffdf8] overflow-y-auto md:overflow-hidden p-3.5 sm:p-4.5 lg:p-5 h-full">
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === 1 && (
                <m.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden overscroll-contain custom-scrollbar"
                >
                  <ProfileStep
                    user={user}
                    profileName={profileName}
                    profileWhatsapp={profileWhatsapp}
                    profileEmail={profileEmail}
                    profileAvatar={profileAvatar}
                    profileGender={profileGender}
                    profileDob={profileDob}
                    profileSaving={profileSaving}
                    profileError={profileError}
                    autoFocus={currentStep === 1}
                    onNameChange={setProfileName}
                    onWhatsappChange={setProfileWhatsapp}
                    onEmailChange={setProfileEmail}
                    onAvatarChange={setProfileAvatar}
                    onGenderChange={setProfileGender}
                    onDobChange={setProfileDob}
                    onProfileError={setProfileError}
                    onEmailVerified={async (email) => {
                      setProfileEmail(email);
                      await refreshUser();
                    }}
                    onSubmit={handleSaveProfile}
                  />
                </m.div>
              )}

              {currentStep === 2 && isStepMounted(2) && (
                <m.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden overscroll-contain custom-scrollbar"
                >
                  <AddressDetailsStep
                    user={user}
                    selectedStateId={selectedStateId}
                    selectedCityId={selectedCityId}
                    selectedAreaId={selectedAreaId}
                    selectedAreaName={selectedAreaName}
                    selectedCityName={selectedCityName}
                    selectedPincode={selectedAreaPincode}
                    coords={coords}
                    onStateChange={setSelectedStateId}
                    onCityChange={(cityId, cityName) => {
                      setSelectedCityId(cityId);
                      if (cityName) setSelectedCityName(cityName);
                    }}
                    onAreaChange={(areaId, pincode, areaName) => {
                      setSelectedAreaId(areaId);
                      setSelectedAreaPincode(pincode);
                      if (areaName) setSelectedAreaName(areaName);
                    }}
                    onCoordsChange={setCoords}
                    onBack={() => handleGoToStep(1)}
                    onAddressSaved={handleSaveVerifiedAddress}
                  />
                </m.div>
              )}

              {currentStep === 3 && isStepMounted(3) && (
                <m.div
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden overscroll-contain custom-scrollbar"
                >
                  <PlanStep
                    savedAddress={savedAddress}
                    selectedPlanId={selectedPlanId}
                    planSubmitting={planSubmitting}
                    planError={planError}
                    onSelectPlanId={setSelectedPlanId}
                    onCompletePlanSelection={handleCompletePlanSelection}
                    onGoToStep={handleGoToStep}
                  />
                </m.div>
              )}

              {currentStep === 4 && isStepMounted(4) && (
                <m.div
                  key="step-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="h-full flex flex-col overflow-y-auto lg:overflow-hidden overscroll-contain custom-scrollbar"
                >
                  <PaymentStep
                    quote={pendingQuote}
                    plan={pendingPlan}
                    walletBalancePaise={walletBalancePaise}
                    walletAutoCredit={walletAutoCredit}
                    walletLoading={walletLoading}
                    paymentSubmitting={paymentSubmitting}
                    paymentError={paymentError}
                    paymentNotice={paymentNotice}
                    onReloadWallet={reloadWallet}
                    onPayFromWallet={handlePayFromWallet}
                    onPayOnline={handlePayOnline}
                    onPayCash={handlePayCash}
                    onBackToPlans={handleCancelPendingQuote}
                  />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
