"use client";

import React from "react";
import { FiEdit2, FiRefreshCw, FiClock, FiArrowRight } from "react-icons/fi";

export interface OtpStepProps {
  phoneNumber: string;
  loading: boolean;
  countdown: number;
  otpValues: string[];
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onChangePhone: () => void;
  onOtpDigitChange: (index: number, val: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onResendOtp: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OtpStep({
  phoneNumber,
  loading,
  countdown,
  otpValues,
  otpInputRefs,
  onChangePhone,
  onOtpDigitChange,
  onOtpKeyDown,
  onOtpPaste,
  onResendOtp,
  onSubmit,
}: OtpStepProps) {
  return (
    <div>
      {/* Target Phone row */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DFD4] mb-4 text-xs text-[#6B584C]">
        <div className="flex items-center gap-1.5">
          <span>Sent to</span>
          <strong className="text-[#1A1008] font-bold">+91 {phoneNumber}</strong>
        </div>
        <button
          type="button"
          onClick={onChangePhone}
          className="text-[#5C1B13] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <FiEdit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-center text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-2.5">
            Enter 6-Digit Verification Code
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
                  h-11 sm:h-12 text-center text-lg sm:text-xl font-bold rounded-xl border transition-all
                  ${digit ? "border-[#5C1B13] bg-[#5C1B13]/5 text-[#5C1B13]" : "border-[#D5C7B8] bg-white text-[#1A1008]"}
                  focus:border-[#5C1B13] focus:ring-2 focus:ring-[#5C1B13]/10 focus:outline-none shadow-2xs
                `}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otpValues.join("").length !== 6}
          className="w-full py-3.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying code...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Verify & Continue</span>
              <FiArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>

        {/* Resend Action */}
        <div className="text-center pt-0.5">
          {countdown > 0 ? (
            <p className="text-xs text-[#8C7A6B] flex items-center justify-center gap-1.5 font-medium">
              <FiClock className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>
                Resend in <strong>{countdown}s</strong>
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onResendOtp}
              disabled={loading}
              className="text-xs font-semibold text-[#5C1B13] hover:underline cursor-pointer"
            >
              Didn&apos;t receive code? Resend
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
