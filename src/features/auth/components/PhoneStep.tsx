"use client";

import React from "react";
import { FiArrowRight, FiChevronDown, FiRefreshCw } from "react-icons/fi";

export interface PhoneStepProps {
  phoneNumber: string;
  loading: boolean;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PhoneStep({
  phoneNumber,
  loading,
  onPhoneChange,
  onSubmit,
}: PhoneStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="phone-input"
          className="mb-2 block text-[12px] font-semibold text-[#24130f]"
        >
          Phone number
        </label>
        <div className="flex h-[56px] items-center overflow-hidden rounded-[12px] border border-[#d8cfc5] bg-white px-3.5 transition-colors focus-within:border-[#7a2417] focus-within:ring-2 focus-within:ring-[#7a2417]/10 sm:h-[60px] sm:px-4">
          <div className="flex shrink-0 select-none items-center gap-2 border-r border-[#ddd4c8] pr-3 text-[14px] font-semibold text-[#24130f]">
            <span
              className="inline-flex h-[14px] w-5 overflow-hidden rounded-[2px] border border-[#e8dfd4]"
              aria-label="India"
              role="img"
            >
              <svg viewBox="0 0 640 480" className="h-full w-full" aria-hidden="true">
                <path fill="#FF9933" d="M0 0h640v160H0z" />
                <path fill="#FFFFFF" d="M0 160h640v160H0z" />
                <path fill="#128807" d="M0 320h640v160H0z" />
                <circle cx="320" cy="240" r="38" fill="none" stroke="#000080" strokeWidth="6" />
                <circle cx="320" cy="240" r="8" fill="#000080" />
              </svg>
            </span>
            <span>+91</span>
            <FiChevronDown className="h-3.5 w-3.5 text-[#71665f]" aria-hidden="true" />
          </div>
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            pattern="[0-9]{10}"
            maxLength={10}
            value={phoneNumber}
            onChange={onPhoneChange}
            placeholder="98765 43210"
            className="h-full min-w-0 flex-1 bg-transparent pl-3.5 text-[15px] font-medium tracking-[0.01em] text-[#24130f] outline-none placeholder:text-[#a49a91]"
            aria-label="10-digit Indian mobile number"
            aria-required="true"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#7a2417] text-[15px] font-semibold text-white shadow-[0_3px_8px_rgba(71,23,12,0.12)] transition-colors hover:bg-[#5f1b12] active:bg-[#54170f] disabled:cursor-not-allowed disabled:opacity-55 sm:h-[60px] sm:text-[16px]"
      >
        {loading ? (
          <>
            <FiRefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Sending OTP...</span>
          </>
        ) : (
          <>
            <span>Send OTP</span>
            <FiArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
