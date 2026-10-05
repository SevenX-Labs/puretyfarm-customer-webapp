"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { FiPhone, FiShield, FiRefreshCw } from "react-icons/fi";

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
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto mb-3">
          <FiPhone className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1A1008] tracking-tight">
          Welcome to PuretyFarm
        </h1>
        <p className="text-xs text-[#3A241C]/70 mt-1.5">
          Enter your mobile number to sign in or create an account. No password needed.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="phone-input"
            className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
          >
            Mobile Number
          </label>
          <div className="relative flex items-center rounded-2xl border-2 border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] transition-all overflow-hidden px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#E8DFD4] text-[#1A1008] font-bold text-sm select-none">
              <span>🇮🇳</span>
              <span>+91</span>
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
              className="w-full pl-3 bg-transparent text-[#1A1008] text-base font-semibold focus:outline-none placeholder-[#3A241C]/35 tracking-wide"
            />
          </div>
          <p className="text-[11px] text-[#3A241C]/60 mt-1.5 pl-1">
            We will send a 6-digit one-time verification code via SMS.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={loading || phoneNumber.length !== 10}
          className="rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-[#5C1B13]/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span>Sending OTP...</span>
            </span>
          ) : (
            <span>Send OTP</span>
          )}
        </Button>
      </form>

      <div className="mt-7 pt-5 border-t border-[#E8DFD4]/80 flex items-center justify-center gap-5 text-[11px] text-[#3A241C]/60">
        <span className="flex items-center gap-1.5">
          <FiShield className="w-3.5 h-3.5 text-[#5C1B13]" />
          <span>Safe & Encrypted</span>
        </span>
        <span>•</span>
        <span>Zero Spam Guarantee</span>
      </div>
    </div>
  );
}
