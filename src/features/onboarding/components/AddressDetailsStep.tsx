"use client";

import React, { useState } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiArrowLeft,
  FiMapPin,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import { locationApi } from "@/features/location/api/locationApi";
import { User } from "@/types/models";

export interface AddressDetailsStepProps {
  user: User | null;
  selectedStateId: string;
  selectedCityId: string;
  selectedAreaId: string;
  selectedAreaName: string;
  selectedCityName: string;
  selectedPincode: string;
  coords: { lat?: number; lng?: number };
  onBack: () => void;
  onAddressSaved: () => void;
}

export function AddressDetailsStep({
  user,
  selectedStateId,
  selectedCityId,
  selectedAreaId,
  selectedAreaName,
  selectedCityName,
  selectedPincode,
  coords,
  onBack,
  onAddressSaved,
}: AddressDetailsStepProps) {
  const [houseNumber, setHouseNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landmark, setLandmark] = useState("");
  const defaultReceiverName =
    user?.name && !user.name.startsWith("Customer (") && user.name.toLowerCase() !== "customer"
      ? user.name
      : "";
  const [fullName, setFullName] = useState(defaultReceiverName);
  const [mobile, setMobile] = useState(user?.phone || "");
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">("Home");

  const [savingAddress, setSavingAddress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStateId || !selectedCityId || !selectedAreaId) {
      setSaveError("Please choose a delivery area in the previous step first.");
      return;
    }

    if (!houseNumber.trim()) {
      setSaveError("Please enter your flat / house / unit number.");
      return;
    }

    if (!fullName.trim() || fullName.trim().startsWith("Customer (")) {
      setSaveError("Please enter the receiver's full name.");
      return;
    }

    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) {
      setSaveError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSavingAddress(true);
    setSaveError(null);

    try {
      await locationApi.createAddress({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        houseNumber: houseNumber.trim(),
        buildingName: buildingName.trim() || undefined,
        streetName: streetName.trim() || undefined,
        landmark: landmark.trim() || undefined,
        stateId: selectedStateId,
        cityId: selectedCityId,
        areaId: selectedAreaId,
        pincode: selectedPincode || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
      });

      onAddressSaved();
    } catch (err: any) {
      const errorMsg =
        err?.data?.message || err?.message || "Failed to save address. Please check your details.";
      setSaveError(Array.isArray(errorMsg) ? errorMsg.join(", ") : String(errorMsg));
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <m.section
      aria-labelledby="address-details-heading"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="bg-[#fffdf8] p-3.5 sm:p-5 lg:p-6 xl:p-7 flex flex-col justify-between h-full min-h-0"
    >
      <div>
        <header className="mb-2.5 sm:mb-3 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              id="address-details-heading"
              className="font-heading text-[20px] font-bold leading-tight tracking-[-0.03em] text-[#24130f] sm:text-[23px] lg:text-[25px]"
            >
              Delivery Address
            </h1>
            <p className="mt-0.5 text-[12px] text-[#715e50] sm:text-[13px]">
              Add your exact house and street details for daily morning delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-8 w-fit items-center gap-1.5 text-[12px] font-semibold text-[#7a2417] transition-colors hover:text-[#5f1b12] cursor-pointer"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Service Area
          </button>
        </header>

        {/* Selected Hub Summary Pill */}
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#cce3cf] bg-[#f0f8f0] px-3.5 py-2 text-xs text-[#326d3c]">
          <div className="flex items-center gap-2">
            <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#39834a]" />
            <span>
              Delivering to Hub: <strong>{selectedAreaName || "Selected Area"}</strong>, {selectedCityName || "Raipur"}
              {selectedPincode ? ` (${selectedPincode})` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] font-bold text-[#7a2417] underline underline-offset-2 hover:text-[#5f1b12] cursor-pointer shrink-0"
          >
            Change Hub
          </button>
        </div>

        {saveError && (
          <div className="mb-2.5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
            <span>{saveError}</span>
          </div>
        )}

        <form id="addressDetailsForm" onSubmit={handleSaveAddress}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Flat / House / Unit Number <span className="text-[#7a2417]">*</span>
              </label>
              <input
                type="text"
                required
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g. Flat 402, Building A"
                className="h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Building / Society / Apartment
              </label>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="e.g. Green Acres Residency"
                className="h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Street / Road Name
              </label>
              <input
                type="text"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="e.g. Main Market Lane"
                className="h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near the market"
                className="h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Receiver Name <span className="text-[#7a2417]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name of receiver"
                className="h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Mobile Number <span className="text-[#7a2417]">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+919876543210"
                className="h-9.5 sm:h-10 lg:h-[42px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] font-mono text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Address Label
              </label>
              <select
                value={addressType}
                onChange={(e) =>
                  setAddressType(e.target.value as "Home" | "Work" | "Other")
                }
                className="h-9.5 sm:h-10 lg:h-[42px] w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-3 flex justify-stretch border-t border-[#eee5db] pt-3 sm:justify-end">
        <Button
          type="submit"
          form="addressDetailsForm"
          variant="primary"
          size="md"
          disabled={savingAddress}
          className="min-h-9.5 sm:min-h-10 lg:h-[42px] w-full rounded-xl bg-[#7a2417] py-2.5 text-[12.5px] sm:text-[13px] font-semibold text-white shadow-sm hover:bg-[#5f1b12] sm:w-[min(100%,300px)] cursor-pointer"
        >
          <span>
            {savingAddress ? "Saving Address..." : "Continue to Select Plan"}
          </span>
          <FiArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </m.section>
  );
}
