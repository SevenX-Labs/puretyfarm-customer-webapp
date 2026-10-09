"use client";

import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { GiMilkCarton } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { PhoneStep } from "./PhoneStep";
import { OtpStep } from "./OtpStep";
import { OnboardingStep } from "./OnboardingStep";
import { useAuthFlow } from "../hooks/useAuthFlow";

const features = [
  {
    icon: GiMilkCarton,
    firstLine: "A2 Milk",
    secondLine: "Products",
  },
  {
    icon: TbTruckDelivery,
    firstLine: "Farm Fresh",
    secondLine: "Delivery",
  },
  {
    icon: HiOutlineBadgeCheck,
    firstLine: "Pure",
    secondLine: "& Trusted",
  },
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
    authStatus,
  } = useAuthFlow();

  if (authStatus === "loading" || authStatus === "authenticated") {
    return (
      <main className="min-h-svh flex items-center justify-center bg-[#f3dfc0]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
      </main>
    );
  }

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
      className="min-h-svh lg:h-svh lg:overflow-hidden isolate flex w-full flex-col justify-center overflow-x-hidden overflow-y-auto bg-[#f3dfc0] bg-cover bg-center bg-no-repeat text-[#24130f] pt-[74px] sm:pt-[82px] lg:pt-[86px] pb-3 sm:pb-5 lg:pb-5"
      style={{
        backgroundImage:
          "url('/newimge/Sepia%20Countryside%20Farm%20Panorama.png')",
      }}
    >
      <div className="relative z-10 mx-auto flex flex-1 w-full max-w-[1360px] flex-col items-center justify-center gap-4 px-3 sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(340px,410px)] lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] xl:grid-cols-[minmax(0,1fr)_460px] md:items-center lg:gap-8 xl:gap-12 md:max-h-[calc(100svh-5.8rem)]">
        <section className="relative isolate hidden w-full self-stretch md:flex md:flex-col md:justify-center">
          <m.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 max-w-[560px] lg:pl-1"
          >
            <h1 className="text-[clamp(2.2rem,3.8vw,3.2rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#24130f] xl:text-[54px]">
              Pure <span className="text-[#7a2417]">Goodness</span>
              <br />
              From Our Farm
              <br />
              To Your Home.
            </h1>
            <p className="mt-2.5 max-w-[460px] text-[13.5px] leading-[1.5] text-[#3e332c] sm:text-[14.5px] lg:mt-3.5">
              Fresh A2 milk and natural dairy products,
              <br className="hidden lg:block" /> straight from our farm to your doorstep.
            </p>

            <div className="mt-4 hidden items-center lg:mt-5 md:hidden lg:flex">
              {features.map(({ icon: Icon, firstLine, secondLine }, index) => (
                <div className="flex items-center" key={firstLine}>
                  {index > 0 && (
                    <span
                      className="mx-3 h-10 w-px bg-[#7a593e]/30 xl:mx-4"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex items-center gap-2 xl:gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe899] text-[#4a1e12] xl:h-11 xl:w-11">
                      <Icon className="h-4.5 w-4.5 xl:h-5 xl:w-5" aria-hidden="true" />
                    </span>
                    <span className="text-[12.5px] font-bold leading-[1.3] text-[#24130f] xl:text-[13.5px]">
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

        <div className="w-full max-w-[430px] md:max-w-none md:justify-self-end">
          <m.section
            aria-label="Sign in to PuretyFarm"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative isolate flex flex-col justify-center overflow-hidden rounded-2xl md:rounded-[24px] border border-[#e7ddd0] bg-[#fffdf8] px-4.5 py-4.5 sm:px-6 sm:py-5 lg:px-7 lg:py-6 xl:px-8 xl:py-7 shadow-[0_20px_60px_rgba(64,37,18,0.14)]"
          >
            <div
              className="pointer-events-none absolute -right-5 -top-10 -z-10 h-32 w-32 rounded-bl-[100px] bg-[#f8e94e]/35"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-14 -right-10 -z-10 h-28 w-36 rounded-tl-[90px] bg-[#f8e94e]/25"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mb-2.5 flex justify-center sm:mb-3">
                <Image
                  src="/newimge/logo-removebg-preview.png"
                  alt="PuretyFarm — 100% Pure A2 Milk Products"
                  width={378}
                  height={229}
                  priority
                  className="h-auto w-[120px] object-contain sm:w-[130px] lg:w-[140px]"
                />
              </div>

              <div className="mb-3 text-center sm:mb-3.5">
                <h2 className="text-[20px] font-bold leading-tight tracking-[-0.03em] text-[#24130f] sm:text-[23px] lg:text-[25px]">
                  {heading}
                </h2>
                <p className="mx-auto mt-1 max-w-[320px] text-[12px] leading-[1.45] text-[#715e50] sm:text-[13px]">
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
                    className="mb-2.5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] font-medium text-red-700"
                  >
                    <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
                    className="mb-2.5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] font-medium text-emerald-800"
                  >
                    <FiCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
                    transition={{ duration: 0.16 }}
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
                    transition={{ duration: 0.16 }}
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
                    transition={{ duration: 0.16 }}
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

              <p className="mt-3.5 text-center text-[10px] leading-relaxed text-[#8c7a6b] sm:text-[10.5px]">
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
