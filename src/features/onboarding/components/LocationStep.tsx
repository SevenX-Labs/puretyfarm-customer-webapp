"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { User } from "@/types/models";
import {
  ServiceCheckResult,
  AddressDetailsFormData,
} from "../types";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiCrosshair,
  FiMapPin,
  FiCheckCircle,
  FiBell,
} from "react-icons/fi";

export interface LocationStepProps {
  user: User | null;
  autoChecking: boolean;
  autoCheckError: string | null;
  manualPincode: string;
  manualLocality: string;
  manualChecking: boolean;
  serviceCheckResult: ServiceCheckResult | null;
  addressDetails: AddressDetailsFormData;
  addressSaving: boolean;
  addressSaveError: string | null;
  waitlistJoining: boolean;
  waitlistJoined: boolean;
  onGoBack: () => void;
  onAutoLocationCheck: () => void;
  onManualPincodeChange: (val: string) => void;
  onManualLocalityChange: (val: string) => void;
  onManualCheck: (e: React.FormEvent) => void;
  onJoinWaitlist: () => void;
  onResetServiceCheck: () => void;
  onAddressDetailsChange: (details: AddressDetailsFormData) => void;
  onSaveAddress: (e: React.FormEvent) => void;
}

export function LocationStep({
  user,
  autoChecking,
  autoCheckError,
  manualPincode,
  manualLocality,
  manualChecking,
  serviceCheckResult,
  addressDetails,
  addressSaving,
  addressSaveError,
  waitlistJoining,
  waitlistJoined,
  onGoBack,
  onAutoLocationCheck,
  onManualPincodeChange,
  onManualLocalityChange,
  onManualCheck,
  onJoinWaitlist,
  onResetServiceCheck,
  onAddressDetailsChange,
  onSaveAddress,
}: LocationStepProps) {
  return (
    <m.div
      key="step2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-9 shadow-xs"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#5C1B13]/8 text-[#5C1B13] text-[11px] font-bold tracking-wide mb-2 uppercase">
            Step 2 of 3
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#1A1008]">
            Delivery Location & Service Check
          </h1>
          <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
            We currently deliver before 10 AM across major residential sectors in Raipur.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoBack}
          className="text-xs text-[#5C1B13] hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer shrink-0 ml-2"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Auto check banner / Error notification */}
      {autoCheckError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2"
        >
          <FiAlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{autoCheckError}</span>
        </div>
      )}

      {/* A) AUTO CHECK OPTION */}
      {!serviceCheckResult?.serviceable && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#FAF3EA] to-[#FFFDF7] border border-[#E8DFD4] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A1008] flex items-center gap-2">
                <FiCrosshair className="w-4 h-4 text-[#5C1B13]" />
                <span>Detect Location Automatically</span>
              </h3>
              <p className="text-xs text-[#3A241C]/70 mt-0.5">
                Check your device GPS coordinates to quickly detect your Raipur sector.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAutoLocationCheck}
              disabled={autoChecking}
              className="rounded-xl px-4 py-2.5 text-xs font-bold shrink-0 cursor-pointer"
            >
              {autoChecking ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Detecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <FiCrosshair className="w-3.5 h-3.5" />
                  <span>Use My Current Location</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* B) MANUAL CHECK OPTION */}
      {!serviceCheckResult?.serviceable && (
        <div className="mb-6 pb-6 border-b border-[#E8DFD4]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#1A1008] uppercase tracking-wider">
              Or Enter Raipur Postal Code Manually
            </span>
            <div className="flex-1 h-px bg-[#E8DFD4]" />
          </div>

          <form onSubmit={onManualCheck} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pincodeInput" className="block text-[11px] font-bold text-[#1A1008] mb-1">
                  6-Digit Pincode *
                </label>
                <input
                  id="pincodeInput"
                  type="text"
                  maxLength={6}
                  required
                  value={manualPincode}
                  onChange={(e) => onManualPincodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="e.g. 492001 or 492007"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-sm font-mono font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="localityInput" className="block text-[11px] font-bold text-[#1A1008] mb-1">
                  Locality / Area Name
                </label>
                <input
                  id="localityInput"
                  type="text"
                  value={manualLocality}
                  onChange={(e) => onManualLocalityChange(e.target.value)}
                  placeholder="e.g. Shankar Nagar, Civil Lines"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-sm font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              fullWidth
              disabled={manualChecking || manualPincode.length !== 6}
              className="rounded-xl py-2.5 text-xs font-bold border-[#5C1B13] text-[#5C1B13] hover:bg-[#5C1B13]/8 cursor-pointer"
            >
              {manualChecking ? "Checking Delivery Availability..." : "Check Availability"}
            </Button>
          </form>
        </div>
      )}

      {/* C) RESULT: UNSERVICEABLE STATE */}
      {serviceCheckResult?.performed && !serviceCheckResult.serviceable && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl bg-amber-50/70 border border-amber-200 p-6 sm:p-7 text-center space-y-4 mb-6"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1A1008]">
              We Haven’t Reached Your Area Just Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#3A241C]/75 max-w-md mx-auto mt-1.5 leading-relaxed">
              PuretyFarm milk delivery hasn’t reached pincode <strong>{serviceCheckResult.pincode}</strong> yet.
              We are expanding our cold-chain morning milk routes across Raipur soon!
            </p>
          </div>

          {waitlistJoined ? (
            <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4" />
              <span>You’re on the priority waitlist! We will notify {user?.phone} when routes open.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onJoinWaitlist}
                disabled={waitlistJoining}
                className="rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 cursor-pointer w-full sm:w-auto"
              >
                <FiBell className="w-3.5 h-3.5" />
                <span>{waitlistJoining ? "Saving Request..." : "Notify Me When You're Available"}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onResetServiceCheck}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer w-full sm:w-auto"
              >
                Try a Different Address
              </Button>
            </div>
          )}
        </div>
      )}

      {/* C) RESULT: SERVICEABLE STATE -> REVEAL REMAINING ADDRESS FIELDS */}
      {serviceCheckResult?.serviceable && (
        <div role="status" aria-live="polite" className="space-y-6">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">
                  Serviceable Area: {serviceCheckResult.areaName || "Raipur Sector"} ({serviceCheckResult.pincode})
                </p>
                <p className="text-emerald-700/80 text-[11px]">
                  Pure cold-chain milk delivery is active before 10 AM every morning.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetServiceCheck}
              className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0 cursor-pointer"
            >
              Change Area
            </button>
          </div>

          {/* Remaining Address Fields Form */}
          <form onSubmit={onSaveAddress} className="space-y-4">
            {addressSaveError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
              >
                <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{addressSaveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="houseNoInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  House / Flat / Villa No. *
                </label>
                <input
                  id="houseNoInput"
                  type="text"
                  required
                  value={addressDetails.houseNo}
                  onChange={(e) => onAddressDetailsChange({ ...addressDetails, houseNo: e.target.value })}
                  placeholder="e.g. Flat 302, Tower B"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="streetInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Building / Society / Street *
                </label>
                <input
                  id="streetInput"
                  type="text"
                  required
                  value={addressDetails.street}
                  onChange={(e) => onAddressDetailsChange({ ...addressDetails, street: e.target.value })}
                  placeholder="e.g. Palm Springs Residency"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="localityInputFinal" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Locality / Area Name
                </label>
                <input
                  id="localityInputFinal"
                  type="text"
                  readOnly
                  value={addressDetails.locality || serviceCheckResult.areaName || ""}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] bg-[#FBF6EE] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="landmarkInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Landmark (Optional)
                </label>
                <input
                  id="landmarkInput"
                  type="text"
                  value={addressDetails.landmark}
                  onChange={(e) => onAddressDetailsChange({ ...addressDetails, landmark: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-medium text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="addressLabelSelect" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Address Label
                </label>
                <select
                  id="addressLabelSelect"
                  value={addressDetails.addressType}
                  onChange={(e) =>
                    onAddressDetailsChange({
                      ...addressDetails,
                      addressType: e.target.value as "Home" | "Work" | "Other",
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="receiverNameInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Receiver Name
                </label>
                <input
                  id="receiverNameInput"
                  type="text"
                  value={addressDetails.receiverName}
                  onChange={(e) => onAddressDetailsChange({ ...addressDetails, receiverName: e.target.value })}
                  placeholder="Name of receiver"
                  className="w-full px-3 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="alternatePhoneInput" className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                  Alt Phone (Optional)
                </label>
                <input
                  id="alternatePhoneInput"
                  type="tel"
                  maxLength={10}
                  value={addressDetails.alternatePhone}
                  onChange={(e) =>
                    onAddressDetailsChange({
                      ...addressDetails,
                      alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  placeholder="Secondary contact"
                  className="w-full px-3 py-2.5 rounded-2xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-mono font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={addressSaving}
                className="rounded-2xl py-3.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{addressSaving ? "Verifying & Saving Address..." : "Save Address & Choose Milk Plan"}</span>
                <FiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </m.div>
  );
}
