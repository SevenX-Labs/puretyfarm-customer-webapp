"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { User } from "@/types/models";
import {
  FiAlertCircle,
  FiPhone,
  FiUser,
  FiMail,
  FiArrowRight,
} from "react-icons/fi";

export interface ProfileStepProps {
  user: User | null;
  profileName: string;
  profileEmail: string;
  profileAvatar: string;
  profileSaving: boolean;
  profileError: string | null;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onAvatarChange: (url: string) => void;
  onProfileError: (msg: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileStep({
  user,
  profileName,
  profileEmail,
  profileAvatar,
  profileSaving,
  profileError,
  onNameChange,
  onEmailChange,
  onAvatarChange,
  onProfileError,
  onSubmit,
}: ProfileStepProps) {
  return (
    <m.div
      key="step1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-9 shadow-xs"
    >
      <div className="mb-6">
        <span className="inline-block px-3 py-1 rounded-full bg-[#5C1B13]/8 text-[#5C1B13] text-[11px] font-bold tracking-wide mb-2 uppercase">
          Step 1 of 3
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#1A1008]">
          Complete Your Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
          Tell us who to address daily morning milk dispatches to.
        </p>
      </div>

      {profileError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
        >
          <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{profileError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Avatar Upload with Square Crop & Resize */}
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
          <AvatarUpload
            initialUrl={profileAvatar}
            name={profileName || user?.name || "Purety"}
            onUploaded={onAvatarChange}
            onError={onProfileError}
          />
        </div>

        {/* Verified Phone (Read-Only) */}
        <div>
          <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
            Mobile Number (Verified)
          </label>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FBF6EE] border border-[#E8DFD4] text-xs font-mono font-semibold text-[#1A1008]">
            <div className="flex items-center gap-2">
              <FiPhone className="w-3.5 h-3.5 text-[#5C1B13]" />
              <span>{user?.phone}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Phone Verified ✓
            </span>
          </div>
          <p className="text-[11px] text-[#3A241C]/50 mt-1">
            Daily delivery SMS & morning notifications will be sent to this number.
          </p>
        </div>

        {/* Full Name (Required) */}
        <div>
          <label
            htmlFor="profileNameInput"
            className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
          >
            Full Name *
          </label>
          <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-4 py-3 transition-colors">
            <FiUser className="w-4 h-4 text-[#3A241C]/40 mr-3 shrink-0" />
            <input
              id="profileNameInput"
              type="text"
              required
              value={profileName}
              onChange={(e) => {
                onNameChange(e.target.value);
                onProfileError(null);
              }}
              placeholder="e.g. Anand Agrawal"
              className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Email Address (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="profileEmailInput"
              className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider"
            >
              Email Address
            </label>
            <span className="text-[10px] text-[#3A241C]/55 italic">Optional (for invoices)</span>
          </div>
          <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-4 py-3 transition-colors">
            <FiMail className="w-4 h-4 text-[#3A241C]/40 mr-3 shrink-0" />
            <input
              id="profileEmailInput"
              type="email"
              value={profileEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="e.g. anand@puretyfarm.com"
              className="w-full bg-transparent text-sm font-medium text-[#1A1008] focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-[#3A241C]/50 mt-1">
            Used optionally for monthly billing summaries and tax invoices.
          </p>
        </div>

        {/* Submit CTA */}
        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={profileSaving}
            className="rounded-2xl py-3.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{profileSaving ? "Saving Details..." : "Continue to Delivery Location"}</span>
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </m.div>
  );
}
