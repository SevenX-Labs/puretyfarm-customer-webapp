"use client";

import { useState, useEffect, useRef } from "react";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiClock, FiDroplet, FiMapPin } from "react-icons/fi";
import { FaCow, FaLeaf, FaSnowflake } from "react-icons/fa6";

export function HeroProductVisual({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Smooth mouse parallax physics for desktop callout cards
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const card1X = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const card1Y = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const card2X = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const card2Y = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const card3X = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const card3Y = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const card4X = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const card4Y = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const pillX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const pillY = useTransform(smoothY, [-0.5, 0.5], [5, -5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (mobileOnly) {
    return (
      <div className="w-full flex flex-col items-center gap-2.5 pb-2 px-1 min-w-0">
        {/* 2x2 Trust Badges Grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-2 min-w-0">
          {/* 1. 100% Pure A2 */}
          <div className="bg-white/98 backdrop-blur-md rounded-xl p-2 border border-[#ECE5DC] shadow-2xs flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#EAF7EE] border border-[#CDEED5] text-[#15803d] flex items-center justify-center shrink-0">
              <FaLeaf className="w-3 h-3" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[11px] font-bold text-[#1A1008] truncate">
                100% Pure A2
              </span>
              <span className="text-[9.5px] text-[#6B584C] font-medium truncate">
                Raw &amp; Unprocessed
              </span>
            </div>
          </div>

          {/* 2. Sealed Glass */}
          <div className="bg-white/98 backdrop-blur-md rounded-xl p-2 border border-[#ECE5DC] shadow-2xs flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#FEF7E6] border border-[#F9E6B5] text-[#B87C14] flex items-center justify-center shrink-0">
              <FiDroplet className="w-3 h-3" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[11px] font-bold text-[#1A1008] truncate">
                Sealed Glass
              </span>
              <span className="text-[9.5px] text-[#6B584C] font-medium truncate">
                Zero plastic touch
              </span>
            </div>
          </div>

          {/* 3. Morning delivery */}
          <div className="bg-white/98 backdrop-blur-md rounded-xl p-2 border border-[#ECE5DC] shadow-2xs flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#F7F2EA] border border-[#E8DFD4] text-[#4A352A] flex items-center justify-center shrink-0">
              <FiClock className="w-3 h-3" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[11px] font-bold text-[#1A1008] truncate">
                Every Morning
              </span>
              <span className="text-[9.5px] text-[#6B584C] font-medium truncate">
                Fresh daily delivery
              </span>
            </div>
          </div>

          {/* 4. Cold Chained 4°C */}
          <div className="bg-white/98 backdrop-blur-md rounded-xl p-2 border border-[#ECE5DC] shadow-2xs flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#EFF8FF] border border-[#CDE8FE] text-[#1D74B8] flex items-center justify-center shrink-0">
              <FaSnowflake className="w-3 h-3" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[11px] font-bold text-[#1A1008] truncate">
                Cold Chained 4°C
              </span>
              <span className="text-[9.5px] text-[#6B584C] font-medium truncate">
                Farm to fridge purity
              </span>
            </div>
          </div>
        </div>

        {/* Product Benefit Pill */}
        <div className="w-full max-w-sm flex justify-center mt-0.5 min-w-0">
          <div className="bg-white/98 backdrop-blur-md rounded-full px-3 py-1.5 border border-[#ECE5DC] shadow-2xs flex items-center gap-2 text-[10px] sm:text-[10.5px] font-semibold text-[#1A1008] max-w-full overflow-hidden">
            <div className="flex items-center gap-1 text-[#541711] shrink-0">
              <FaCow className="w-3 h-3 text-[#541711]" />
              <span className="font-bold">Desi Gir</span>
            </div>
            <span className="text-[#D4AF37] font-bold shrink-0">•</span>
            <div className="flex items-center gap-1 text-[#15803d] shrink-0">
              <FaLeaf className="w-3 h-3 text-[#15803d]" />
              <span className="font-bold">Cruelty-Free</span>
            </div>
            <span className="text-[#D4AF37] font-bold shrink-0">•</span>
            <div className="flex items-center gap-1 text-[#541711] shrink-0">
              <FiMapPin className="w-3 h-3 text-[#541711]" />
              <span className="font-bold">Raipur</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* ═══════════════════════════════════════════════════════════════
       DESKTOP STAGE (>= 1024px)
       Mathematically anchored to bottle center at 71.8% of the hero section.
       The 4 cards, dotted pointer lines, and bottom pill NEVER drift,
       remaining pixel-perfect at all viewport widths (1024px to 2560px+).
       ═══════════════════════════════════════════════════════════════ */
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hidden lg:block absolute inset-0 pointer-events-none select-none z-15 overflow-hidden"
    >
      {/* Anchor Frame: Centered directly over the bottle at 68% X and 46% Y (matching herobg.png) */}
      <div className="absolute top-[46%] left-[68%] -translate-x-1/2 -translate-y-1/2 w-[580px] h-[560px]">
        
        {/* ─── DELICATE SVG DOTTED CONNECTING LINES TO BOTTLE ─── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 580 560"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. Top-Left: Card 1 -> Bottle Shoulder */}
          <g opacity="0.85">
            <line
              x1="190"
              y1="90"
              x2="250"
              y2="134"
              stroke="#9E8D7F"
              strokeWidth="1.2"
              strokeDasharray="2.5 3.5"
            />
            <circle cx="250" cy="134" r="3.5" fill="#9E8D7F" />
            <circle cx="250" cy="134" r="1.5" fill="#FFFFFF" />
          </g>

          {/* 2. Top-Right: Card 2 -> Bottle Neck */}
          <g opacity="0.85">
            <line
              x1="392"
              y1="84"
              x2="330"
              y2="110"
              stroke="#9E8D7F"
              strokeWidth="1.2"
              strokeDasharray="2.5 3.5"
            />
            <circle cx="330" cy="110" r="3.5" fill="#9E8D7F" />
            <circle cx="330" cy="110" r="1.5" fill="#FFFFFF" />
          </g>

          {/* 3. Bottom-Left: Card 3 -> Bottle Body */}
          <g opacity="0.85">
            <line
              x1="192"
              y1="308"
              x2="236"
              y2="308"
              stroke="#9E8D7F"
              strokeWidth="1.2"
              strokeDasharray="2.5 3.5"
            />
            <circle cx="236" cy="308" r="3.5" fill="#9E8D7F" />
            <circle cx="236" cy="308" r="1.5" fill="#FFFFFF" />
          </g>

          {/* 4. Bottom-Right: Card 4 -> Bottle Lower Body */}
          <g opacity="0.85">
            <line
              x1="392"
              y1="274"
              x2="348"
              y2="274"
              stroke="#9E8D7F"
              strokeWidth="1.2"
              strokeDasharray="2.5 3.5"
            />
            <circle cx="348" cy="274" r="3.5" fill="#9E8D7F" />
            <circle cx="348" cy="274" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>

        {/* ─── 4 FLOATING CALLOUT CARDS (Desktop) ─── */}

        {/* Card 1: TOP-LEFT — 100% Pure A2 */}
        <m.div
          style={isReducedMotion ? {} : { x: card1X, y: card1Y }}
          className="absolute top-[62px] left-[5px] z-20 pointer-events-auto"
        >
          <div className="group bg-white/98 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-[#ECE5DC] shadow-[0_8px_24px_rgba(26,16,8,0.07)] hover:shadow-[0_12px_30px_rgba(84,23,17,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] border border-[#CDEED5] text-[#15803d] flex items-center justify-center shrink-0">
              <FaLeaf className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-[#1A1008] tracking-tight leading-tight">
                100% Pure A2
              </span>
              <span className="text-[11px] text-[#6B584C] font-medium leading-none mt-0.5">
                Raw &amp; Unprocessed
              </span>
            </div>
          </div>
        </m.div>

        {/* Card 2: TOP-RIGHT — Sealed Glass */}
        <m.div
          style={isReducedMotion ? {} : { x: card2X, y: card2Y }}
          className="absolute top-[56px] right-[5px] z-20 pointer-events-auto"
        >
          <div className="group bg-white/98 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-[#ECE5DC] shadow-[0_8px_24px_rgba(26,16,8,0.07)] hover:shadow-[0_12px_30px_rgba(84,23,17,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#FEF7E6] border border-[#F9E6B5] text-[#B87C14] flex items-center justify-center shrink-0">
              <FiDroplet className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-[#1A1008] tracking-tight leading-tight">
                Sealed Glass
              </span>
              <span className="text-[11px] text-[#6B584C] font-medium leading-none mt-0.5">
                Zero plastic touch
              </span>
            </div>
          </div>
        </m.div>

        {/* Card 3: BOTTOM-LEFT — Morning delivery */}
        <m.div
          style={isReducedMotion ? {} : { x: card3X, y: card3Y }}
          className="absolute top-[280px] left-[-15px] z-20 pointer-events-auto"
        >
          <div className="group bg-white/98 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-[#ECE5DC] shadow-[0_8px_24px_rgba(26,16,8,0.07)] hover:shadow-[0_12px_30px_rgba(84,23,17,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#F7F2EA] border border-[#E8DFD4] text-[#4A352A] flex items-center justify-center shrink-0">
              <FiClock className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-[#1A1008] tracking-tight leading-tight">
                Every Morning
              </span>
              <span className="text-[11px] text-[#6B584C] font-medium leading-none mt-0.5">
                Fresh daily delivery
              </span>
            </div>
          </div>
        </m.div>

        {/* Card 4: BOTTOM-RIGHT — Cold Chained 4°C */}
        <m.div
          style={isReducedMotion ? {} : { x: card4X, y: card4Y }}
          className="absolute top-[248px] right-[-10px] z-20 pointer-events-auto"
        >
          <div className="group bg-white/98 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-[#ECE5DC] shadow-[0_8px_24px_rgba(26,16,8,0.07)] hover:shadow-[0_12px_30px_rgba(84,23,17,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#EFF8FF] border border-[#CDE8FE] text-[#1D74B8] flex items-center justify-center shrink-0">
              <FaSnowflake className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-[#1A1008] tracking-tight leading-tight">
                Cold Chained 4°C
              </span>
              <span className="text-[11px] text-[#6B584C] font-medium leading-none mt-0.5">
                Farm to fridge purity
              </span>
            </div>
          </div>
        </m.div>

        {/* ─── 5. BOTTOM FLOATING PILL OVER RUSTIC TABLE ─── */}
        <m.div
          style={isReducedMotion ? {} : { x: pillX, y: pillY }}
          className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-max max-w-[95%]"
        >
          <div className="bg-white/98 backdrop-blur-md rounded-full px-5 py-2 border border-[#ECE5DC] shadow-[0_6px_20px_rgba(26,16,8,0.08)] flex items-center gap-3 text-[12px] font-semibold text-[#1A1008]">
            <div className="flex items-center gap-1.5 text-[#541711]">
              <FaCow className="w-3.5 h-3.5 text-[#541711]" />
              <span className="tracking-tight text-[#1A1008] font-bold">Desi Gir Cows</span>
            </div>
            <span className="text-[#D4AF37] font-bold text-xs">•</span>
            <div className="flex items-center gap-1.5 text-[#15803d]">
              <FaLeaf className="w-3.5 h-3.5 text-[#15803d]" />
              <span className="tracking-tight text-[#1A1008] font-bold">Cruelty-Free</span>
            </div>
            <span className="text-[#D4AF37] font-bold text-xs">•</span>
            <div className="flex items-center gap-1.5 text-[#541711]">
              <FiMapPin className="w-3.5 h-3.5 text-[#541711]" />
              <span className="tracking-tight text-[#1A1008] font-bold">Raipur Local</span>
            </div>
          </div>
        </m.div>

      </div>
    </div>
  );
}
