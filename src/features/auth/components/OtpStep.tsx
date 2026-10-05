"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { FiShield, FiEdit2, FiRefreshCw, FiClock } from "react-icons/fi";

export interface OtpStepProps {
  phoneNumber: string;
  loading: boolean;
  devOtpHint: string | null;
  countdown: number;
  otpValues: string[];
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onChangePhone: () => void;
  onAutofillDevOtp: () => void;
  onOtpDigitChange: (index: number, val: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onResendOtp: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OtpStep({
  phoneNumber,
  loading,
  devOtpHint,
  countdown,
  otpValues,
  otpInputRefs,
  onChangePhone,
  onAutofillDevOtp,
  onOtpDigitChange,
  onOtpKeyDown,
  onOtpPaste,
  onResendOtp,
  onSubmit,
}: OtpStepProps) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto mb-3">
          <FiShield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1A1008] tracking-tight">
          Verify Your Mobile
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-[#3A241C]/80">
          <span>
            Code sent to <strong className="text-[#1A1008] font-bold">+91 {phoneNumber}</strong>
          </span>
          <button
            type="button"
            onClick={onChangePhone}
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
              onClick={onAutofillDevOtp}
              className="text-[11px] font-bold bg-amber-200/70 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            >
              Autofill
            </button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
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
                onChange={(e) => onOtpDigitChange(idx, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(idx, e)}
                onPaste={idx === 0 ? onOtpPaste : undefined}
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
              <span>
                Resend code in <strong>{countdown}s</strong>
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onResendOtp}
              disabled={loading}
              className="text-xs font-bold text-[#5C1B13] hover:text-[#40110D] underline cursor-pointer"
            >
              Didn&apos;t receive code? Resend OTP
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
