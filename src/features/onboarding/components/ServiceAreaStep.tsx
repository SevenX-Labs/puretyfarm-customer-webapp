"use client";

import React, { useState, useEffect, useRef } from "react";
import { m } from "framer-motion";
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

export interface ServiceAreaStepProps {
  selectedStateId: string;
  selectedCityId: string;
  selectedAreaId: string;
  selectedAreaPincode: string;
  onStateChange: (stateId: string) => void;
  onCityChange: (cityId: string, cityName?: string) => void;
  onAreaChange: (areaId: string, pincode: string, areaName?: string) => void;
  onCoordsChange: (coords: { lat?: number; lng?: number }) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function ServiceAreaStep({
  selectedStateId,
  selectedCityId,
  selectedAreaId,
  selectedAreaPincode,
  onStateChange,
  onCityChange,
  onAreaChange,
  onCoordsChange,
  onBack,
  onContinue,
}: ServiceAreaStepProps) {
  // GPS State
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<DetectLocationResponse | null>(null);

  // Server-Side Location Catalog State
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Guard flag for GPS auto-population
  const gpsPopulatingRef = useRef(false);

  // 1. Initial load of States from Server
  useEffect(() => {
    let mounted = true;
    async function loadStates() {
      setLoadingStates(true);
      try {
        const stateList = await locationApi.getStates();
        if (mounted) {
          setStates(Array.isArray(stateList) ? stateList : []);
        }
      } catch (err) {
        console.warn("Failed to load states from server:", err);
      } finally {
        if (mounted) setLoadingStates(false);
      }
    }
    loadStates();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Load Cities when State changes
  useEffect(() => {
    if (gpsPopulatingRef.current) return;

    if (!selectedStateId) {
      setCities([]);
      return;
    }

    let mounted = true;
    async function loadCities() {
      setLoadingCities(true);
      try {
        const cityList = await locationApi.getCities(selectedStateId);
        if (mounted) {
          setCities(Array.isArray(cityList) ? cityList : []);
        }
      } catch (err) {
        console.warn("Failed to load cities for state:", err);
      } finally {
        if (mounted) setLoadingCities(false);
      }
    }
    loadCities();
    return () => {
      mounted = false;
    };
  }, [selectedStateId]);

  // 3. Load Areas when City changes
  useEffect(() => {
    if (gpsPopulatingRef.current) return;

    if (!selectedCityId) {
      setAreas([]);
      return;
    }

    let mounted = true;
    async function loadAreas() {
      setLoadingAreas(true);
      try {
        const areaList = await locationApi.getAreas(selectedCityId);
        if (mounted) {
          setAreas(Array.isArray(areaList) ? areaList : []);
        }
      } catch (err) {
        console.warn("Failed to load areas for city:", err);
      } finally {
        if (mounted) setLoadingAreas(false);
      }
    }
    loadAreas();
    return () => {
      mounted = false;
    };
  }, [selectedCityId]);

  // Handle Area Selection change
  const handleAreaSelect = (areaId: string) => {
    const chosen = areas.find((a) => a.id === areaId);
    onAreaChange(areaId, chosen?.pincode || "", chosen?.name || "");
  };

  // ─── GPS Auto-Detection Handler ───
  const handleDetectGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your device browser.");
      setDetectedLocation(null);
      return;
    }

    setGpsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onCoordsChange({ lat, lng });

        try {
          const res = await locationApi.detectLocation({ latitude: lat, longitude: lng });

          if (!res || !res.state) {
            throw new Error("Location coordinates could not be resolved.");
          }

          setDetectedLocation(res);
          gpsPopulatingRef.current = true;

          try {
            const allStates = states.length > 0 ? states : await locationApi.getStates();
            if (!states.length && allStates.length) setStates(allStates);

            const matchedState = allStates.find(
              (s) =>
                s.name.toLowerCase() === res.state.toLowerCase() ||
                res.state.toLowerCase().includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().includes(res.state.toLowerCase())
            );

            if (matchedState) {
              onStateChange(matchedState.id);
              const cityList = await locationApi.getCities(matchedState.id);
              setCities(cityList);

              const matchedCity = cityList.find(
                (c) =>
                  c.name.toLowerCase() === res.city.toLowerCase() ||
                  res.city.toLowerCase().includes(c.name.toLowerCase()) ||
                  c.name.toLowerCase().includes(res.city.toLowerCase())
              );

              if (matchedCity) {
                onCityChange(matchedCity.id, matchedCity.name);
                const areaList = await locationApi.getAreas(matchedCity.id);
                setAreas(areaList);

                const matchedArea =
                  areaList.find((a) => a.pincode && res.pincode && a.pincode === res.pincode) ||
                  areaList.find(
                    (a) =>
                      a.name.toLowerCase().includes(res.area.toLowerCase()) ||
                      res.area.toLowerCase().includes(a.name.toLowerCase())
                  );

                if (matchedArea) {
                  onAreaChange(matchedArea.id, matchedArea.pincode || res.pincode, matchedArea.name);
                } else {
                  onAreaChange("", "", "");
                  setGpsError(
                    `Detected location: ${res.city}, ${res.state}. Please select your specific Delivery Hub below.`
                  );
                }
              } else {
                onCityChange("", "");
                onAreaChange("", "", "");
                setGpsError(
                  `Detected city "${res.city}" is not yet serviceable. Please choose an available city below.`
                );
              }
            } else {
              onStateChange("");
              onCityChange("", "");
              onAreaChange("", "", "");
              setGpsError(
                `Detected state "${res.state}" is not yet serviceable. Please select from available states below.`
              );
            }
          } finally {
            setTimeout(() => {
              gpsPopulatingRef.current = false;
            }, 50);
          }
        } catch {
          setDetectedLocation(null);
          setGpsError("Could not auto-detect location. Please select your State, City, and Delivery Hub from the dropdowns below.");
        } finally {
          setGpsDetecting(false);
        }
      },
      (err) => {
        setGpsDetecting(false);
        setDetectedLocation(null);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Location permission was denied. Please select your State and City manually below.");
        } else {
          setGpsError("Could not retrieve GPS coordinates. Please select your State, City, and Delivery Hub manually below.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const selectedStateObj = states.find((s) => s.id === selectedStateId);
  const selectedCityObj = cities.find((c) => c.id === selectedCityId);
  const selectedAreaObj = areas.find((a) => a.id === selectedAreaId);

  const isAreaServiceable = Boolean(
    selectedStateId &&
    selectedCityId &&
    selectedAreaId &&
    selectedAreaObj
  );

  const selectedStateName = selectedStateObj?.name || "";
  const selectedCityName = selectedCityObj?.name || "";
  const selectedAreaName = selectedAreaObj?.name || "";
  const activePincode = selectedAreaObj?.pincode || selectedAreaPincode || "";

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col justify-between"
    >
      <div className="space-y-3.5 sm:space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-lg font-bold text-[#24130f] sm:text-xl md:text-2xl">
              Choose Service Area
            </h1>
            <p className="mt-0.5 text-xs text-[#715e50] sm:text-[13px]">
              Select where you want your fresh morning milk delivered.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#7a2417] hover:bg-[#7a2417]/10 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Profile
          </button>
        </header>

        <div className="space-y-3 rounded-xl border border-[#e8dfd4] bg-white p-3.5 sm:p-4.5 shadow-2xs">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDetectGps}
              disabled={gpsDetecting}
              className="min-h-9 sm:min-h-10 w-full rounded-xl bg-[#7a2417] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#5f1b12] sm:w-auto cursor-pointer"
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
            <span className="text-[11px] font-medium text-[#8b7b70]">or select manually below</span>
          </div>

          {gpsError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11.5px] text-amber-800"
            >
              <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>{gpsError}</span>
            </div>
          )}

