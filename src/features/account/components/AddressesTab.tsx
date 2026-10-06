"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { AddressFormData } from "../types";
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiPhone, FiCheckCircle, FiTruck } from "react-icons/fi";
import { AddressModal } from "./AddressModal";

export interface AddressesTabProps {
  addresses: Address[];
  addressesLoading: boolean;
  showAddressModal: boolean;
  editingAddress: Address | null;
  addressForm: AddressFormData;
  addressSaving: boolean;
  onOpenAddAddress: () => void;
  onOpenEditAddress: (addr: Address) => void;
  onCloseModal: () => void;
  onChangeForm: (form: AddressFormData) => void;
  onSaveAddress: (e: React.FormEvent) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (addr: Address) => void;
}

export function AddressesTab({
  addresses,
  addressesLoading,
  showAddressModal,
  editingAddress,
  addressForm,
  addressSaving,
  onOpenAddAddress,
  onOpenEditAddress,
  onCloseModal,
  onChangeForm,
  onSaveAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: AddressesTabProps) {
  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* ─── SECTION HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD4]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
            Delivery Addresses
          </h2>
          <p className="text-sm sm:text-base text-[#6B584C] mt-1">
            Verified Raipur doorstep locations where fresh chilled milk crates arrive before 10:00 AM daily.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenAddAddress}
          className="rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {addressesLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-base text-[#1A1008] font-bold">Loading addresses...</p>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-1">Retrieving your saved Raipur locations</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-4 border border-[#E8DFD4]/60">
            <FiMapPin className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#1A1008] mb-2">No delivery address saved yet</h3>
          <p className="text-sm text-[#6B584C] mb-6 leading-relaxed max-w-md mx-auto">
            Please add your home, apartment, or villa address in Raipur so our cold-chain delivery team can reach your doorstep at sunrise.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddAddress}
            className="rounded-2xl px-7 py-3 text-xs sm:text-sm font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white cursor-pointer shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add First Address</span>
          </Button>
        </div>
      ) : (
        /* ─── ADDRESS CARDS GRID (EXPANSIVE & LUXURIOUS) ─── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-[28px] sm:rounded-[32px] p-7 sm:p-8 lg:p-9 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative ${
                addr.isDefault
                  ? "bg-[#FFFDF9] border-[#5C1B13] ring-1 ring-[#5C1B13]/30 shadow-md shadow-[#5C1B13]/8"
                  : "bg-white border-[#E8DFD4] hover:border-[#5C1B13]/40"
              }`}
            >
              <div className="space-y-4">
                {/* Header: Name + Default Status */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E8DFD4]/70">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center shrink-0 border border-[#E8DFD4]">
                      <FiMapPin className="w-5 h-5" />
                    </div>
                    <span className="font-serif font-bold text-lg sm:text-xl text-[#1A1008]">
                      {addr.fullName}
                    </span>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Default Address</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addr)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#5C1B13] bg-[#FAF3EA] hover:bg-[#5C1B13] hover:text-white transition-all border border-[#E8DFD4] cursor-pointer shrink-0"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                {/* Body: Street, Locality, Landmark, City, Pincode (Clear, prominent typography) */}
                <div className="space-y-2.5 pt-1">
                  <p className="text-base sm:text-lg font-bold text-[#1A1008] leading-snug">
                    {addr.street}
                  </p>
                  <p className="text-sm sm:text-base text-[#4A3225] font-medium leading-relaxed">
                    {addr.locality}
                    {addr.landmark ? `, Near ${addr.landmark}` : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4] text-xs sm:text-sm font-bold">
                      <FiMapPin className="w-3.5 h-3.5 text-[#5C1B13]" />
                      <span>{addr.city} — {addr.pincode}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] text-[#6B584C] border border-[#E8DFD4]/70 text-xs font-semibold">
                      <FiTruck className="w-3.5 h-3.5 text-[#8C603D]" />
                      <span>Sunrise Route Delivery</span>
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5 text-sm sm:text-base font-mono font-bold text-[#1A1008]">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF3EA] flex items-center justify-center text-[#8C603D] border border-[#E8DFD4]/60">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-[#E8DFD4]/80">
                <button
                  type="button"
                  onClick={() => onOpenEditAddress(addr)}
                  className="px-4 py-2 rounded-xl text-[#3A241C] hover:text-[#5C1B13] hover:bg-[#FAF3EA] bg-white border border-[#E8DFD4] transition-all cursor-pointer text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteAddress(addr.id)}
                  className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        editingAddress={editingAddress}
        addressForm={addressForm}
        addressSaving={addressSaving}
        onClose={onCloseModal}
        onChangeForm={onChangeForm}
        onSubmit={onSaveAddress}
      />
    </m.div>
  );
}
