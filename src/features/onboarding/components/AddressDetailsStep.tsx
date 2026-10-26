"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiArrowLeft,
  FiMapPin,
  FiAlertCircle,
  FiArrowRight,
  FiLogIn,
  FiCheckCircle,
  FiChevronDown,
  FiHome,
  FiBriefcase,
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
  addressDraft?: {
    houseNumber: string;
    buildingName: string;
    streetName: string;
    landmark: string;
    fullName: string;
    mobile: string;
    addressType: "Home" | "Work" | "Other";
  };
  onDraftChange?: (draft: {
    houseNumber: string;
    buildingName: string;
    streetName: string;
    landmark: string;
    fullName: string;
    mobile: string;
    addressType: "Home" | "Work" | "Other";
  }) => void;
  onStateChange: (stateId: string) => void;
  onCityChange: (cityId: string, cityName?: string) => void;
  onAreaChange: (areaId: string, pincode: string, areaName?: string) => void;
  onCoordsChange?: (coords: { lat?: number; lng?: number }) => void;
  onBack: () => void;
  onAddressSaved: (createdAddress?: CustomerAddress) => void;
}

function AddressDetailsStepComponent({
  user,
  selectedStateId,
  selectedCityId,
  selectedAreaId,
  selectedAreaName,
  selectedCityName,
  selectedPincode,
  coords,
  addressDraft,
  onDraftChange,
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

  // Address Form State - initialized from addressDraft to preserve user input on step navigation
  const defaultReceiverName =
    user?.name && !user.name.startsWith("Customer (") && user.name.toLowerCase() !== "customer"
      ? user.name
      : "";
  const [houseNumber, setHouseNumber] = useState(addressDraft?.houseNumber || "");
  const [buildingName, setBuildingName] = useState(addressDraft?.buildingName || "");
  const [streetName, setStreetName] = useState(addressDraft?.streetName || "");
  const [landmark, setLandmark] = useState(addressDraft?.landmark || "");
  const [fullName, setFullName] = useState(addressDraft?.fullName || defaultReceiverName);
  const [mobile, setMobile] = useState(addressDraft?.mobile || user?.phone || "");
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">(
    addressDraft?.addressType || "Home"
  );

  // Keep parent draft updated whenever inputs change (debounced 250ms to prevent re-rendering parent on every keystroke)
  const currentDraftRef = React.useRef({
    houseNumber,
    buildingName,
    streetName,
    landmark,
    fullName,
    mobile,
    addressType,
  });

  useEffect(() => {
    currentDraftRef.current = {
      houseNumber,
      buildingName,
      streetName,
      landmark,
      fullName,
      mobile,
      addressType,
    };
    const timer = setTimeout(() => {
      onDraftChange?.(currentDraftRef.current);
    }, 250);
    return () => clearTimeout(timer);
  }, [houseNumber, buildingName, streetName, landmark, fullName, mobile, addressType, onDraftChange]);

  // Flush latest draft on unmount so navigation preserves changes
  useEffect(() => {
    return () => {
      onDraftChange?.(currentDraftRef.current);
    };
  }, [onDraftChange]);

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
          const stateExists = stateList.some((s) => s.id === selectedStateId);
          if (stateList.length === 1 && (!selectedStateId || !stateExists)) {
            onStateChange(stateList[0].id);
          } else if (!stateExists && selectedStateId) {
            onStateChange("");
            onCityChange("", "");
            onAreaChange("", "");
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

  // Live data sync: silently update states, cities, and areas if admin adds or removes them
  useRealtimeSync(async () => {
    try {
      // 1. Sync states catalog
      const stateList = await locationApi.getStates();
      setStates(stateList);

      const stateExists = stateList.some((s) => s.id === selectedStateId);
      if (selectedStateId && !stateExists) {
        // Selected state was deleted by admin!
        onStateChange("");
        onCityChange("", "");
        onAreaChange("", "", "");
        setCities([]);
        setAreas([]);
        return;
      }

      if (stateList.length === 1 && (!selectedStateId || !stateExists)) {
        onStateChange(stateList[0].id);
      }

      const activeState = selectedStateId || (stateList.length === 1 ? stateList[0].id : "");

      // 2. Sync cities if state is active
      if (activeState) {
        const cityList = await locationApi.getCities(activeState);
        setCities(cityList);

        const cityExists = cityList.some((c) => c.id === selectedCityId);
        if (selectedCityId && !cityExists) {
          // Selected city was deleted by admin!
          onCityChange("", "");
          onAreaChange("", "", "");
          setAreas([]);
          return;
        }

        if (cityList.length === 1 && (!selectedCityId || !cityExists)) {
          onCityChange(cityList[0].id, cityList[0].name);
        }

        const activeCity = selectedCityId || (cityList.length === 1 ? cityList[0].id : "");

        // 3. Sync areas if city is active
        if (activeCity) {
          const areaList = await locationApi.getAreas(activeCity);
          setAreas(areaList);

          const areaExists = areaList.some((a) => a.id === selectedAreaId);
          if (selectedAreaId && !areaExists) {
            // Selected area was deleted by admin!
            onAreaChange("", "", "");
            return;
          }

          if (areaList.length === 1 && (!selectedAreaId || !areaExists)) {
            onAreaChange(areaList[0].id, areaList[0].pincode || "", areaList[0].name);
          }
        }
      }
    } catch {
      // Silently ignore live sync errors in background
    }
  }, { intervalMs: 120000, onFocus: false });

  // Load Cities whenever State changes
  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      return;
    }
    const controller = new AbortController();
    let isMounted = true;
    async function loadCities() {
      setLoadingCities(true);
      try {
        const cityList = await locationApi.getCities(selectedStateId, false, controller.signal);
        if (isMounted) {
          setCities(cityList);
          const cityExists = cityList.some((c) => c.id === selectedCityId);
          if (cityList.length === 1 && (!selectedCityId || !cityExists)) {
            onCityChange(cityList[0].id, cityList[0].name);
          } else if (!cityExists && selectedCityId) {
            onCityChange("", "");
            onAreaChange("", "");
          }
        }
      } catch (err: unknown) {
        if (isMounted && !(err instanceof Error && err.name === "AbortError")) {
          console.error("Error loading cities:", err);
        }
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    }
    loadCities();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedStateId, selectedCityId, onCityChange, onAreaChange]);

  // Load Areas/Hubs whenever City changes
  useEffect(() => {
    if (!selectedCityId) {
      setAreas([]);
      return;
    }
    const controller = new AbortController();
    let isMounted = true;
    async function loadAreas() {
      setLoadingAreas(true);
      try {
        const areaList = await locationApi.getAreas(selectedCityId, false, controller.signal);
        if (isMounted) {
          setAreas(areaList);
          const areaExists = areaList.some((a) => a.id === selectedAreaId);
          if (areaList.length === 1 && (!selectedAreaId || !areaExists)) {
            onAreaChange(areaList[0].id, areaList[0].pincode || "", areaList[0].name);
          } else if (!areaExists && selectedAreaId) {
            onAreaChange("", "", "");
          }
        }
      } catch (err: unknown) {
        if (isMounted && !(err instanceof Error && err.name === "AbortError")) {
          console.error("Error loading areas:", err);
        }
      } finally {
        if (isMounted) setLoadingAreas(false);
      }
    }
    loadAreas();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCityId, selectedAreaId, onAreaChange]);

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

    if (!buildingName.trim()) {
      setSaveError("Please enter your building / society / apartment name.");
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
      className="flex flex-col justify-between w-full md:h-full space-y-3"
    >
      <form onSubmit={handleSaveAddress} className="flex flex-col justify-between flex-1 md:h-full space-y-3">
        <div className="space-y-3">
          {/* Header */}
          <header className="flex items-center justify-between gap-3 border-b border-[#eee5db] pb-2.5 sm:pb-3">
            <div>
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#7a2417] block">
                Step 2 of 4 • Delivery Location
              </span>
              <h1 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#24130f] mt-0.5">
                Delivery Address
              </h1>
              <p className="mt-1 text-xs sm:text-[13px] text-[#715e50]">
                Select your delivery hub and enter your house & street details for morning deliveries.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#7a2417]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#7a2417] hover:bg-[#7a2417]/8 transition-colors cursor-pointer shadow-2xs"
            >
              <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Profile</span>
            </button>
          </header>

          {/* Service Area Selection Grid */}
          <div className="rounded-2xl border border-[#e8dfd4] bg-[#FAF7F2] p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C1B13] block">
              1. Select Delivery Service Hub
            </span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {/* State Selector */}
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  State <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStateId}
                    onChange={(e) => {
                      onStateChange(e.target.value);
                      onCityChange("", "");
                      onAreaChange("", "", "");
                    }}
                    disabled={loadingStates}
                    className="h-10.5 sm:h-11 w-full appearance-none cursor-pointer rounded-xl border border-[#DED4C7] bg-white pl-3.5 pr-8 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition-all focus:border-[#7a2417] focus:ring-4 focus:ring-[#7a2417]/10 disabled:opacity-50"
                  >
                    <option value="">{loadingStates ? "Loading states..." : states.length === 0 ? "No states available" : "Select State"}</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#715E50]" />
                </div>
              </div>

              {/* City Selector */}
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  City <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCityId}
                    onChange={(e) => {
                      const chosenCity = cities.find((c) => c.id === e.target.value);
                      onCityChange(e.target.value, chosenCity?.name || "");
                      onAreaChange("", "", "");
                    }}
                    disabled={!selectedStateId || loadingCities}
                    className="h-10.5 sm:h-11 w-full appearance-none cursor-pointer rounded-xl border border-[#DED4C7] bg-white pl-3.5 pr-8 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition-all focus:border-[#7a2417] focus:ring-4 focus:ring-[#7a2417]/10 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingCities
                        ? "Loading cities..."
                        : !selectedStateId
                        ? "Choose state first"
                        : cities.length === 0
                        ? "No cities available"
                        : "Select City"}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#715E50]" />
                </div>
              </div>

              {/* Area / Hub Selector */}
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Delivery Hub / Area <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedAreaId}
                    onChange={(e) => handleAreaSelect(e.target.value)}
                    disabled={!selectedCityId || loadingAreas}
                    className="h-10.5 sm:h-11 w-full appearance-none cursor-pointer rounded-xl border border-[#DED4C7] bg-white pl-3.5 pr-8 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition-all focus:border-[#7a2417] focus:ring-4 focus:ring-[#7a2417]/10 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingAreas
                        ? "Loading areas..."
                        : !selectedCityId
                        ? "Choose city first"
                        : areas.length === 0
                        ? "No delivery areas available"
                        : "Select Delivery Area / Hub"}
                    </option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} {a.pincode ? `(${a.pincode})` : ""}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#715E50]" />
                </div>
              </div>
            </div>

            {/* Status Pill */}
            {isAreaSelected ? (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs text-emerald-900 shadow-2xs"
              >
                <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Delivering to Hub: <strong>{currentAreaName}</strong>
                  {currentCityName ? `, ${currentCityName}` : ""}
                  {activePincode ? ` (${activePincode})` : ""}. House details unlocked below.
                </span>
              </div>
            ) : (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-[#e8dfd4] bg-white px-3 py-2 text-xs text-[#715e50] shadow-2xs"
              >
                <FiMapPin className="h-4 w-4 shrink-0 text-[#7a2417]" />
                <span>
                  Select your State, City, and Delivery Hub above to unlock house & street fields.
                </span>
              </div>
            )}
          </div>

          {/* House & Street Manual Address Block */}
          <div className="rounded-2xl border border-[#e8dfd4] bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C1B13] block">
              2. House & Receiver Details
            </span>

            {saveError && (
              <div className="flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                <div className="flex items-start gap-1.5">
                  <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Flat / House / Unit Number <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAreaSelected}
                  value={houseNumber}
                  onChange={(e) => {
                    setHouseNumber(e.target.value);
                    setSaveError(null);
                  }}
                  placeholder={isAreaSelected ? "e.g. Flat 203, Block B" : "Select hub above first"}
                  className="h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] text-[#24130f] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Building / Society / Apartment <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAreaSelected}
                  value={buildingName}
                  onChange={(e) => {
                    setBuildingName(e.target.value);
                    setSaveError(null);
                  }}
                  placeholder={isAreaSelected ? "e.g. Sunrise Heights, Tower B" : "Select hub above first"}
                  className="h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] text-[#24130f] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Street / Road Name
                </label>
                <input
                  type="text"
                  disabled={!isAreaSelected}
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder={isAreaSelected ? "e.g. Station Road" : "Select hub above first"}
                  className="h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] text-[#24130f] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  disabled={!isAreaSelected}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={isAreaSelected ? "e.g. Near City Garden" : "Select hub above first"}
                  className="h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] text-[#24130f] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Receiver Name <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAreaSelected}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAreaSelected ? "Full name of receiver" : "Select hub above first"}
                  className="h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] text-[#24130f] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Mobile Number <span className="text-[#7a2417] font-bold">*</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={!isAreaSelected}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={isAreaSelected ? "+91 98765 43210" : "Select hub above first"}
                  className="h-10.5 sm:h-11 w-full rounded-xl border border-[#DED4C7] bg-[#FDFBF7] px-3.5 text-[13px] font-mono text-[#24130f] outline-none transition-all placeholder:text-[#A89A8D] focus:border-[#7a2417] focus:bg-white focus:ring-4 focus:ring-[#7a2417]/10 disabled:bg-[#f7f3ed] disabled:text-[#a89b8c] disabled:border-[#e2d8cd] disabled:cursor-not-allowed"
                />
              </div>

              {/* Address Label Chips */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1.5 block text-[11.5px] sm:text-xs font-semibold text-[#24130f]">
                  Address Label
                </label>
                <div className="flex items-center gap-2">
                  {(
                    [
                      { label: "Home", icon: FiHome },
                      { label: "Work", icon: FiBriefcase },
                      { label: "Other", icon: FiMapPin },
                    ] as const
                  ).map(({ label, icon: LabelIcon }) => {
                    const isSelected = addressType === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={!isAreaSelected}
                        onClick={() => setAddressType(label)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-[#7a2417] text-white border-[#7a2417] shadow-xs"
                            : "bg-[#FDFBF7] text-[#24130F] border-[#DED4C7] hover:border-[#7a2417]/40 hover:bg-white"
                        }`}
                      >
                        <LabelIcon className="h-3.5 w-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="mt-5 flex justify-stretch border-t border-[#eee5db] pt-3 sm:justify-end pb-3 sm:pb-0">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isAreaSelected || savingAddress}
            className="h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#5C1B13] px-7 text-xs sm:text-[13.5px] font-bold text-white transition-all hover:bg-[#48150F] active:scale-[0.98] shadow-md shadow-[#5C1B13]/20 hover:shadow-lg hover:shadow-[#5C1B13]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>
              {savingAddress
                ? "Saving Address..."
                : !isAreaSelected
                ? "Select Delivery Area First"
                : "Continue to Select Plan"}
            </span>
            <FiArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </m.section>
  );
}

export const AddressDetailsStep = React.memo(AddressDetailsStepComponent);
