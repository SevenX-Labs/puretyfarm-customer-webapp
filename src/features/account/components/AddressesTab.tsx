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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8DFD4]">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1008]">
            Delivery Addresses
          </h2>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
            Verified Raipur doorstep locations where fresh chilled milk crates arrive each morning.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddAddress}
          className="rounded-xl px-4 py-2 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {addressesLoading ? (
        <div className="py-20 text-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#1A1008] font-bold">Loading addresses...</p>
          <p className="text-xs text-[#6B584C] mt-1">Retrieving your saved Raipur locations</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-8 sm:p-10 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-4 border border-[#E8DFD4]/60">
            <FiMapPin className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1A1008] mb-1.5">No delivery address saved yet</h3>
          <p className="text-xs sm:text-sm text-[#6B584C] mb-5 leading-relaxed max-w-sm mx-auto">
            Please add your home, apartment, or villa address in Raipur so our cold-chain delivery team can reach your doorstep at sunrise.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddAddress}
            className="rounded-xl px-5 py-2 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white cursor-pointer shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add First Address</span>
          </Button>
        </div>
      ) : (
        /* ─── ADDRESS CARDS GRID (PROPORTIONATE 2-COLUMN) ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                addr.isDefault
                  ? "bg-[#FFFDF9] border-[#5C1B13] ring-1 ring-[#5C1B13]/30 shadow-md shadow-[#5C1B13]/6"
                  : "bg-white border-[#E8DFD4] hover:border-[#5C1B13]/30"
              }`}
            >
              <div className="space-y-3">
                {/* Header: Name + Default Status */}
                <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-[#E8DFD4]/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center shrink-0 border border-[#E8DFD4]">
                      <FiMapPin className="w-4 h-4" />
                    </div>
                    <span className="font-serif font-bold text-base text-[#1A1008]">
                      {addr.fullName}
                    </span>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shrink-0">
                      <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Default</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addr)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#5C1B13] bg-[#FAF3EA] hover:bg-[#5C1B13] hover:text-white transition-all border border-[#E8DFD4] cursor-pointer shrink-0"
                    >
                      Set Default
                    </button>
                  )}
                </div>

                {/* Body: Street, Locality, City, Phone */}
                <div className="space-y-1.5 pt-0.5">
                  <p className="text-sm font-bold text-[#1A1008] leading-snug">
                    {addr.street}
                  </p>
                  <p className="text-xs text-[#4A3225] font-medium leading-relaxed">
                    {addr.locality}
                    {addr.landmark ? `, Near ${addr.landmark}` : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4] text-[11px] font-bold">
                      <FiMapPin className="w-3 h-3 text-[#5C1B13]" />
                      <span>{addr.city} — {addr.pincode}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF6F0] text-[#6B584C] border border-[#E8DFD4]/70 text-[10px] font-semibold">
                      <FiTruck className="w-3 h-3 text-[#8C603D]" />
                      <span>Sunrise Route</span>
                    </span>
                  </div>

                  <div className="pt-1.5 flex items-center gap-2 text-xs font-mono font-bold text-[#1A1008]">
                    <div className="w-6 h-6 rounded-lg bg-[#FAF3EA] flex items-center justify-center text-[#8C603D] border border-[#E8DFD4]/60">
                      <FiPhone className="w-3 h-3" />
                    </div>
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3.5 mt-3.5 border-t border-[#E8DFD4]/80">
                <button
                  type="button"
                  onClick={() => onOpenEditAddress(addr)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg text-[#3A241C] hover:text-[#5C1B13] hover:bg-[#FAF3EA] bg-white border border-[#E8DFD4] transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <FiEdit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteAddress(addr.id)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                >
                  <FiTrash2 className="w-3 h-3" />
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
