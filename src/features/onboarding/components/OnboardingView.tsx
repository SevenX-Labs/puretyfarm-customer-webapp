"use client";

import { m } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { Navbar } from "@/components/ui/Navbar";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { ProfileStep } from "./ProfileStep";
import { LocationStep } from "./LocationStep";
import { PlanStep } from "./PlanStep";
import { StepKey } from "../types";

const STEPS = [
  { num: 1 as const, title: "Profile Details", desc: "Tell us about yourself" },
  { num: 2 as const, title: "Delivery Location", desc: "Choose your service area" },
  { num: 3 as const, title: "Select Plan", desc: "Start receiving fresh milk" },
];

export function OnboardingView() {
  const {
    user,
    authLoading,
    initialLoading,
    currentStep,
    maxAllowedStep,
    handleGoToStep,
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
    savedAddress,
    handleSaveVerifiedAddress,
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

  const panelMotion = (step: StepKey) => ({
    opacity: currentStep === step ? 1 : 0,
    x: currentStep === step ? 0 : currentStep > step ? -10 : 10,
  });

  return (
    <div className="min-h-svh bg-[#f7e8cf] selection:bg-[#7a2417]/15 selection:text-[#7a2417]">
      <Navbar />
      <main className="mx-auto flex min-h-svh w-full max-w-[1400px] items-center justify-center px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <section
          aria-label="PuretyFarm onboarding"
          className="mx-auto grid w-full max-w-[1280px] overflow-hidden rounded-[24px] border border-[#e7d8c5] bg-[#fffdf8] shadow-[0_18px_48px_rgba(74,46,27,0.10)] md:min-h-[650px] md:grid-cols-[minmax(230px,32%)_minmax(0,68%)]"
        >
          <aside className="relative flex flex-col overflow-hidden bg-[#6f2115] px-5 py-5 text-white sm:px-8 sm:py-7 md:px-8 md:py-8 lg:px-9 lg:py-9">
            <span className="w-fit rounded-full border border-white/25 bg-[#fff8ee] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f2115]">
              Step {currentStep} of 3
            </span>

            <h1 className="mt-4 font-heading text-[24px] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[30px] md:mt-6 md:text-[32px]">
              Complete
              <br />
              Your Profile
            </h1>
            <p className="mt-2 max-w-[280px] text-[12px] leading-[1.6] text-white/85 sm:text-[14px]">
              Tell us who will receive
              <br className="hidden md:block" /> the daily morning milk
              <br className="hidden md:block" /> at your home.
            </p>

            <nav aria-label="Onboarding steps" className="mt-5 md:mt-8">
              <ol className="flex gap-2 md:flex-col md:gap-5">
                {STEPS.map((step) => {
                  const isComplete = step.num < currentStep;
                  const isCurrent = step.num === currentStep;
                  const isClickable = step.num <= maxAllowedStep;

                  return (
                    <li
                      className="relative min-w-0 flex-1 md:flex-none"
                      key={step.num}
                    >
                      {step.num < 3 && (
                        <>
                          <span
                            className="absolute left-4 top-9 hidden h-8 w-px bg-white/25 md:block"
                            aria-hidden="true"
                          />
                          <span
                            className="absolute left-[34px] right-0 top-4 h-px bg-white/25 md:hidden"
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
                        className="relative z-10 flex w-full items-start gap-2 text-left disabled:cursor-not-allowed md:gap-3"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-200 sm:h-[34px] sm:w-[34px] ${
                            isCurrent
                              ? "border-[#f8e94e] bg-[#f8e94e] text-[#6f2115]"
                              : isComplete
                                ? "border-[#f8e94e] bg-transparent text-[#f8e94e]"
                                : "border-white/55 bg-transparent text-white"
                          }`}
                        >
                          {isComplete ? (
                            <FiCheck className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            `0${step.num}`
                          )}
                        </span>
                        <span className="hidden min-w-0 pt-0.5 md:block">
                          <span className="block text-[12px] font-semibold text-white lg:text-[13px]">
                            {step.title}
                          </span>
                          <span className="mt-1 block text-[10px] leading-relaxed text-white/70 lg:text-[11px]">
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
          </aside>

          <div className="relative min-h-[600px] bg-[#fffdf8] md:min-h-[650px]">
            <m.div
              initial={false}
              animate={panelMotion(1)}
              transition={{ duration: 0.24, ease: "easeOut" }}
              aria-hidden={currentStep !== 1}
              inert={currentStep !== 1}
              style={{ zIndex: currentStep === 1 ? 2 : 1 }}
              className={`absolute inset-0 overflow-y-auto ${
                currentStep === 1 ? "pointer-events-auto" : "pointer-events-none"
              }`}
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

            {isStepMounted(2) && (
              <m.div
                initial={false}
                animate={panelMotion(2)}
                transition={{ duration: 0.24, ease: "easeOut" }}
                aria-hidden={currentStep !== 2}
                inert={currentStep !== 2}
                style={{ zIndex: currentStep === 2 ? 2 : 1 }}
                className={`absolute inset-0 overflow-y-auto p-5 sm:p-8 lg:p-10 ${
                  currentStep === 2
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`}
              >
                <LocationStep
                  user={user}
                  onBack={() => handleGoToStep(1)}
                  onAddressSaved={handleSaveVerifiedAddress}
                />
              </m.div>
            )}

            {isStepMounted(3) && (
              <m.div
                initial={false}
                animate={panelMotion(3)}
                transition={{ duration: 0.24, ease: "easeOut" }}
                aria-hidden={currentStep !== 3}
                inert={currentStep !== 3}
                style={{ zIndex: currentStep === 3 ? 2 : 1 }}
                className={`absolute inset-0 overflow-y-auto p-5 sm:p-8 lg:p-10 ${
                  currentStep === 3
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`}
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
          </div>
        </section>
      </main>
    </div>
  );
}
