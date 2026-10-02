"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { checkServiceArea, ServiceAreaResult } from "@/lib/serviceArea";
import { SERVICEABLE_AREAS } from "@/data/serviceableAreas";
import { handleTrialClick, getWhatsAppUrl } from "@/lib/cta";
import {
  FiMapPin,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiZap,
  FiTruck,
  FiHome,
  FiArrowRight,
  FiPackage,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const POPULAR_AREAS = [
  "Shankar Nagar",
  "VIP Road",
  "Telibandha",
  "Civil Lines",
  "Samta Colony",
  "Devendra Nagar",
];

import confetti from "canvas-confetti";

export function ServiceAreaChecker() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ServiceAreaResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkedArea, setCheckedArea] = useState<string>("");

  const handleCheck = (areaName?: string) => {
    const target = (areaName ?? query).trim();

    if (!target) {
      setErrorMessage("Please enter your Raipur locality or colony name to check delivery.");
      setResult(null);
      return;
    }

    if (target.length < 2) {
      setErrorMessage("Please enter at least 2 characters for locality lookup.");
      setResult(null);
      return;
    }

    setErrorMessage(null);
    setCheckedArea(target);
    const res = checkServiceArea(target);
    setResult(res);

    if (res.serviceable) {
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#F5E729", "#5C1B13", "#10B981", "#FFFDF7"],
      });
    }
  };

  const handleChipClick = (area: string) => {
    setQuery(area);
    handleCheck(area);
  };

  const handleReset = () => {
    setQuery("");
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <Section background="cream" id="service-area">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-[#5C1B13]/10 border border-[#5C1B13]/20 text-[#5C1B13] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
            <FiMapPin className="w-3.5 h-3.5" />
            <span>Delivery Coverage</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight">
            Check If We Deliver to Your Door
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#3A241C]/80 max-w-xl mx-auto">
            We deliver chilled raw A2 Gir cow milk before 7:00 AM daily across Raipur localities.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8DFD4] shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheck();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A241C]/40">
                <FiMapPin className="w-5 h-5 text-[#5C1B13]" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter locality e.g. Shankar Nagar, Telibandha"
                className="w-full pl-10 pr-10 py-3 text-base text-[#1A1008] bg-[#FFFDF7] border border-[#E8DFD4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all placeholder:text-[#3A241C]/40"
                aria-label="Enter your Raipur locality"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3A241C]/40 hover:text-[#1A1008] cursor-pointer"
                  aria-label="Clear input"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="whitespace-nowrap">
              Check Availability
            </Button>
          </form>

          {/* Quick Area Chips */}
          <div className="mt-4 pt-3 border-t border-[#E8DFD4]/60">
            <p className="text-xs text-[#3A241C]/60 mb-2 font-medium">Popular delivery hubs:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleChipClick(area)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    query.toLowerCase() === area.toLowerCase()
                      ? "bg-[#5C1B13] text-white border-[#5C1B13]"
                      : "bg-[#FBF6EE] text-[#3A241C] border-[#E8DFD4] hover:border-[#5C1B13]/30 hover:bg-white"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* ─── ERROR STATE (Item 15) ─── */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-fade-in"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mt-0.5">
                <FiAlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Input Required</p>
                <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* ─── SUCCESS STATE (Item 16) ─── */}
          {result && result.serviceable && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border-2 border-emerald-500/30 text-emerald-950 shadow-lg shadow-emerald-900/5 animate-fade-in"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <FiCheck className="w-6 h-6" strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                      <FiZap className="w-3.5 h-3.5" />
                      <span>Active Delivery Zone</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      Morning Slot: 5:30 AM – 7:00 AM
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 font-[family-name:var(--font-heading)] mt-2">
                    Confirmed! We deliver to {checkedArea}
                  </h3>

                  <p className="text-sm text-emerald-900/80 mt-1.5 leading-relaxed">
                    Fresh, chilled A2 Gir cow milk in sanitized glass bottles is ready for morning dispatch to your doorstep.
                  </p>

                  {/* Morning Delivery Breadcrumb Route */}
                  <div className="mt-4 p-3 rounded-xl bg-white/90 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-emerald-900 inline-flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>VIP Road Chilling Hub</span>
                    </span>
                    <FiArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold text-emerald-900 inline-flex items-center gap-1.5">
                      <FiTruck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>4°C Cold Van</span>
                    </span>
                    <FiArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold text-[#5C1B13] inline-flex items-center gap-1.5">
                      <FiHome className="w-3.5 h-3.5 text-[#5C1B13]" />
                      <span>{checkedArea} Doorstep</span>
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button variant="primary" size="md" onClick={handleTrialClick} className="shadow-md shadow-[#5C1B13]/20">
                      Start 7-Day Trial in {checkedArea}
                    </Button>
                    <a
                      href={getWhatsAppUrl(`Hi PuretyFarm, I verified delivery for ${checkedArea} and would like to start my trial.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-900 bg-white border border-emerald-300 px-4 py-2.5 rounded-xl hover:bg-emerald-100/50 transition-colors shadow-xs"
                    >
                      <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                      <span>Confirm on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── EMPTY STATE (Item 12) ─── */}
          {result && !result.serviceable && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 p-6 sm:p-7 rounded-2xl bg-[#FFFDF7] border-2 border-dashed border-[#E8DFD4] text-center animate-fade-in"
            >
              {/* Empty state illustration */}
              <div className="w-16 h-16 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] mx-auto flex items-center justify-center mb-4">
                <FiPackage className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E729]/30 text-[#1A1008] text-xs font-semibold mb-2">
                <span>Expanding Soon</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                We don&apos;t deliver to &ldquo;{checkedArea}&rdquo; yet
              </h3>

              <p className="text-sm text-[#3A241C]/75 max-w-md mx-auto mt-2 leading-relaxed">
                Our farm cold-chain vehicles currently service 23+ prime Raipur sectors. We expand to new localities based on family demand!
              </p>

              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppUrl(`Hi PuretyFarm team, please start A2 cow milk delivery in ${checkedArea}, Raipur!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>Request {checkedArea} on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#E8DFD4] text-sm font-semibold text-[#3A241C] hover:bg-white transition-colors"
                >
                  Try Another Locality
                </button>
              </div>

              {/* Active areas list preview */}
              <div className="mt-5 pt-4 border-t border-[#E8DFD4]/60 text-left">
                <p className="text-xs font-semibold text-[#1A1008] mb-2">
                  Currently active delivery sectors in Raipur ({SERVICEABLE_AREAS.length} areas):
                </p>
                <p className="text-xs text-[#3A241C]/70 leading-relaxed">
                  {SERVICEABLE_AREAS.join(" • ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
