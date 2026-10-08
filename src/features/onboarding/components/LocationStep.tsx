"use client";

import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiArrowLeft,
  FiMapPin,
  FiNavigation,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiRefreshCw,
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
  onBack: () => void;
  onAddressSaved: () => void;
}

export function LocationStep({ user, onBack, onAddressSaved }: LocationStepProps) {
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

  // Guard flag: when true, the cascading useEffects for cities/areas skip
  // their automatic resets so the GPS handler can set everything atomically.
  const gpsPopulatingRef = useRef(false);

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
    // Skip if GPS handler is populating — it manages cities/areas itself
    if (gpsPopulatingRef.current) return;

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
    // Skip if GPS handler is populating — it manages cities/areas itself
    if (gpsPopulatingRef.current) return;

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

          // Prevent cascading useEffects from resetting our selections
          gpsPopulatingRef.current = true;

          try {
            // Try to match detected state, city, and area with active catalog
            const allStates = states.length > 0 ? states : await locationApi.getStates();
            if (!states.length && allStates.length) setStates(allStates);

            const matchedState = allStates.find(
              (s) => s.name.toLowerCase() === res.state.toLowerCase()
            );

            if (matchedState) {
              setSelectedStateId(matchedState.id);
              const cityList = await locationApi.getCities(matchedState.id);
              setCities(cityList);

              const matchedCity = cityList.find(
                (c) => c.name.toLowerCase() === res.city.toLowerCase()
              );

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
                  );

                if (matchedArea) {
                  setSelectedAreaId(matchedArea.id);
                  setSelectedAreaPincode(matchedArea.pincode || res.pincode);
                } else {
                  // No area match — clear area so user picks manually
                  setSelectedAreaId("");
                  setSelectedAreaPincode("");
                  setGpsError(
                    `Your detected area "${res.area}" is not yet in our delivery catalog. Please select your Delivery Hub manually below.`
                  );
                }
              } else {
                // No city match — clear city & area so user picks manually
                setSelectedCityId("");
                setSelectedAreaId("");
                setSelectedAreaPincode("");
                setGpsError(
                  `Your detected city "${res.city}" is not yet in our delivery catalog. Please select your City and Delivery Hub manually below.`
                );
              }
            } else {
              // No state match — clear everything so user picks manually
              setSelectedStateId("");
              setSelectedCityId("");
              setSelectedAreaId("");
              setSelectedAreaPincode("");
              setGpsError(
                `Your detected state "${res.state}" is not yet in our delivery catalog. Please select your State, City, and Delivery Hub manually below.`
              );
            }
          } finally {
            // Release the guard so manual dropdown changes work normally again.
            // Use setTimeout to let React flush the state updates before
            // re-enabling the useEffects.
            setTimeout(() => {
              gpsPopulatingRef.current = false;
            }, 0);
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
      className="space-y-5"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#24130f] sm:text-[32px]">
            Delivery Location
          </h1>
          <p className="mt-1.5 text-[14px] text-[#715e50] sm:text-[15px]">
            Choose where you&apos;d like your fresh milk delivered.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-10 w-fit items-center gap-1.5 text-[13px] font-semibold text-[#7a2417] transition-colors hover:text-[#5f1b12]"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Profile
        </button>
      </header>

      <section className="space-y-5 rounded-2xl border border-[#e8dfd4] bg-white p-4 sm:p-5">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDetectGps}
            disabled={gpsDetecting}
            className="min-h-11 w-full rounded-xl bg-[#7a2417] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#5f1b12] sm:w-auto"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {gpsDetecting ? (
                <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FiNavigation className="h-3.5 w-3.5" />
              )}
              {gpsDetecting ? "Detecting Location..." : "Use Current Location"}
            </span>
          </Button>
          <span className="text-[11px] font-medium text-[#8b7b70]">or select manually</span>
        </div>

        {gpsError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span>{gpsError}</span>
          </div>
        )}

        {detectedLocation && (
          <div className="rounded-xl bg-[#faf6f0] px-3.5 py-3 text-xs">
            <div className="flex items-center justify-between gap-3 font-semibold text-[#24130f]">
              <span>Detected location</span>
              <span className="font-mono text-[11px] text-[#7a2417]">
                {detectedLocation.pincode}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#715e50]">
              {detectedLocation.formattedAddress}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* State Selector */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
              State <span className="text-[#7a2417]">*</span>
            </label>
            <select
              value={selectedStateId}
              onChange={(e) => {
                setSelectedStateId(e.target.value);
                setGpsError(null);
                setSaveError(null);
              }}
              disabled={loadingStates}
              className="h-12 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
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
            <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
              City <span className="text-[#7a2417]">*</span>
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => {
                setSelectedCityId(e.target.value);
                setGpsError(null);
                setSaveError(null);
              }}
              disabled={!selectedStateId || loadingCities}
              className="h-12 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
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
            <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
              Delivery Area / Hub <span className="text-[#7a2417]">*</span>
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => {
                handleAreaSelect(e.target.value);
                setGpsError(null);
                setSaveError(null);
              }}
              disabled={!selectedCityId || loadingAreas}
              className="h-12 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
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

        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-[12px] ${
            isAreaServiceable
              ? "border-[#cce3cf] bg-[#f0f8f0] text-[#326d3c]"
              : "border-[#e8dfd4] bg-[#faf6f0] text-[#715e50]"
          }`}
        >
          {isAreaServiceable ? (
            <>
              <FiCheckCircle className="h-4 w-4 shrink-0 text-[#39834a]" />
              <span>
                Delivery available in {selectedAreaName}, {selectedCityName}
                {activePincode ? ` (${activePincode})` : ""}.
              </span>
            </>
          ) : (
            <>
              <FiMapPin className="h-4 w-4 shrink-0 text-[#7a2417]" />
              <span>Select a delivery area to check availability.</span>
            </>
          )}
        </div>
      </section>

      {/* Address details are collected after selecting an active delivery area. */}
      <AnimatePresence>
        {isAreaServiceable ? (
          <m.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveAddress}
            className="space-y-4 rounded-2xl border border-[#e8dfd4] bg-white p-4 sm:p-5"
          >
            <div className="border-b border-[#e8dfd4]/60 pb-2">
              <h2 className="text-sm font-bold text-[#24130f]">
                Delivery Address Details
              </h2>
              <p className="mt-0.5 text-xs text-[#715e50]">
                Add your house and street details for accurate delivery.
              </p>
            </div>

            {saveError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Flat / House / Unit Number *
                </label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. Flat 402, Building A"
                  className="h-12 w-full rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Building / Society / Apartment
                </label>
                <input
                  type="text"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="e.g. Green Acres Residency"
                  className="h-12 w-full rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Street / Road Name
                </label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder="e.g. Main Market Lane"
                  className="h-12 w-full rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near the market"
                  className="h-12 w-full rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Receiver Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name of receiver"
                  className="h-12 w-full rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+919876543210"
                  className="h-12 w-full rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] font-mono text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#24130f]">
                  Address Label
                </label>
                <select
                  value={addressType}
                  onChange={(e) =>
                    setAddressType(e.target.value as "Home" | "Work" | "Other")
                  }
                  className="h-12 w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3.5 text-[13px] text-[#24130f] outline-none focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="border-t border-[#eee5db] pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={savingAddress}
                className="min-h-12 w-full rounded-xl bg-[#7a2417] py-3 text-[13px] font-semibold text-white shadow-sm hover:bg-[#5f1b12] sm:ml-auto sm:w-[min(100%,360px)]"
              >
                <span>
                  {savingAddress ? "Saving Address..." : "Continue to Select Plan"}
                </span>
                <FiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </m.form>
        ) : (
          <div className="rounded-xl border border-dashed border-[#ddd2c7] px-4 py-3 text-center text-[12px] text-[#715e50]">
            Select a delivery area to confirm availability and enter your address.
          </div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