          {detectedLocation && (
            <div className="rounded-xl bg-[#faf6f0] px-3.5 py-2.5 text-xs border border-[#e8dfd4]">
              <div className="flex items-center justify-between gap-3 font-semibold text-[#24130f]">
                <span>Detected location</span>
                {detectedLocation.pincode ? (
                  <span className="font-mono text-[11px] text-[#7a2417]">
                    {detectedLocation.pincode}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#715e50]">
                {detectedLocation.formattedAddress}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {/* State Selector */}
            <div>
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                State <span className="text-[#7a2417]">*</span>
              </label>
              <select
                value={selectedStateId}
                onChange={(e) => {
                  onStateChange(e.target.value);
                  onCityChange("", "");
                  onAreaChange("", "", "");
                  setGpsError(null);
                }}
                disabled={loadingStates}
                className="h-9.5 sm:h-10 lg:h-[42px] w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10"
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
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                City <span className="text-[#7a2417]">*</span>
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => {
                  const chosenCity = cities.find((c) => c.id === e.target.value);
                  onCityChange(e.target.value, chosenCity?.name || "");
                  onAreaChange("", "", "");
                  setGpsError(null);
                }}
                disabled={!selectedStateId || loadingCities}
                className="h-9.5 sm:h-10 lg:h-[42px] w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
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
              <label className="mb-1 block text-[11.5px] sm:text-[12px] font-semibold text-[#24130f]">
                Delivery Area / Hub <span className="text-[#7a2417]">*</span>
              </label>
              <select
                value={selectedAreaId}
                onChange={(e) => {
                  handleAreaSelect(e.target.value);
                  setGpsError(null);
                }}
                disabled={!selectedCityId || loadingAreas}
                className="h-9.5 sm:h-10 lg:h-[42px] w-full cursor-pointer rounded-xl border border-[#ddd2c7] bg-white px-3 text-[12.5px] sm:text-[13px] font-medium text-[#24130f] outline-none transition focus:border-[#7a2417] focus:ring-2 focus:ring-[#7a2417]/10 disabled:opacity-50"
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

          <div
            role="status"
            aria-live="polite"
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11.5px] sm:text-[12px] ${
              isAreaServiceable
                ? "border-[#cce3cf] bg-[#f0f8f0] text-[#326d3c]"
                : "border-[#e8dfd4] bg-[#faf6f0] text-[#715e50]"
            }`}
          >
            {isAreaServiceable ? (
              <>
                <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-[#39834a]" />
                <span>
                  Delivery available in <strong>{selectedAreaName}</strong>
                  {selectedCityName ? `, ${selectedCityName}` : ""}
                  {activePincode ? ` (${activePincode})` : ""}.
                </span>
              </>
            ) : (
              <>
                <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#7a2417]" />
                <span>
                  {selectedStateId && selectedCityId
                    ? "Please select your Delivery Area / Hub to confirm service availability."
                    : "Select your State, City, and Delivery Area to check availability."}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-stretch border-t border-[#eee5db] pt-3 sm:justify-end">
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!isAreaServiceable}
          onClick={onContinue}
          className="min-h-9.5 sm:min-h-10 lg:h-[42px] w-full rounded-xl bg-[#7a2417] px-5 text-[12.5px] sm:text-[13px] font-semibold text-white shadow-sm hover:bg-[#5f1b12] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[min(100%,300px)] cursor-pointer"
        >
          <span>Continue to Delivery Address</span>
          <FiArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </m.section>
  );
}
