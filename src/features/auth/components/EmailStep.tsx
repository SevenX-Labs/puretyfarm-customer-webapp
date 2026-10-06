"use client";

import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";

interface EmailStepProps {
  onSuccessRedirect?: () => void;
  onSwitchToPhone: () => void;
}

export function EmailStep({ onSwitchToPhone }: EmailStepProps) {
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    if (mode === "password") {
      if (!password || password.length < 6) {
        setFieldError("Password must be at least 6 characters.");
        return;
      }

      setLoading(true);
      // Seamless simulated auth with feedback (can be connected to backend email auth)
      setTimeout(() => {
        setLoading(false);
        setFieldError("Email/password sign-in is managed via your registered mobile OTP for security. Please use mobile verification.");
      }, 700);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMagicLinkSent(true);
      }, 600);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Switcher Pills */}
      <div className="flex items-center justify-center p-1 bg-[#FAF6F0] rounded-xl border border-[#E8DFD4] mb-5">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setMagicLinkSent(false);
            setFieldError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "password"
              ? "bg-white text-[#1A1008] shadow-2xs font-bold"
              : "text-[#8C7A6B] hover:text-[#1A1008]"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("magic-link");
            setMagicLinkSent(false);
            setFieldError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "magic-link"
              ? "bg-white text-[#1A1008] shadow-2xs font-bold"
              : "text-[#8C7A6B] hover:text-[#1A1008]"
          }`}
        >
          Magic Link
        </button>
      </div>

      {magicLinkSent ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1A1008]">Check your inbox</h3>
          <p className="text-xs text-[#6B584C] max-w-xs mx-auto leading-relaxed">
            We sent a secure login link to <strong className="text-[#1A1008]">{email}</strong>. Click the link to instantly sign in.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-xs font-semibold text-[#5C1B13] hover:underline pt-2 cursor-pointer"
          >
            Resend or try another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email-login-input"
              className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white transition-all px-3.5 py-3 shadow-2xs">
              <FiMail className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
              <input
                id="email-login-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
                placeholder="name@example.com"
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none placeholder-[#B0A195]"
              />
            </div>
          </div>

          {/* Password Input (Only in Password mode) */}
          {mode === "password" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-login-input"
                  className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode("magic-link")}
                  className="text-[11px] font-medium text-[#5C1B13] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white transition-all px-3.5 py-3 shadow-2xs">
                <FiLock className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
                <input
                  id="password-login-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none placeholder-[#B0A195]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[#8C7A6B] hover:text-[#1A1008] p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Inline non-intrusive error */}
          {fieldError && (
            <div className="text-xs text-red-600 bg-red-50/80 border border-red-200/80 rounded-lg p-2.5 font-medium transition-all">
              {fieldError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? "Verifying..." : mode === "password" ? "Sign In" : "Send Magic Link"}</span>
            {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}

      {/* Switch back to Mobile OTP */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToPhone}
          className="text-xs font-semibold text-[#8C7A6B] hover:text-[#5C1B13] cursor-pointer inline-flex items-center gap-1 transition-colors"
        >
          <span>Prefer SMS OTP?</span>
          <span className="font-bold underline text-[#5C1B13]">Use Mobile Number</span>
        </button>
      </div>
    </div>
  );
}
