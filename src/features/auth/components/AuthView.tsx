"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { LuLeaf, LuShieldCheck, LuTruck } from "react-icons/lu";
import { useAuthFlow } from "../hooks/useAuthFlow";
import { PhoneStep } from "./PhoneStep";
import { OtpStep } from "./OtpStep";
import { OnboardingStep } from "./OnboardingStep";

const features = [
  { icon: LuLeaf, firstLine: "A2 Milk", secondLine: "Products" },
  { icon: LuTruck, firstLine: "Farm Fresh", secondLine: "Delivery" },
  { icon: LuShieldCheck, firstLine: "Pure", secondLine: "& Trusted" },
];

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

  const heading =
    step === "otp"
      ? "Enter verification code"
      : step === "onboarding"
        ? "Welcome to PuretyFarm"
        : "Welcome Back";
  const description =
    step === "otp"
      ? "We've sent a verification code to"
      : step === "onboarding"
        ? "Tell us a little about yourself to personalize your deliveries."
        : "Enter your phone number to receive a one-time password (OTP)";

  return (
    <main
      className="fixed inset-0 isolate flex min-h-svh w-full items-center overflow-x-hidden overflow-y-auto bg-[#f3dfc0] bg-cover bg-center bg-no-repeat text-[#24130f]"
      style={{
        backgroundImage:
          "url('/newimge/Sepia%20Countryside%20Farm%20Panorama.png')",
      }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center gap-5 px-4 py-6 sm:px-6 md:grid md:min-h-svh md:grid-cols-[minmax(0,1fr)_minmax(320px,40%)] md:items-center md:gap-4 md:px-6 md:py-6 lg:w-[92vw] lg:grid-cols-[minmax(0,1fr)_minmax(460px,520px)] lg:gap-8 lg:px-0 lg:py-8 xl:w-[84vw] xl:grid-cols-[minmax(0,1fr)_540px] xl:gap-14">
        <section className="relative isolate hidden w-full self-stretch md:flex md:flex-col md:justify-center lg:justify-start lg:pt-[28svh]">
          <m.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="relative z-10 max-w-[600px] lg:pl-1"
          >
            <h1 className="text-[clamp(2.75rem,5vw,3.5rem)] font-extrabold leading-[1.01] tracking-[-0.04em] text-[#24130f] lg:text-[clamp(3.5rem,4.3vw,4rem)] xl:text-[68px] 2xl:text-[72px]">
              Pure <span className="text-[#7a2417]">Goodness</span>
              <br />
              From Our Farm
              <br />
              To Your Home.
            </h1>
            <p className="mt-4 max-w-[500px] text-[16px] leading-[1.6] text-[#3e332c] lg:mt-5 lg:text-[18px]">
              Fresh A2 milk and natural dairy products,
              <br className="hidden lg:block" /> straight from our farm to your doorstep.
            </p>

            <div className="mt-6 hidden items-center lg:mt-7 md:hidden lg:flex">
              {features.map(({ icon: Icon, firstLine, secondLine }, index) => (
                <div className="flex items-center" key={firstLine}>
                  {index > 0 && (
                    <span
                      className="mx-3 h-12 w-px bg-[#7a593e]/30 xl:mx-5"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex items-center gap-2 xl:gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffe899] text-[#4a1e12] xl:h-12 xl:w-12">
                      <Icon className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
                    </span>
                    <span className="text-[13px] font-bold leading-[1.35] text-[#24130f] xl:text-[15px]">
                      {firstLine}
                      <br />
                      {secondLine}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </m.div>
        </section>

        <div className="w-full max-w-[430px] md:max-w-none md:justify-self-end lg:max-w-none">
          <m.section
            aria-label="Sign in to PuretyFarm"
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative isolate flex min-h-[500px] flex-col justify-center overflow-hidden rounded-[24px] border border-[#e7ddd0] bg-[#fffdf8] px-5 py-6 shadow-[0_24px_70px_rgba(64,37,18,0.16)] sm:px-8 sm:py-8 md:min-h-[520px] lg:min-h-[570px] lg:min-w-[460px] lg:rounded-[28px] lg:px-8 lg:py-8 xl:min-h-[620px] xl:rounded-[28px] xl:px-[54px] xl:py-[52px]"
          >
            <div
              className="pointer-events-none absolute -right-5 -top-10 -z-10 h-36 w-36 rounded-bl-[120px] bg-[#f8e94e]/40"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-12 -top-12 -z-10 h-36 w-36 rounded-bl-[120px] bg-[#f8e94e]/35"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-16 -right-12 -z-10 h-32 w-40 rounded-tl-[100px] bg-[#f8e94e]/30"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mb-4 flex justify-center sm:mb-5 xl:mb-6">
                <Image
                  src="/newimge/logo-removebg-preview.png"
                  alt="PuretyFarm — 100% Pure A2 Milk Products"
                  width={378}
                  height={229}
                  priority
                  className="h-auto w-[148px] object-contain sm:w-[160px] xl:w-[180px]"
                />
              </div>

              <div className="mb-5 text-center sm:mb-6 xl:mb-7">
                <h2 className="text-[28px] font-bold leading-tight tracking-[-0.04em] text-[#24130f] sm:text-[30px] xl:text-[34px]">
                  {heading}
                </h2>
                <p className="mx-auto mt-2 max-w-[330px] text-[14px] leading-[1.5] text-[#715e50] sm:text-[15px]">
                  {description}
                  {step === "otp" && (
                    <span className="mt-0.5 block font-semibold tracking-[0.02em] text-[#4a3830]">
                      +91 {phoneNumber.slice(0, 2)}••• •••{phoneNumber.slice(-2)}
                    </span>
                  )}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {errorMessage && (
                  <m.div
                    key="error"
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-medium text-red-700"
                  >
                    <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </m.div>
                )}
                {successMessage && !errorMessage && (
                  <m.div
                    key="success"
                    role="status"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12px] font-medium text-emerald-800"
                  >
                    <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{successMessage}</span>
                  </m.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                {step === "phone" && (
                  <m.div
                    key="phone"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <PhoneStep
                      phoneNumber={phoneNumber}
                      loading={loading}
                      onPhoneChange={handlePhoneChange}
                      onSubmit={handleSendOtp}
                    />
                  </m.div>
                )}
                {step === "otp" && (
                  <m.div
                    key="otp"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <OtpStep
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
                  </m.div>
                )}
                {step === "onboarding" && (
                  <m.div
                    key="onboarding"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <OnboardingStep
                      name={name}
                      email={email}
                      loading={loading}
                      onNameChange={setName}
                      onEmailChange={setEmail}
                      onSubmit={handleSaveProfile}
                    />
                  </m.div>
                )}
              </AnimatePresence>

              <p className="mt-5 text-center text-[10px] leading-relaxed text-[#8c7a6b] sm:mt-6 sm:text-[11px]">
                By continuing, you agree to our
                <br />
                <Link
                  href="/terms-and-conditions"
                  className="font-medium text-[#4e382c] underline underline-offset-2 hover:text-[#7a2417]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-[#4e382c] underline underline-offset-2 hover:text-[#7a2417]"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </m.section>
        </div>
      </div>
    </main>
  );
}
