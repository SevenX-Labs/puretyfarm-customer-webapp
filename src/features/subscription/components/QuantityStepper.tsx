"use client";

import React from "react";
import { FiMinus, FiPlus, FiPackage } from "react-icons/fi";
import { MIN_LITRES, MAX_LITRES } from "../pricing";

interface QuantityStepperProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  showChips?: boolean;
}

export function QuantityStepper({
  label,
  sublabel,
  value,
  onChange,
  min = MIN_LITRES,
  max = MAX_LITRES,
  disabled = false,
  showChips = false,
}: QuantityStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  const handleDecrease = () => {
    if (canDecrease) {
      const next = Math.max(min, Math.min(max, value - 1));
      onChange(next);
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      const next = Math.max(min, Math.min(max, value + 1));
      onChange(next);
    }
  };

  const handleChipClick = (chipVal: number) => {
    if (!disabled && chipVal >= min && chipVal <= max) {
      onChange(chipVal);
    }
  };

  const chipOptions = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <FiPackage className="w-3.5 h-3.5 text-[#5C1B13] shrink-0" />
            <span className="text-xs font-bold text-[#1A1008] truncate">{label}</span>
          </div>
          {sublabel && (
            <p className="text-[11px] text-[#3A241C]/70 mt-0.5 leading-snug">{sublabel}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Decrease button - min 44x44px tap target */}
          <button
            type="button"
            onClick={handleDecrease}
            disabled={!canDecrease}
            aria-label={`Decrease ${label} to ${value - 1} Litres`}
            className={`
              w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer
              outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]
              ${
                canDecrease
                  ? "border-[#E8DFD4] bg-white text-[#1A1008] hover:border-[#5C1B13] hover:bg-[#FAF3EA] active:scale-95"
                  : "border-[#E8DFD4]/50 bg-gray-50 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <FiMinus className="w-4 h-4" />
          </button>

          {/* Value badge */}
          <div className="min-w-[64px] px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DFD4] text-center shadow-2xs">
            <span className="text-sm font-extrabold text-[#5C1B13] font-mono block">
              {value}L
            </span>
            <span className="text-[10px] text-[#3A241C]/70 block font-sans">
              {value === 1 ? "1 Litre" : `${value} Litres`}
            </span>
          </div>

          {/* Increase button - min 44x44px tap target */}
          <button
            type="button"
            onClick={handleIncrease}
            disabled={!canIncrease}
            aria-label={`Increase ${label} to ${value + 1} Litres`}
            className={`
              w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer
              outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]
              ${
                canIncrease
                  ? "border-[#E8DFD4] bg-white text-[#1A1008] hover:border-[#5C1B13] hover:bg-[#FAF3EA] active:scale-95"
                  : "border-[#E8DFD4]/50 bg-gray-50 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Chips (1L, 2L, 3L, 4L, 5L) - synced with stepper */}
      {showChips && (
        <div className="pt-2 border-t border-[#E8DFD4]/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A241C]/70">
              Quick Volume Select
            </span>
            <span className="text-[10px] text-[#3A241C]/60">1L – 5L per delivery</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Quick volume selection chips">
            {chipOptions.map((chip) => {
              const isSelected = value === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={`${chip} Litre${chip > 1 ? "s" : ""}`}
                  className={`
                    min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer
                    flex items-center justify-center border outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]
                    ${
                      isSelected
                        ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-xs scale-[1.02]"
                        : "bg-white text-[#1A1008] border-[#E8DFD4] hover:border-[#5C1B13]/40 hover:bg-[#FAF3EA] active:scale-95"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {chip}L
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
