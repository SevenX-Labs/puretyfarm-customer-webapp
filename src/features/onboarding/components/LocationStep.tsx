"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { User } from "@/types/models";
import {
  ServiceCheckResult,
  AddressDetailsFormData,
} from "../types";
import {
  SERVICEABLE_AREAS_DATA,
  POPULAR_SERVICE_AREAS,
} from "@/content/serviceAreas";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiCrosshair,
  FiMapPin,
  FiCheckCircle,
  FiChevronDown,
  FiSearch,
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
  onAutoLocationCheck: () => Promise<boolean> | void;
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
  // ─── Manual Area Selection State (design-only) ───
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState<{
    areaName: string;
    pincode: string;
  } | null>(null);

  // Unique areas sorted alphabetically
  const uniqueAreas = SERVICEABLE_AREAS_DATA.filter((a) => a.active);
  const filteredAreas = areaSearch.trim()
    ? uniqueAreas.filter(
        (a) =>
          a.areaName.toLowerCase().includes(areaSearch.toLowerCase()) ||
          a.pincode.includes(areaSearch)
      )
    : uniqueAreas;

  const handleAreaSelect = (area: { areaName: string; pincode: string }) => {
    setSelectedArea(area);
    onManualPincodeChange(area.pincode);
    onManualLocalityChange(area.areaName);
    onAddressDetailsChange({ ...addressDetails, locality: area.areaName });
    setShowManualSelect(false);
    setAreaSearch("");
  };

  const handleAutoLocationClick = async () => {
    const success = await onAutoLocationCheck();
    if (success) {
      setSelectedArea(null);
      onManualPincodeChange("");
      onManualLocalityChange("");
    }
  };

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

      {/* A) AUTO-DETECT CONVENIENCE BANNER */}
      <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF3EA] to-[#FFFDF7] border border-[#E8DFD4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1A1008] flex items-center gap-2">
            <FiCrosshair className="w-4 h-4 text-[#5C1B13]" />
            <span>Detect Location Automatically</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-[#3A241C]/70 mt-0.5">
            Quickly fill your Raipur sector and postal code using device GPS.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAutoLocationClick}
          disabled={autoChecking}
          className="rounded-xl px-4 py-2 text-xs font-bold shrink-0 cursor-pointer self-start sm:self-auto"
        >
          {autoChecking ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Detecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <FiCrosshair className="w-3.5 h-3.5" />
              <span>Use My Location</span>
            </div>
          )}
        </Button>
      </div>

      {/* B) MANUAL AREA SELECTION — Shown as alternative */}
      {!serviceCheckResult?.performed && (
        <div className="mb-6">
          {/* Divider with "OR" */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E8DFD4]" />
            <span className="text-[10px] font-bold text-[#3A241C]/40 uppercase tracking-widest">
              or select manually
            </span>
            <div className="flex-1 h-px bg-[#E8DFD4]" />
          </div>

          {/* Manual Area Selector Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E8DFD4] bg-[#FFFDF7]">
            <div className="flex items-center gap-2 mb-3">
              <FiMapPin className="w-4 h-4 text-[#5C1B13]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#1A1008]">
                Choose Your Area in Raipur
              </h3>
            </div>

            {/* Popular Area Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {POPULAR_SERVICE_AREAS.map((area) => {
                const areaData = uniqueAreas.find((a) => a.areaName === area);
                const isActive = selectedArea?.areaName === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() =>
                      areaData &&
                      handleAreaSelect({
                        areaName: areaData.areaName,
                        pincode: areaData.pincode,
                      })
                    }
                    className={`
                      px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border
                      ${
                        isActive
                          ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-sm"
                          : "bg-white text-[#3A241C]/80 border-[#E8DFD4] hover:border-[#5C1B13]/40 hover:bg-[#FAF3EA]"
                      }
                    `}
                  >
                    {area}
                  </button>
                );
              })}
            </div>

            {/* Dropdown trigger for all areas */}
            <button
              type="button"
              onClick={() => setShowManualSelect(!showManualSelect)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#E8DFD4] bg-white hover:border-[#5C1B13]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FiMapPin className="w-3.5 h-3.5 text-[#3A241C]/40 group-hover:text-[#5C1B13] transition-colors" />
                <span className={`text-xs font-semibold ${selectedArea ? "text-[#1A1008]" : "text-[#3A241C]/50"}`}>
                  {selectedArea
                    ? `${selectedArea.areaName} — ${selectedArea.pincode}`
                    : "Browse all Raipur areas..."}
                </span>
              </div>
              <FiChevronDown
                className={`w-4 h-4 text-[#3A241C]/40 transition-transform duration-200 ${
                  showManualSelect ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Panel */}
            {showManualSelect && (
              <m.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-xl border border-[#E8DFD4] bg-white shadow-lg overflow-hidden"
              >
                {/* Search Input */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8DFD4] bg-[#FFFDF7]">
                  <FiSearch className="w-3.5 h-3.5 text-[#3A241C]/40" />
                  <input
                    type="text"
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    placeholder="Search area or pincode..."
                    className="w-full bg-transparent text-xs font-semibold text-[#1A1008] placeholder:text-[#3A241C]/40 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Area List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredAreas.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-[#3A241C]/50">
                        No areas found matching &ldquo;{areaSearch}&rdquo;
                      </p>
                    </div>
                  ) : (
                    filteredAreas.map((area, idx) => {
                      const isActive = selectedArea?.areaName === area.areaName;
                      return (
                        <button
                          key={`${area.pincode}-${area.areaName}-${idx}`}
                          type="button"
                          onClick={() =>
                            handleAreaSelect({
                              areaName: area.areaName,
                              pincode: area.pincode,
                            })
                          }
                          className={`
                            w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer transition-colors
                            ${
                              isActive
                                ? "bg-[#5C1B13]/5 text-[#5C1B13]"
                                : "hover:bg-[#FAF3EA] text-[#1A1008]"
                            }
                            ${idx < filteredAreas.length - 1 ? "border-b border-[#E8DFD4]/50" : ""}
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <FiMapPin className={`w-3 h-3 ${isActive ? "text-[#5C1B13]" : "text-[#3A241C]/30"}`} />
                            <span className="text-xs font-semibold">{area.areaName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#3A241C]/50">{area.pincode}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </m.div>
            )}

            {/* Selected area confirmation */}
            {selectedArea && (
              <m.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200"
              >
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold text-emerald-800">
                  Selected: {selectedArea.areaName} ({selectedArea.pincode}) — Raipur
                </span>
              </m.div>
            )}
          </div>
        </div>
      )}

      {/* Serviceable Area Confirmation Banner if detected/checked */}
      {serviceCheckResult?.performed && serviceCheckResult.serviceable && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">
                Serviceable Area: {serviceCheckResult.areaName || "Raipur Sector"} ({serviceCheckResult.pincode})
              </span>
              <span className="hidden sm:inline text-emerald-700/80 text-[11px] ml-1">
                — Fresh cold-chain delivery active before 10 AM.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY ADDRESS FORM (DIRECTLY ACCESSIBLE) */}
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

        {/* Pincode & Locality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="pincodeInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
              6-Digit Pincode *
            </label>
            <input
              id="pincodeInput"
              type="text"
              maxLength={6}
              value={manualPincode || serviceCheckResult?.pincode || "492001"}
              onChange={(e) => onManualPincodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 492001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-mono font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="localityInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
              Locality / Area Name *
            </label>
            <input
              id="localityInput"
              type="text"
              value={addressDetails.locality || manualLocality || serviceCheckResult?.areaName || "Civil Lines"}
              onChange={(e) => {
                onManualLocalityChange(e.target.value);
                onAddressDetailsChange({ ...addressDetails, locality: e.target.value });
              }}
              placeholder="e.g. Shankar Nagar, Civil Lines"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>
        </div>

        {/* House No & Street */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="houseNoInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
              House / Flat / Villa No. *
            </label>
            <input
              id="houseNoInput"
              type="text"
              required
              value={addressDetails.houseNo}
              onChange={(e) => onAddressDetailsChange({ ...addressDetails, houseNo: e.target.value })}
              placeholder="e.g. Flat 302, Tower B"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="streetInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
              Building / Society / Street *
            </label>
            <input
              id="streetInput"
              type="text"
              required
              value={addressDetails.street}
              onChange={(e) => onAddressDetailsChange({ ...addressDetails, street: e.target.value })}
              placeholder="e.g. Palm Springs Residency"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>
        </div>

        {/* Landmark */}
        <div>
          <label htmlFor="landmarkInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
            Landmark (Optional)
          </label>
          <input
            id="landmarkInput"
            type="text"
            value={addressDetails.landmark}
            onChange={(e) => onAddressDetailsChange({ ...addressDetails, landmark: e.target.value })}
            placeholder="e.g. Near City Center Mall"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-medium text-[#1A1008] focus:outline-none"
          />
        </div>

        {/* Label, Receiver Name, Alt Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label htmlFor="addressLabelSelect" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
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
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="receiverNameInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
              Receiver Name
            </label>
            <input
              id="receiverNameInput"
              type="text"
              value={addressDetails.receiverName || user?.name || ""}
              onChange={(e) => onAddressDetailsChange({ ...addressDetails, receiverName: e.target.value })}
              placeholder="Name of receiver"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="alternatePhoneInput" className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-mono font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={addressSaving}
            className="rounded-2xl py-3.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 flex items-center justify-center gap-2 cursor-pointer bg-[#5C1B13] hover:bg-[#48150f] text-white"
          >
            <span>{addressSaving ? "Saving Address..." : "Save Address & Choose Milk Plan"}</span>
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </m.div>
  );
}
