"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { AddressFormData } from "../types";
import { FiMapPin, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
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
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A1008]">Delivery Addresses</h2>
          <p className="text-xs text-[#3A241C]/65">
            Addresses across Raipur where our daily morning chilled milk is delivered.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddAddress}
          className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Address</span>
        </Button>
      </div>

      {addressesLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#3A241C]/60">Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-10 text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-3">
            <FiMapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1A1008] mb-1">No delivery address saved</h3>
          <p className="text-xs text-[#3A241C]/70 mb-5">
            Add your home or apartment address in Raipur for daily morning deliveries.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddAddress}
            className="rounded-xl px-5 py-2.5 text-xs font-bold"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add First Address</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all relative flex flex-col justify-between ${
                addr.isDefault
                  ? "border-[#5C1B13] shadow-md shadow-[#5C1B13]/5"
                  : "border-[#E8DFD4] hover:border-[#5C1B13]/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-[#1A1008] flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-[#5C1B13]" />
                    <span>{addr.fullName}</span>
                  </span>
                  {addr.isDefault ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Default Address ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addr)}
                      className="text-[11px] font-semibold text-[#5C1B13] hover:underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#3A241C]/80 space-y-0.5 mb-4 pl-6">
                  <p className="font-medium text-[#1A1008]">{addr.street}</p>
                  <p>
                    {addr.locality}
                    {addr.landmark ? `, Near ${addr.landmark}` : ""}
                  </p>
                  <p>
                    {addr.city} — {addr.pincode}
                  </p>
                  <p className="text-[#3A241C]/60 pt-1 font-mono">📞 {addr.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DFD4]/70">
                <button
                  type="button"
                  onClick={() => onOpenEditAddress(addr)}
                  className="p-2 rounded-xl text-[#3A241C]/70 hover:text-[#5C1B13] hover:bg-[#FAF3EA] transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteAddress(addr.id)}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
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
