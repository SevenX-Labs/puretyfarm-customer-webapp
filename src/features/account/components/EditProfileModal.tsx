"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { accountApi } from "@/features/account/api/accountApi";
import { EmailVerificationModal } from "@/components/pf/EmailVerificationModal";

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export function EditProfileModal({
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gender, setGender] = useState<string>("female");
  const [dob, setDob] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);

  // Initialize fields from user
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAvatarUrl(user.avatarUrl || "");
      setGender(user.gender?.toLowerCase() || "female");
      setDob(user.dob ? user.dob.split("T")[0] : "");
      setErrorMsg(null);
      setSuccessMsg(null);
      setSaving(false);
    }
  }, [isOpen, user]);

  // ESC handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !saving) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, saving, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Full name cannot be empty.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await accountApi.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        avatarUrl,
        gender,
        dob: dob || undefined,
      });

      if (res.success) {
        setSuccessMsg("Profile updated successfully!");
        await refreshUser().catch(() => {});
        onSaved?.();
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || "Failed to update profile. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "An unexpected error occurred while updating profile.";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setSaving(false);
    }
  };

  const isEmailVerified = Boolean(
    user?.emailVerified && email.trim().toLowerCase() === (user?.email || "").trim().toLowerCase()
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => !saving && onClose()}
              className="fixed inset-0 bg-black/55 backdrop-blur-[3px]"
              aria-hidden="true"
            />

            {/* Modal Card */}
            <m.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-3xl bg-[#FFFDF8] p-5 sm:p-7 shadow-2xl border border-[#E8DFD4] z-10 font-sans my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close dialog"
                className="absolute right-4 top-4 rounded-full p-2 text-[#715E50] hover:bg-[#FAF1E2] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="mb-5 pb-4 border-b border-[#E8DFD4]">
                <h3
                  id="edit-profile-title"
                  className="text-xl sm:text-2xl font-bold text-[#24130F] font-serif tracking-tight"
                >
                  Edit Profile
                </h3>
                <p className="mt-1 text-xs sm:text-[13px] text-[#715E50] leading-relaxed">
                  Update your personal details, profile picture, and contact information.
                </p>
              </div>

              {/* Status Banners */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <m.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                    <span className="flex-1">{errorMsg}</span>
                  </m.div>
                )}
                {successMsg && (
                  <m.div
                    key="success"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
                  >
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span className="flex-1">{successMsg}</span>
                  </m.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* 1. Profile Picture Upload */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4] flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      Profile Photo
                    </span>
                    <p className="text-xs text-[#715E50] mt-0.5">
                      PNG, JPG, or WebP. 1:1 square recommended.
                    </p>
                  </div>
                  <AvatarUpload
                    initialUrl={avatarUrl}
                    name={name || user?.name || "Customer"}
                    onUploaded={(url) => setAvatarUrl(url)}
                    onError={(err) => setErrorMsg(err)}
                    actionLabel="Change Photo"
                  />
                </div>

                {/* 2. Full Legal Name */}
                <div>
                  <label
                    htmlFor="edit-name-input"
                    className="block text-xs font-semibold text-[#4A3830] mb-1.5"
                  >
                    Full Name <span className="text-[#5C1B13]">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C7A6B]">
                      <User size={16} />
                    </div>
                    <input
                      id="edit-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="e.g. SevenX Labs"
                      disabled={saving}
                      className="w-full rounded-xl border border-[#DDD2C7] bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[#24130F] placeholder-[#A8988B] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#F5EFE6] transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number (Locked) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#4A3830]">
                      Mobile Number
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Verified &amp; Locked
                    </span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C7A6B]">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={user?.mobile || user?.phone || "—"}
                      className="w-full rounded-xl border border-[#E8DFD4] bg-[#FAF8F5] py-2.5 pl-10 pr-3.5 text-sm font-mono font-bold text-[#6B584C] cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#8C7A6B]">
                    Phone is linked to OTP authentication and cannot be edited directly.
                  </p>
                </div>

                {/* 4. Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="edit-email-input"
                      className="text-xs font-semibold text-[#4A3830]"
                    >
                      Email Address
                    </label>
                    {isEmailVerified ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} /> Verified
                      </span>
                    ) : email.trim() ? (
                      <button
                        type="button"
                        onClick={() => setShowEmailVerifyModal(true)}
                        className="text-[11px] font-bold text-[#6F2115] hover:underline cursor-pointer"
                      >
                        Verify Email
                      </button>
                    ) : null}
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C7A6B]">
                      <Mail size={16} />
                    </div>
                    <input
                      id="edit-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="e.g. contact@sevenxlabs.com"
                      disabled={saving}
                      className="w-full rounded-xl border border-[#DDD2C7] bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[#24130F] placeholder-[#A8988B] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#F5EFE6] transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#8C7A6B]">
                    Required for online payment receipts and monthly invoice PDFs.
                  </p>
                </div>

                {/* 5. Date of Birth & Gender Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="edit-dob-input"
                      className="block text-xs font-semibold text-[#4A3830] mb-1.5"
                    >
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C7A6B]">
                        <Calendar size={16} />
                      </div>
                      <input
                        id="edit-dob-input"
                        type="date"
                        value={dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDob(e.target.value)}
                        disabled={saving}
                        className="w-full rounded-xl border border-[#DDD2C7] bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[#24130F] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#F5EFE6] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3830] mb-1.5">
                      Gender
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {GENDER_OPTIONS.map((opt) => {
                        const isSelected = gender === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={saving}
                            onClick={() => setGender(opt.value)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer disabled:opacity-50 ${
                              isSelected
                                ? "border-[#6F2115] bg-[#FAF1E2] text-[#6F2115] shadow-xs"
                                : "border-[#DDD2C7] bg-white text-[#4A3830] hover:bg-[#FAF6F0]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-[#E8DFD4]">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="flex-1 min-h-[44px] rounded-xl border border-[#DDD2C7] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#24130F] hover:bg-[#FAF6F0] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[1.5] min-h-[44px] rounded-xl bg-[#6F2115] hover:bg-[#581A11] px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerifyModal}
        onClose={() => setShowEmailVerifyModal(false)}
        initialEmail={email}
        onSuccess={(verified) => {
          setEmail(verified);
          setShowEmailVerifyModal(false);
          refreshUser().catch(() => {});
        }}
      />
    </>
  );
}
