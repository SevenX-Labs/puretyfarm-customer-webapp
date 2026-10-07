"use client";

import React from "react";
import { PricingResult, DeliveryDatePreviewItem } from "../types";
import { CUT_OFF_HOUR } from "../pricing";
import { FiClock, FiShield, FiCalendar } from "react-icons/fi";

interface PricingSummaryProps {
  result: PricingResult;
  schedulePreview?: DeliveryDatePreviewItem[];
}

export function PricingSummary({ result, schedulePreview }: PricingSummaryProps) {
  const {
    totalDeliveries,
    totalLitres,
    totalPrice,
    breakdownText,
    pricePerLitre,
    mode,
    fixedLitres,
    day1Litres,
    day2Litres,
  } = result;

  const perDeliveryText =
    mode === "fixed"
      ? `₹${(fixedLitres * pricePerLitre).toLocaleString("en-IN")} per delivery`
      : day1Litres === day2Litres
      ? `₹${(day1Litres * pricePerLitre).toLocaleString("en-IN")} per delivery`
      : `₹${(day1Litres * pricePerLitre).toLocaleString("en-IN")} / ₹${(day2Litres * pricePerLitre).toLocaleString("en-IN")} per delivery`;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="p-4 sm:p-5 rounded-2xl bg-[#FAF3EA] border border-[#E8DFD4] space-y-3.5 shadow-2xs"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD4]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1B13] block">
            Plan Summary (30-Day Cycle)
          </span>
          <p className="text-xs font-medium text-[#3A241C]/80 mt-0.5">
            {totalDeliveries} total doorstep deliveries
          </p>
          <span className="text-[11px] font-semibold text-[#5C1B13] block mt-0.5">
            {perDeliveryText}
          </span>
        </div>

        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#5C1B13] font-mono leading-none block">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] font-semibold text-[#3A241C]/70 block mt-0.5">
            ₹{pricePerLitre} / litre
          </span>
        </div>
      </div>

      {/* Breakdown details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD4]/70">
          <span className="text-[10px] font-bold text-[#3A241C]/65 block uppercase tracking-wider">
            Total Milk Volume
          </span>
          <span className="text-sm font-bold text-[#1A1008] font-mono mt-0.5 block">
            {totalLitres} Litres ({totalLitres}L)
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD4]/70">
          <span className="text-[10px] font-bold text-[#3A241C]/65 block uppercase tracking-wider">
            Delivery Breakdown
          </span>
          <span className="text-xs font-bold text-[#5C1B13] font-mono mt-0.5 block truncate" title={breakdownText}>
            {breakdownText}
          </span>
        </div>
      </div>

      {/* Delivery Schedule Preview (First 4 deliveries) */}
      {schedulePreview && schedulePreview.length > 0 && (
        <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD4]/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A241C]/70 flex items-center gap-1">
              <FiCalendar className="w-3 h-3 text-[#5C1B13]" />
              Schedule Preview (First 4 Deliveries)
            </span>
            <span className="text-[10px] text-[#3A241C]/60">Morning sequence</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {schedulePreview.map((item) => (
              <div
                key={item.deliveryNumber}
                className="px-2 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8DFD4] text-center"
              >
                <span className="text-[10px] text-[#3A241C]/75 block truncate">
                  {item.formattedDate}
                </span>
                <span className="text-xs font-extrabold text-[#5C1B13] font-mono block mt-0.5">
                  {item.litres}L
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fine print & Cut-off notes */}
      <div className="space-y-1.5 pt-0.5 text-[11px] text-[#3A241C]/75 leading-tight">
        <p className="text-[10px] text-[#3A241C]/60 italic">
          * Billed per 30-day cycle. Unused quota rolls over if vacation pause is activated.
        </p>

        <div className="flex items-start gap-2 pt-1 text-[11px]">
          <FiClock className="w-3.5 h-3.5 text-[#5C1B13] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#1A1008]">{CUT_OFF_HOUR}:00 PM Daily Cut-Off:</strong> Modify quantities or pause mornings anytime before 10:00 PM via customer WhatsApp/portal.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 mt-1">
          <FiShield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Delivered cold in sterilized 1L reusable glass bottles before 10:00 AM.</span>
        </div>
      </div>
    </div>
  );
}
