"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  FiArrowLeft,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiMail,
} from "react-icons/fi";

type AuthStep = "phone" | "otp" | "onboarding";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { isLoggedIn, user, refreshUser } = useAuth();

  // If already logged in, route straight to current onboarding step or account
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.onboardingStep && user.onboardingStep !== "complete") {
        router.replace("/onboarding");
      } else {
        router.replace(redirectUrl === "/onboarding" ? "/account" : redirectUrl);
      }
    }
  }, [isLoggedIn, user, redirectUrl, router]);

  const [step, setStep] = useState<AuthStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Onboarding fields for first-time users
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // References for OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 10) {
      setPhoneNumber(raw);
      setErrorMessage(null);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phoneNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to send verification code.");
        if (data.remainingCooldown) {
          setCountdown(data.remainingCooldown);
        }
        return;
      }

      setCountdown(data.cooldownSeconds || 30);
      if (data.devOtpHint) {
        setDevOtpHint(data.devOtpHint);
      }
      setSuccessMessage("Verification code sent to your phone.");
      setStep("otp");
      setOtpValues(["", "", "", "", "", ""]);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP input handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) {
      const next = [...otpValues];
      next[index] = "";
      setOtpValues(next);
      return;
    }

    // Single digit input
    const char = numeric.slice(-1);
    const next = [...otpValues];
    next[index] = char;
    setOtpValues(next);
    setErrorMessage(null);

    // Auto advance
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...otpValues];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setOtpValues(next);
    setErrorMessage(null);

    const targetFocus = Math.min(pasted.length, 5);
    otpInputRefs.current[targetFocus]?.focus();
  };

  // Autofill dev hint for easy testing
  const handleAutofillDevOtp = () => {
    if (!devOtpHint || devOtpHint.length !== 6) return;
    const digits = devOtpHint.split("");
    setOtpValues(digits);
    otpInputRefs.current[5]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpValues.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid verification code.");
        return;
      }

      const updatedUser = await refreshUser();
      const nextStep = data.onboardingStep || updatedUser?.onboardingStep || (data.isNewUser ? "profile_pending" : "complete");

      setSuccessMessage("Verification successful! Redirecting...");
      setTimeout(() => {
        if (nextStep !== "complete") {
          router.replace("/onboarding");
        } else {
          router.replace(redirectUrl === "/onboarding" ? "/account" : redirectUrl);
        }
      }, 400);
    } catch {
      setErrorMessage("Verification failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Onboarding Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save profile.");
        return;
      }

      await refreshUser();
      setSuccessMessage("Profile saved! Redirecting to your account...");
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 600);
    } catch {
      setErrorMessage("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto mb-3">
                    <FiPhone className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#1A1008] tracking-tight">
                    Welcome to PuretyFarm
                  </h1>
                  <p className="text-xs text-[#3A241C]/70 mt-1.5">
                    Enter your mobile number to sign in or create an account. No password needed.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="phone-input"
                      className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
                    >
                      Mobile Number
                    </label>
                    <div className="relative flex items-center rounded-2xl border-2 border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] transition-all overflow-hidden px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#E8DFD4] text-[#1A1008] font-bold text-sm select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        id="phone-input"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        autoFocus
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="98765 43210"
                        className="w-full pl-3 bg-transparent text-[#1A1008] text-base font-semibold focus:outline-none placeholder-[#3A241C]/35 tracking-wide"
                      />
                    </div>
                    <p className="text-[11px] text-[#3A241C]/60 mt-1.5 pl-1">
                      We will send a 6-digit one-time verification code via SMS.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={loading || phoneNumber.length !== 10}
                    className="rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-[#5C1B13]/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </span>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </Button>
                </form>

                <div className="mt-7 pt-5 border-t border-[#E8DFD4]/80 flex items-center justify-center gap-5 text-[11px] text-[#3A241C]/60">
                  <span className="flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5 text-[#5C1B13]" />
                    <span>Safe & Encrypted</span>
                  </span>
                  <span>•</span>
                  <span>Zero Spam Guarantee</span>
                </div>
              </div>
            )}

            {/* ─── STEP 2: 6-DIGIT OTP VERIFICATION ─── */}
            {step === "otp" && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto mb-3">
                    <FiShield className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#1A1008] tracking-tight">
                    Verify Your Mobile
                  </h1>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-[#3A241C]/80">
                    <span>Code sent to <strong className="text-[#1A1008] font-bold">+91 {phoneNumber}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[#5C1B13] font-bold hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
                    >
                      <FiEdit2 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>

                {/* Dev Mode OTP Hint Banner */}
                {devOtpHint && (
                  <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span>🧪</span> Dev Mode Hint: OTP is{" "}
                        <span className="font-mono font-bold tracking-widest text-[#5C1B13]">
                          {devOtpHint}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAutofillDevOtp}
                        className="text-[11px] font-bold bg-amber-200/70 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Autofill
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-center text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-2.5">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          autoComplete={idx === 0 ? "one-time-code" : "off"}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className={`
                            h-13 sm:h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all
                            ${digit ? "border-[#5C1B13] bg-[#5C1B13]/5 text-[#5C1B13]" : "border-[#E8DFD4] bg-[#FFFDF7] text-[#1A1008]"}
                            focus:border-[#5C1B13] focus:bg-white focus:outline-none shadow-xs
                          `}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={loading || otpValues.join("").length !== 6}
                    className="rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-[#5C1B13]/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      <span>Verify & Continue</span>
                    )}
                  </Button>

                  {/* Resend Action */}
                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <p className="text-xs text-[#3A241C]/60 flex items-center justify-center gap-1.5 font-medium">
                        <FiClock className="w-3.5 h-3.5 text-[#3A241C]/50" />
                        <span>Resend code in <strong>{countdown}s</strong></span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="text-xs font-bold text-[#5C1B13] hover:text-[#40110D] underline cursor-pointer"
                      >
                        Didn&apos;t receive code? Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ─── STEP 3: FIRST-TIME USER ONBOARDING ─── */}
            {step === "onboarding" && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#1A1008] tracking-tight">
                    Welcome to the Family!
                  </h1>
                  <p className="text-xs text-[#3A241C]/70 mt-1.5">
                    Tell us what to call you so we can personalize your fresh morning deliveries.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label
                      htmlFor="user-name-input"
                      className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
                    >
                      Full Name <span className="text-[#5C1B13]">*</span>
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
                      <FiUser className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
                      <input
                        id="user-name-input"
                        type="text"
                        required
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-transparent text-[#1A1008] text-sm font-semibold focus:outline-none placeholder-[#3A241C]/35"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="user-email-input"
                      className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
                    >
                      Email Address <span className="text-[11px] font-normal text-[#3A241C]/50">(Optional)</span>
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
                      <FiMail className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
                      <input
                        id="user-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full bg-transparent text-[#1A1008] text-sm font-medium focus:outline-none placeholder-[#3A241C]/35"
                      />
                    </div>
                    <p className="text-[11px] text-[#3A241C]/50 mt-1 pl-1">
                      For receiving monthly billing statements and morning dispatch receipts.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={loading || !name.trim()}
                    className="rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-[#5C1B13]/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Profile...</span>
                      </span>
                    ) : (
                      <span>Complete & Go to Account</span>
                    )}
                  </Button>
                </form>
              </div>
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
            </Link>.
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

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
