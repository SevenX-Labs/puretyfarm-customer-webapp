"use client";

import React from "react";
import { FiArrowLeft, FiArrowRight, FiRefreshCw } from "react-icons/fi";

export interface OtpStepProps {
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
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-3.5">
        <fieldset>
          <legend className="mb-2 text-center text-[11.5px] sm:text-[12px] font-semibold text-[#4b3a31]">
            Enter the 6-digit code
          </legend>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {otpValues.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpInputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                disabled={loading}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                value={digit}
                onChange={(event) => onOtpDigitChange(index, event.target.value)}
                onKeyDown={(event) => onOtpKeyDown(index, event)}
                onPaste={onOtpPaste}
                aria-label={`Verification code digit ${index + 1}`}
                className={`h-10 sm:h-11 lg:h-[44px] w-full min-w-0 rounded-xl border text-center text-[18px] sm:text-[19px] font-semibold outline-none transition-colors focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-60 ${
                  digit
                    ? "border-[#9c705b] bg-[#fffaf3] text-[#7a2417]"
                    : "border-[#d8d0c6] bg-white text-[#24130f]"
                }`}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex min-h-4 items-center justify-between gap-3 text-[11.5px] sm:text-[12px]">
          <span className="text-[#71665f]">Didn&apos;t receive the code?</span>
          {countdown > 0 ? (
            <span className="shrink-0 font-medium tabular-nums text-[#71665f]">
              Resend in{" "}
              {String(Math.floor(countdown / 60)).padStart(2, "0")}:
              {String(countdown % 60).padStart(2, "0")}
            </span>
          ) : (
            <button
              type="button"
              onClick={onResendOtp}
              disabled={loading}
              className="shrink-0 font-semibold text-[#7a2417] underline underline-offset-2 hover:text-[#54170f] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Resend OTP
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || otpValues.join("").length !== 6}
          className="flex h-10 sm:h-11 lg:h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#7a2417] text-[13.5px] sm:text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#5f1b12] active:bg-[#54170f] disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer"
        >
          {loading ? (
            <>
              <FiRefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <span>Verifying OTP...</span>
            </>
          ) : (
            <>
              <span>Verify OTP</span>
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={onChangePhone}
        className="mx-auto mt-2.5 flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-semibold text-[#7a2417] hover:text-[#54170f] cursor-pointer"
      >
        <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Change phone number
      </button>
    </div>
  );
}
