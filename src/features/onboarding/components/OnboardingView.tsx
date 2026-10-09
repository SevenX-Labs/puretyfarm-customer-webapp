"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { ProfileStep } from "./ProfileStep";
import { ServiceAreaStep } from "./ServiceAreaStep";
import { AddressDetailsStep } from "./AddressDetailsStep";
import { PlanStep } from "./PlanStep";
import { PaymentStep } from "./PaymentStep";
import { StepKey } from "../types";

export function OnboardingView() {
  const {
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
  } = useOnboardingFlow();

  const isStepMounted = (step: StepKey) => {
    return Math.abs(currentStep - step) <= 1;
  };

  const stepsList: { num: StepKey; title: string; desc: string }[] = [
    {
      num: 1,
      title: "Profile Details",
      desc: "Tell us about yourself",
    },
    {
      num: 2,
      title: "Service Area",
      desc: "Choose delivery area",
    },
    {
      num: 3,
      title: "Delivery Address",
      desc: "Enter house & street",
    },
    {
      num: 4,
      title: "Select Plan",
      desc: "Start receiving milk",
    },
    {
      num: 5,
      title: "Payment",
      desc: "Pay via wallet or cash",
    },
  ];

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
          {/* Left Sidebar - Exact Same Fixed Size Across All 5 Steps */}
          <aside className="relative flex flex-col justify-between bg-[#6f2115] p-3.5 sm:p-4.5 md:w-[250px] lg:w-[280px] shrink-0 text-white h-auto md:h-full">
            <div className="space-y-2 md:space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="relative h-6 w-20 sm:h-6.5 sm:w-22">
                  <Image
                    src="/newimge/logo-removebg-preview.png"
                    alt="Purety Farm Logo"
                    fill
                    sizes="(max-width: 640px) 80px, 88px"
                    className="object-contain object-left brightness-0 invert"
                    priority
                  />
                </div>
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] sm:text-[9.5px] font-bold tracking-wide uppercase text-white/90">
                  Step {currentStep} of 5
                </span>
              </div>

              <div className="space-y-0.5">
                <h2 className="font-serif text-sm sm:text-base font-bold text-white md:text-[17px]">
                  {currentStep === 1
                    ? "Welcome to Purety"
                    : currentStep === 2
                    ? "Choose Service Area"
                    : currentStep === 3
                    ? "Delivery Address"
                    : currentStep === 4
                    ? "Select Your Plan"
                    : "Payment & Activation"}
                </h2>
                <p className="hidden md:block text-[9.5px] lg:text-[10.5px] text-white/80 leading-snug">
                  {currentStep === 1
                    ? "Set up your profile to start receiving fresh farm-to-table A2 milk daily."
                    : currentStep === 2
                    ? "Select your state, city, and delivery hub."
                    : currentStep === 3
                    ? "Provide your exact flat, building, and receiver details."
                    : currentStep === 4
                    ? "Choose the milk plan that best fits your family's morning routine."
                    : "Complete payment via wallet or cash to activate morning milk delivery."}
                </p>
              </div>

              {/* Progress Steps List */}
              <nav aria-label="Onboarding Steps" className="pt-0.5 md:pt-1">
                <ol className="flex flex-row md:flex-col gap-1 md:gap-1.5">
                  {stepsList.map((step) => {
                    const isCurrent = currentStep === step.num;
                    const isComplete = currentStep > step.num;
                    const isClickable = step.num <= maxAllowedStep;

                    return (
                      <li
                        className="relative min-w-0 flex-1 md:flex-none"
                        key={step.num}
                      >
                        {step.num < 5 && (
                          <>
                            <span
                              className="absolute left-3 top-5 hidden h-3.5 w-px bg-white/25 md:block lg:left-3 lg:h-4"
                              aria-hidden="true"
                            />
                            <span
                              className="absolute left-[24px] right-0 top-3 h-px bg-white/25 md:hidden"
                              aria-hidden="true"
                            />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            isClickable && handleGoToStep(step.num)
                          }
                          disabled={!isClickable}
                          aria-current={isCurrent ? "step" : undefined}
                          className="relative z-10 flex w-full items-start gap-1.5 text-left disabled:cursor-not-allowed md:gap-2 cursor-pointer"
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold transition-colors duration-200 sm:h-6.5 sm:w-6.5 sm:text-[9.5px] ${
                              isCurrent
                                ? "border-[#f8e94e] bg-[#f8e94e] text-[#6f2115]"
                                : isComplete
                                  ? "border-[#f8e94e] bg-transparent text-[#f8e94e]"
                                  : "border-white/55 bg-transparent text-white"
                            }`}
                          >
                            {isComplete ? (
                              <FiCheck className="h-2.5 w-2.5" aria-hidden="true" />
                            ) : (
                              `0${step.num}`
                            )}
                          </span>
                          <span className="hidden min-w-0 pt-0.5 md:block">
                            <span className="block text-[10.5px] font-semibold text-white lg:text-[11px]">
                              {step.title}
                            </span>
                            <span className="block text-[8.5px] leading-tight text-white/70 lg:text-[9px]">
                              {step.desc}
                            </span>
                          </span>
                          <span className="sr-only md:hidden">{step.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-1.5 pt-2 border-t border-white/15 text-[9.5px] text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f8e94e] shrink-0" />
              <span>Purety Farm Fresh Daily A2 Milk</span>
            </div>
          </aside>

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
                    profileEmail={profileEmail}
                    profileAvatar={profileAvatar}
                    profileGender={profileGender}
                    profileDob={profileDob}
                    profileSaving={profileSaving}
                    profileError={profileError}
                    autoFocus={currentStep === 1}
                    onNameChange={setProfileName}
                    onEmailChange={setProfileEmail}
                    onAvatarChange={setProfileAvatar}
                    onGenderChange={setProfileGender}
                    onDobChange={setProfileDob}
                    onProfileError={setProfileError}
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
                  <ServiceAreaStep
                    selectedStateId={selectedStateId}
                    selectedCityId={selectedCityId}
                    selectedAreaId={selectedAreaId}
                    selectedAreaPincode={selectedAreaPincode}
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
                    onContinue={handleContinueToAddress}
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
                  <AddressDetailsStep
                    user={user}
                    selectedStateId={selectedStateId}
                    selectedCityId={selectedCityId}
                    selectedAreaId={selectedAreaId}
                    selectedAreaName={selectedAreaName}
                    selectedCityName={selectedCityName}
                    selectedPincode={selectedAreaPincode}
                    coords={coords}
                    onBack={() => handleGoToStep(2)}
                    onAddressSaved={handleSaveVerifiedAddress}
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

              {currentStep === 5 && isStepMounted(5) && (
                <m.div
                  key="step-5"
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
