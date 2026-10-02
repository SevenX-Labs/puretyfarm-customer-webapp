"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";

interface HeroBottle3DProps {
  className?: string;
}

export function HeroBottle3D({ className = "" }: HeroBottle3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const badge1Ref = useRef<HTMLDivElement>(null);
  const badge2Ref = useRef<HTMLDivElement>(null);
  const badge3Ref = useRef<HTMLDivElement>(null);
  const badge4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bottle = bottleRef.current;
    const shadow = shadowRef.current;
    if (!container || !bottle || !shadow) return;

    // Disable floating GSAP animations on small screens (< 768px) and under prefers-reduced-motion
    if (
      window.innerWidth < 768 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Continuous Floating & Levitation for the 3D Bottle
      gsap.to(bottle, {
        y: -18,
        rotationZ: 1.5,
        duration: 3.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Synchronized floor shadow: softens and scales down as bottle rises
      gsap.to(shadow, {
        scaleX: 0.82,
        scaleY: 0.75,
        opacity: 0.28,
        duration: 3.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Gentle ambient floating for side badges (independent subtle rhythms)
      const badgeElements = [
        { ref: badge1Ref.current, y: -6, dur: 2.8, delay: 0 },
        { ref: badge2Ref.current, y: -8, dur: 3.3, delay: 0.3 },
        { ref: badge3Ref.current, y: -5, dur: 2.7, delay: 0.6 },
        { ref: badge4Ref.current, y: -7, dur: 3.1, delay: 0.9 },
      ];

      badgeElements.forEach(({ ref, y, dur, delay }) => {
        if (!ref) return;
        gsap.to(ref, {
          y,
          duration: dur,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay,
        });
      });

      // 2. Interactive 3D Perspective Tilt on Mouse Movement
      // All elements move synchronously in the same direction so badges NEVER cross over the bottle
      const setBottleRotX = gsap.quickTo(bottle, "rotationX", { duration: 0.6, ease: "power2.out" });
      const setBottleRotY = gsap.quickTo(bottle, "rotationY", { duration: 0.6, ease: "power2.out" });
      const setBottleX = gsap.quickTo(bottle, "x", { duration: 0.6, ease: "power2.out" });

      const setB1X = badge1Ref.current ? gsap.quickTo(badge1Ref.current, "x", { duration: 0.6, ease: "power2.out" }) : null;
      const setB1Y = badge1Ref.current ? gsap.quickTo(badge1Ref.current, "y", { duration: 0.6, ease: "power2.out" }) : null;
      const setB2X = badge2Ref.current ? gsap.quickTo(badge2Ref.current, "x", { duration: 0.6, ease: "power2.out" }) : null;
      const setB2Y = badge2Ref.current ? gsap.quickTo(badge2Ref.current, "y", { duration: 0.6, ease: "power2.out" }) : null;
      const setB3X = badge3Ref.current ? gsap.quickTo(badge3Ref.current, "x", { duration: 0.6, ease: "power2.out" }) : null;
      const setB3Y = badge3Ref.current ? gsap.quickTo(badge3Ref.current, "y", { duration: 0.6, ease: "power2.out" }) : null;
      const setB4X = badge4Ref.current ? gsap.quickTo(badge4Ref.current, "x", { duration: 0.6, ease: "power2.out" }) : null;
      const setB4Y = badge4Ref.current ? gsap.quickTo(badge4Ref.current, "y", { duration: 0.6, ease: "power2.out" }) : null;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        // Bottle tilts in 3D
        setBottleRotY(relX * 14);
        setBottleRotX(-relY * 10);
        setBottleX(relX * 8);

        // Side badges move in the SAME direction and slightly outward (away from bottle)
        // Left badges (B1, B3): move with relX, never inward toward the center bottle
        if (setB1X && setB1Y) {
          setB1X(relX * 8 - Math.max(0, relX) * 4);
          setB1Y(relY * 6);
        }
        if (setB3X && setB3Y) {
          setB3X(relX * 8 - Math.max(0, relX) * 4);
          setB3Y(relY * 6);
        }

        // Right badges (B2, B4): move with relX, never inward toward the center bottle
        if (setB2X && setB2Y) {
          setB2X(relX * 8 + Math.max(0, -relX) * 4);
          setB2Y(relY * 6);
        }
        if (setB4X && setB4Y) {
          setB4X(relX * 8 + Math.max(0, -relX) * 4);
          setB4Y(relY * 6);
        }
      };

      const handleMouseLeave = () => {
        gsap.to(bottle, {
          rotationX: 0,
          rotationY: 0,
          x: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
        });
        if (badge1Ref.current) gsap.to(badge1Ref.current, { x: 0, duration: 0.8, ease: "power2.out" });
        if (badge2Ref.current) gsap.to(badge2Ref.current, { x: 0, duration: 0.8, ease: "power2.out" });
        if (badge3Ref.current) gsap.to(badge3Ref.current, { x: 0, duration: 0.8, ease: "power2.out" });
        if (badge4Ref.current) gsap.to(badge4Ref.current, { x: 0, duration: 0.8, ease: "power2.out" });
      };

      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-lg mx-auto select-none [perspective:1200px] flex flex-col items-center justify-center py-4 ${className}`}
    >
      {/* Soft warm ambient lighting behind the bottle (strictly -z-10) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#F5E729]/30 via-[#FDEE57]/15 to-[#5C1B13]/5 blur-3xl"
        />
      </div>

      {/* ─── Floating Feature Badges (Stacked underneath the bottle at z-10, safely outside) ─── */}

      {/* Badge 1: Top-Left - 100% Raw A2 */}
      <div
        ref={badge1Ref}
        className="absolute top-2 left-0 sm:top-4 sm:-left-6 lg:-left-10 z-10 pointer-events-auto"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DFD4] shadow-md shadow-[#5C1B13]/8 text-left transition-transform hover:scale-105">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#1A1008] leading-tight">
              100% Pure A2
            </p>
            <p className="text-[10px] sm:text-xs text-[#3A241C]/70">
              Raw & Unprocessed
            </p>
          </div>
        </div>
      </div>

      {/* Badge 2: Top-Right - Sealed Glass Bottle */}
      <div
        ref={badge2Ref}
        className="absolute top-6 right-0 sm:top-8 sm:-right-6 lg:-right-8 z-10 pointer-events-auto"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#FFFBEB]/95 backdrop-blur-md border border-[#F5E729]/60 shadow-md shadow-[#5C1B13]/8 text-left transition-transform hover:scale-105">
          <span className="text-sm sm:text-base">✨</span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#5C1B13] leading-tight">
              Sealed Glass
            </p>
            <p className="text-[10px] sm:text-xs text-[#3A241C]/70">
              Zero plastic touch
            </p>
          </div>
        </div>
      </div>

      {/* Badge 3: Mid/Bottom-Left - 7 AM Morning Delivery */}
      <div
        ref={badge3Ref}
        className="absolute bottom-16 left-0 sm:bottom-20 sm:-left-6 lg:-left-10 z-10 pointer-events-auto"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DFD4] shadow-md shadow-[#5C1B13]/8 text-left transition-transform hover:scale-105">
          <span className="text-sm sm:text-base">⏰</span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#1A1008] leading-tight">
              Before 7:00 AM
            </p>
            <p className="text-[10px] sm:text-xs text-[#3A241C]/70">
              Fresh daily delivery
            </p>
          </div>
        </div>
      </div>

      {/* Badge 4: Bottom-Right - Cold-Chained at 4°C */}
      <div
        ref={badge4Ref}
        className="absolute bottom-14 right-0 sm:bottom-16 sm:-right-4 lg:-right-6 z-10 pointer-events-auto"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DFD4] shadow-md shadow-[#5C1B13]/8 text-left transition-transform hover:scale-105">
          <span className="text-sm sm:text-base">❄️</span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#1A1008] leading-tight">
              Cold Chained 4°C
            </p>
            <p className="text-[10px] sm:text-xs text-[#3A241C]/70">
              Farm to fridge purity
            </p>
          </div>
        </div>
      </div>

      {/* ─── Ambient Subtle Droplets (Constrained strictly behind the bottle, hidden on mobile) ─── */}
      <div className="hidden md:block absolute inset-0 pointer-events-none -z-5 overflow-hidden">
        <div className="absolute top-12 right-12 w-5 h-5 rounded-full bg-white/60 backdrop-blur-xs border border-[#E8DFD4]/60 shadow-xs" />
        <div className="absolute bottom-24 right-10 w-4 h-4 rounded-full bg-white/60 border border-[#E8DFD4]/60 shadow-xs" />
      </div>

      {/* ─── The Floating 3D Milk Bottle (Higher z-30 stack, ALWAYS above everything) ─── */}
      <div
        ref={bottleRef}
        className="relative z-30 [transform-style:preserve-3d] flex items-center justify-center cursor-grab active:cursor-grabbing group"
      >
        <Image
          src="/pure-milk-bottle-3d.webp"
          alt="PuretyFarm Pure A2 Gir Cow Milk - 3D Glass Bottle"
          width={450}
          height={608}
          priority
          loading="eager"
          unoptimized
          className="w-auto h-[360px] sm:h-[430px] md:h-[470px] max-w-full object-contain drop-shadow-[0_30px_45px_rgba(92,27,19,0.22)] select-none pointer-events-none transition-filter duration-300"
        />

        {/* Ambient freshness aura behind bottle */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-radial from-[#F5E729]/20 via-white/10 to-transparent blur-xl scale-90 opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        />
      </div>

      {/* Synchronized Floor Shadow & Fresh Ripple Rings beneath the bottle */}
      <div className="relative flex items-center justify-center -mt-4 -z-10 pointer-events-none">
        <div
          ref={shadowRef}
          className="w-56 sm:w-68 h-8 rounded-[100%] bg-gradient-to-r from-transparent via-[#5C1B13]/35 to-transparent blur-md transition-transform"
        />
        {/* Subtle chilled ring pulse */}
        <div className="absolute w-44 sm:w-56 h-6 rounded-[100%] border border-[#5C1B13]/15 animate-ping opacity-25" />
      </div>

      {/* Bottom Tagline Pill - Safely below */}
      <div className="mt-5 inline-flex items-center gap-3 bg-[#FBF6EE]/90 backdrop-blur-sm border border-[#E8DFD4] rounded-full px-5 py-1.5 shadow-sm text-xs text-[#3A241C]/80 z-20">
        <span className="font-semibold text-[#5C1B13]">Desi Gir Cows</span>
        <span className="inline-block w-1 h-1 rounded-full bg-[#F5E729]" />
        <span>Cruelty-Free</span>
        <span className="inline-block w-1 h-1 rounded-full bg-[#F5E729]" />
        <span className="font-semibold text-emerald-700">Raipur Local</span>
      </div>
    </div>
  );
}
