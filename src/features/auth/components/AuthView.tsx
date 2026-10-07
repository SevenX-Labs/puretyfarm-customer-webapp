"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    handleVerifyOtp,
    handleSaveProfile,
  } = useAuthFlow();

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#FDFBF7] flex flex-col justify-between relative overflow-x-hidden lg:overflow-hidden font-sans">
      {/* Background Graphic */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat pointer-events-none opacity-90"
        style={{
          backgroundImage: "url('/loginbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 70%",
        }}
      />

      {/* ─── TOP HEADER ─── */}
      <header className="w-full px-6 py-3 sm:py-4 flex items-center justify-between z-10 max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-3 group select-none transition-transform hover:scale-[1.01]"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-2xs border border-[#E8DFD4] bg-white">
            <Image
              src="/icon.png"
              alt="PuretyFarm Cow Logo"
              width={44}
              height={44}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="flex flex-col">
            <span className="font-heading text-lg sm:text-xl font-black text-[#1A1008] tracking-tight group-hover:text-[#5C1B13] transition-colors leading-tight">
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
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1A1008] hover:text-[#5C1B13] transition-colors py-1.5 px-3 rounded-full hover:bg-white/60 backdrop-blur-xs"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to PuretyFarm</span>
        </Link>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex items-center px-4 sm:px-8 lg:px-12 xl:px-16 py-2 sm:py-4 z-10 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">
          {/* Left Column: Brand Story / Headline */}
          <div className="lg:col-span-6 flex flex-col justify-start pl-2 lg:pl-6 xl:pl-10 pb-4 lg:pb-16 -mt-1 lg:-mt-10">
            <m.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="select-none text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD4] text-[#5C1B13] text-[11px] font-bold mb-3 tracking-wide shadow-2xs backdrop-blur-xs">
                <span>Raipur Sunrise Cold-Chain</span>
              </span>
              <h1 className="font-script text-5xl sm:text-6xl xl:text-[76px] text-[#4A2E1B] leading-[0.98] tracking-tight transform -rotate-1 inline-block">
                Goodness <br className="hidden sm:inline" />
                from Nature
              </h1>
              <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs xl:text-[13px] font-bold text-[#6B584C] tracking-[0.24em] uppercase flex items-center justify-center lg:justify-start gap-2.5">
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
              className="w-full max-w-[420px] sm:max-w-[450px] bg-white rounded-3xl border border-[#E8DFD4] shadow-[0_20px_50px_rgba(74,46,27,0.08)] p-5 sm:p-7 relative overflow-hidden"
            >
              {/* Card Header & Title */}
              <div className="mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A1008] tracking-tight font-[family-name:var(--font-heading)]">
                  {step === "otp"
                    ? "Verify Mobile"
                    : step === "onboarding"
                    ? "Welcome to Purety"
                    : "Sign in to PuretyFarm"}
                </h2>
                <p className="text-xs text-[#6B584C] mt-1 leading-relaxed">
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
                    className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
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
                    className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5"
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
                  countdown={countdown}
                  otpValues={otpValues}
                  otpInputRefs={otpInputRefs}
                  onChangePhone={() => {
                    setStep("phone");
                    setErrorMessage(null);
                  }}
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
              <p className="mt-4 sm:mt-5 text-center text-[11px] text-[#8C7A6B] leading-relaxed">
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

      <footer className="py-2.5 sm:py-3 text-center text-xs text-[#8C7A6B]/80 z-10">
        <span>© {new Date().getFullYear()} PuretyFarm • Fresh Natural A2 Gir Cow Milk in Raipur</span>
      </footer>
    </div>
  );
}
