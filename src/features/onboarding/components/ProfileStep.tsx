"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  FiBell,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { User } from "@/types/models";

const MarsIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="10" cy="14" r="5" />
    <path d="M14 10l6-6m-4 0h4v4" />
  </svg>
);

const VenusIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="9" r="5" />
    <path d="M12 14v7m-3-3h6" />
  </svg>
);

const OtherIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const GENDER_OPTIONS = [
  { value: "male", label: "Male", Icon: MarsIcon },
  { value: "female", label: "Female", Icon: VenusIcon },
  { value: "other", label: "Other", Icon: OtherIcon },
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

function formatPhoneDisplay(rawPhone?: string | null): string {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/\s+/g, "");
  if (cleaned.startsWith("+91") && cleaned.length >= 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith("+91")) {
    return `+91 ${cleaned.slice(3)}`;
  }
  return cleaned;
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
    "h-10 sm:h-10.5 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3 text-[12.5px] sm:text-[13px] font-medium text-[#1F1410] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7A2417] focus:bg-white focus:ring-4 focus:ring-[#7A2417]/10 disabled:opacity-50";

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-labelledby="profile-heading"
      className="relative flex w-full flex-col justify-between"
    >
      {/* Header text */}
      <header className="relative z-10 pb-1.5 sm:pb-2 max-w-[280px] sm:max-w-md lg:max-w-lg">
        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#7A2417] block">
          STEP 1 OF 4 • ACCOUNT DETAILS
        </span>
        <h1
          id="profile-heading"
          className="font-serif text-xl sm:text-[24px] lg:text-[27px] font-bold text-[#1C120E] tracking-tight mt-0.5 leading-snug"
        >
          Create your customer profile
        </h1>
        <p className="mt-0.5 text-xs text-[#715E50] max-w-sm sm:max-w-md">
          Tell us about yourself so we can personalize your farm-fresh milk deliveries.
        </p>
      </header>

      <form onSubmit={handleFormSubmit} className="relative z-10 flex-1 flex flex-col justify-between pt-1">
        {profileError && (
          <div
            role="alert"
            className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50/90 p-2 text-xs text-red-800 shadow-2xs"
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

        <div className="space-y-3 sm:space-y-3.5">
          {/* Avatar / Profile photo card matching reference */}
          <div className="rounded-2xl border border-[#EBDED2] bg-white/70 p-3 sm:p-3.5 shadow-2xs">
            <AvatarUpload
              initialUrl={profileAvatar}
              name={profileName || user?.name || "Customer"}
              onUploaded={onAvatarChange}
              onError={onProfileError}
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {/* 1. Full Name */}
            <div>
              <label
                htmlFor="profileNameInput"
                className="mb-1 block text-xs font-semibold text-[#1F1410]"
              >
                Full Name <span className="text-[#7A2417] font-bold">*</span>
              </label>
              <div className="relative">
                <FiUser
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#715E50]"
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
                className="mb-1.5 block text-xs font-semibold text-[#1F1410]"
              >
                Registered Mobile
              </label>
              <div className="relative flex h-11 sm:h-11.5 items-center gap-2 rounded-xl border border-[#DED4C7] bg-[#F8F5EF] px-3.5">
                <FiPhone
                  className="h-4 w-4 shrink-0 text-[#715E50]"
                  aria-hidden="true"
                />
                <input
                  id="profileMobileInput"
                  type="tel"
                  value={formatPhoneDisplay(user?.phone)}
                  readOnly
                  aria-readonly="true"
                  className="min-w-0 flex-1 bg-transparent text-[13px] sm:text-sm font-medium text-[#1F1410] outline-none cursor-not-allowed"
                />
                <span className="shrink-0 rounded-full bg-[#D1F2D9] px-2.5 py-1 text-xs font-bold text-[#1E7B42] flex items-center gap-1">
                  <FiCheck className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            {/* 3. WhatsApp Number */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="profileWhatsappInput"
                  className="text-xs font-semibold text-[#1F1410]"
                >
                  WhatsApp Number <span className="text-[#7A2417] font-bold">*</span>
                </label>
                <span className="text-xs font-semibold text-[#1E7B42] bg-[#E2F5EA] px-2.5 py-0.5 rounded-full border border-[#BCE7CB] flex items-center gap-1.5">
                  <FiBell className="w-3 h-3 text-[#1E7B42]" aria-hidden="true" />
                  <span>Priority Alerts</span>
                </span>
              </div>
              <div className="relative flex h-11 sm:h-11.5 items-center gap-2 rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 transition-all focus-within:border-[#25D366] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#25D366]/15">
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
                  placeholder="e.g. +91 8591434081"
                  className="min-w-0 flex-1 bg-transparent text-[13px] sm:text-sm font-medium text-[#1F1410] outline-none placeholder:text-[#A89A8D]"
                />
                {user?.phone && profileWhatsapp !== user.phone && (
                  <button
                    type="button"
                    onClick={() => onWhatsappChange(user.phone)}
                    className="text-[10.5px] text-[#7A2417] hover:underline font-bold shrink-0 cursor-pointer bg-[#7A2417]/8 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    Same as mobile
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#715E50]">
                Used for morning dispatch updates, delivery alerts & offers.
              </p>
            </div>

            {/* 4. Date of Birth (Optional) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="profileDobInput"
                  className="text-xs font-semibold text-[#1F1410]"
                >
                  Date of Birth
                </label>
                <span className="text-xs font-medium text-[#8A786B]">Optional</span>
              </div>
              <div className="relative">
                <FiCalendar
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#715E50]"
                  aria-hidden="true"
                />
                <input
                  id="profileDobInput"
                  type="date"
                  value={profileDob}
                  max={today}
                  onChange={(event) => onDobChange(event.target.value)}
                  placeholder="dd - mm - yyyy"
                  className={`${fieldClassName} cursor-pointer pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#715E50]">
                Optional. Used for birthday specials and surprises.
              </p>
            </div>

            {/* 5. Gender */}
            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold text-[#1F1410]">
                Gender <span className="text-[#7A2417] font-bold">*</span>
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map(({ value, label, Icon }) => {
                  const isSelected = profileGender === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onGenderChange(value)}
                      className={`inline-flex h-11 sm:h-11.5 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs sm:text-[13px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A2417] cursor-pointer ${
                        isSelected
                          ? "border-[#7A2417] bg-[#FFF8F6] text-[#7A2417] shadow-2xs ring-1 ring-[#7A2417]"
                          : "border-[#DED4C7] bg-white text-[#24130F] hover:border-[#7A2417]/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* 6. Email Address (Optional) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="profileEmailInput"
                  className="text-xs font-semibold text-[#1F1410]"
                >
                  Email Address
                </label>
                <span className="text-xs font-medium text-[#8A786B]">Optional</span>
              </div>
              <div className="relative flex h-11 sm:h-11.5 items-center gap-2 rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 transition-all focus-within:border-[#7A2417] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7A2417]/10">
                <FiMail
                  className="h-4 w-4 shrink-0 text-[#715E50]"
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
                  className="min-w-0 flex-1 bg-transparent text-[13px] sm:text-sm font-medium text-[#1F1410] outline-none placeholder:text-[#A89A8D]"
                />
                {isEmailVerified ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded-full bg-[#D1F2D9] px-2.5 py-0.5 text-[11px] font-bold text-[#1E7B42]">
                      ✓ Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onEmailChange("");
                        setJustVerifiedEmail(null);
                      }}
                      className="text-[10.5px] text-[#7A2417] hover:underline font-bold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : profileEmail.trim() && isValidEmail(profileEmail) ? (
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="shrink-0 rounded-lg bg-[#7A2417] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#5f1b12] transition-colors cursor-pointer"
                  >
                    Verify Email
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] text-[#715E50]">
                Optional. You can proceed without an email.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Divider and Continue Button matching reference */}
        <div className="mt-6 pt-4 border-t border-[#EBDED2] flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#671A1B] px-8 text-xs sm:text-[13.5px] font-bold text-white transition-all hover:bg-[#521314] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#671A1B] disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-[#671A1B]/20 cursor-pointer"
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
