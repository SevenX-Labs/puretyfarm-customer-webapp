"use client";

import React, { useRef } from "react";
import { FiMinus, FiPlus, FiBox } from "react-icons/fi";
import { MIN_LITRES, MAX_LITRES } from "../pricing";

interface QuantityStepperProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (value: number) => void;
  showChips?: boolean;
  disabled?: boolean;
}

export function QuantityStepper({
  label,
  sublabel,
  value,
  onChange,
  showChips = true,
  disabled = false,
}: QuantityStepperProps) {
  const valueDisplayRef = useRef<HTMLDivElement>(null);

  const canDecrease = value > MIN_LITRES && !disabled;
  const canIncrease = value < MAX_LITRES && !disabled;

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      onChange(value + 1);
    }
  };

  const handleChipClick = (qty: number) => {
    if (!disabled && qty >= MIN_LITRES && qty <= MAX_LITRES) {
      onChange(qty);
    }
  };

  const chipOptions = Array.from(
    { length: MAX_LITRES - MIN_LITRES + 1 },
    (_, i) => MIN_LITRES + i
  );

  return (
    <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] space-y-3.5 shadow-2xs">
      {/* Top row: Label & Stepper Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <FiBox className="w-4 h-4 text-[#5C1B13] shrink-0" />
            <h4 className="text-sm font-bold text-[#1A1008] truncate">
              {label}
            </h4>
          </div>
          {sublabel && (
            <p className="text-[11px] text-[#715E50] mt-0.5 leading-snug">
              {sublabel}
            </p>
          )}
        </div>

        {/* Stepper buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={!canDecrease}
            aria-label={`Decrease ${label} to ${value - 1} Litres`}
            className={`
              w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer
              outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]
              ${
                canDecrease
                  ? "border-[#E8DFD4] bg-white text-[#1A1008] hover:border-[#5C1B13] hover:bg-[#FAF3EA] active:scale-95"
                  : "border-[#E8DFD4]/50 bg-stone-100 text-stone-300 cursor-not-allowed"
              }
            `}
          >
            <FiMinus className="w-4 h-4" />
          </button>

          {/* Volume Indicator */}
          <div
            ref={valueDisplayRef}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="w-14 h-10 px-1 rounded-xl bg-white border border-[#E8DFD4] flex flex-col items-center justify-center text-center shadow-xs"
          >
            <span className="text-sm font-black text-[#5C1B13] font-mono leading-none">
              {value}L
            </span>
            <span className="text-[9px] font-medium text-[#715E50] leading-none mt-0.5">
              {value} Litre{value > 1 ? "s" : ""}
            </span>
          </div>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={!canIncrease}
            aria-label={`Increase ${label} to ${value + 1} Litres`}
            className={`
              w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer
              outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]
              ${
                canIncrease
                  ? "border-[#E8DFD4] bg-white text-[#1A1008] hover:border-[#5C1B13] hover:bg-[#FAF3EA] active:scale-95"
                  : "border-[#E8DFD4]/50 bg-stone-100 text-stone-300 cursor-not-allowed"
              }
            `}
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Chips (1L, 2L, 3L, 4L, 5L) */}
      {showChips && (
        <div className="pt-3 border-t border-[#E8DFD4]/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#715E50]">
              Quick Volume Select
            </span>
            <span className="text-[10px] text-[#715E50]">1L – 5L per delivery</span>
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
                    min-h-[40px] py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer
                    flex items-center justify-center border outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13]
                    ${
                      isSelected
                        ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-xs"
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
