"use client";

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiMapPin,
  FiNavigation,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiRefreshCw,
  FiHome,
  FiLayers,
} from "react-icons/fi";
import {
  locationApi,
  StateItem,
  CityItem,
  AreaItem,
  DetectLocationResponse,
} from "@/features/location/api/locationApi";
import { User } from "@/types/models";

export interface LocationStepProps {
  user: User | null;
  onAddressSaved: () => void;
}

export function LocationStep({ user, onAddressSaved }: LocationStepProps) {
  // Mode: "gps" | "manual"
  const [selectionMode, setSelectionMode] = useState<"gps" | "manual">("gps");

  // GPS State
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<DetectLocationResponse | null>(null);

  // Hierarchy Catalog State
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedAreaPincode, setSelectedAreaPincode] = useState("");

  // Address Details Form
  const [houseNumber, setHouseNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.phone || "");
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">("Home");

  // Submission State
  const [savingAddress, setSavingAddress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Coordinates from GPS if available
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

  // 1. Initial load of States Catalog
  useEffect(() => {
    async function loadStates() {
      setLoadingStates(true);
      try {
        const stateList = await locationApi.getStates();
        setStates(stateList);
        if (stateList.length === 1) {
          setSelectedStateId(stateList[0].id);
        }
      } catch (err) {
        console.warn("Failed to load states:", err);
      } finally {
        setLoadingStates(false);
      }
    }
    loadStates();
  }, []);

  // 2. Load Cities when State changes
  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      setSelectedCityId("");
      return;
    }

    async function loadCities() {
      setLoadingCities(true);
      try {
        const cityList = await locationApi.getCities(selectedStateId);
        setCities(cityList);
        if (cityList.length === 1) {
          setSelectedCityId(cityList[0].id);
        } else {
          setSelectedCityId("");
        }
      } catch (err) {
        console.warn("Failed to load cities:", err);
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, [selectedStateId]);

  // 3. Load Areas when City changes
  useEffect(() => {
    if (!selectedCityId) {
      setAreas([]);
      setSelectedAreaId("");
      setSelectedAreaPincode("");
      return;
    }

    async function loadAreas() {
      setLoadingAreas(true);
      try {
        const areaList = await locationApi.getAreas(selectedCityId);
        setAreas(areaList);
        setSelectedAreaId("");
        setSelectedAreaPincode("");
      } catch (err) {
        console.warn("Failed to load areas:", err);
      } finally {
        setLoadingAreas(false);
      }
    }
    loadAreas();
  }, [selectedCityId]);

  // Handle Area Selection change
  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    const chosen = areas.find((a) => a.id === areaId);
    if (chosen) {
      setSelectedAreaPincode(chosen.pincode || "");
    }
  };

  // ─── GPS Auto-Detection Handler ───
  const handleDetectGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await locationApi.detectLocation({ latitude: lat, longitude: lng });
          setDetectedLocation(res);

          // Try to match detected state, city, and area with active catalog
          const allStates = states.length > 0 ? states : await locationApi.getStates();
          const matchedState = allStates.find(
            (s) => s.name.toLowerCase() === res.state.toLowerCase()
          ) || allStates[0];

          if (matchedState) {
            setSelectedStateId(matchedState.id);
            const cityList = await locationApi.getCities(matchedState.id);
            setCities(cityList);

            const matchedCity = cityList.find(
              (c) => c.name.toLowerCase() === res.city.toLowerCase()
            ) || cityList[0];

            if (matchedCity) {
              setSelectedCityId(matchedCity.id);
              const areaList = await locationApi.getAreas(matchedCity.id);
              setAreas(areaList);

              const matchedArea =
                areaList.find((a) => a.pincode === res.pincode) ||
                areaList.find(
                  (a) =>
                    a.name.toLowerCase().includes(res.area.toLowerCase()) ||
                    res.area.toLowerCase().includes(a.name.toLowerCase())
                ) ||
                areaList[0];

              if (matchedArea) {
                setSelectedAreaId(matchedArea.id);
                setSelectedAreaPincode(matchedArea.pincode || res.pincode);
              }
            }
          }
        } catch (err: any) {
          const errorMsg =
            err?.data?.message || err?.message || "Location detection failed. Please select your area manually.";
          setGpsError(Array.isArray(errorMsg) ? errorMsg.join(", ") : String(errorMsg));
        } finally {
          setGpsDetecting(false);
        }
      },
      (err) => {
        setGpsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Location access was denied. Please select your state and city below.");
        } else {
          setGpsError("Could not retrieve GPS coordinates. Please select manually below.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const isAreaServiceable = Boolean(selectedStateId && selectedCityId && selectedAreaId);

  // Selected State/City/Area names for badges
  const selectedStateName = states.find((s) => s.id === selectedStateId)?.name || detectedLocation?.state || "";
  const selectedCityName = cities.find((c) => c.id === selectedCityId)?.name || detectedLocation?.city || "";
  const selectedAreaObj = areas.find((a) => a.id === selectedAreaId);
  const selectedAreaName = selectedAreaObj?.name || detectedLocation?.area || "";
  const activePincode = selectedAreaObj?.pincode || selectedAreaPincode || detectedLocation?.pincode || "";

  // ─── Save Address Handler ───
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStateId || !selectedCityId || !selectedAreaId) {
      setSaveError("Please select a serviceable State, City, and Delivery Area first.");
      return;
    }

    if (!houseNumber.trim()) {
      setSaveError("Please enter your flat / house / unit number.");
      return;
    }

    setSavingAddress(true);
    setSaveError(null);

    try {
      await locationApi.createAddress({
        fullName: fullName.trim() || user?.name || "Customer",
        mobile: mobile.trim() || user?.phone || "+919876543210",
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
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* ─── SECTION 1: SELECTION MODE SWITCHER ─── */}
      <div className="bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#E8DFD4] flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSelectionMode("gps")}
          className={`
            flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer
            ${
              selectionMode === "gps"
                ? "bg-white text-[#5C1B13] shadow-sm border border-[#E8DFD4]"
                : "text-[#6B584C] hover:text-[#1A1008]"
            }
          `}
        >
          <FiNavigation className="w-3.5 h-3.5" />
          <span>Use Current Location (GPS)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectionMode("manual")}
          className={`
            flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer
            ${
              selectionMode === "manual"
                ? "bg-white text-[#5C1B13] shadow-sm border border-[#E8DFD4]"
                : "text-[#6B584C] hover:text-[#1A1008]"
            }
          `}
        >
          <FiLayers className="w-3.5 h-3.5" />
          <span>Select State / City / Area</span>
        </button>
      </div>

      {/* ─── MODE A: GPS LOCATION DETECTION ─── */}
      {selectionMode === "gps" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFD4] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A1008] flex items-center gap-1.5">
                <FiMapPin className="w-4 h-4 text-[#5C1B13]" />
                <span>GPS Serviceability Check</span>
              </h3>
              <p className="text-xs text-[#6B584C] mt-0.5">
                Detect your device coordinates to confirm morning cold-chain delivery.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDetectGps}
              disabled={gpsDetecting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              {gpsDetecting ? (
                <>
                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <FiNavigation className="w-3.5 h-3.5" />
                  <span>{detectedLocation ? "Re-detect GPS" : "Detect Location"}</span>
                </>
              )}
            </Button>
          </div>

          {gpsError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}

          {detectedLocation && (
            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD4] text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-[#1A1008]">
                <span>Detected Address:</span>
                <span className="font-mono text-[11px] text-[#5C1B13]">{detectedLocation.pincode}</span>
              </div>
              <p className="text-[#6B584C] text-[11px] leading-relaxed">
                {detectedLocation.formattedAddress}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── MODE B: STATE -> CITY -> AREA SELECTOR (ALWAYS VISIBLE OR WHEN MANUAL) ─── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFD4] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#1A1008] flex items-center gap-1.5">
          <FiLayers className="w-4 h-4 text-[#8C603D]" />
          <span>Active Service Delivery Hub</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* State Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
              1. State *
            </label>
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              disabled={loadingStates}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer"
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
            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
              2. City *
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              disabled={!selectedStateId || loadingCities}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer disabled:opacity-50"
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
            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
              3. Delivery Hub / Area *
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => handleAreaSelect(e.target.value)}
              disabled={!selectedCityId || loadingAreas}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {loadingAreas
                  ? "Loading areas..."
                  : !selectedCityId
                  ? "Choose city first"
                  : "Select Area / Hub"}
              </option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.pincode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Confirmed Serviceable Badge */}
        {isAreaServiceable && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Serviceable Hub: <strong>{selectedAreaName}, {selectedCityName} ({activePincode})</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Daily Delivery Active
            </span>
          </div>
        )}
      </div>

      {/* ─── SECTION 2: MANUAL ADDRESS DETAILS FORM (ENABLED ONCE SERVICEABLE) ─── */}
      <AnimatePresence>
        {isAreaServiceable ? (
          <m.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveAddress}
            className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E8DFD4] shadow-xs space-y-4"
          >
            <div className="pb-1 border-b border-[#E8DFD4]/60">
              <h3 className="text-sm font-bold text-[#1A1008] flex items-center gap-1.5">
                <FiHome className="w-4 h-4 text-[#5C1B13]" />
                <span>Enter Street &amp; House Details</span>
              </h3>
              <p className="text-xs text-[#6B584C]">
                Provide your exact door details for sunrise cold-chain delivery before 10 AM.
              </p>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Flat / House Number & Building Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Flat / House / Unit Number *
                </label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. Flat 402, Building A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Building / Society / Apartment
                </label>
                <input
                  type="text"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="e.g. Green Acres Residency"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            {/* Street & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Street / Road Name
                </label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder="e.g. Hill Road, Main Market Lane"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Mehboob Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-medium text-[#1A1008] focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Address Label
                </label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value as "Home" | "Work" | "Other")}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none cursor-pointer"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Receiver Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name of receiver"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] focus:border-[#5C1B13] bg-[#FFFDF7] text-xs font-semibold text-[#1A1008] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+919876543210"
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
                disabled={savingAddress}
                className="rounded-2xl py-3.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 flex items-center justify-center gap-2 cursor-pointer bg-[#5C1B13] hover:bg-[#48150f] text-white"
              >
                <span>{savingAddress ? "Saving Address..." : "Save Delivery Address & Continue"}</span>
                <FiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </m.form>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-dashed border-[#E8DFD4] text-center text-xs text-[#8C7A6B]">
            Please detect your location or select your State, City, and Delivery Hub above to unlock the address form.
          </div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
