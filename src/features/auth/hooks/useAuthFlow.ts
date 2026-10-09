"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "../api/authApi";
import { profileApi } from "@/features/profile/api/profileApi";
import { locationApi } from "@/features/location/api/locationApi";
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

  // Route existing sessions: if onboarding is incomplete, go to onboarding; else account.
  useEffect(() => {
    if (isLoggedIn && user && step === "phone") {
      const isProfileIncomplete =
        user.onboardingStep === "profile_pending" ||
        !user.name ||
        user.name.trim() === "" ||
        user.name.startsWith("Customer (");

      if (isProfileIncomplete) {
        router.replace("/onboarding?step=1");
      } else {
        router.replace(redirectUrl === "/onboarding" ? "/account" : redirectUrl);
      }
    }
  }, [isLoggedIn, user, step, redirectUrl, router]);

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

      const refreshedUser = await refreshUser();

      const profile = await profileApi.getProfile().catch(() => null);
      const addresses = await locationApi.getAddresses().catch(() => []);
      const subRes = await fetch("/api/subscription").then((r) => r.json()).catch(() => null);
      const hasSubscription = Boolean(subRes?.subscription);

      const isProfileComplete = Boolean(
        (profile && profile.firstName && !profile.firstName.startsWith("Customer (")) ||
        (refreshedUser && refreshedUser.name && !refreshedUser.name.startsWith("Customer (") && refreshedUser.name.trim() !== "")
      );
      const hasAddress = Array.isArray(addresses) && addresses.length > 0;
      const hasPlan = hasSubscription || refreshedUser?.onboardingStep === "complete";

      setSuccessMessage("Authentication successful! Redirecting...");
      setTimeout(() => {
        if (!isProfileComplete) {
          // Incomplete profile -> onboarding step 1 (profile details)
          router.replace("/onboarding?step=1");
        } else if (!hasAddress) {
          // Profile exists, but no address -> onboarding step 2 (delivery location)
          router.replace("/onboarding?step=2");
        } else if (!hasPlan) {
          // Address exists, but no plan -> onboarding step 3 (plan selection)
          router.replace("/onboarding?step=3");
        } else {
          // Existing active customer -> route to account page!
          router.replace(redirectUrl && redirectUrl !== "/onboarding" ? redirectUrl : "/account");
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
  };
}
