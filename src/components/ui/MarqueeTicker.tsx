"use client";

import { FLAGS } from "@/config/flags";
import {
  FiShield,
  FiCheckCircle,
  FiPackage,
  FiThermometer,
  FiClock,
  FiDroplet,
  FiMapPin,
  FiStar,
} from "react-icons/fi";

const TICKER_ITEMS = [
  { icon: FiShield, text: "100% Desi Gir Cows", color: "text-[#5C1B13]" },
  ...(FLAGS.SHOW_40_TESTS_CLAIM
    ? [{ icon: FiCheckCircle, text: "Tested for 40+ Adulterants & Heavy Metals", color: "text-emerald-700" }]
    : []),
  { icon: FiPackage, text: "Sanitized Eco Glass Bottles", color: "text-[#5C1B13]" },
  { icon: FiThermometer, text: "Chilled to 4°C Farm-to-Doorstep", color: "text-blue-600" },
  { icon: FiClock, text: "Delivered Before 10:00 AM Daily", color: "text-[#5C1B13]" },
  { icon: FiDroplet, text: "Zero Added Water, Hormones, or Preservatives", color: "text-emerald-600" },
  { icon: FiMapPin, text: "Serving All Major Localities Across Raipur", color: "text-amber-600" },
  { icon: FiStar, text: "7-Day Trial — Non-Refundable Deposit", color: "text-amber-600" },
];

export function MarqueeTicker({ className = "" }: { className?: string }) {
  // Duplicate list to create a seamless infinite loop
  const duplicatedItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      aria-label="PuretyFarm Key Highlights"
      className={`relative w-full overflow-hidden bg-gradient-to-r from-[#FAF3EA] via-[#FFFDF7] to-[#FAF3EA] py-3.5 border-y border-[#E8DFD4] select-none ${className}`}
    >
      {/* Edge gradient masks for smooth fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAF3EA] to-transparent z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF3EA] to-transparent z-10"
      />

      <div className="animate-marquee flex items-center">
        {duplicatedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 mx-6 sm:mx-8 text-xs sm:text-sm font-semibold text-[#3A241C]"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
              <span className="whitespace-nowrap">{item.text}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C1B13]/30 mx-3" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
