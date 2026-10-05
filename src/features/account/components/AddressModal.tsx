"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { AddressFormData } from "../types";
import { FiX } from "react-icons/fi";

export interface AddressModalProps {
  isOpen: boolean;
  editingAddress: Address | null;
  addressForm: AddressFormData;
  addressSaving: boolean;
  onClose: () => void;
  onChangeForm: (form: AddressFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddressModal({
  isOpen,
  editingAddress,
  addressForm,
  addressSaving,
  onClose,
  onChangeForm,
  onSubmit,
}: AddressModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD4] mb-4">
              <h3 className="text-base font-bold text-[#1A1008]">
                {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => onChangeForm({ ...addressForm, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => onChangeForm({ ...addressForm, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                  House / Flat / Building / Street *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => onChangeForm({ ...addressForm, street: e.target.value })}
                  placeholder="e.g. Flat 402, Royal Palms, Shankar Nagar"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Locality in Raipur *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.locality}
                    onChange={(e) => onChangeForm({ ...addressForm, locality: e.target.value })}
                    placeholder="e.g. Shankar Nagar, VIP Rd"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => onChangeForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="492001"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => onChangeForm({ ...addressForm, landmark: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-medium text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1008] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => onChangeForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-[#5C1B13] focus:ring-[#5C1B13]"
                  />
                  <span>Set as default morning delivery address</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={addressSaving}
                  className="rounded-xl py-2.5 text-xs font-bold"
                >
                  {addressSaving ? "Saving Address..." : "Save Address"}
                </Button>
              </div>
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
