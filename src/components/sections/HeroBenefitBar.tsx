"use client";

import { FiShield, FiClock, FiDroplet, FiThermometer } from "react-icons/fi";
import { FaCow, FaLeaf } from "react-icons/fa6";

const BENEFITS = [
  {
    icon: FiShield,
    iconColor: "text-[#5C1B13]",
    iconBg: "bg-[#5C1B13]/10",
    title: "Risk-Free 7-Day Trial",
    subtitle: "No Deposit",
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
    title: "Delivered Before 7:00 AM",
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

export function HeroBenefitBar() {
  return (
    <div className="w-full bg-white border-t border-[#ECE4DA] relative z-20 py-3.5 sm:py-4 px-3 sm:px-6 shadow-[0_-2px_12px_rgba(26,16,8,0.02)]">
      <div className="max-w-7xl mx-auto">
        {/* Desktop 6-column row matching reference layout */}
        <div className="hidden lg:grid lg:grid-cols-6 divide-x divide-[#ECE4DA] items-center">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-3 xl:px-4 py-1 group hover:bg-[#FDFBF7] rounded-xl transition-colors duration-150"
              >
                <Icon className="w-5 h-5 xl:w-[22px] xl:h-[22px] text-[#3E2D24] shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12.5px] xl:text-[13px] font-bold text-[#1A1008] leading-tight tracking-tight whitespace-nowrap">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#6B584C] leading-tight whitespace-nowrap mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet / Mobile Grid (3 cols on tablet, 2 cols on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden gap-2 sm:gap-3 min-w-0">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECE4DA] shadow-2xs min-w-0 overflow-hidden"
              >
                <Icon className="w-4 h-4 text-[#3E2D24] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-xs font-bold text-[#1A1008] leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[8.5px] sm:text-[10px] text-[#6B584C] leading-tight mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
