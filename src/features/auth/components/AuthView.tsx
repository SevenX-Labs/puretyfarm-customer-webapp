"use client";

import React from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuthFlow } from "../hooks/useAuthFlow";
import { PhoneStep } from "./PhoneStep";
import { OtpStep } from "./OtpStep";
import { OnboardingStep } from "./OnboardingStep";

export function AuthView() {
  const {
    step,
    setStep,
    phoneNumber,
    otpValues,
    devOtpHint,
    name,
    setName,
    email,
    setEmail,
    loading,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    countdown,
    otpInputRefs,
    handlePhoneChange,
    handleSendOtp,
    handleOtpDigitChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleAutofillDevOtp,
    handleVerifyOtp,
    handleSaveProfile,
  } = useAuthFlow();

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-between selection:bg-[#5C1B13]/15 selection:text-[#5C1B13]">
      {/* ─── TOP NAVIGATION BAR ─── */}
      <header className="w-full py-5 px-4 sm:px-8 border-b border-[#E8DFD4] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <BrandLogo size="sm" priority />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C1B13] hover:text-[#40110D] transition-colors px-3 py-1.5 rounded-full hover:bg-[#5C1B13]/5"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to PuretyFarm</span>
          </Link>
        </div>
      </header>

      {/* ─── MAIN AUTH CONTAINER ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-white rounded-3xl border border-[#E8DFD4] shadow-xl shadow-[#5C1B13]/6 p-6 sm:p-9 relative overflow-hidden"
          >
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5C1B13] via-[#8B2B20] to-[#F5E729]" />

            {/* Error Banner */}
            <AnimatePresence>
              {errorMessage && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
                >
                  <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{errorMessage}</span>
                </m.div>
              )}
            </AnimatePresence>

            {/* Success Banner */}
            <AnimatePresence>
              {successMessage && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5"
                >
                  <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{successMessage}</span>
                </m.div>
              )}
            </AnimatePresence>

            {/* ─── STEP 1: PHONE NUMBER INPUT ─── */}
            {step === "phone" && (
              <PhoneStep
                phoneNumber={phoneNumber}
                loading={loading}
                onPhoneChange={handlePhoneChange}
                onSubmit={handleSendOtp}
              />
            )}

            {/* ─── STEP 2: 6-DIGIT OTP VERIFICATION ─── */}
            {step === "otp" && (
              <OtpStep
                phoneNumber={phoneNumber}
                loading={loading}
                devOtpHint={devOtpHint}
                countdown={countdown}
                otpValues={otpValues}
                otpInputRefs={otpInputRefs}
                onChangePhone={() => {
                  setStep("phone");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                onAutofillDevOtp={handleAutofillDevOtp}
                onOtpDigitChange={handleOtpDigitChange}
                onOtpKeyDown={handleOtpKeyDown}
                onOtpPaste={handleOtpPaste}
                onResendOtp={() => handleSendOtp()}
                onSubmit={handleVerifyOtp}
              />
            )}

            {/* ─── STEP 3: FIRST-TIME USER ONBOARDING ─── */}
            {step === "onboarding" && (
              <OnboardingStep
                name={name}
                email={email}
                loading={loading}
                onNameChange={setName}
                onEmailChange={setEmail}
                onSubmit={handleSaveProfile}
              />
            )}
          </m.div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-[#3A241C]/50">
            By signing in, you agree to PuretyFarm&apos;s{" "}
            <Link href="/terms-and-conditions" className="underline hover:text-[#5C1B13]">
              Terms of Use
            </Link>{" "}
            &{" "}
            <Link href="/privacy-policy" className="underline hover:text-[#5C1B13]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-4 text-center border-t border-[#E8DFD4] text-[11px] text-[#3A241C]/50">
        © {new Date().getFullYear()} PuretyFarm. Pure A2 Desi Gir Cow Milk Delivered Fresh in Raipur.
      </footer>
    </div>
  );
}
