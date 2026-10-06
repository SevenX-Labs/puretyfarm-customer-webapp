"use client";

import React, { useState } from "react";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiSmartphone,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import { User } from "@/types/models";

interface SecurityTabProps {
  user: User;
  onLogout: () => void;
}

export function SecurityTab({ user, onLogout }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Danger Zone Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordToast(null);

    if (newPassword.length < 6) {
      setPasswordToast({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    setTimeout(() => {
      setPasswordSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordToast({
        type: "success",
        text: "Password updated successfully! Used as backup login credentials.",
      });
      setTimeout(() => setPasswordToast(null), 3500);
    }, 600);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") return;
    setShowDeleteModal(false);
    alert("Account deletion scheduled. Your data and subscriptions will be removed.");
    onLogout();
  };

  const handleDeactivate = () => {
    setShowDeactivateModal(false);
    alert("Deliveries paused. Your account is on seasonal hold.");
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── SECTION 1: TWO-FACTOR & MOBILE OTP ANCHOR ─── */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD4]/80">
          <div className="flex items-center gap-2.5">
            <FiShield className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A1008]">Two-Factor Mobile Authentication</h3>
              <p className="text-xs text-[#6B584C]">Cryptographic OTP authentication via verified SMS.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Active
          </span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B584C]">
          <div>
            <span className="font-semibold text-[#1A1008]">Primary Authentication Phone:</span>
            <span className="font-mono font-bold text-[#1A1008] ml-2">{user.phone}</span>
          </div>
          <p className="text-[11px] text-[#8C7A6B]">Every sign-in session requires one-time SMS verification.</p>
        </div>
      </div>

      {/* ─── SECTION 2: PASSWORD MANAGEMENT ─── */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-2">
          <FiLock className="w-4 h-4 text-[#5C1B13]" />
          <h3 className="text-sm sm:text-base font-bold text-[#1A1008]">Account Password</h3>
        </div>
        <p className="text-xs text-[#6B584C] mb-4">
          Optional fallback password for web portal access alongside mobile verification.
        </p>

        {passwordToast && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-medium flex items-center gap-2 ${
              passwordToast.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            {passwordToast.type === "success" ? (
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <FiAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{passwordToast.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <div>
            <label
              htmlFor="current-pw-input"
              className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
            >
              Current Password (If set)
            </label>
            <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5">
              <input
                id="current-pw-input"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none placeholder-[#B0A195]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-pw-input"
                className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5">
                <input
                  id="new-pw-input"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none placeholder-[#B0A195]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-pw-input"
                className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center rounded-xl border border-[#D5C7B8] focus-within:border-[#5C1B13] focus-within:ring-2 focus-within:ring-[#5C1B13]/10 bg-white px-3.5 py-2.5">
                <input
                  id="confirm-pw-input"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none placeholder-[#B0A195]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[#8C7A6B] hover:text-[#1A1008] p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving || (!newPassword && !confirmPassword)}
              className="px-5 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordSaving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ─── SECTION 3: ACTIVE SESSIONS ─── */}
      <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <FiSmartphone className="w-4 h-4 text-[#5C1B13]" />
          <h3 className="text-sm sm:text-base font-bold text-[#1A1008]">Active Sessions</h3>
        </div>
        <p className="text-xs text-[#6B584C] mb-4">Devices currently logged into your customer portal.</p>

        <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD4] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] shrink-0">
              <FiSmartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1008]">Current Web Browser</span>
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                  This device
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">Raipur, Chhattisgarh • Active now</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-semibold text-[#5C1B13] hover:underline cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ─── SECTION 4: DANGER ZONE ─── */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-red-950 flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-red-600" />
            Danger Zone
          </h3>
          <p className="text-xs text-red-800/80 mt-1">
            Carefully manage subscription deactivation or permanent removal of your account.
          </p>
        </div>

        <div className="divide-y divide-red-200/80 bg-white rounded-xl border border-red-200/90 overflow-hidden">
          {/* Pause / Freeze deliveries */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#1A1008]">Pause / Freeze Deliveries</p>
              <p className="text-[11px] text-[#6B584C]">
                Temporarily pause your milk schedule without losing your subscription pricing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              className="px-3.5 py-2 rounded-xl border border-[#D5C7B8] hover:bg-[#FAF6F0] text-xs font-bold text-[#1A1008] cursor-pointer shrink-0 self-start sm:self-center"
            >
              Freeze Deliveries
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-red-900">Delete Account Permanently</p>
              <p className="text-[11px] text-red-700/80">
                Permanently purge your delivery history, verified phone record, and addresses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-1.5 shadow-2xs"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL: DEACTIVATE / FREEZE ─── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFDF7] rounded-3xl border border-[#E8DFD4] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#1A1008]">Pause Milk Deliveries?</h4>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#6B584C] leading-relaxed">
              Going on vacation or traveling outside Raipur? You can pause delivery bottles at no penalty and resume anytime from your portal.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDeactivate}
                className="flex-1 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Freeze
              </button>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="py-2.5 px-4 rounded-xl bg-[#FAF3EA] text-[#1A1008] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE CONFIRMATION ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-red-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-red-950 flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Account Deletion
              </h4>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-900 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-red-900/80 leading-relaxed">
              This action cannot be undone. All active bottle deliveries, pending orders, and saved addresses in Raipur will be deleted permanently.
            </p>
            <div>
              <label
                htmlFor="delete-confirm-input"
                className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1"
              >
                Type &quot;DELETE&quot; to confirm:
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-mono font-bold"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
              >
                Delete Account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 rounded-xl border border-[#D5C7B8] text-[#1A1008] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
