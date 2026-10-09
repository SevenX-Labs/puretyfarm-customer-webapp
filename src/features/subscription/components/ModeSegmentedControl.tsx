"use client";

import React, { useRef, KeyboardEvent } from "react";
import { DeliveryMode } from "../types";
import { FiLayers, FiRepeat } from "react-icons/fi";

interface ModeSegmentedControlProps {
  value: DeliveryMode;
  onChange: (value: DeliveryMode) => void;
  day1Litres: number;
  day2Litres: number;
  disabled?: boolean;
}

export function ModeSegmentedControl({
  value,
  onChange,
  day1Litres,
  day2Litres,
  disabled = false,
}: ModeSegmentedControlProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const modeOptions = [
    {
      id: "fixed" as const,
      label: "Fixed daily volume",
      sublabel: "Same volume every delivery",
      icon: FiLayers,
    },
    {
      id: "pattern" as const,
      label: `${day1Litres}L Day 1 → ${day2Litres}L Day 2`,
      sublabel: "Alternating delivery sequence",
      icon: FiRepeat,
    },
  ];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (disabled) return;
    let nextIndex = currentIndex;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % modeOptions.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + modeOptions.length) % modeOptions.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = modeOptions.length - 1;
    }

    if (nextIndex !== currentIndex) {
      onChange(modeOptions[nextIndex].id);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-2.5">
      <label
        id="mode-segmented-label"
        className="text-xs font-bold text-[#1A1008] uppercase tracking-wider block"
      >
        Quantity Pattern Mode
      </label>

      <div
        role="radiogroup"
        aria-labelledby="mode-segmented-label"
        className="p-1.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] grid grid-cols-1 sm:grid-cols-2 gap-1.5 shadow-2xs"
      >
        {modeOptions.map((opt, index) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                min-h-[46px] px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer outline-none
                flex items-center gap-3 select-none
                focus-visible:ring-2 focus-visible:ring-[#5C1B13] focus-visible:ring-offset-2
                ${
                  isSelected
                    ? "bg-[#5C1B13] text-white shadow-xs"
                    : "bg-transparent text-[#3A241C] hover:bg-[#FAF3EA]"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#5C1B13]/10 text-[#5C1B13]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">
                  {opt.label}
                </p>
                <p
                  className={`text-[10.5px] leading-snug mt-0.5 ${
                    isSelected ? "text-white/80" : "text-[#715E50]"
                  }`}
                >
                  {opt.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
