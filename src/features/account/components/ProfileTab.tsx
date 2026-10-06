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
} from "react-icons/fi";

export interface ProfileTabProps {
  user: User;
  isEditingProfile: boolean;
  profileName: string;
  profileEmail: string;
  profileAvatar: string;
  profileSaving: boolean;
  profileMsg: { type: "success" | "error"; text: string } | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onAvatarChange: (url: string) => void;
  onProfileError: (msg: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
}

export function ProfileTab({
  user,
  isEditingProfile,
  profileName,
  profileEmail,
  profileAvatar,
  profileSaving,
  profileMsg,
  onStartEdit,
  onCancelEdit,
  onNameChange,
  onEmailChange,
  onAvatarChange,
  onProfileError,
  onSaveProfile,
}: ProfileTabProps) {
  const initials = (user.name || "MU")
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedPhone = user.phone
    ? user.phone.startsWith("+91")
      ? user.phone
      : `+91${user.phone}`
    : "+919082873561";

  return (
    <div className="w-full">
      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8DFD4] mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
            Personal Information
          </h2>
          <p className="text-sm sm:text-base text-[#6B584C] mt-1">
            Your verified PuretyFarm customer profile and sunrise delivery details.
          </p>
        </div>

        {!isEditingProfile ? (
          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF3EA] hover:bg-[#5C1B13] hover:text-white border border-[#E8DFD4] text-[#5C1B13] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FiEdit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#E8DFD4] hover:bg-[#FAF6F0] text-[#6B584C] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <FiX className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Status toast message */}
      {profileMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
            profileMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {profileMsg.type === "success" ? (
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{profileMsg.text}</span>
        </div>
      )}

      {/* ─── READ MODE (EXACT DESIGN MATCH) ─── */}
      {!isEditingProfile ? (
        <div className="space-y-4">
          {/* Member Card Header Row */}
          <div className="flex items-center gap-5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
            <div className="w-18 h-18 rounded-full bg-[#FAF3EA] border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] font-serif font-bold text-2xl shrink-0 overflow-hidden shadow-xs">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name || "Customer"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A1008]">
                {user.name || "manthan utekar"}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B584C] mt-1 font-medium">
                FarmFresh Milk Subscriber • Raipur Dawn Cold-Chain
              </p>
            </div>
          </div>

          {/* Row 1: Mobile Number */}
          <div className="flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF3EA] flex items-center justify-center text-[#8C603D] shrink-0 border border-[#E8DFD4]/60">
                <FiPhone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                  MOBILE NUMBER
                </span>
                <span className="text-base sm:text-lg font-bold text-[#1A1008] font-mono mt-0.5 block">
                  {formattedPhone}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
              <FiCheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verified</span>
            </span>
          </div>

          {/* Row 2: Full Name */}
          <div className="flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF3EA] flex items-center justify-center text-[#8C603D] shrink-0 border border-[#E8DFD4]/60">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                  FULL NAME
                </span>
                <span className="text-base sm:text-lg font-bold text-[#1A1008] mt-0.5 block">
                  {user.name || "manthan utekar"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartEdit}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#8C7A6B] hover:text-[#5C1B13] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              title="Edit Name"
              aria-label="Edit Full Name"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Row 3: Email Address */}
          <div className="flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDF7] border border-[#E8DFD4]/80 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF3EA] flex items-center justify-center text-[#8C603D] shrink-0 border border-[#E8DFD4]/60">
                <FiMail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                  EMAIL ADDRESS
                </span>
                <span className="text-base sm:text-lg font-semibold text-[#1A1008] mt-0.5 block">
                  {user.email || "manthanut27@gmail.com"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartEdit}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#8C7A6B] hover:text-[#5C1B13] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              title="Edit Email"
              aria-label="Edit Email Address"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Quote Banner */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#FAF4ED] border border-[#E8DFD4]/70 p-5 sm:p-6 flex items-center gap-4 mt-6">
            <div className="w-10 h-10 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#966038] shrink-0 border border-[#E8DFD4]/60">
              <svg
                className="w-5 h-5"
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
            <p className="text-sm sm:text-base font-serif italic text-[#8C5D38] leading-relaxed">
              “Pure milk. Healthier you. A better tomorrow.”
            </p>
          </div>
        </div>
      ) : (
        /* ─── EDIT MODE FORM ─── */
        <form onSubmit={onSaveProfile} className="space-y-5">
          {/* Avatar Upload */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4]">
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
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Locked
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#1A1008]">
              <FiPhone className="w-4 h-4 text-[#8C603D]" />
              <span>{formattedPhone}</span>
            </div>
            <p className="text-[11px] text-[#8C7A6B] mt-1.5 flex items-center gap-1">
              <FiShield className="w-3 h-3 text-[#5C1B13]" /> Authentication phone is locked to your account.
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
                placeholder="e.g. manthan utekar"
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
              />
            </div>
          </div>

          {/* Edit Email Address */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]/80">
            <label
              htmlFor="profile-email-input"
              className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block mb-1.5"
            >
              Email Address
            </label>
            <div className="flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5 transition-all">
              <FiMail className="w-4 h-4 text-[#8C7A6B] mr-2.5 shrink-0" />
              <input
                id="profile-email-input"
                type="email"
                value={profileEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="e.g. manthanut27@gmail.com"
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#8C7A6B] mt-1.5">
              Used for morning dispatch confirmations and monthly invoices.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancelEdit}
              disabled={profileSaving}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold border-[#E8DFD4] bg-white text-[#6B584C] hover:bg-[#FAF6F0] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={profileSaving}
              className="rounded-xl px-6 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-2 cursor-pointer shadow-sm"
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