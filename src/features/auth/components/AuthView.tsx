"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
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
    <div
      className="min-h-screen w-full relative flex flex-col justify-between bg-[#F8F3EA] bg-cover bg-center bg-no-repeat selection:bg-[#5C1B13]/15 selection:text-[#5C1B13] overflow-x-hidden"
      style={{
        backgroundImage: "url('/loginbg.jpeg')",
      }}
    >
      {/* ─── TOP NAVIGATION BAR ─── */}
      <header className="w-full py-5 sm:py-6 px-4 sm:px-10 lg:px-16 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13] rounded-xl"
        >
          <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FCE22A] flex items-center justify-center shrink-0 shadow-xs p-1.5 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-mark-clean.webp"
              alt="PuretyFarm Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </span>

          <span className="flex flex-col text-left select-none">
            <span className="text-xl sm:text-2xl font-bold text-[#1A1008] tracking-tight leading-tight font-[family-name:var(--font-heading)]">
              PuretyFarm
            </span>
            <span
              className="text-[8.5px] sm:text-[9.5px] font-bold text-[#4A2E1B] uppercase leading-none mt-0.5 whitespace-nowrap"
              style={{ letterSpacing: "0.16em" }}
            >
              Raipur&apos;s No.1 A2 Milk
            </span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1A1008] hover:text-[#5C1B13] transition-colors py-2 px-3.5 rounded-full hover:bg-white/60 backdrop-blur-xs"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to PuretyFarm</span>
        </Link>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex items-center px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 z-10 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Column: Brand Story / Headline */}
          <div className="lg:col-span-6 flex flex-col justify-start pl-2 lg:pl-6 xl:pl-10 pb-6 lg:pb-28 -mt-2 lg:-mt-16">
            <m.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="select-none text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD4] text-[#5C1B13] text-[11px] font-bold mb-4 tracking-wide shadow-2xs backdrop-blur-xs">
                <span>Raipur Sunrise Cold-Chain</span>
              </span>
              <h1 className="font-script text-5xl sm:text-6xl xl:text-[76px] text-[#4A2E1B] leading-[0.98] tracking-tight transform -rotate-1 inline-block">
                Goodness <br className="hidden sm:inline" />
                from Nature
              </h1>
              <p className="mt-4 text-[11px] sm:text-xs xl:text-[13px] font-bold text-[#6B584C] tracking-[0.24em] uppercase flex items-center justify-center lg:justify-start gap-2.5">
                <span>PURE</span>
                <span className="text-[#8C603D]" aria-hidden="true">•</span>
                <span>NATURAL</span>
                <span className="text-[#8C603D]" aria-hidden="true">•</span>
                <span>FARM FRESH</span>
              </p>
            </m.div>
          </div>

          {/* Right Column: Clean Mobile Number & OTP Auth Card */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-center w-full lg:pl-2 xl:pl-4">
            <m.div
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-[430px] sm:max-w-[460px] bg-white rounded-3xl border border-[#E8DFD4] shadow-[0_20px_50px_rgba(74,46,27,0.08)] p-6 sm:p-9 relative overflow-hidden"
            >
              {/* Card Header & Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1A1008] tracking-tight font-[family-name:var(--font-heading)]">
                  {step === "otp"
                    ? "Verify Mobile"
                    : step === "onboarding"
                    ? "Welcome to Purety"
                    : "Sign in to PuretyFarm"}
                </h2>
                <p className="text-xs text-[#6B584C] mt-1.5 leading-relaxed">
                  {step === "otp"
                    ? "Enter the 6-digit verification code sent to your phone."
                    : step === "onboarding"
                    ? "Please tell us your name to personalize your deliveries."
                    : "Enter your mobile number to sign in or create an account. No password needed."}
                </p>
              </div>

              {/* Non-intrusive Inline Error Banner */}
              <AnimatePresence>
                {errorMessage && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
                  >
                    <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="flex-1 font-medium">{errorMessage}</span>
                  </m.div>
                )}
              </AnimatePresence>

              {/* Non-intrusive Inline Success Banner */}
              <AnimatePresence>
                {successMessage && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5"
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

              {/* Legal disclaimer */}
              <p className="mt-6 text-center text-[11px] text-[#8C7A6B] leading-relaxed">
                By continuing, you agree to PuretyFarm&apos;s{" "}
                <Link
                  href="/terms-and-conditions"
                  className="underline hover:text-[#1A1008] font-medium"
                >
                  Terms of Service
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-[#1A1008] font-medium"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </m.div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#8C7A6B]/80 z-10">
        <span>© {new Date().getFullYear()} PuretyFarm • Fresh Natural A2 Gir Cow Milk in Raipur</span>
      </footer>
    </div>
  );
}
