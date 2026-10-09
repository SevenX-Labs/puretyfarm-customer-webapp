"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Mail, ShieldCheck, X, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/features/auth/api/authApi";
import { useAuth } from "@/context/AuthContext";

export interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (verifiedEmail: string) => void;
  initialEmail?: string;
  title?: string;
  description?: string;
}

export function EmailVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = "",
  title = "Email Required for Online Payment",
  description = "Online payment gateways require a verified email address to generate transaction receipts and delivery invoices.",
}: EmailVerificationModalProps) {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState<string>(initialEmail || user?.email || "");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync initial email
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || user?.email || "");
      setStep("email");
      setOtp(Array(6).fill(""));
      setError(null);
      setSuccessMsg(null);
      setLoading(false);
    }
  }, [isOpen, initialEmail, user?.email]);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ESC key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  const handleSendOtp = async (targetEmail?: string) => {
    const emailToSend = (targetEmail || email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailToSend || !emailRegex.test(emailToSend)) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authApi.sendEmailOtp({ email: emailToSend });
      if (res && res.success) {
        setStep("otp");
        setCountdown(60);
        setSuccessMsg(res.message || `Verification code sent to ${emailToSend}`);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      } else {
        setError(res?.error || "Failed to send verification code. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not send verification email. Please try again.";
      setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean && value !== "") return;

    const next = [...otp];
    next[index] = clean.slice(-1);
    setOtp(next);
    setError(null);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (index === 5 && clean) {
      const fullCode = next.slice(0, 5).join("") + clean.slice(-1);
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    setError(null);

    const targetIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[targetIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otp.join("")).trim();
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.verifyEmailOtp({
        email: email.trim().toLowerCase(),
        otp: code,
      });

      if (res && res.success) {
        setSuccessMsg("Email verified successfully! Resuming payment...");
        await refreshUser().catch(() => {});
        setTimeout(() => {
          onSuccess(email.trim().toLowerCase());
        }, 600);
      } else {
        setError(res?.error || "Invalid verification code. Please check and try again.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Verification failed. Please check the code and try again.";
      setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl bg-[#FFFDF8] p-5 sm:p-6 shadow-2xl border border-[#E8DFD4] z-10 font-sans"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close dialog"
              className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-[#715E50] hover:bg-[#FAF1E2] transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Icon Banner */}
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF1E2] text-[#6F2115] shadow-sm">
              {step === "email" ? (
                <Mail size={22} strokeWidth={2} />
              ) : (
                <ShieldCheck size={22} strokeWidth={2} />
              )}
            </div>

            {/* Header Content */}
            <div className="text-center mb-4">
              <h3
                id="email-modal-title"
                className="text-lg sm:text-xl font-bold text-[#24130F] font-serif tracking-tight"
              >
                {step === "email" ? title : "Verify Your Email Address"}
              </h3>
              <p className="mt-1 text-xs sm:text-[13px] text-[#715E50] leading-relaxed max-w-sm mx-auto">
                {step === "email"
                  ? description
                  : `We sent a 6-digit confirmation code to ${email}. Enter it below to link your email.`}
              </p>
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <m.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                  <span className="flex-1">{error}</span>
                </m.div>
              )}
              {successMsg && !error && (
                <m.div
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800"
                >
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="flex-1">{successMsg}</span>
                </m.div>
              )}
            </AnimatePresence>

            {/* STEP 1: Enter Email */}
            {step === "email" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="customer-email-input"
                    className="block text-xs font-semibold text-[#4A3830] mb-1.5"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C7A6B]">
                      <Mail size={16} />
                    </div>
                    <input
                      id="customer-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                      autoFocus
                      className="w-full rounded-xl border border-[#DDD2C7] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#24130F] placeholder-[#A8988B] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#F5EFE6] transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#8C7A6B]">
                    Payment receipts and monthly milk bills will be delivered here.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 min-h-[42px] rounded-xl border border-[#DDD2C7] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#24130F] hover:bg-[#FAF6F0] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="flex-[1.5] min-h-[42px] rounded-xl bg-[#6F2115] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#581A11] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {step === "otp" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#715E50]">
                  <span>Enter 6-digit code:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                    }}
                    disabled={loading}
                    className="text-[#6F2115] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Change email
                  </button>
                </div>

                {/* 6 Digit Inputs */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={loading}
                      aria-label={`Digit ${idx + 1}`}
                      className="h-12 w-11 sm:h-13 sm:w-12 rounded-xl border border-[#DDD2C7] bg-white text-center text-lg sm:text-xl font-bold text-[#24130F] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#F5EFE6] transition-colors"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#8C7A6B]">
                    Didn't receive the email?
                  </span>
                  {countdown > 0 ? (
                    <span className="font-medium text-[#715E50]">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      className="text-[#6F2115] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={12} /> Resend code
                    </button>
                  )}
                </div>

                {/* Dev hint */}
                <div className="rounded-lg bg-[#FAF1E2] px-3 py-2 text-[11px] text-[#6F2115] border border-[#ECDCCB]">
                  <strong>Testing Tip:</strong> In test / dev environments, you can enter <code>123456</code> to verify instantly.
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                    }}
                    disabled={loading}
                    className="flex-1 min-h-[42px] rounded-xl border border-[#DDD2C7] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#24130F] hover:bg-[#FAF6F0] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.join("").length !== 6}
                    className="flex-[1.5] min-h-[42px] rounded-xl bg-[#6F2115] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#581A11] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Continue</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
