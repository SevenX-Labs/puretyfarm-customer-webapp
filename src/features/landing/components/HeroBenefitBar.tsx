"use client";

import Link from "next/link";
import { FiShield, FiClock, FiDroplet, FiThermometer } from "react-icons/fi";
import { FaCow, FaLeaf } from "react-icons/fa6";

const BENEFITS = [
  {
    icon: FiShield,
    iconColor: "text-[#5C1B13]",
    iconBg: "bg-[#5C1B13]/10",
    title: "7-Day Trial Plan",
    subtitle: "Non-Refundable Deposit",
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
          const isTrial = item.title === "7-Day Trial Plan";
          const cardContent = (
            <div
              className={`flex items-center gap-3 sm:gap-3.5 px-3 sm:px-4 py-1 rounded-xl hover:bg-[#FDFBF7] transition-colors duration-150 group shrink-0 ${isTrial ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-2xs`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.iconColor}`} />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <span className={`text-xs sm:text-[13px] font-bold tracking-tight ${isTrial ? "text-[#5C1B13] underline decoration-[#5C1B13]/30 underline-offset-2" : "text-[#1A1008]"}`}>
                  {item.title}
                </span>
                <span className="text-[#C4B5A5] text-[10px] sm:text-xs select-none" aria-hidden="true">
                  •
                </span>
                <span className="text-[11px] sm:text-xs text-[#6B584C] font-medium">
                  {item.subtitle}
                </span>
              </div>
              {/* Vertical hair-line separator after each item */}
              <div
                className="h-4 sm:h-5 w-px bg-[#ECE4DA] ml-3 sm:ml-4 shrink-0"
                aria-hidden="true"
              />
            </div>
          );

          return isTrial ? (
            <Link key={idx} href="/account?tab=subscription">
              {cardContent}
            </Link>
          ) : (
            <div key={idx}>{cardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
