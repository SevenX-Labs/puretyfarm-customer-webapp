"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { FaCow, FaPlay } from "react-icons/fa6";
import { handleTrialClick } from "@/lib/cta";

interface HeroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeroVideoModal({ isOpen, onClose }: HeroVideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <m.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#1A1008] border border-white/15 text-white shadow-2xl z-10 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="PuretyFarm 1-Minute Story & How It Works"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 rounded-full bg-[#5C1B13] items-center justify-center text-[#F5E729]">
                  <FaCow className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                    How PuretyFarm Works
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Gir Cow Milking to Doorstep Delivery in Raipur (1 Min Tour)
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close video tour"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Video / Interactive Story Stage */}
            <div className="relative aspect-video w-full bg-black/90 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 pointer-events-none z-10" />

              {/* Background ambient poster frame */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 filter blur-xs"
                style={{ backgroundImage: `url('/hero-cinematic-dairy.webp')` }}
              />

              {/* Animated Cinematic Overlay Content */}
              <div className="relative z-20 text-center max-w-lg px-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#5C1B13] border-2 border-[#F5E729] text-[#F5E729] flex items-center justify-center shadow-lg shadow-[#5C1B13]/60 mb-4 animate-pulse">
                  <FaPlay className="w-6 h-6 ml-1" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-2">
                  Daily 4:30 AM Farm Milking
                </span>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  Dawn Milked &amp; Chilled to 4°C
                </h4>
                <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
                  Raw unpasteurised Gir cow milk sealed immediately in sanitised glass bottles and delivered to Shankar Nagar, Civil Lines, VIP Road &amp; all Raipur before 10:00 AM.
                </p>
              </div>

              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div className="h-full bg-[#F5E729] w-3/4 animate-[pulse_2s_infinite]" />
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-[#23150D] border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                <span>Zero plastic touch • Sanitized glass • 100% money back</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  handleTrialClick();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#722319] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start My 7-Day Trial →</span>
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
