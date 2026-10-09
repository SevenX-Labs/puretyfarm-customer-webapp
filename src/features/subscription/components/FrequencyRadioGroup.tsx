"use client";

import React, { useRef, KeyboardEvent } from "react";
import { DeliveryFrequency } from "../types";
import { FiSun, FiCalendar, FiCheck } from "react-icons/fi";

interface FrequencyRadioGroupProps {
  value: DeliveryFrequency;
  onChange: (value: DeliveryFrequency) => void;
  disabled?: boolean;
}

const FREQUENCY_OPTIONS = [
  {
    id: "daily" as const,
    title: "Every day",
    badge: "DAILY",
    scheduleText: "30 deliveries per 30-day cycle",
    description: "Chilled bottle delivered every morning before 10 AM.",
    icon: FiSun,
  },
  {
    id: "alternate" as const,
    title: "Alternate days",
    badge: "ALTERNATE",
    scheduleText: "15 deliveries per 30-day cycle",
    description: "Chilled bottle delivered every alternate morning.",
    icon: FiCalendar,
  },
];

export function FrequencyRadioGroup({
  value,
  onChange,
  disabled = false,
}: FrequencyRadioGroupProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, currentIndex: number) => {
    if (disabled) return;
    let nextIndex = currentIndex;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % FREQUENCY_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + FREQUENCY_OPTIONS.length) % FREQUENCY_OPTIONS.length;
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(FREQUENCY_OPTIONS[currentIndex].id);
      return;
    }

    if (nextIndex !== currentIndex) {
      onChange(FREQUENCY_OPTIONS[nextIndex].id);
      cardRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-2.5">
      <label
        id="frequency-radiogroup-label"
        className="text-xs font-bold text-[#1A1008] uppercase tracking-wider block"
      >
        Delivery Frequency
      </label>

      <div
        role="radiogroup"
        aria-labelledby="frequency-radiogroup-label"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {FREQUENCY_OPTIONS.map((opt, index) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={disabled}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => !disabled && onChange(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`${opt.title}, ${opt.scheduleText}, ${opt.description}`}
              className={`
                min-h-[44px] p-4 rounded-2xl border-2 cursor-pointer transition-all outline-none
                flex flex-col justify-between text-left select-none relative
                focus-visible:ring-2 focus-visible:ring-[#5C1B13] focus-visible:ring-offset-2
                ${
                  isSelected
                    ? "bg-[#FAF3EA] border-[#5C1B13] shadow-sm shadow-[#5C1B13]/10"
                    : "bg-[#FFFDF7] border-[#E8DFD4] hover:border-[#5C1B13]/40 hover:bg-[#FAF8F5]"
                }
                ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {/* Top row: Icon, Badge, Radio dot */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#5C1B13] text-white" : "bg-[#5C1B13]/10 text-[#5C1B13]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap ${
                      isSelected
                        ? "bg-[#5C1B13] text-white"
                        : "bg-white border border-[#E8DFD4] text-[#715E50]"
                    }`}
                  >
                    {opt.badge}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-[#5C1B13] bg-[#5C1B13] text-white"
                        : "border-[#D8C7B5] bg-white"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Title & Schedule */}
              <div>
                <p className="text-sm font-bold text-[#1A1008] leading-tight">
                  {opt.title}
                </p>
                <p className="text-xs font-semibold text-[#5C1B13] mt-1">
                  {opt.scheduleText}
                </p>
                <p className="text-[11.5px] text-[#715E50] mt-1 leading-snug">
                  {opt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
