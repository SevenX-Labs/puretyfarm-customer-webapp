"use client";

import { FiShield, FiClock, FiDroplet, FiThermometer } from "react-icons/fi";
import { FaCow, FaLeaf } from "react-icons/fa6";

const BENEFITS = [
  {
    icon: FiShield,
    iconColor: "text-[#5C1B13]",
    iconBg: "bg-[#5C1B13]/10",
    title: "Risk-Free 7-Day Trial",
    subtitle: "Money-Back Guarantee",
  },
  {
    icon: FaCow,
    iconColor: "text-[#8C3A24]",
    iconBg: "bg-[#8C3A24]/10",
    title: "100% Desi Gir Cows",
    subtitle: "A2 Rich Milk",
  },
  {
    icon: FaLeaf,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-700/10",
    title: "Sanitized Eco Glass Bottles",
    subtitle: "Hygienic & Safe",
  },
  {
    icon: FiThermometer,
    iconColor: "text-sky-700",
    iconBg: "bg-sky-700/10",
    title: "Chilled to 4°C",
    subtitle: "Farm-to-Doorstep",
  },
  {
    icon: FiClock,
    iconColor: "text-[#5C1B13]",
    iconBg: "bg-[#5C1B13]/10",
    title: "Delivered Before 10:00 AM",
    subtitle: "Daily",
  },
  {
    icon: FiDroplet,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-700/10",
    title: "Zero Added Water",
    subtitle: "Pure & Natural",
  },
] as const;

// 4 copies create a 2-half set (2 copies in the first 50%, 2 copies in the second 50%)
// ensuring a seamless infinite right-to-left loop on every screen width (including ultra-wide displays)
const LOOPED_BENEFITS = [...BENEFITS, ...BENEFITS, ...BENEFITS, ...BENEFITS];

export function HeroBenefitBar() {
  return (
    <div
      role="region"
      aria-label="PuretyFarm Key Benefits"
      className="w-full bg-white border-t border-[#ECE4DA] relative z-20 py-3 sm:py-3.5 overflow-hidden shadow-[0_-2px_12px_rgba(26,16,8,0.02)] select-none"
    >
      {/* Edge gradient masks for seamless fade on left and right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10"
      />

      {/* Infinite right-to-left marquee track */}
      <div
        className="animate-marquee flex items-center will-change-transform hover:[animation-play-state:paused]"
        style={{ animationDuration: "35s" }}
      >
        {LOOPED_BENEFITS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 sm:gap-3.5 px-3 sm:px-4 py-1 rounded-xl hover:bg-[#FDFBF7] transition-colors duration-150 group shrink-0 cursor-default"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-2xs`}
              >
                <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${item.iconColor}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] sm:text-[13px] font-bold text-[#1A1008] leading-tight tracking-tight whitespace-nowrap">
                  {item.title}
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-[#6B584C] font-medium leading-tight whitespace-nowrap mt-0.5">
                  {item.subtitle}
                </span>
              </div>
              {/* Vertical hair-line separator after each item */}
              <div
                className="h-5 sm:h-6 w-px bg-[#ECE4DA] ml-3 sm:ml-4 shrink-0"
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
