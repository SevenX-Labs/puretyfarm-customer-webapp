"use client";

import React from "react";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { Button } from "@/components/ui/Button";
import { User } from "@/types/models";
import {
  FiCheckCircle,
  FiEdit2,
  FiEdit3,
  FiMail,
  FiUser,
  FiPhone,
  FiShield,
  FiX,
  FiSave,
  FiAlertCircle,
  FiCalendar,
  FiLock,
} from "react-icons/fi";

export interface ProfileTabProps {
  user: User;
  isEditingProfile: boolean;
  profileName: string;
  profileEmail: string;
  profileAvatar: string;
  profileDob: string;
  profileGender: string;
  profileSaving: boolean;
  profileMsg: { type: "success" | "error"; text: string } | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onAvatarChange: (url: string) => void;
  onDobChange: (val: string) => void;
  onGenderChange: (val: string) => void;
  onProfileError: (msg: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onVerifyEmail?: (email?: string) => void;
}

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export function ProfileTab({
  user,
  isEditingProfile,
  profileName,
  profileEmail,
  profileAvatar,
  profileDob,
  profileGender,
  profileSaving,
  profileMsg,
  onStartEdit,
  onCancelEdit,
  onNameChange,
  onEmailChange,
  onAvatarChange,
  onDobChange,
  onGenderChange,
  onProfileError,
  onSaveProfile,
  onVerifyEmail,
}: ProfileTabProps) {
  const userInitials = (user.name || "Customer")
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "PF";

  const rawPhone = user.phone || (user as any).mobile || "";
  const formattedPhone = rawPhone
    ? rawPhone.startsWith("+91")
      ? rawPhone
      : `+91${rawPhone}`
    : "—";

  const formattedDob = user.dob
    ? (() => {
        try {
          const d = new Date(user.dob);
          if (isNaN(d.getTime())) return user.dob;
          return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        } catch {
          return user.dob;
        }
      })()
    : "Not added";

  const formattedGender = user.gender
    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()
    : "Not specified";

  const isEmailVerified = Boolean((user as any).emailVerified);

  return (
    <div className="w-full">
      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between pb-5 border-b border-[#E8DFD4] mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1008]">
            {isEditingProfile ? "Update Profile" : "Personal Information"}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
            {isEditingProfile
              ? "Update your name, email, date of birth, and gender."
              : "Your verified PuretyFarm customer profile and account details."}
          </p>
        </div>

        {!isEditingProfile ? (
          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF3EA] hover:bg-[#5C1B13] hover:text-white border border-[#E8DFD4] text-[#5C1B13] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FiEdit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={profileSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E8DFD4] hover:bg-[#FAF6F0] text-[#6B584C] text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <FiX className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Status toast message */}
      {profileMsg && (
        <div
          role="alert"
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm transition-all ${
            profileMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-[#5C1B13] border border-rose-200"
          }`}
        >
          {profileMsg.type === "success" ? (
            <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <FiAlertCircle className="w-4 h-4 shrink-0 text-[#5C1B13]" />
          )}
          <span className="font-medium">{profileMsg.text}</span>
        </div>
      )}

      {!isEditingProfile ? (
        /* ─── VIEW MODE ─── */
        <div className="space-y-4">
          {/* Main Profile Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#FAF6F0]/70 border border-[#E8DFD4] gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#FAF3EA] border-2 border-[#E8DFD4] flex items-center justify-center shrink-0 shadow-xs">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold font-serif text-[#5C1B13]">
                    {userInitials}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-[#1A1008] truncate">
                  {user.name || "Customer"}
                </h3>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF1E2] text-[#5C1B13] border border-[#E8DFD4]">
                    PuretyFarm Customer
                  </span>
                  {isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <FiCheckCircle className="w-2.5 h-2.5" /> Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartEdit}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#D5C7B8] bg-white text-xs font-bold text-[#5C1B13] hover:bg-[#FAF6F0] transition-colors cursor-pointer shadow-2xs"
            >
              <FiEdit2 className="w-3 h-3" />
              <span>Edit Details</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
            {/* Mobile Number */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1">
                  <FiPhone className="w-3 h-3 text-[#8C603D]" /> Mobile Number
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FiLock className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <div className="font-mono font-bold text-sm sm:text-base text-[#1A1008]">
                {formattedPhone}
              </div>
              <p className="text-[11px] text-[#8C7A6B] mt-1">
                Linked to OTP authentication.
              </p>
            </div>

            {/* Email Address */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1">
                  <FiMail className="w-3 h-3 text-[#8C603D]" /> Email Address
                </span>
                {isEmailVerified ? (
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                ) : user.email ? (
                  <button
                    type="button"
                    onClick={() => onVerifyEmail ? onVerifyEmail(user.email!) : onStartEdit()}
                    className="text-[10px] font-bold uppercase text-[#5C1B13] hover:underline cursor-pointer"
                  >
                    Verify
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onVerifyEmail ? onVerifyEmail(profileEmail || "") : onStartEdit()}
                    className="text-[10px] font-bold uppercase text-[#5C1B13] hover:underline cursor-pointer"
                  >
                    Add &amp; Verify
                  </button>
                )}
              </div>
              <div className="font-semibold text-sm sm:text-base text-[#1A1008] break-all">
                {user.email || "Not added"}
              </div>
              <p className="text-[11px] text-[#8C7A6B] mt-1">
                For receipts, bills, and monthly invoices.
              </p>
            </div>

            {/* Date of Birth */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1">
                  <FiCalendar className="w-3 h-3 text-[#8C603D]" /> Date of Birth
                </span>
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-[#8C7A6B] hover:text-[#5C1B13] transition-colors cursor-pointer"
                  title="Edit Date of Birth"
                >
                  <FiEdit2 className="w-3 h-3" />
                </button>
              </div>
              <div className="font-semibold text-sm sm:text-base text-[#1A1008]">
                {formattedDob}
              </div>
              <p className="text-[11px] text-[#8C7A6B] mt-1">
                Used for birthday special farm perks.
              </p>
            </div>

            {/* Gender */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1">
                  <FiShield className="w-3 h-3 text-[#8C603D]" /> Gender
                </span>
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-[#8C7A6B] hover:text-[#5C1B13] transition-colors cursor-pointer"
                  title="Edit Gender"
                >
                  <FiEdit2 className="w-3 h-3" />
                </button>
              </div>
              <div className="font-semibold text-sm sm:text-base text-[#1A1008]">
                {formattedGender}
              </div>
              <p className="text-[11px] text-[#8C7A6B] mt-1">
                Personalized customer profile preferences.
              </p>
            </div>
          </div>

          {/* Bottom Quote Banner */}
          <div className="rounded-2xl bg-[#FAF4ED] border border-[#E8DFD4]/70 p-4 sm:p-5 flex items-center gap-3.5 mt-5">
            <div className="w-9 h-9 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#966038] shrink-0 border border-[#E8DFD4]/60">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" opacity="0.1" fill="currentColor" />
                <path d="M7 20h10" />
                <path d="M10 20c0-4 2-7 5-8" />
                <path d="M14 20c0-6-3-9-7-10" />
                <path d="M12 3v7" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-serif italic text-[#8C5D38] leading-relaxed">
              “Pure milk. Healthier you. A better tomorrow.”
            </p>
          </div>
        </div>
      ) : (
        /* ─── EDIT MODE FORM ─── */
        <form onSubmit={onSaveProfile} className="space-y-5">
          {/* Avatar Upload */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4]">
            <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-2">
              Update Profile Photo
            </span>
            <AvatarUpload
              initialUrl={profileAvatar}
              name={profileName || user.name}
              onUploaded={onAvatarChange}
              onError={onProfileError}
            />
          </div>

          {/* Locked Mobile Number */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                Mobile Number (Verified)
              </span>
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FiLock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#1A1008]">
              <FiPhone className="w-4 h-4 text-[#8C603D]" />
              <span>{formattedPhone}</span>
            </div>
            <p className="text-[11px] text-[#8C7A6B] mt-1.5 flex items-center gap-1">
              <FiShield className="w-3 h-3 text-[#5C1B13]" /> Phone is linked to OTP authentication and cannot be changed here.
            </p>
          </div>

          {/* Edit Full Name */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80">
            <label
              htmlFor="profile-name-input"
              className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-1.5"
            >
              Full Legal Name <span className="text-[#5C1B13]">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5 transition-all">
              <FiUser className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
              <input
                id="profile-name-input"
                type="text"
                required
                value={profileName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. SevenX Labs"
                disabled={profileSaving}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
              />
            </div>
          </div>

          {/* Edit Email Address */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="profile-email-input"
                className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block"
              >
                Email Address
              </label>
              {isEmailVerified ? (
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FiCheckCircle className="w-2.5 h-2.5" /> Verified
                </span>
              ) : profileEmail.trim() ? (
                <button
                  type="button"
                  onClick={() => onVerifyEmail?.(profileEmail.trim())}
                  className="text-[11px] font-bold text-[#5C1B13] hover:underline cursor-pointer"
                >
                  Verify Email
                </button>
              ) : null}
            </div>
            <div className="flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5 transition-all">
              <FiMail className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
              <input
                id="profile-email-input"
                type="email"
                value={profileEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="e.g. contact@puretyfarm.com"
                disabled={profileSaving}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#8C7A6B] mt-1.5">
              Required for online payment receipts and monthly invoice records.
            </p>
          </div>

          {/* Date of Birth & Gender Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80">
              <label
                htmlFor="profile-dob-input"
                className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-1.5"
              >
                Date of Birth
              </label>
              <div className="flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5 transition-all">
                <FiCalendar className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
                <input
                  id="profile-dob-input"
                  type="date"
                  value={profileDob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => onDobChange(e.target.value)}
                  disabled={profileSaving}
                  className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            {/* Gender Selector */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80">
              <label className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((opt) => {
                  const isSelected = profileGender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={profileSaving}
                      onClick={() => onGenderChange(opt.value)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer disabled:opacity-50 ${
                        isSelected
                          ? "border-[#5C1B13] bg-[#FAF1E2] text-[#5C1B13] shadow-xs"
                          : "border-[#E8DFD4] bg-white text-[#6B584C] hover:bg-[#FAF6F0]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD4]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancelEdit}
              disabled={profileSaving}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold border-[#E8DFD4] bg-white text-[#6B584C] hover:bg-[#FAF6F0] cursor-pointer disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={profileSaving}
              className="rounded-xl px-6 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FiSave className="w-3.5 h-3.5" />
              <span>{profileSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
