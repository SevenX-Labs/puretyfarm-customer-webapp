"use client";

import React, { useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import { LogOut, X } from "lucide-react";

export interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmDialogProps) {
  // Handle ESC key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <m.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-desc"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-[var(--pf-border)] z-10 font-sans"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close dialog"
              className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-[#715E50] hover:bg-[#FAF1E2] transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF1E2] text-[#6F2115]">
              <LogOut size={22} strokeWidth={2} />
            </div>

            {/* Content */}
            <div className="text-center">
              <h3
                id="logout-dialog-title"
                className="text-base sm:text-lg font-bold text-[#24130F] font-serif"
              >
                Log Out of PuretyFarm?
              </h3>
              <p
                id="logout-dialog-desc"
                className="mt-1.5 text-xs sm:text-[13px] text-[#715E50] leading-relaxed"
              >
                Are you sure you want to log out? You will need to verify your phone number to sign back in.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 min-h-[40px] rounded-xl border border-[#DDD2C7] bg-white px-4 py-2 text-xs font-semibold text-[#24130F] hover:bg-[#FAF6F0] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 min-h-[40px] rounded-xl bg-[#6F2115] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#581A11] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Yes, Log Out</span>
                )}
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
