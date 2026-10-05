"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { ShinyText } from "@/components/reactbits";
import { useScrollReveal, useStaggerReveal, useCountUp } from "@/lib/animations";
import { FLAGS } from "@/config/flags";
import {
  FiHeart,
  FiShield,
  FiPackage,
  FiSun,
  FiCheck,
  FiUsers,
  FiCheckCircle,
  FiDroplet,
  FiThermometer,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

import { TESTIMONIALS } from "@/content/testimonials";

const TRUST_ITEMS = [
  {
    icon: <FiHeart className="w-6 h-6 text-white" />,
    title: "100% A2 Gir Cow Milk",
    description:
      "Our cows are indigenous Gir breed, naturally producing only the A2 beta-casein protein.",
  },
  {
    icon: <FiShield className="w-6 h-6 text-white" />,
    title: "No Adulteration Ever",
    description:
      "Every batch is tested. Zero added water, preservatives, or hormones.",
  },
  {
    icon: <FiPackage className="w-6 h-6 text-white" />,
    title: "Glass Bottle Delivery",
    description:
      "Eco-friendly sealed glass bottles, sanitized and reused responsibly.",
  },
  {
    icon: <FiSun className="w-6 h-6 text-white" />,
    title: "Farm-Fresh Daily",
    description:
      "Milked at dawn, chilled immediately, delivered within hours.",
  },
] as const;

function StatCounter({
  end,
  suffix = "",
  label,
  icon,
}: {
  end: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
}) {
  const countRef = useCountUp(end, { duration: 2, suffix });
  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#E8DFD4] shadow-xs hover:shadow-md transition-shadow group">
      <div className="mb-2 group-hover:scale-110 transition-transform duration-200">{icon}</div>
      <span ref={countRef} className="text-2xl sm:text-3xl font-black text-[#5C1B13] tracking-tight">
        0{suffix}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-[#3A241C]/80 text-center mt-1">
        {label}
      </span>
    </div>
  );
}

export function SocialProof() {
  // Testimonials section
  const testBadgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.5 });
  const testHeadingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const statsRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0.15 });

  // Scroller refs & interactive state
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const pointerStartScrollRef = useRef(0);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Tripled testimonials array for seamless bi-directional wrap
  const tripledTestimonials = useMemo(
    () => [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS],
    []
  );

  // Initialize scroll position in the center set on mount for smooth wrap
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      if (container) {
        const singleSetWidth = container.scrollWidth / 3;
        if (singleSetWidth > 0) {
          container.scrollLeft = singleSetWidth;
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Continuous frame ticker for universal smooth movement across all screen refresh rates
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let lastTime = performance.now();
    // 38 px/sec: smooth, legible, and relaxing drift
    const speed = 38;

    const tick = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (
        !prefersReducedMotion &&
        !isInteractingRef.current &&
        !isPointerDownRef.current &&
        !isHovered &&
        container
      ) {
        container.scrollLeft += speed * delta;

        const singleSetWidth = container.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [isHovered]);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);
  }, []);

  const handleTouchStart = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isPointerDownRef.current = true;
    isInteractingRef.current = true;
    pointerStartXRef.current = e.clientX;
    pointerStartScrollRef.current = scrollRef.current?.scrollLeft || 0;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !scrollRef.current) return;
    const deltaX = e.clientX - pointerStartXRef.current;
    scrollRef.current.scrollLeft = pointerStartScrollRef.current - deltaX;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    scheduleResume();
  }, [scheduleResume]);

  const scrollByDirection = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    isInteractingRef.current = true;
    const cardWidth = container.clientWidth < 640 ? 320 : 380;
    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
    scheduleResume();
  }, [scheduleResume]);

  return (
    <>
      {/* Testimonials */}
      {(FLAGS.SHOW_TESTIMONIALS || FLAGS.SHOW_500_FAMILIES_BADGE) && (
        <Section background="default" id="testimonials" className="overflow-hidden">
          {FLAGS.SHOW_500_FAMILIES_BADGE && (
            <div ref={testBadgeRef} className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-[#F5E729]/20 border border-[#F5E729]/40 text-[#1A1008] text-sm font-bold px-4 py-2 rounded-full">
                <FaStar className="w-3.5 h-3.5 text-amber-500" />
                <ShinyText text="500+ Happy Families in Raipur" speed={3.5} />
              </span>
            </div>
          )}

          {FLAGS.SHOW_TESTIMONIALS && (
            <div className="text-center max-w-3xl mx-auto mb-4">
              <h2
                ref={testHeadingRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight"
              >
                Loved by Families Across{" "}
                <span className="text-[#5C1B13] font-serif italic relative inline-block">
                  Raipur
                  <span className="absolute bottom-1.5 left-0 right-0 h-2.5 bg-[#F5E729]/35 -z-10 rounded-sm" />
                </span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#3A241C]/80">
                Real mornings, authentic Desi Gir goodness, and zero plastic packaging verified by local households.
              </p>
            </div>
          )}

          {/* Dynamic Animated Statistics Counters */}
          <div
            ref={statsRef}
            className={`mt-6 mb-10 grid grid-cols-2 ${FLAGS.SHOW_500_FAMILIES_BADGE || FLAGS.SHOW_40_TESTS_CLAIM
              ? "md:grid-cols-4 max-w-4xl"
              : "max-w-xl"
              } gap-4 mx-auto`}
          >
            {FLAGS.SHOW_500_FAMILIES_BADGE && (
              <StatCounter end={500} suffix="+" label="Happy Families" icon={<FiUsers className="w-6 h-6 text-[#5C1B13]" />} />
            )}
            {FLAGS.SHOW_40_TESTS_CLAIM && (
              <StatCounter end={40} suffix="+" label="Lab Quality Tests" icon={<FiCheckCircle className="w-6 h-6 text-emerald-600" />} />
            )}
            <StatCounter end={100} suffix="%" label="A2 Desi Gir Milk" icon={<FiDroplet className="w-6 h-6 text-blue-600" />} />
            <StatCounter end={4} suffix="°C" label="Chilled Cold Chain" icon={<FiThermometer className="w-6 h-6 text-cyan-600" />} />
          </div>

          {/* Continuous Interactive Testimonials Scroller */}
          {FLAGS.SHOW_TESTIMONIALS && (
            <div className="relative mt-8">
              {/* Header Controls: Live status + Prev/Next Buttons */}
              <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 mb-3.5">
                <span className="text-xs font-semibold text-[#3A241C]/65 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real Raipur Residents • Swipe or drag to browse</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollByDirection("left")}
                    aria-label="Previous testimonials"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8DFD4] text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByDirection("right")}
                    aria-label="Next testimonials"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8DFD4] text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Marquee viewport container with break-out width */}
              <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-2">
                {/* Left gradient mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-24 md:w-36 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/90 to-transparent z-10"
                />
                {/* Right gradient mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-24 md:w-36 bg-gradient-to-l from-[#FFFDF7] via-[#FFFDF7]/90 to-transparent z-10"
                />

                {/* Multi-Device Interactive Smooth Scroller */}
                <div
                  ref={scrollRef}
                  data-lenis-prevent="true"
                  data-lenis-prevent-touch="true"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => {
                    setIsHovered(false);
                    isPointerDownRef.current = false;
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="flex items-stretch overflow-x-auto scrollbar-hide py-2 cursor-grab active:cursor-grabbing select-none"
                  style={{
                    scrollBehavior: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {tripledTestimonials.map((testimonial, idx) => (
                    <div
                      key={`${testimonial.name}-${idx}`}
                      className="w-[310px] sm:w-[360px] md:w-[390px] shrink-0 h-full flex flex-col px-2.5 sm:px-3"
                    >
                      <div className="bg-white h-full rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                          {/* Top row: Stars & Verified Badge */}
                          <div className="flex items-center justify-between gap-2 mb-3.5">
                            <div className="flex gap-1 group-hover:scale-105 transition-transform duration-200">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className="w-3.5 h-3.5 text-[#F5E729] drop-shadow-2xs"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 inline-flex items-center gap-1.5 shadow-2xs">
                              <FiCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Raipur</span>
                            </span>
                          </div>

                          {/* Decorative Quote Icon & Content */}
                          <div className="relative mb-5">
                            <FaQuoteLeft className="w-4 h-4 text-[#5C1B13]/15 mb-2" />
                            <p className="text-[#3A241C]/90 text-sm leading-relaxed">
                              &ldquo;{testimonial.quote}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Customer Details Footer */}
                        <div className="flex items-center gap-3 pt-3.5 border-t border-[#E8DFD4]/60 mt-auto">
                          <div className="w-10 h-10 rounded-full bg-[#5C1B13]/10 flex items-center justify-center border border-[#5C1B13]/20 shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-[#5C1B13]">
                              {testimonial.initials}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-sm font-bold text-[#1A1008] truncate">
                                {testimonial.name}
                              </p>
                              <span className="text-[10px] font-semibold text-[#5C1B13] bg-[#5C1B13]/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {testimonial.tag}
                              </span>
                            </div>
                            <p className="text-xs text-[#3A241C]/65 truncate">
                              {testimonial.location}, Raipur
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>
      )}
    </>
  );
}
