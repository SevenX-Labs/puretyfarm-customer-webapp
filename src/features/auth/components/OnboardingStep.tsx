"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { FiCheckCircle, FiUser, FiMail, FiRefreshCw } from "react-icons/fi";

export interface OnboardingStepProps {
  name: string;
  email: string;
  loading: boolean;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OnboardingStep({
  name,
  email,
  loading,
  onNameChange,
  onEmailChange,
  onSubmit,
}: OnboardingStepProps) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
          <FiCheckCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1A1008] tracking-tight">
          Welcome to the Family!
        </h1>
        <p className="text-xs text-[#3A241C]/70 mt-1.5">
          Tell us what to call you so we can personalize your fresh morning deliveries.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="user-name-input"
            className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
          >
            Full Name <span className="text-[#5C1B13]">*</span>
          </label>
          <div className="relative flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
            <FiUser className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
            <input
              id="user-name-input"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-transparent text-[#1A1008] text-sm font-semibold focus:outline-none placeholder-[#3A241C]/35"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="user-email-input"
            className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
          >
            Email Address <span className="text-[11px] font-normal text-[#3A241C]/50">(Optional)</span>
          </label>
          <div className="relative flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
            <FiMail className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
            <input
              id="user-email-input"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full bg-transparent text-[#1A1008] text-sm font-medium focus:outline-none placeholder-[#3A241C]/35"
            />
          </div>
          <p className="text-[11px] text-[#3A241C]/50 mt-1 pl-1">
            For receiving monthly billing statements and morning dispatch receipts.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={loading || !name.trim()}
          className="rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-[#5C1B13]/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </span>
          ) : (
            <span>Complete & Go to Account</span>
          )}
        </Button>
      </form>
    </div>
  );
}
