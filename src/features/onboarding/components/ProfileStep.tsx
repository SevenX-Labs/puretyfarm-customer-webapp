"use client";

import React from "react";
import { m } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { User } from "@/types/models";
const GENDER_OPTIONS = [
  { value: "male", label: "Male", icon: FiUser },
  { value: "female", label: "Female", icon: FiUser },
  { value: "other", label: "Other", icon: FiUser },
];

export interface ProfileStepProps {
  user: User | null;
  profileName: string;
  profileEmail: string;
  profileAvatar: string;
  profileGender: string;
  profileDob: string;
  profileSaving: boolean;
  profileError: string | null;
  autoFocus?: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAvatarChange: (url: string) => void;
  onGenderChange: (value: string) => void;
  onDobChange: (value: string) => void;
  onProfileError: (error: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileStep({
  user,
  profileName,
  profileEmail,
  profileAvatar,
  profileGender,
  profileDob,
  profileSaving,
  profileError,
  autoFocus = false,
  onNameChange,
  onEmailChange,
  onAvatarChange,
  onGenderChange,
  onDobChange,
  onProfileError,
  onSubmit,
}: ProfileStepProps) {
  const today = new Date().toISOString().split("T")[0];

  const fieldClassName =
    "h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50";

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="h-full flex flex-col justify-between"
    >
      <form onSubmit={onSubmit} className="h-full flex flex-col justify-between">
        <div>
          <div className="mb-2.5 sm:mb-3">
            <h1
              id="profileHeading"
              className="font-serif text-lg sm:text-xl font-bold text-[#24130f] lg:text-[22px]"
            >
              Profile Information
            </h1>
            <p className="mt-0.5 text-[12px] text-[#715e50] sm:text-[13px]">
              This helps us serve you better.
            </p>
          </div>

          {profileError && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[12px] text-red-700"
            >
              <FiAlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="mb-2.5 sm:mb-3">
            <AvatarUpload
              initialUrl={profileAvatar}
              name={profileName || user?.name || "Purety"}
              onUploaded={onAvatarChange}
              onError={onProfileError}
              size="large"
              actionLabel="Change Photo"
              className="!flex-row !items-center !gap-3.5"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:gap-x-5 sm:gap-y-2.5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="profileNameInput"
                className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
              >
                Full Name <span className="text-[#7a2417]">*</span>
              </label>
              <div className="relative">
                <FiUser
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7a2417]"
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
                  placeholder="Enter your full name"
                  minLength={2}
                  className={`${fieldClassName} pl-9`}
                  autoFocus={autoFocus}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profileMobileInput"
                className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
              >
                Mobile Number <span className="text-[#7a2417]">*</span>
              </label>
              <div className="flex h-9.5 sm:h-10 lg:h-[42px] items-center gap-2 rounded-xl border border-[#ddd2c7] bg-white px-3">
                <FiPhone
                  className="h-3.5 w-3.5 shrink-0 text-[#7a2417]"
                  aria-hidden="true"
                />
                <input
                  id="profileMobileInput"
                  type="tel"
                  value={user?.phone || ""}
                  readOnly
                  aria-readonly="true"
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none"
                />
                <span className="shrink-0 rounded-full bg-[#e8f4e9] px-2 py-0.5 text-[10px] font-semibold text-[#367847]">
                  Verified ✓
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="profileDobInput"
                className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
              >
                Date of Birth
              </label>
              <div className="relative">
                <FiCalendar
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7a2417]"
                  aria-hidden="true"
                />
                <input
                  id="profileDobInput"
                  type="date"
                  value={profileDob}
                  max={today}
                  onChange={(event) => onDobChange(event.target.value)}
                  className={`${fieldClassName} cursor-pointer pl-9`}
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Gender
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {GENDER_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isSelected = profileGender === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onGenderChange(value)}
                      className={`inline-flex h-9.5 sm:h-10 lg:h-[42px] items-center justify-center gap-1.5 rounded-xl border px-1.5 text-[11.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2417] sm:text-[12px] cursor-pointer ${
                        isSelected
                          ? "border-[#7a2417] bg-[#7a2417] text-white"
                          : "border-[#ddd2c7] bg-white text-[#24130f] hover:border-[#a65a3a]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="lg:col-span-2">
              <div className="mb-1 flex items-center justify-between gap-3">
                <label
                  htmlFor="profileEmailInput"
                  className="text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
                >
                  Email Address
                </label>
                <span className="text-[10px] text-[#8b7b70]">
                  Optional (for invoices)
                </span>
              </div>
              <div className="relative">
                <FiMail
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7a2417]"
                  aria-hidden="true"
                />
                <input
                  id="profileEmailInput"
                  type="email"
                  autoComplete="email"
                  value={profileEmail}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="Your email address"
                  className={`${fieldClassName} pl-9`}
                />
              </div>
              <p className="mt-0.5 text-[10px] text-[#8b7b70]">
                Used to share your orders, billing and important updates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex justify-stretch border-t border-[#eee5db] pt-2.5 sm:mt-3 sm:justify-end sm:pt-3">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex h-9.5 sm:h-10 lg:h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#7a2417] px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#5f1b12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2417] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[min(100%,300px)] sm:text-[13px] shadow-sm cursor-pointer"
          >
            <span>
              {profileSaving
                ? "Saving Details..."
                : "Continue to Delivery Location"}
            </span>
            <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </form>
    </m.section>
  );
}
