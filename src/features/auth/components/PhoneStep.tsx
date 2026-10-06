"use client";

import React from "react";
import { FiRefreshCw, FiArrowRight } from "react-icons/fi";

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
          className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-2"
        >
          Mobile Number
        </label>
        <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white transition-all overflow-hidden px-4 py-3 shadow-2xs">
          {/* India Flag + Country Code */}
          <div className="flex items-center gap-2 pr-3 border-r border-[#E8DFD4] text-[#1A1008] font-bold text-sm select-none shrink-0">
            <span className="inline-flex items-center justify-center w-5 h-3.5 rounded-[2px] overflow-hidden border border-[#E8DFD4] shrink-0">
              <svg viewBox="0 0 640 480" className="w-full h-full" aria-hidden="true">
                <path fill="#FF9933" d="M0 0h640v160H0z" />
                <path fill="#FFFFFF" d="M0 160h640v160H0z" />
                <path fill="#128807" d="M0 320h640v160H0z" />
                <circle cx="320" cy="240" r="38" fill="none" stroke="#000080" strokeWidth="6" />
                <circle cx="320" cy="240" r="8" fill="#000080" />
              </svg>
            </span>
            <span className="text-sm font-bold text-[#1A1008]">+91</span>
          </div>

          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            autoFocus
            value={phoneNumber}
            onChange={onPhoneChange}
            placeholder="98765 43210"
            className="w-full pl-3.5 bg-transparent text-[#1A1008] text-base font-semibold focus:outline-none placeholder-[#B0A195] tracking-wider"
            aria-required="true"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || phoneNumber.length !== 10}
        className="w-full py-3.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4 animate-spin" />
            <span>Sending OTP...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>Send OTP</span>
            <FiArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>

      <p className="text-center text-[11px] text-[#8C7A6B]">
        We will send a 6-digit one-time code to your mobile via SMS.
      </p>
    </form>
  );
}
