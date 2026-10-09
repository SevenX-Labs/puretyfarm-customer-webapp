"use client";

import React, { useState } from "react";
import { EmailVerificationModal } from "@/components/pf/EmailVerificationModal";
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
  onEmailVerified?: (email: string) => Promise<void> | void;
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
  onEmailVerified,
  onSubmit,
}: ProfileStepProps) {
  const today = new Date().toISOString().split("T")[0];
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [justVerifiedEmail, setJustVerifiedEmail] = useState<string | null>(null);

  const isEmailVerified = Boolean(
    (justVerifiedEmail && justVerifiedEmail.toLowerCase() === profileEmail.trim().toLowerCase()) ||
    (user?.email &&
      (user as any)?.emailVerified &&
      user.email.toLowerCase() === profileEmail.trim().toLowerCase())
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail.trim()) {
      onProfileError("Please enter your email address to continue.");
      return;
    }
    if (!isValidEmail(profileEmail)) {
      onProfileError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    if (!isEmailVerified) {
      onProfileError("Please verify your email address to continue.");
      setIsEmailModalOpen(true);
      return;
    }
    onSubmit(e);
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

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
      <form onSubmit={handleFormSubmit} className="h-full flex flex-col justify-between">
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
                  Email Address <span className="text-[#7a2417]">*</span>
                </label>
                <span className="text-[10px] text-[#8b7b70]">
                  Required for billing & payments
                </span>
              </div>
              <div className="flex h-9.5 sm:h-10 lg:h-[42px] items-center gap-2 rounded-xl border border-[#ddd2c7] bg-white px-3 focus-within:border-[#7a2417]">
                <FiMail
                  className="h-3.5 w-3.5 shrink-0 text-[#7a2417]"
                  aria-hidden="true"
                />
                <input
                  id="profileEmailInput"
                  type="email"
                  autoComplete="email"
                  required
                  value={profileEmail}
                  onChange={(event) => {
                    onEmailChange(event.target.value);
                    setJustVerifiedEmail(null);
                    onProfileError(null);
                  }}
                  placeholder="Enter your email address"
                  readOnly={isEmailVerified}
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none"
                />
                {isEmailVerified ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded-full bg-[#e8f4e9] px-2 py-0.5 text-[10px] font-semibold text-[#367847]">
                      Verified ✓
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onEmailChange("");
                        setJustVerifiedEmail(null);
                      }}
                      className="text-[10.5px] text-[#7a2417] hover:underline font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!isValidEmail(profileEmail)}
                    onClick={() => setIsEmailModalOpen(true)}
                    className="shrink-0 rounded-lg bg-[#7a2417] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#5f1b12] disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Verify Email
                  </button>
                )}
              </div>
              {isEmailVerified ? (
                <p className="mt-0.5 text-[10px] text-[#367847] font-medium">
                  ✓ Email verified. Used for payment receipts and subscription invoices.
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] text-[#7a2417]">
                  Click &ldquo;Verify Email&rdquo; to confirm your email before continuing.
                </p>
              )}
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
      <EmailVerificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={async (verifiedEmail) => {
          setJustVerifiedEmail(verifiedEmail);
          onEmailChange(verifiedEmail);
          setIsEmailModalOpen(false);
          onProfileError(null);
          if (onEmailVerified) {
            await onEmailVerified(verifiedEmail);
          }
        }}
        initialEmail={profileEmail.trim()}
        title="Verify Your Email Address"
        description="We will send a 6-digit verification code to confirm your email address."
        successMessage="Email verified successfully!"
      />
    </m.section>
  );
}
