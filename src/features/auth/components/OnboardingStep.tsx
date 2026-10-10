"use client";

import React from "react";
import { FiUser, FiMail, FiRefreshCw, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export interface OnboardingStepProps {
  name: string;
  whatsapp: string;
  email: string;
  loading: boolean;
  onNameChange: (val: string) => void;
  onWhatsappChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OnboardingStep({
  name,
  whatsapp,
  email,
  loading,
  onNameChange,
  onWhatsappChange,
  onEmailChange,
  onSubmit,
}: OnboardingStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="user-name-input"
          className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
        >
          Full Name <span className="text-[#5C1B13]">*</span>
        </label>
        <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-3 shadow-2xs transition-all">
          <FiUser className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
          <input
            id="user-name-input"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full bg-transparent text-[#1A1008] text-sm font-semibold focus:outline-none placeholder-[#B0A195]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="user-whatsapp-input"
            className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider flex items-center gap-1"
          >
            <FaWhatsapp className="text-[#25D366]" /> WhatsApp Number <span className="text-[#5C1B13]">*</span>
          </label>
          <span className="text-[10px] text-emerald-800 font-semibold">Priority Updates</span>
        </div>
        <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#25D366] focus-within:ring-2 focus-within:ring-[#25D366]/10 bg-white px-3.5 py-3 shadow-2xs transition-all">
          <FaWhatsapp className="w-4 h-4 text-[#25D366] mr-2.5 shrink-0" />
          <input
            id="user-whatsapp-input"
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => onWhatsappChange(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full bg-transparent text-[#1A1008] text-sm font-semibold focus:outline-none placeholder-[#B0A195]"
          />
        </div>
        <p className="text-[11px] text-[#8C7A6B] mt-1.5">
          Required for morning dispatch alerts, order tracking &amp; offers.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="user-email-input"
            className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider"
          >
            Email Address
          </label>
          <span className="text-[10px] text-[#8C7A6B]">Optional</span>
        </div>
        <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-3 shadow-2xs transition-all">
          <FiMail className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
          <input
            id="user-email-input"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="e.g. rahul@example.com (optional)"
            className="w-full bg-transparent text-[#1A1008] text-sm font-semibold focus:outline-none placeholder-[#B0A195]"
          />
        </div>
        <p className="text-[11px] text-[#8C7A6B] mt-1.5">
          Optional. You can proceed without an email address.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim() || !whatsapp.trim()}
        className="w-full py-3.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4 animate-spin" />
            <span>Setting up account...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>Complete Setup</span>
            <FiArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>
    </form>
  );
}
