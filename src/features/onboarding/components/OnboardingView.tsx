"use client";

import { m, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { Navbar } from "@/components/ui/Navbar";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { ProfileStep } from "./ProfileStep";
import { ServiceAreaStep } from "./ServiceAreaStep";
import { AddressDetailsStep } from "./AddressDetailsStep";
import { PlanStep } from "./PlanStep";
import { StepKey } from "../types";

const STEPS = [
  {
    num: 1 as const,
    title: "Profile Details",
    desc: "Tell us about yourself",
    sidebarHeading: "Complete\nYour Profile",
    sidebarText: "Tell us who will receive the daily morning milk at your home.",
  },
  {
    num: 2 as const,
    title: "Service Area",
    desc: "Choose delivery area",
    sidebarHeading: "Choose\nService Area",
    sidebarText: "Select your state, city, and delivery hub in Raipur.",
  },
  {
    num: 3 as const,
    title: "Delivery Address",
    desc: "Enter house & street",
    sidebarHeading: "Delivery\nAddress",
    sidebarText: "Enter your house number, building, and street details.",
  },
  {
    num: 4 as const,
    title: "Select Plan",
    desc: "Start receiving milk",
    sidebarHeading: "Select\nYour Plan",
    sidebarText: "Choose the fresh milk subscription or trial for your family.",
  },
];

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
    profileGender,
    setProfileGender,
    profileDob,
    setProfileDob,
    profileSaving,
    profileError,
    setProfileError,
    handleSaveProfile,
    // Step 2
    selectedStateId,
    setSelectedStateId,
    selectedCityId,
    setSelectedCityId,
    selectedAreaId,
    setSelectedAreaId,
    selectedAreaPincode,
    setSelectedAreaPincode,
    selectedAreaName,
    selectedCityName,
    coords,
    setCoords,
    handleContinueToAddress,
    // Step 3
    savedAddress,
    handleSaveVerifiedAddress,
    // Step 4
    selectedPlanId,
    setSelectedPlanId,
    planSubmitting,
    planError,
    handleCompletePlanSelection,
  } = useOnboardingFlow();

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-svh bg-[#f7e8cf]">
        <Navbar />
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-3 border-[#7a2417] border-t-transparent" />
            <p className="text-xs font-medium text-[#715e50]">
              Setting up your PuretyFarm journey...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isStepMounted = (step: StepKey) =>
    maxAllowedStep >= step || currentStep >= step;

  const currentStepMeta = STEPS.find((s) => s.num === currentStep) || STEPS[0];

  return (
    <div className="min-h-svh lg:h-svh lg:overflow-hidden bg-[#f7e8cf] selection:bg-[#7a2417]/15 selection:text-[#7a2417] flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto flex flex-1 w-full max-w-[1320px] flex-col justify-center px-3 pt-[74px] pb-3 sm:px-6 sm:pt-[82px] sm:pb-5 lg:px-8 lg:pt-[86px] lg:pb-5">
        <section
          aria-label="PuretyFarm onboarding"
          className="mx-auto grid w-full max-w-[1240px] md:max-h-[calc(100svh-5.8rem)] lg:max-h-[calc(100svh-6.2rem)] overflow-hidden rounded-2xl md:rounded-[24px] border border-[#e7d8c5] bg-[#fffdf8] shadow-[0_18px_48px_rgba(74,46,27,0.10)] md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]"
        >
          {/* Left Sidebar */}
          <aside className="relative flex flex-col justify-between overflow-hidden bg-[#6f2115] p-4 sm:p-5 lg:p-6 text-white shrink-0">
            <div className="space-y-3 sm:space-y-3.5">
              <div>
                <span className="inline-block rounded-full border border-white/25 bg-[#fff8ee] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f2115]">
                  Step {currentStep} of 4
                </span>

                <h1 className="mt-2 font-heading text-[19px] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[21px] md:mt-2.5 md:text-[23px] lg:text-[25px] whitespace-pre-line">
                  {currentStepMeta.sidebarHeading}
                </h1>
                <p className="mt-0.5 max-w-[260px] text-[11px] leading-[1.45] text-white/85 sm:text-[12px]">
                  {currentStepMeta.sidebarText}
                </p>
              </div>

              <nav aria-label="Onboarding steps" className="pt-0.5 md:pt-1">
                <ol className="flex gap-1.5 md:flex-col md:gap-2 lg:gap-2.5">
                  {STEPS.map((step) => {
                    const isComplete = step.num < currentStep;
                    const isCurrent = step.num === currentStep;
                    const isClickable = step.num <= maxAllowedStep;

                    return (
                      <li
                        className="relative min-w-0 flex-1 md:flex-none"
                        key={step.num}
                      >
                        {step.num < 4 && (
                          <>
                            <span
                              className="absolute left-3.5 top-6 hidden h-4.5 w-px bg-white/25 md:block lg:left-3.5 lg:h-5"
                              aria-hidden="true"
                            />
                            <span
                              className="absolute left-[26px] right-0 top-3 h-px bg-white/25 md:hidden"
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
                            className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border text-[9.5px] font-semibold transition-colors duration-200 sm:h-7 sm:w-7 sm:text-[10px] ${
                              isCurrent
                                ? "border-[#f8e94e] bg-[#f8e94e] text-[#6f2115]"
                                : isComplete
                                  ? "border-[#f8e94e] bg-transparent text-[#f8e94e]"
                                  : "border-white/55 bg-transparent text-white"
                            }`}
                          >
                            {isComplete ? (
                              <FiCheck className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              `0${step.num}`
                            )}
                          </span>
                          <span className="hidden min-w-0 pt-0.5 md:block">
                            <span className="block text-[11px] font-semibold text-white lg:text-[11.5px]">
                              {step.title}
                            </span>
                            <span className="block text-[9px] leading-snug text-white/70 lg:text-[9.5px]">
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

            <div className="hidden md:flex items-center gap-2 pt-2.5 border-t border-white/15 text-[10px] text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f8e94e] shrink-0" />
              <span>Raipur&apos;s Fresh Daily Morning A2 Milk</span>
            </div>
          </aside>

          {/* Right Content Panel */}
          <div className="relative flex flex-col flex-1 min-h-0 bg-[#fffdf8] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === 1 && (
                <m.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="h-full overflow-y-auto lg:overflow-hidden overscroll-contain scrollbar-hide no-scrollbar"
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
                  className="h-full overflow-y-auto lg:overflow-hidden overscroll-contain scrollbar-hide no-scrollbar"
                >
                  <ServiceAreaStep
                    selectedStateId={selectedStateId}
                    selectedCityId={selectedCityId}
                    selectedAreaId={selectedAreaId}
                    selectedAreaPincode={selectedAreaPincode}
                    onStateChange={setSelectedStateId}
                    onCityChange={setSelectedCityId}
                    onAreaChange={(areaId, pincode) => {
                      setSelectedAreaId(areaId);
                      setSelectedAreaPincode(pincode);
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
                  className="h-full overflow-y-auto lg:overflow-hidden overscroll-contain scrollbar-hide no-scrollbar"
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
                  className="h-full overflow-y-auto overscroll-contain scrollbar-hide no-scrollbar p-3.5 sm:p-5 lg:p-6"
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
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
