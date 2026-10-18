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
    whatsapp,
    setWhatsapp,
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
      <main className="min-h-screen min-h-[100dvh] flex flex-1 items-center justify-center bg-[#f3dfc0]">
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
      className="min-h-screen min-h-[100dvh] lg:h-svh lg:overflow-hidden isolate flex w-full flex-1 flex-col justify-center overflow-x-hidden overflow-y-auto bg-[#fae7cb] bg-[length:max(100%,500px)_auto] sm:bg-[length:100%_auto] md:bg-cover bg-bottom md:bg-center bg-no-repeat text-[#24130f] pt-[72px] sm:pt-[80px] lg:pt-[86px] pb-6 sm:pb-8 lg:pb-6"
      style={{
        backgroundImage:
          "url('/newimge/Sepia%20Countryside%20Farm%20Panorama.png')",
      }}
    >
      <div className="relative z-10 mx-auto my-auto flex flex-1 w-full max-w-[1360px] flex-col items-center justify-center gap-4 px-3 sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(340px,410px)] lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] xl:grid-cols-[minmax(0,1fr)_460px] md:items-center lg:gap-8 xl:gap-12 md:max-h-[calc(100svh-5.8rem)]">
        <section className="relative isolate hidden w-full self-stretch md:flex md:flex-col md:justify-center">
          <m.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 max-w-[580px] lg:pl-1"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7a2417]/25 bg-[#fffaf1]/90 px-3.5 py-1 text-[11px] sm:text-[11.5px] font-semibold text-[#6e2217] shadow-xs backdrop-blur-xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#7a2417] animate-pulse" />
              <span className="tracking-wider uppercase text-[10.5px] font-bold">100% Pure Desi Gir Cow Milk</span>
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-[clamp(2.35rem,4.1vw,3.55rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#1f110c] xl:text-[56px]">
              Pure{" "}
              <span className="relative inline-block font-serif italic text-[#7a2417]">
                Goodness
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 sm:bottom-1.5 left-0 right-0 -z-10 h-2.5 sm:h-3 rounded-xs bg-[#f8e94e]/75 -rotate-0.5"
                />
              </span>
              <br />
              From Our Farm
              <br />
              To Your Home.
            </h1>
            <p className="mt-3 max-w-[480px] text-[14px] sm:text-[15px] font-normal leading-[1.6] text-[#4a362b] lg:mt-3.5">
              Fresh unadulterated A2 Gir cow milk and Vedic dairy products,
              <br className="hidden lg:block" /> straight from our sunlit pastures in Raipur to your doorstep.
            </p>

            <div className="mt-5 hidden items-center gap-3 lg:flex">
              {features.map(({ icon: Icon, firstLine, secondLine }) => (
                <div
                  key={firstLine}
                  className="flex items-center gap-2.5 rounded-2xl border border-[#dccab6]/85 bg-[#fffdf8]/85 px-3.5 py-2 shadow-[0_2px_12px_rgba(64,37,18,0.06)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffe899] to-[#fed055] text-[#4a1e12] shadow-xs">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="text-[12px] font-bold leading-[1.25] text-[#24130f] tracking-tight">
                    {firstLine}
                    <br />
                    {secondLine}
                  </span>
                </div>
              ))}
            </div>
          </m.div>
        </section>

        <div className="w-full max-w-[390px] min-[420px]:max-w-[410px] sm:max-w-[430px] md:max-w-none md:justify-self-end">
          <m.section
            aria-label="Sign in to PuretyFarm"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative isolate flex flex-col justify-center overflow-hidden rounded-[22px] sm:rounded-[24px] border border-[#e7ddd0]/90 bg-[#fffdf8] px-5 py-5 sm:px-6 sm:py-5 lg:px-7 lg:py-6 xl:px-8 xl:py-7 shadow-[0_16px_50px_rgba(64,37,18,0.12)]"
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
              <div className="mb-2 sm:mb-2.5 flex justify-center">
                <Image
                  src="/newimge/logo-removebg-preview.png"
                  alt="PuretyFarm — 100% Pure A2 Milk Products"
                  width={378}
                  height={229}
                  priority
                  className="h-auto w-[116px] sm:w-[130px] lg:w-[140px] object-contain"
                />
              </div>

              <div className="mb-3.5 sm:mb-4 text-center">
                <h2 className="font-[family-name:var(--font-heading)] text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#22120e] sm:text-[25px] lg:text-[27px]">
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
                      whatsapp={whatsapp}
                      email={email}
                      loading={loading}
                      onNameChange={setName}
                      onWhatsappChange={setWhatsapp}
                      onEmailChange={setEmail}
                      onSubmit={handleSaveProfile}
                    />
                  </m.div>
                )}
              </AnimatePresence>

              <div className="mt-4 sm:mt-4.5 pt-0.5 text-center">
                <p className="text-[11px] leading-relaxed text-[#7c695b]">
                  By continuing, you agree to our{" "}
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
            </div>
          </m.section>
        </div>
      </div>
    </main>
  );
}
