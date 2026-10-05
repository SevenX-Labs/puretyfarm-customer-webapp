"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { User } from "@/types/models";
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiCheckCircle,
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
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-xs"
    >
      <div className="flex items-center justify-between pb-5 border-b border-[#E8DFD4] mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#1A1008]">Personal Information</h2>
          <p className="text-xs text-[#3A241C]/65 mt-0.5">Your verified PuretyFarm customer profile.</p>
        </div>
        {!isEditingProfile && (
          <button
            onClick={onStartEdit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C1B13] hover:text-[#40110D] bg-[#5C1B13]/8 hover:bg-[#5C1B13]/12 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {profileMsg && (
        <div
          className={`mb-5 p-3 rounded-2xl text-xs flex items-center gap-2 ${
            profileMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {profileMsg.type === "success" ? (
            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <FiAlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{profileMsg.text}</span>
        </div>
      )}

      {isEditingProfile ? (
        <form onSubmit={onSaveProfile} className="space-y-5">
          {/* Avatar Uploader with Square Crop */}
          <div className="pb-4 border-b border-[#E8DFD4]">
            <AvatarUpload
              initialUrl={profileAvatar}
              name={profileName || user.name}
              onUploaded={onAvatarChange}
              onError={onProfileError}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
              Phone Number (Verified)
            </label>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FBF6EE] border border-[#E8DFD4] text-xs font-mono font-semibold text-[#1A1008]">
              <span>{user.phone}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Verified ✓
              </span>
            </div>
            <p className="text-[11px] text-[#3A241C]/50 mt-1">Phone number is locked to your account.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
              <FiUser className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
              <FiMail className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="e.g. yourname@domain.com"
                className="w-full bg-transparent text-sm font-medium text-[#1A1008] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={profileSaving}
              className="rounded-xl px-5 py-2.5 text-xs font-bold"
            >
              {profileSaving ? "Saving Changes..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancelEdit}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Profile Avatar Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
            <button
              type="button"
              onClick={onStartEdit}
              title="Click to change profile photo"
              className="relative group w-16 h-16 rounded-full border border-[#E8DFD4] hover:border-[#5C1B13] overflow-hidden bg-gradient-to-br from-[#FAF3EA] to-[#F3E7D7] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-serif font-bold text-[#5C1B13]">
                  {(user.name || "PF")
                    .split(/\s+/)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <FiEdit2 className="w-4 h-4" />
              </div>
            </button>
            <div>
              <h3 className="text-base font-bold text-[#1A1008]">{user.name || "Purety Member"}</h3>
              <p className="text-xs text-[#3A241C]/65">Farm Fresh Milk Subscriber</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
            <div>
              <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                Mobile Number
              </span>
              <span className="text-sm font-bold text-[#1A1008] mt-0.5 block font-mono">
                {user.phone}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
            <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
              Full Name
            </span>
            <span className="text-sm font-bold text-[#1A1008] mt-0.5 block">
              {user.name || "Not provided"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
            <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
              Email Address
            </span>
            <span className="text-sm font-semibold text-[#1A1008] mt-0.5 block">
              {user.email || "Not specified (used for delivery receipts)"}
            </span>
          </div>
        </div>
      )}
    </m.div>
  );
}
