"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "../api/authApi";
import { AuthStep } from "../types";

function getSafeRedirectUrl(param: string | null): string {
  if (!param) return "/account";
  const trimmed = param.trim();
  // Reject non-relative paths, protocol-relative paths (//), and backslashes (\)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return "/account";
  }
  return trimmed;
}

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = getSafeRedirectUrl(searchParams.get("redirect"));
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

  // Step 2: OTP input handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) {
      const next = [...otpValues];
      next[index] = "";
      setOtpValues(next);
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

      const updatedUser = await refreshUser();
      const nextStep =
        data.onboardingStep ||
        updatedUser?.onboardingStep ||
        (data.isNewUser ? "profile_pending" : "complete");

      setSuccessMessage("Authentication successful! Redirecting...");
      setTimeout(() => {
        if (nextStep !== "complete") {
          router.replace("/onboarding");
        } else {
          router.replace(redirectUrl === "/onboarding" ? "/account" : redirectUrl);
        }
      }, 400);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Verification failed. Please check your connection.";
      setErrorMessage(errorMsg);
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
        router.replace(redirectUrl);
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
  };
}
