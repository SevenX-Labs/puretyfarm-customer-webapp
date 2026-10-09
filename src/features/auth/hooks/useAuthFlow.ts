"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "../api/authApi";
import { AuthStep } from "../types";
import { profileApi } from "@/features/profile/api/profileApi";
import { locationApi } from "@/features/location/api/locationApi";

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const { isLoggedIn, user, status, refreshUser } = useAuth();
  const authStatus = status;

  const [step, setStep] = useState<AuthStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Prefetch destinations for instant routing
  useEffect(() => {
    router.prefetch("/account");
    router.prefetch("/onboarding?step=1");
  }, [router]);

  // Helper to check if user has not completed onboarding
  const isPendingOnboarding = (u: typeof user) => {
    if (!u) return true;
    if (u.onboardingStep === "profile_pending") return true;
    const name = u.name?.trim() || "";
    return !name || name.startsWith("Customer (") || name.toLowerCase() === "customer";
  };

  // Route existing sessions: only after session is confirmed authenticated
  useEffect(() => {
    if (status === "authenticated" && user && step === "phone") {
      const isPending = isPendingOnboarding(user);

      if (isPending) {
        router.replace("/onboarding?step=1");
      } else {
        const dest = redirectUrl && redirectUrl !== "/onboarding" && redirectUrl !== "/auth" ? redirectUrl : "/account";
        router.replace(dest);
      }
    }
  }, [status, user, step, redirectUrl, router]);

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
    if (isLoggedIn) {
      router.replace("/account");
      return;
    }
    if (phoneNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await authApi.sendOtp({
        mobile: phoneNumber,
        phone: phoneNumber,
      });

      if (!data.success) {
        setErrorMessage(data.error || data.message || "Failed to send verification code.");
        if (data.remainingCooldown) {
          setCountdown(data.remainingCooldown);
        }
        return;
      }

      setCountdown(data.cooldownSeconds || 60);
      setSuccessMessage("OTP sent successfully to your mobile number.");
      setStep("otp");
      setOtpValues(["", "", "", "", "", ""]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection and try again.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Auto-verify function
  const triggerVerifyOtp = async (codeToVerify?: string) => {
    if (isLoggedIn) {
      router.replace("/account");
      return;
    }
    if (isSubmittingRef.current) return;
    const code = (codeToVerify || otpValues.join("")).trim();
    if (code.length !== 6) {
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await authApi.verifyOtp({
        mobile: phoneNumber,
        otp: code,
        phone: phoneNumber,
        code,
      });

      if (!data.success) {
        setErrorMessage(data.error || data.message || "Invalid verification code.");
        return;
      }

      const refreshedUser = await refreshUser();

      const isPending = isPendingOnboarding(refreshedUser);

      const targetUrl = isPending
        ? redirectUrl && redirectUrl.startsWith("/onboarding")
          ? redirectUrl
          : "/onboarding?step=1"
        : redirectUrl && redirectUrl !== "/onboarding" && redirectUrl !== "/auth"
        ? redirectUrl
        : "/account";

      setSuccessMessage("Authentication successful! Redirecting...");
      router.replace(targetUrl);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Verification failed. Please check your connection.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Step 2: Automatic trigger whenever all 6 digits are filled
  useEffect(() => {
    if (step === "otp" && !loading && !isSubmittingRef.current) {
      const fullCode = otpValues.join("");
      if (fullCode.length === 6 && otpValues.every((d) => d.trim() !== "")) {
        void triggerVerifyOtp(fullCode);
      }
    }
  }, [otpValues, step, loading]);

  // Step 2: OTP input handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) {
      const next = [...otpValues];
      next[index] = "";
      setOtpValues(next);
      return;
    }

    if (numeric.length > 1) {
      // Handles autofill or multi-digit paste directly in input
      const next = [...otpValues];
      for (let i = 0; i < numeric.length && index + i < 6; i++) {
        next[index + i] = numeric[i];
      }
      setOtpValues(next);
      setErrorMessage(null);
      const nextFocus = Math.min(index + numeric.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const char = numeric.slice(-1);
    const next = [...otpValues];
    next[index] = char;
    setOtpValues(next);
    setErrorMessage(null);

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

  // Step 2: Manual Verify OTP (fallback on button click / enter key)
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await triggerVerifyOtp();
  };

  // Step 3: Complete Onboarding Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggedIn && user?.onboardingStep !== "profile_pending") {
      router.replace("/account");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

      if (!data.success) {
        setErrorMessage(data.error || data.message || "Failed to save profile.");
        return;
      }

      await refreshUser();
      setSuccessMessage("Profile saved! Redirecting to your account...");
      setTimeout(() => {
        router.replace("/account");
      }, 600);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error updating profile. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    setSuccessMessage,
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
  };
}
