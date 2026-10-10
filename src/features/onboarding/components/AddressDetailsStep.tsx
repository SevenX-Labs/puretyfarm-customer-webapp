"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiArrowLeft,
  FiMapPin,
  FiAlertCircle,
  FiArrowRight,
  FiLogIn,
  FiCheckCircle,
} from "react-icons/fi";
import {
  locationApi,
  CustomerAddress,
  StateItem,
  CityItem,
  AreaItem,
} from "@/features/location/api/locationApi";
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
  onStateChange: (stateId: string) => void;
  onCityChange: (cityId: string, cityName?: string) => void;
  onAreaChange: (areaId: string, pincode: string, areaName?: string) => void;
  onCoordsChange?: (coords: { lat?: number; lng?: number }) => void;
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
  onStateChange,
  onCityChange,
  onAreaChange,
  onCoordsChange,
  onBack,
  onAddressSaved,
}: AddressDetailsStepProps) {
  const router = useRouter();

  // Location Catalog State
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Address Form State
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

  // Initial load of States
  useEffect(() => {
    let isMounted = true;
    async function loadStates() {
      setLoadingStates(true);
      setCatalogError(null);
      try {
        const stateList = await locationApi.getStates();
        if (isMounted) {
          setStates(stateList);
          if (stateList.length === 1 && !selectedStateId) {
            onStateChange(stateList[0].id);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load states";
          setCatalogError(msg);
        }
      } finally {
        if (isMounted) setLoadingStates(false);
      }
    }
    loadStates();
    return () => {
      isMounted = false;
    };
  }, [selectedStateId, onStateChange]);

  // Load Cities whenever State changes
  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      return;
    }
    let isMounted = true;
    async function loadCities() {
      setLoadingCities(true);
      try {
        const cityList = await locationApi.getCities(selectedStateId);
        if (isMounted) {
          setCities(cityList);
          if (cityList.length === 1 && !selectedCityId) {
            onCityChange(cityList[0].id, cityList[0].name);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Error loading cities:", err);
        }
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    }
    loadCities();
    return () => {
      isMounted = false;
    };
  }, [selectedStateId, selectedCityId, onCityChange]);

  // Load Areas/Hubs whenever City changes
  useEffect(() => {
    if (!selectedCityId) {
      setAreas([]);
      return;
    }
    let isMounted = true;
    async function loadAreas() {
      setLoadingAreas(true);
      try {
        const areaList = await locationApi.getAreas(selectedCityId);
        if (isMounted) {
          setAreas(areaList);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Error loading areas:", err);
        }
      } finally {
        if (isMounted) setLoadingAreas(false);
      }
    }
    loadAreas();
    return () => {
      isMounted = false;
    };
  }, [selectedCityId]);

  // Sync default receiver name and mobile if user object updates
  useEffect(() => {
    if (user?.name && !fullName && !user.name.startsWith("Customer (") && user.name.toLowerCase() !== "customer") {
      setFullName(user.name);
    }
    if (user?.phone && !mobile) {
      setMobile(user.phone);
    }
  }, [user, fullName, mobile]);

  // Handle Area Select
  const handleAreaSelect = (areaId: string) => {
    const selected = areas.find((a) => a.id === areaId);
    if (selected) {
      onAreaChange(selected.id, selected.pincode || "", selected.name);
    } else {
      onAreaChange("", "", "");
    }
  };

  const selectedStateObj = states.find((s) => s.id === selectedStateId);
  const selectedCityObj = cities.find((c) => c.id === selectedCityId);
  const selectedAreaObj = areas.find((a) => a.id === selectedAreaId);

  const currentAreaName = selectedAreaName || selectedAreaObj?.name || "";
  const currentCityName = selectedCityName || selectedCityObj?.name || "";
  const activePincode = selectedPincode || selectedAreaObj?.pincode || "";
  const isAreaSelected = Boolean(selectedStateId && selectedCityId && selectedAreaId);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAreaSelected) {
      setSaveError("Please select your State, City, and Delivery Hub first.");
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
        pincode: activePincode || undefined,
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
        errorMsg.toLowerCase().includes("session")
      ) {
        setIsSessionExpired(true);
        setSaveError("Your session expired. Please log in again to continue.");
      } else {
        setSaveError(errorMsg || "Failed to save delivery address. Please try again.");
      }
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <m.section
      key="address-details-step"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col justify-between h-full space-y-3"
    >
      <form onSubmit={handleSaveAddress} className="flex flex-col justify-between h-full space-y-3">
        <div className="space-y-3">
          {/* Header */}
          <header className="flex items-center justify-between gap-3 border-b border-[#eee5db] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a2417] block">
                Step 2 of 4
              </span>
              <h1 className="font-serif text-base font-bold text-[#24130f] sm:text-lg md:text-xl">
                Delivery Address
              </h1>
              <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#715e50]">
                Select your delivery hub and enter your house & street details for daily morning delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-[#7a2417] hover:bg-[#7a2417]/10 transition-colors cursor-pointer"
            >
              <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Profile</span>
            </button>
          </header>

          {/* Service Area Selection Grid */}
          <div className="rounded-xl border border-[#e8dfd4] bg-[#faf8f5] p-2.5 sm:p-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
              {/* State Selector */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  State <span className="text-[#7a2417]">*</span>
                </label>
                <select
                  value={selectedStateId}
                  onChange={(e) => {
                    onStateChange(e.target.value);
                    onCityChange("", "");
                    onAreaChange("", "", "");
                  }}
                  disabled={loadingStates}
                  className="h-9 sm:h-9.5 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-2.5 text-[12px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
                >
                  <option value="">{loadingStates ? "Loading states..." : "Select State"}</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selector */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  City <span className="text-[#7a2417]">*</span>
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => {
                    const chosenCity = cities.find((c) => c.id === e.target.value);
                    onCityChange(e.target.value, chosenCity?.name || "");
                    onAreaChange("", "", "");
                  }}
                  disabled={!selectedStateId || loadingCities}
                  className="h-9 sm:h-9.5 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-2.5 text-[12px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
                >
                  <option value="">
                    {loadingCities
                      ? "Loading cities..."
                      : !selectedStateId
                      ? "Choose state first"
                      : "Select City"}
                  </option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area / Hub Selector */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Delivery Hub / Area <span className="text-[#7a2417]">*</span>
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => handleAreaSelect(e.target.value)}
                  disabled={!selectedCityId || loadingAreas}
                  className="h-9 sm:h-9.5 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-2.5 text-[12px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
                >
                  <option value="">
                    {loadingAreas
                      ? "Loading areas..."
                      : !selectedCityId
                      ? "Choose city first"
                      : "Select Delivery Area / Hub"}
                  </option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.pincode ? `(${a.pincode})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Pill */}
            {isAreaSelected ? (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-[#cce3cf] bg-[#f0f8f0] px-2.5 py-1.5 text-[11px] text-[#326d3c]"
              >
                <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-[#39834a]" />
                <span>
                  Delivering to Hub: <strong>{currentAreaName}</strong>
                  {currentCityName ? `, ${currentCityName}` : ""}
                  {activePincode ? ` (${activePincode})` : ""}. House details unlocked.
                </span>
              </div>
            ) : (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-[#e8dfd4] bg-white px-2.5 py-1.5 text-[11px] text-[#715e50]"
              >
                <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#7a2417]" />
                <span>
                  Select your State, City, and Delivery Hub above to enter your house and street details.
                </span>
              </div>
            )}
          </div>

          {/* House & Street Manual Address Block */}
          <div className="rounded-xl border border-[#e8dfd4] bg-white p-3 sm:p-3.5 shadow-2xs space-y-2.5">
            {saveError && (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                <div className="flex items-start gap-1.5">
                  <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                  <span>{saveError}</span>
                </div>
                {isSessionExpired && (
                  <button
                    type="button"
                    onClick={() => router.push("/auth?redirect=/onboarding?step=2")}
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
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Flat / House / Unit Number <span className="text-[#7a2417]">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAreaSelected}
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder={isAreaSelected ? "e.g. Flat 203, Block B" : "Select hub above first"}
                  className="h-9 sm:h-9.5 w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Building / Society / Apartment
                </label>
                <input
                  type="text"
                  disabled={!isAreaSelected}
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder={isAreaSelected ? "e.g. Sunrise Heights" : "Select hub above first"}
                  className="h-9 sm:h-9.5 w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Street / Road Name
                </label>
                <input
                  type="text"
                  disabled={!isAreaSelected}
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder={isAreaSelected ? "e.g. Station Road" : "Select hub above first"}
                  className="h-9 sm:h-9.5 w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  disabled={!isAreaSelected}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={isAreaSelected ? "e.g. Near City Garden" : "Select hub above first"}
                  className="h-9 sm:h-9.5 w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Receiver Name <span className="text-[#7a2417]">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAreaSelected}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAreaSelected ? "Full name of receiver" : "Select hub above first"}
                  className="h-9 sm:h-9.5 w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Mobile Number <span className="text-[#7a2417]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={!isAreaSelected}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={isAreaSelected ? "+91 98765 43210" : "Select hub above first"}
                  className="h-9 sm:h-9.5 w-full rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] font-mono text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1 block text-[11px] font-semibold text-[#24130f]">
                  Address Label
                </label>
                <select
                  disabled={!isAreaSelected}
                  value={addressType}
                  onChange={(e) =>
                    setAddressType(e.target.value as "Home" | "Work" | "Other")
                  }
                  className="h-9 sm:h-9.5 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12px] text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="flex justify-stretch border-t border-[#eee5db] pt-2.5 sm:justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isAreaSelected || savingAddress}
            className="min-h-9 sm:min-h-9.5 lg:h-[40px] w-full rounded-xl bg-[#7a2417] py-2 px-5 text-[12px] sm:text-[12.5px] font-semibold text-white shadow-sm hover:bg-[#5f1b12] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[min(100%,300px)] cursor-pointer"
          >
            <span>
              {savingAddress
                ? "Saving Address..."
                : !isAreaSelected
                ? "Select Delivery Area First"
                : "Continue to Select Plan"}
            </span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </m.section>
  );
}
