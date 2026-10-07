"use client";

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Address } from "@/types/models";
import { AddressFormData } from "../types";
import { FiX, FiLayers, FiMapPin } from "react-icons/fi";
import {
  locationApi,
  StateItem,
  CityItem,
  AreaItem,
} from "@/features/location/api/locationApi";

export interface AddressModalProps {
  isOpen: boolean;
  editingAddress: Address | null;
  addressForm: AddressFormData;
  addressSaving: boolean;
  onClose: () => void;
  onChangeForm: (form: AddressFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddressModal({
  isOpen,
  editingAddress,
  addressForm,
  addressSaving,
  onClose,
  onChangeForm,
  onSubmit,
}: AddressModalProps) {
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");

  // Load States
  useEffect(() => {
    if (!isOpen) return;
    async function fetchStates() {
      try {
        const stateList = await locationApi.getStates();
        setStates(stateList);
        if (stateList.length === 1) {
          setSelectedStateId(stateList[0].id);
        }
      } catch (err) {
        console.warn("Failed to load states:", err);
      }
    }
    fetchStates();
  }, [isOpen]);

  // Load Cities
  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      setSelectedCityId("");
      return;
    }
    async function fetchCities() {
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
      }
    }
    fetchCities();
  }, [selectedStateId]);

  // Load Areas
  useEffect(() => {
    if (!selectedCityId) {
      setAreas([]);
      setSelectedAreaId("");
      return;
    }
    async function fetchAreas() {
      try {
        const areaList = await locationApi.getAreas(selectedCityId);
        setAreas(areaList);
      } catch (err) {
        console.warn("Failed to load areas:", err);
      }
    }
    fetchAreas();
  }, [selectedCityId]);

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const chosen = areas.find((a) => a.id === areaId);
    if (chosen) {
      onChangeForm({
        ...addressForm,
        locality: chosen.name,
        pincode: chosen.pincode || addressForm.pincode,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD4] mb-4">
              <h3 className="text-base font-bold text-[#1A1008] flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-[#5C1B13]" />
                <span>{editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}</span>
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5">
              {/* Active Location Selection */}
              {states.length > 0 && (
                <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD4] space-y-2">
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1">
                    <FiLayers className="w-3.5 h-3.5 text-[#5C1B13]" />
                    <span>Service Delivery Hub</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={selectedStateId}
                      onChange={(e) => setSelectedStateId(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-[#E8DFD4] bg-white text-[11px] font-semibold text-[#1A1008] focus:outline-none"
                    >
                      <option value="">State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      disabled={!selectedStateId}
                      className="px-2 py-1.5 rounded-lg border border-[#E8DFD4] bg-white text-[11px] font-semibold text-[#1A1008] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">City</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedAreaId}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      disabled={!selectedCityId}
                      className="px-2 py-1.5 rounded-lg border border-[#E8DFD4] bg-white text-[11px] font-semibold text-[#1A1008] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Area/Hub</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => onChangeForm({ ...addressForm, fullName: e.target.value })}
                    placeholder="e.g. Sahil Hode"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => onChangeForm({ ...addressForm, phone: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                  House / Flat / Building / Street *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => onChangeForm({ ...addressForm, street: e.target.value })}
                  placeholder="e.g. Flat 402, Building A, Hill Road"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Locality / Delivery Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.locality}
                    onChange={(e) => onChangeForm({ ...addressForm, locality: e.target.value })}
                    placeholder="e.g. Bandra West, Shankar Nagar"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => onChangeForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="400050"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => onChangeForm({ ...addressForm, landmark: e.target.value })}
                  placeholder="e.g. Near Mehboob Studio"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-medium text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1008] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => onChangeForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-[#5C1B13] focus:ring-[#5C1B13]"
                  />
                  <span>Set as default morning delivery address</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={addressSaving}
                  className="rounded-xl py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white"
                >
                  {addressSaving ? "Saving Address..." : "Save Delivery Address"}
                </Button>
              </div>
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
