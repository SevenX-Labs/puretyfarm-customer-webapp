"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { m } from "framer-motion";

const EmailVerificationModal = dynamic(
  () =>
    import("@/components/pf/EmailVerificationModal").then(
      (mod) => mod.EmailVerificationModal
    ),
  { ssr: false }
);
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

function ProfileStepComponent({
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

  // Auto-dismiss error alert so it does not stay visible indefinitely
  useEffect(() => {
    if (!profileError) return;
    const timer = setTimeout(() => {
      onProfileError(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [profileError, onProfileError]);

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
    const cleanWhatsappDigits = profileWhatsapp.replace(/\D/g, "");
    if (cleanWhatsappDigits.length < 10) {
      onProfileError("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    if (profileEmail.trim() && !isValidEmail(profileEmail)) {
      onProfileError("Please enter a valid email address (e.g. name@domain.com) or leave it empty.");
      return;
    }
    onSubmit(e);
  };

  const fieldClassName =
    "h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] sm:text-[13.5px] font-medium text-[#24130F] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:opacity-50";

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-labelledby="profile-heading"
      className="flex w-full flex-col justify-between"
    >
      <header className="border-b border-[#eee5db] pb-2.5 sm:pb-3">
        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#7a2417] block">
          Step 1 of 4 • Account Details
        </span>
        <h1
          id="profile-heading"
          className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#24130f] mt-0.5"
        >
          Create Customer Profile
        </h1>
        <p className="mt-1 text-xs sm:text-[13px] text-[#715e50]">
          Tell us about yourself so we can personalize your farm-fresh milk deliveries.
        </p>
      </header>

      <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between pt-3 sm:pt-4">
        {profileError && (
          <div
            role="alert"
            className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50/90 p-2.5 text-xs text-red-800 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <p className="font-semibold">{profileError}</p>
            </div>
            <button
              type="button"
              onClick={() => onProfileError(null)}
              className="text-red-700 hover:text-red-900 font-bold cursor-pointer text-xs px-1.5 py-0.5 rounded"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-3.5 sm:space-y-4">
          {/* Avatar / Profile photo picker */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#EBE2D5] bg-[#FDFBF7] p-2.5 sm:p-3 shadow-2xs">
            <AvatarUpload
              initialUrl={profileAvatar}
              name={profileName || user?.name || "Customer"}
              onUploaded={onAvatarChange}
              onError={onProfileError}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
            {/* 1. Full Name */}
            <div>
              <label
                htmlFor="profileNameInput"
                className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]"
              >
                Full Name <span className="text-[#7a2417] font-bold">*</span>
              </label>
              <div className="relative">
                <FiUser
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a2417]"
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
                  className={`${fieldClassName} pl-10`}
                />
              </div>
            </div>

            {/* 2. Registered Mobile (Read-Only) */}
            <div>
              <label
                htmlFor="profileMobileInput"
                className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]"
              >
                Registered Mobile
              </label>
              <div className="flex h-10.5 sm:h-11 items-center gap-2 rounded-xl border border-[#DED4C7] bg-[#F6F2EC] px-3.5">
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
                  className="min-w-0 flex-1 bg-transparent text-[13px] sm:text-[13.5px] font-medium font-mono text-[#24130f] outline-none cursor-not-allowed"
                />
                <span className="shrink-0 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Verified ✓
                </span>
              </div>
            </div>

            {/* 3. WhatsApp Number (Compulsory for notifications & updates) */}
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label
                  htmlFor="profileWhatsappInput"
                  className="text-[11.5px] sm:text-xs font-semibold text-[#24130f] flex items-center gap-1.5"
                >
                  <FaWhatsapp className="text-[#25D366] h-3.5 w-3.5" />
                  <span>WhatsApp Number</span>
                  <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Priority Alerts
                </span>
              </div>
              <div className="relative flex h-10.5 sm:h-11 items-center gap-2 rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 transition-all focus-within:border-[#25D366] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#25D366]/15">
                <FaWhatsapp
                  className="h-4 w-4 shrink-0 text-[#25D366]"
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
                  className="min-w-0 flex-1 bg-transparent text-[13px] sm:text-[13.5px] font-medium text-[#24130f] outline-none placeholder:text-[#A89A8D]"
                />
                {user?.phone && profileWhatsapp !== user.phone && (
                  <button
                    type="button"
                    onClick={() => onWhatsappChange(user.phone)}
                    className="text-[10.5px] text-[#7a2417] hover:underline font-bold shrink-0 cursor-pointer bg-[#7a2417]/8 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    Same as mobile
                  </button>
                )}
              </div>
              <p className="mt-1 text-[10.5px] text-[#715e50]">
                Used for morning dispatch updates, delivery alerts & offers.
              </p>
            </div>

            {/* 4. Date of Birth (Optional) */}
            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label
                  htmlFor="profileDobInput"
                  className="text-[11.5px] sm:text-xs font-semibold text-[#24130f]"
                >
                  Date of Birth
                </label>
                <span className="text-[10.5px] font-medium text-[#8b7b70]">Optional</span>
              </div>
              <div className="relative">
                <FiCalendar
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a2417]"
                  aria-hidden="true"
                />
                <input
                  id="profileDobInput"
                  type="date"
                  value={profileDob}
                  max={today}
                  onChange={(event) => onDobChange(event.target.value)}
                  className={`${fieldClassName} cursor-pointer pl-10`}
                />
              </div>
              <p className="mt-1 text-[10.5px] text-[#715e50]">
                Optional. Used for birthday specials and surprises.
              </p>
            </div>

            {/* 5. Gender */}
            <fieldset>
              <legend className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                Gender <span className="text-[#7a2417] font-bold">*</span>
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
                      className={`inline-flex h-10.5 sm:h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs sm:text-[12.5px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2417] cursor-pointer ${
                        isSelected
                          ? "border-[#7a2417] bg-[#7a2417] text-white shadow-sm ring-2 ring-[#7a2417]/20"
                          : "border-[#DED4C7] bg-[#FDFBF7] text-[#24130f] hover:border-[#7a2417]/50 hover:bg-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{label}</span>
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
                  className="text-[11.5px] sm:text-xs font-semibold text-[#24130f]"
                >
                  Email Address
                </label>
                <span className="text-[10.5px] font-medium text-[#8b7b70]">Optional</span>
              </div>
              <div className="relative flex h-10.5 sm:h-11 items-center gap-2 rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 transition-all focus-within:border-[#7a2417] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7a2417]/10">
                <FiMail
                  className="h-4 w-4 shrink-0 text-[#7a2417]"
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
                  className="min-w-0 flex-1 bg-transparent text-[13px] sm:text-[13.5px] font-medium text-[#24130f] outline-none placeholder:text-[#A89A8D]"
                />
                {isEmailVerified ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Verified ✓
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onEmailChange("");
                        setJustVerifiedEmail(null);
                      }}
                      className="text-[10.5px] text-[#7a2417] hover:underline font-bold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : profileEmail.trim() && isValidEmail(profileEmail) ? (
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="shrink-0 rounded-lg bg-[#7a2417] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#5f1b12] transition-colors cursor-pointer"
                  >
                    Verify Email
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[10.5px] text-[#715e50]">
                Optional. You can proceed without an email.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#eee5db] flex justify-stretch sm:justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#5C1B13] px-7 text-xs sm:text-[13.5px] font-bold text-white transition-all hover:bg-[#48150F] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C1B13] disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-[#5C1B13]/20 hover:shadow-lg hover:shadow-[#5C1B13]/30 cursor-pointer"
          >
            <span>
              {profileSaving
                ? "Saving Details..."
                : "Continue to Delivery Address"}
            </span>
            <FiArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
      {/* Email Verification Modal - mounted only when opened */}
      {isEmailModalOpen && (
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
      )}
    </m.section>
  );
}

export const ProfileStep = React.memo(ProfileStepComponent);
