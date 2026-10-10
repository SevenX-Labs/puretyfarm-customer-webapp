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
import { FaWhatsapp } from "react-icons/fa";
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
  profileWhatsapp: string;
  profileEmail: string;
  onEmailVerified?: (email: string) => Promise<void> | void;
  profileAvatar: string;
  profileGender: string;
  profileDob: string;
  profileSaving: boolean;
  profileError: string | null;
  autoFocus?: boolean;
  onNameChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
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
  profileWhatsapp,
  profileEmail,
  profileAvatar,
  profileGender,
  profileDob,
  profileSaving,
  profileError,
  autoFocus = false,
  onNameChange,
  onWhatsappChange,
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
    profileEmail.trim() &&
    ((justVerifiedEmail && justVerifiedEmail.toLowerCase() === profileEmail.trim().toLowerCase()) ||
    (user?.email &&
      (user as any)?.emailVerified &&
      user.email.toLowerCase() === profileEmail.trim().toLowerCase()))
  );

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      onProfileError("Please enter your full name.");
      return;
    }
    if (!profileWhatsapp.trim()) {
      onProfileError("Please enter your WhatsApp number for delivery notifications.");
      return;
    }
    if (profileEmail.trim() && !isValidEmail(profileEmail)) {
      onProfileError("Please enter a valid email address (e.g. name@domain.com) or leave it empty.");
      return;
    }
    onSubmit(e);
  };

  const fieldClassName =
    "h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50";

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-labelledby="profile-heading"
      className="flex h-full flex-col justify-between"
    >
      <header className="border-b border-[#eee5db] pb-2 sm:pb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a2417]">
          Step 1 of 5
        </span>
        <h1
          id="profile-heading"
          className="text-base sm:text-lg lg:text-xl font-bold text-[#24130f]"
        >
          Create Customer Profile
        </h1>
        <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#715e50]">
          Tell us about yourself so we can personalize your farm-fresh milk deliveries.
        </p>
      </header>

      <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between pt-2.5">
        {profileError && (
          <div
            role="alert"
            className="mb-2.5 flex items-center gap-2 rounded-xl border border-[#f5c6cb] bg-[#f8d7da] p-2.5 text-[11.5px] sm:text-[12px] text-[#721c24]"
          >
            <FiAlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="font-medium">{profileError}</p>
          </div>
        )}

        <div className="space-y-2.5 sm:space-y-3">
          {/* Avatar / Profile photo picker */}
          <div className="flex items-center gap-3">
            <AvatarUpload
              initialUrl={profileAvatar}
              name={profileName || user?.name || "Customer"}
              onUploaded={onAvatarChange}
              onError={onProfileError}
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:gap-3">
            {/* 1. Full Name */}
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
                  autoFocus={autoFocus}
                  value={profileName}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="e.g. Sahil Hode"
                  className={`${fieldClassName} pl-9`}
                />
              </div>
            </div>

            {/* 2. Registered Mobile (Read-Only) */}
            <div>
              <label
                htmlFor="profileMobileInput"
                className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
              >
                Registered Mobile
              </label>
              <div className="flex h-9.5 sm:h-10 lg:h-[42px] items-center gap-2 rounded-xl border border-[#ddd2c7] bg-[#faf7f2] px-3">
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
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none cursor-not-allowed"
                />
                <span className="shrink-0 rounded-full bg-[#e8f4e9] px-2 py-0.5 text-[10px] font-semibold text-[#367847]">
                  Verified ✓
                </span>
              </div>
            </div>

            {/* 3. WhatsApp Number (Compulsory for notifications & updates) */}
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label
                  htmlFor="profileWhatsappInput"
                  className="text-[11.5px] sm:text-[12px] font-semibold text-[#24130f] flex items-center gap-1.5"
                >
                  <FaWhatsapp className="text-[#25D366] h-3.5 w-3.5" />
                  WhatsApp Number <span className="text-[#7a2417]">*</span>
                </label>
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Priority Alerts
                </span>
              </div>
              <div className="relative flex h-9.5 sm:h-10 lg:h-[42px] items-center gap-2 rounded-xl border border-[#ddd2c7] bg-white px-3 focus-within:border-[#25D366] focus-within:ring-2 focus-within:ring-[#25D366]/15">
                <FaWhatsapp
                  className="h-3.5 w-3.5 shrink-0 text-[#25D366]"
                  aria-hidden="true"
                />
                <input
                  id="profileWhatsappInput"
                  type="tel"
                  required
                  value={profileWhatsapp}
                  onChange={(event) => {
                    onWhatsappChange(event.target.value);
                    onProfileError(null);
                  }}
                  placeholder="e.g. +91 98765 43210"
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none"
                />
                {user?.phone && profileWhatsapp !== user.phone && (
                  <button
                    type="button"
                    onClick={() => onWhatsappChange(user.phone)}
                    className="text-[10px] text-[#7a2417] hover:underline font-semibold shrink-0 cursor-pointer"
                  >
                    Same as mobile
                  </button>
                )}
              </div>
              <p className="mt-0.5 text-[10px] text-[#715e50]">
                Used for morning dispatch updates, delivery alerts & offers.
              </p>
            </div>

            {/* 4. Date of Birth */}
            <div>
              <label
                htmlFor="profileDobInput"
                className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
              >
                Date of Birth <span className="text-[#7a2417]">*</span>
              </label>
              <div className="relative">
                <FiCalendar
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7a2417]"
                  aria-hidden="true"
                />
                <input
                  id="profileDobInput"
                  type="date"
                  required
                  value={profileDob}
                  max={today}
                  onChange={(event) => onDobChange(event.target.value)}
                  className={`${fieldClassName} cursor-pointer pl-9`}
                />
              </div>
            </div>

            {/* 5. Gender */}
            <fieldset>
              <legend className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Gender <span className="text-[#7a2417]">*</span>
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

            {/* 6. Email Address (Optional) */}
            <div className="lg:col-span-1">
              <div className="mb-1 flex items-center justify-between gap-3">
                <label
                  htmlFor="profileEmailInput"
                  className="text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]"
                >
                  Email Address
                </label>
                <span className="text-[10px] text-[#8b7b70]">Optional</span>
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
                  value={profileEmail}
                  onChange={(event) => {
                    onEmailChange(event.target.value);
                    setJustVerifiedEmail(null);
                    onProfileError(null);
                  }}
                  placeholder="name@example.com (optional)"
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
                ) : profileEmail.trim() && isValidEmail(profileEmail) ? (
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="shrink-0 rounded-lg bg-[#7a2417] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#5f1b12] transition-colors cursor-pointer"
                  >
                    Verify Email
                  </button>
                ) : null}
              </div>
              <p className="mt-0.5 text-[10px] text-[#715e50]">
                Optional. You can proceed without an email.
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
