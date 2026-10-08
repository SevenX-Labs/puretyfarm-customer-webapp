"use client";

import React from "react";
import { m } from "framer-motion";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import type { User } from "@/types/models";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { LuUserRound, LuUsersRound } from "react-icons/lu";

export interface ProfileStepProps {
  user: User | null;
  profileName: string;
  profileEmail: string;
  profileAvatar: string;
  profileGender: string;
  profileDob: string;
  profileSaving: boolean;
  profileError: string | null;
  autoFocus: boolean;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onAvatarChange: (url: string) => void;
  onGenderChange: (val: string) => void;
  onDobChange: (val: string) => void;
  onProfileError: (msg: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male", icon: LuUserRound },
  { value: "female", label: "Female", icon: FiUser },
  { value: "other", label: "Other", icon: LuUsersRound },
];

const fieldClassName =
  "h-[54px] w-full rounded-[11px] border border-[#ddd2c7] bg-white px-4 text-[14px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 placeholder:text-[#9a8b80]";

export function ProfileStep({
  user,
  profileName,
  profileEmail,
  profileAvatar,
  profileGender,
  profileDob,
  profileSaving,
  profileError,
  autoFocus,
  onNameChange,
  onEmailChange,
  onAvatarChange,
  onGenderChange,
  onDobChange,
  onProfileError,
  onSubmit,
}: ProfileStepProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <m.section
      aria-labelledby="profile-information-heading"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#fffdf8] p-5 sm:p-8 lg:p-10 xl:p-[52px]"
    >
      <div className="mb-7 sm:mb-8">
        <h1
          id="profile-information-heading"
          className="font-heading text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#24130f] sm:text-[32px]"
        >
          Profile Information
        </h1>
        <p className="mt-1.5 text-[14px] text-[#715e50] sm:text-[15px]">
          This helps us serve you better.
        </p>
      </div>

      {profileError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700"
        >
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-7">
          <AvatarUpload
            initialUrl={profileAvatar}
            name={profileName || user?.name || "Purety"}
            onUploaded={onAvatarChange}
            onError={onProfileError}
            size="large"
            actionLabel="Change Photo"
            className="!flex-row !items-center !gap-5"
          />
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 lg:gap-y-6">
          <div>
            <label
              htmlFor="profileNameInput"
              className="mb-2 block text-[13px] font-semibold text-[#24130f]"
            >
              Full Name <span className="text-[#7a2417]">*</span>
            </label>
            <div className="relative">
              <FiUser
                className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#7a2417]"
                aria-hidden="true"
              />
              <input
                id="profileNameInput"
                type="text"
                required
                autoComplete="name"
                value={profileName}
                onChange={(event) => {
                  onNameChange(event.target.value);
                  onProfileError(null);
                }}
                placeholder="Your full name"
                className={`${fieldClassName} pl-11`}
                autoFocus={autoFocus}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profileMobileInput"
              className="mb-2 block text-[13px] font-semibold text-[#24130f]"
            >
              Mobile Number <span className="text-[#7a2417]">*</span>
            </label>
            <div className="flex h-[54px] items-center gap-2 rounded-[11px] border border-[#ddd2c7] bg-white px-3.5">
              <FiPhone
                className="h-4 w-4 shrink-0 text-[#7a2417]"
                aria-hidden="true"
              />
              <input
                id="profileMobileInput"
                type="tel"
                value={user?.phone || ""}
                readOnly
                aria-readonly="true"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#24130f] outline-none"
              />
              <span className="shrink-0 rounded-full bg-[#e8f4e9] px-2.5 py-1 text-[11px] font-semibold text-[#367847]">
                Verified ✓
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="profileDobInput"
              className="mb-2 block text-[13px] font-semibold text-[#24130f]"
            >
              Date of Birth
            </label>
            <div className="relative">
              <FiCalendar
                className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#7a2417]"
                aria-hidden="true"
              />
              <input
                id="profileDobInput"
                type="date"
                value={profileDob}
                max={today}
                onChange={(event) => onDobChange(event.target.value)}
                className={`${fieldClassName} cursor-pointer pl-11`}
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 block text-[13px] font-semibold text-[#24130f]">
              Gender
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map(({ value, label, icon: Icon }) => {
                const isSelected = profileGender === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onGenderChange(value)}
                    className={`inline-flex h-[46px] items-center justify-center gap-1.5 rounded-[10px] border px-2 text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2417] sm:gap-2 sm:text-[13px] ${
                      isSelected
                        ? "border-[#7a2417] bg-[#7a2417] text-white"
                        : "border-[#ddd2c7] bg-white text-[#24130f] hover:border-[#a65a3a]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="lg:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="profileEmailInput"
                className="text-[13px] font-semibold text-[#24130f]"
              >
                Email Address
              </label>
              <span className="text-[11px] text-[#8b7b70]">
                Optional (for invoices)
              </span>
            </div>
            <div className="relative">
              <FiMail
                className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#7a2417]"
                aria-hidden="true"
              />
              <input
                id="profileEmailInput"
                type="email"
                autoComplete="email"
                value={profileEmail}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="Your email address"
                className={`${fieldClassName} pl-11`}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#8b7b70]">
              Used to share your orders, billing and important updates.
            </p>
          </div>
        </div>

        <div className="mt-7 flex justify-stretch border-t border-[#eee5db] pt-5 sm:mt-8 sm:justify-end sm:pt-6">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[11px] bg-[#7a2417] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#5f1b12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2417] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[58px] sm:w-[min(100%,360px)] sm:text-[14px]"
          >
            <span>
              {profileSaving
                ? "Saving Details..."
                : "Continue to Delivery Location"}
            </span>
            <FiArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </m.section>
  );
}
