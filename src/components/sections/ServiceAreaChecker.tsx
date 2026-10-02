"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { checkServiceArea, ServiceAreaResult } from "@/lib/serviceArea";
import { SERVICEABLE_AREAS } from "@/data/serviceableAreas";
import { handleTrialClick, getWhatsAppUrl } from "@/lib/cta";

const POPULAR_AREAS = [
  "Shankar Nagar",
  "VIP Road",
  "Telibandha",
  "Civil Lines",
  "Samta Colony",
  "Devendra Nagar",
];

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
          <span className="inline-flex items-center gap-2 bg-[#5C1B13]/10 border border-[#5C1B13]/20 text-[#5C1B13] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4">
            📍 Delivery Coverage
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3A241C]/40 hover:text-[#1A1008]"
                  aria-label="Clear input"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
              className="mt-6 p-5 sm:p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fade-in"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Service Active
                    </span>
                    <span className="text-xs text-emerald-800/70">5:30 AM – 7:00 AM Delivery</span>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 mt-1">
                    Great news! We deliver to {checkedArea}
                  </h3>
                  <p className="text-sm text-emerald-800/90 mt-1 leading-relaxed">
                    Fresh, unadulterated A2 Gir cow milk in sanitized glass bottles is ready for morning dispatch to your doorstep.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button variant="primary" size="md" onClick={handleTrialClick}>
                      Start 7-Day Trial in {checkedArea}
                    </Button>
                    <a
                      href={getWhatsAppUrl(`Hi PuretyFarm, I verified delivery for ${checkedArea} and would like to start my trial.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-800 bg-white border border-emerald-300 px-4 py-2.5 rounded-xl hover:bg-emerald-100/50 transition-colors"
                    >
                      <span>💬 Chat on WhatsApp</span>
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
              <div className="w-16 h-16 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] mx-auto flex items-center justify-center text-3xl mb-4">
                🥛
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.761.814 2.791.814 3.18 0 5.766-2.587 5.767-5.766.001-3.182-2.585-5.768-5.767-5.768zm3.376 8.167c-.145.411-.741.776-1.026.822-.27.043-.618.067-2.001-.508-1.503-.625-2.482-2.148-2.558-2.248-.074-.1-1.006-1.336-1.006-2.548 0-1.213.633-1.808.859-2.051.226-.243.493-.304.657-.304.164 0 .328.003.473.01.152.008.358-.058.558.423.208.498.711 1.733.774 1.86.062.128.104.278.02.443-.082.164-.124.267-.248.411-.124.145-.262.324-.374.436-.124.124-.253.259-.109.507.145.248.643 1.061 1.381 1.718.951.848 1.753 1.111 2.001 1.235.248.124.394.104.539-.062.145-.164.622-.724.787-.972.164-.248.33-.207.558-.124.227.083 1.442.68 1.69.804.248.124.413.186.474.29.062.103.062.597-.083 1.008z" />
                  </svg>
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
