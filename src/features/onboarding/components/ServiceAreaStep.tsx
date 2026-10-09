"use client";

import React, { useState, useEffect, useRef } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  FiArrowLeft,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import {
  locationApi,
  StateItem,
  CityItem,
  AreaItem,
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
  // Server-Side Location Catalog State
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initial load of States from puretyfarm-server
  useEffect(() => {
    let isMounted = true;
    async function loadStates() {
      setLoadingStates(true);
      setLoadError(null);
      try {
        const stateList = await locationApi.getStates();
        if (isMounted) {
          setStates(stateList);
          // If only 1 state available (e.g. Chhattisgarh), auto-select it
          if (stateList.length === 1 && !selectedStateId) {
            onStateChange(stateList[0].id);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load states";
          setLoadError(msg);
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
          // If only 1 city available (e.g. Raipur), auto-select it
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

  // Handle Area Selection
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

  const selectedAreaName = selectedAreaObj?.name || "";
  const selectedCityName = selectedCityObj?.name || "";
  const activePincode = selectedAreaPincode || selectedAreaObj?.pincode || "";
  const isAreaServiceable = Boolean(selectedAreaId && selectedCityId && selectedStateId);

  return (
    <m.section
      key="service-area-step"
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
              Select your State, City, and Delivery Hub for morning milk delivery.
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

        <div className="space-y-3.5 rounded-xl border border-[#e8dfd4] bg-white p-3.5 sm:p-4.5 shadow-2xs">
          {loadError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800"
            >
              {loadError}
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
