"use client";

import React from "react";
import { PricingResult, DeliveryDatePreviewItem } from "../types";
import { CUT_OFF_HOUR } from "../pricing";
import { FiClock, FiShield, FiCalendar, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

interface PricingSummaryProps {
  result: PricingResult;
  schedulePreview?: DeliveryDatePreviewItem[];
  isQuoteLoading?: boolean;
  quoteError?: string | null;
  onRetryQuote?: () => void;
  deliveryWindow?: string;
}

export function PricingSummary({
  result,
  schedulePreview,
  isQuoteLoading = false,
  quoteError = null,
  onRetryQuote,
  deliveryWindow,
}: PricingSummaryProps) {
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

  const cutOffHour12 = CUT_OFF_HOUR % 12 === 0 ? 12 : CUT_OFF_HOUR % 12;
  const cutOffPeriod = CUT_OFF_HOUR >= 12 ? "PM" : "AM";
  const cutOffFormatted = `${cutOffHour12}:00 ${cutOffPeriod}`;
  const effectiveDeliveryWindow = deliveryWindow || "6:00 AM – 11:00 AM";

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="p-4 sm:p-5 rounded-2xl bg-[#FAF3EA] border border-[#E8DFD4] space-y-4 shadow-2xs"
    >
      {/* Top Quote Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DFD4]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1B13] block">
            Subscription Quote
          </span>
          {isQuoteLoading ? (
            <div className="space-y-1.5 mt-1">
              <div className="h-3.5 w-36 bg-[#E8DFD4]/70 animate-pulse rounded-md" />
              <div className="h-3 w-28 bg-[#E8DFD4]/50 animate-pulse rounded-md" />
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-[#715E50] mt-0.5">
                {totalDeliveries} total doorstep deliveries
              </p>
              <span className="text-[11.5px] font-semibold text-[#5C1B13] block mt-0.5">
                {perDeliveryText}
              </span>
            </>
          )}
        </div>

        <div className="text-right">
          {isQuoteLoading ? (
            <div className="flex flex-col items-end gap-1.5 py-0.5">
              <div className="h-7 w-24 bg-[#E8DFD4]/70 animate-pulse rounded-md" />
              <div className="h-3 w-16 bg-[#E8DFD4]/50 animate-pulse rounded-md" />
            </div>
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-black text-[#5C1B13] tabular-nums leading-none block">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] font-semibold text-[#715E50] block mt-1">
                ₹{pricePerLitre} / litre
              </span>
            </>
          )}
        </div>
      </div>

      {/* Breakdown details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-white border border-[#E8DFD4]/80">
          <span className="text-[10px] font-bold text-[#715E50] block uppercase tracking-wider">
            Total Milk Volume
          </span>
          {isQuoteLoading ? (
            <div className="h-5 w-20 bg-[#E8DFD4]/60 animate-pulse rounded-md mt-1" />
          ) : (
            <span className="text-sm font-bold text-[#1A1008] font-mono mt-1 block">
              {totalLitres} Litres ({totalLitres}L)
            </span>
          )}
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E8DFD4]/80">
          <span className="text-[10px] font-bold text-[#715E50] block uppercase tracking-wider">
            Delivery Breakdown
          </span>
          {isQuoteLoading ? (
            <div className="h-5 w-32 bg-[#E8DFD4]/60 animate-pulse rounded-md mt-1" />
          ) : (
            <span
              className="text-xs font-bold text-[#5C1B13] font-mono mt-1 block truncate"
              title={breakdownText}
            >
              {breakdownText}
            </span>
          )}
        </div>
      </div>

      {/* Error state with retry action */}
      {quoteError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{quoteError}</span>
          </div>
          {onRetryQuote && (
            <button
              type="button"
              onClick={onRetryQuote}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#5C1B13] hover:underline underline-offset-2 shrink-0 cursor-pointer"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Delivery Schedule Preview (First 4 deliveries) */}
      {schedulePreview && schedulePreview.length > 0 && (
        <div className="p-3 rounded-xl bg-white border border-[#E8DFD4]/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#715E50] flex items-center gap-1">
              <FiCalendar className="w-3 h-3 text-[#5C1B13]" />
              Schedule Preview (First 4 Deliveries)
            </span>
            <span className="text-[10px] text-[#715E50]">Morning sequence</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {schedulePreview.map((item) => (
              <div
                key={item.deliveryNumber}
                className="px-2 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD4] text-center"
              >
                <span className="text-[10.5px] text-[#715E50] block truncate">
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
      <div className="space-y-2 pt-1 text-[11px] text-[#715E50] leading-relaxed">
        <p className="text-[10.5px] text-[#715E50] italic">
          * Billed per calendar-month billing period. Unused quota rolls over if vacation pause is activated.
        </p>

        <div className="flex items-start gap-2 pt-0.5 text-[11.5px]">
          <FiClock className="w-3.5 h-3.5 text-[#5C1B13] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#1A1008]">{cutOffFormatted} Daily Cut-Off:</strong> Modify quantities or pause mornings anytime before {cutOffFormatted} via customer WhatsApp/portal.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11.5px] text-emerald-800 bg-emerald-50/90 px-3 py-2 rounded-xl border border-emerald-200 mt-1">
          <FiShield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Delivered cold in sterilized 1L reusable glass bottles ({effectiveDeliveryWindow}).
          </span>
        </div>
      </div>
    </div>
  );
}
