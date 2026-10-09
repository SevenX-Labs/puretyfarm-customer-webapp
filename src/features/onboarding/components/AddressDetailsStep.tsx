"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiArrowLeft,
  FiMapPin,
  FiAlertCircle,
  FiArrowRight,
  FiLogIn,
} from "react-icons/fi";
import { locationApi, CustomerAddress } from "@/features/location/api/locationApi";
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
  onAddressSaved: (createdAddress?: CustomerAddress) => void;
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
  const router = useRouter();
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
  const [isSessionExpired, setIsSessionExpired] = useState(false);

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
    setIsSessionExpired(false);

    try {
      const created = await locationApi.createAddress({
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

      onAddressSaved(created);
    } catch (err: any) {
      const status = err?.status || err?.statusCode;
      const rawMsg = err?.data?.message || err?.message || "";
      const errorMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : String(rawMsg);

      if (
        status === 401 ||
        errorMsg.toLowerCase().includes("unauthorized") ||
        errorMsg.toLowerCase().includes("refresh token") ||
        errorMsg.toLowerCase().includes("token is missing")
      ) {
        setIsSessionExpired(true);
        setSaveError("Your login session has expired. Please re-verify your phone number to save your address.");
      } else {
        setSaveError(errorMsg || "Failed to save address. Please check your details.");
      }
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="h-full flex flex-col justify-between"
    >
      <form onSubmit={handleSaveAddress} className="h-full flex flex-col justify-between">
        <div>
          <header className="mb-2.5 flex items-start justify-between gap-2 sm:mb-3">
            <div>
              <h1
                id="addressHeading"
                className="font-serif text-lg sm:text-xl font-bold text-[#24130f] lg:text-[22px]"
              >
                Delivery Address
              </h1>
              <p className="mt-0.5 text-[11px] text-[#715e50] sm:text-[12px]">
                Add your exact house and street details for daily morning delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-7 w-fit items-center gap-1.5 text-[11.5px] font-semibold text-[#7a2417] transition-colors hover:text-[#5f1b12] cursor-pointer"
            >
              <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Service Area
            </button>
          </header>

          {/* Selected Hub Summary Pill */}
          <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-[#cce3cf] bg-[#f0f8f0] px-3 py-1.5 text-xs text-[#326d3c]">
            <div className="flex items-center gap-2">
              <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#39834a]" />
              <span>
                Delivering to Hub: <strong>{selectedAreaName || "Star Colony"}</strong>, {selectedCityName || "Dombivali"}
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
            <div className="mb-2.5 flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                <span>{saveError}</span>
              </div>
              {isSessionExpired && (
                <button
                  type="button"
                  onClick={() => router.push("/auth?redirect=/onboarding?step=3")}
                  className="inline-flex shrink-0 items-center gap-1 font-bold text-[#7a2417] underline hover:text-[#5f1b12] cursor-pointer"
                >
                  <FiLogIn className="h-3.5 w-3.5" />
                  <span>Log In</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Flat / House / Unit Number <span className="text-[#7a2417]">*</span>
              </label>
              <input
                type="text"
                required
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g. 203"
                className="h-9 sm:h-9.5 lg:h-[38px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Building / Society / Apartment
              </label>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="e.g. Sunita apt"
                className="h-9 sm:h-9.5 lg:h-[38px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Street / Road Name
              </label>
              <input
                type="text"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="e.g. sabe rd"
                className="h-9 sm:h-9.5 lg:h-[38px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. opp. school"
                className="h-9 sm:h-9.5 lg:h-[38px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Receiver Name <span className="text-[#7a2417]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name of receiver"
                className="h-9 sm:h-9.5 lg:h-[38px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Mobile Number <span className="text-[#7a2417]">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+918652601566"
                className="h-9 sm:h-9.5 lg:h-[38px] w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] font-mono text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] sm:text-[11.5px] font-semibold text-[#24130f]">
                Address Label
              </label>
              <select
                value={addressType}
                onChange={(e) =>
                  setAddressType(e.target.value as "Home" | "Work" | "Other")
                }
                className="h-9 sm:h-9.5 lg:h-[38px] w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] sm:text-[12.5px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-stretch border-t border-[#eee5db] pt-2 sm:justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={savingAddress}
            className="min-h-9 sm:min-h-9.5 lg:h-[40px] w-full rounded-xl bg-[#7a2417] py-2 text-[12px] sm:text-[12.5px] font-semibold text-white shadow-sm hover:bg-[#5f1b12] sm:w-[min(100%,300px)] cursor-pointer"
          >
            <span>
              {savingAddress ? "Saving Address..." : "Continue to Select Plan"}
            </span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </m.section>
  );
}
