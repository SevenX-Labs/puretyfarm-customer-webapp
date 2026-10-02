"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { handleDownloadClick } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import { FLAGS } from "@/config/flags";
import { FaStar, FaGooglePlay } from "react-icons/fa";
import {
  FiCalendar,
  FiPauseCircle,
  FiMapPin,
  FiCreditCard,
  FiSmartphone,
  FiTruck,
  FiDroplet,
  FiThermometer,
  FiHome,
  FiPackage,
  FiUser,
} from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const APP_SCREENS = [
  {
    title: "Daily Subscription",
    subtitle: "Manage your morning milk",
    content: {
      greeting: "Good Morning, Raipur!",
      card: {
        time: "Tomorrow, 6:00 – 6:30 AM",
        status: "Confirmed",
        product: "100% Raw Chilled A2 Gir Cow Milk",
        quantities: ["0.5 L", "1 L", "2 L"],
        selected: 1,
      },
    },
  },
  {
    title: "Plan & Calendar",
    subtitle: "Pause, skip, or reschedule",
    content: {
      plan: "Daily Morning Ritual",
      detail: "Monthly Plan · 30 Litres",
      toggle: "Vacation Mode",
      calendar: true,
    },
  },
  {
    title: "Live Tracking",
    subtitle: "Know when milk arrives",
    content: {
      status: "Out for Delivery",
      eta: "Arriving in 14 mins (6:18 AM)",
      partner: "Ramesh Sahu",
      rating: "4.9",
      temp: "Chilled at 4°C",
    },
  },
] as const;

const FEATURES = [
  { icon: FiCalendar, label: "Schedule Deliveries", detail: "Custom days & quantities" },
  { icon: FiPauseCircle, label: "Pause Anytime", detail: "Zero cancellation charges" },
  { icon: FiMapPin, label: "Track Milkman", detail: "Live GPS & morning ETA" },
  { icon: FiCreditCard, label: "Payment History", detail: "Transparent monthly billing" },
] as const;

function PhoneMockup({
  screen,
  index,
  isActive,
  onSelect,
}: {
  screen: typeof APP_SCREENS[number];
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      data-phone
      onClick={onSelect}
      className={`
        relative flex-shrink-0 w-[260px] sm:w-[280px] cursor-pointer transition-all duration-300
        ${isActive ? "z-20 scale-105 sm:scale-110 opacity-100" : "opacity-75 hover:opacity-95 scale-95 sm:scale-100"}
      `}
    >

      {/* Phone frame */}
      <div
        className={`rounded-[32px] bg-[#1A1008] p-2 transition-shadow duration-300 ${
          isActive
            ? "shadow-[0_25px_60px_-12px_rgba(92,27,19,0.3)] ring-2 ring-[#5C1B13]/30"
            : "shadow-[0_20px_40px_-12px_rgba(92,27,19,0.12)]"
        }`}
      >
        {/* Notch */}
        <div className="relative rounded-[26px] bg-white overflow-hidden">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-20 h-5 bg-[#1A1008] rounded-full" />
          </div>

          {/* Screen content */}
          <div className="px-4 pb-4 min-h-[380px] sm:min-h-[420px]">
            {/* Status bar */}
            <div className="flex items-center justify-between text-[10px] text-[#3A241C]/60 mb-3">
              <span className="font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-2 border border-[#3A241C]/40 rounded-sm">
                  <div className="w-2.5 h-1 bg-[#3A241C]/40 rounded-sm m-[1px]" />
                </div>
              </div>
            </div>

            {index === 0 && (
              <>
                <p className="text-xs text-[#3A241C]/70 mb-1">
                  {(screen.content as typeof APP_SCREENS[0]["content"]).greeting}
                </p>
                <h4 className="text-sm font-bold text-[#1A1008] mb-3">PuretyFarm Pure A2 Milk</h4>
                <div className="bg-[#FBF6EE] rounded-xl p-3 border border-[#E8DFD4] mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#3A241C]">
                      {(screen.content as typeof APP_SCREENS[0]["content"]).card.time}
                    </span>
                    <span className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {(screen.content as typeof APP_SCREENS[0]["content"]).card.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#1A1008] mb-3">
                    {(screen.content as typeof APP_SCREENS[0]["content"]).card.product}
                  </p>
                  <div className="flex gap-2">
                    {(screen.content as typeof APP_SCREENS[0]["content"]).card.quantities.map((q, i) => (
                      <button
                        key={q}
                        className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                          i === (screen.content as typeof APP_SCREENS[0]["content"]).card.selected
                            ? "bg-[#5C1B13] text-white"
                            : "bg-white border border-[#E8DFD4] text-[#3A241C]"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#3A241C]/60">
                  <div className="w-8 h-8 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0">
                  <FiDroplet className="w-4 h-4" />
                </div>
                  <span>Next delivery scheduled</span>
                </div>
              </>
            )}

            {index === 1 && (
              <>
                <h4 className="text-sm font-bold text-[#1A1008] mb-1">
                  {(screen.content as typeof APP_SCREENS[1]["content"]).plan}
                </h4>
                <p className="text-[11px] text-[#3A241C]/70 mb-4">
                  {(screen.content as typeof APP_SCREENS[1]["content"]).detail}
                </p>
                <div className="flex items-center justify-between bg-[#FBF6EE] rounded-xl p-3 border border-[#E8DFD4] mb-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[#1A1008]">Vacation Mode</p>
                    <p className="text-[10px] text-[#3A241C]/60">Pause deliveries</p>
                  </div>
                  <div className="w-10 h-5 bg-[#E8DFD4] rounded-full relative">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                {/* Calendar grid */}
                <div className="bg-white rounded-xl border border-[#E8DFD4] p-3">
                  <p className="text-[11px] font-semibold text-[#1A1008] mb-2">September 2025</p>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <span key={i} className="text-[9px] font-semibold text-[#3A241C]/50">{d}</span>
                    ))}
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <div
                        key={d}
                        className={`w-5 h-5 flex items-center justify-center text-[9px] rounded-full mx-auto ${
                          d <= 14
                            ? "bg-green-100 text-green-700"
                            : d <= 18
                              ? "bg-[#F5E729]/30 text-[#1A1008]"
                              : "text-[#3A241C]/40"
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {index === 2 && (
              <>
                <div className="inline-flex items-center gap-1.5 bg-[#F5E729]/20 border border-[#F5E729]/40 rounded-full px-2.5 py-1 mb-3">
                  <span className="text-[11px] font-semibold text-[#1A1008]">
                    {(screen.content as typeof APP_SCREENS[2]["content"]).status}
                  </span>
                </div>
                <div className="bg-[#FBF6EE] rounded-xl p-3 border border-[#E8DFD4] mb-3">
                  <p className="text-xs font-bold text-[#1A1008] mb-1">
                    {(screen.content as typeof APP_SCREENS[2]["content"]).eta}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-[#5C1B13]/10 flex items-center justify-center text-[10px] font-bold text-[#5C1B13]">
                      RS
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#1A1008]">
                        {(screen.content as typeof APP_SCREENS[2]["content"]).partner}
                      </p>
                      <p className="text-[10px] text-[#3A241C]/60">Delivery Partner</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <FaStar className="w-3 h-3 text-[#F5E729]" />
                      <span className="text-[10px] font-bold text-[#1A1008]">
                        {(screen.content as typeof APP_SCREENS[2]["content"]).rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                  <FiThermometer className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span className="text-[10px] font-semibold text-blue-700">
                    {(screen.content as typeof APP_SCREENS[2]["content"]).temp}
                  </span>
                </div>
                {/* Live Delivery Route Visual (Replaced placeholder) */}
                <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-br from-[#FFFDF7] to-[#FBF6EE] border border-[#E8DFD4]">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#1A1008] mb-1.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Route in Raipur
                    </span>
                    <span className="text-[#5C1B13] text-[9px] font-bold">ETA 6:18 AM</span>
                  </div>
                  {/* Route Progress Graphic */}
                  <div className="relative py-2">
                    <div className="h-1.5 bg-[#E8DFD4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5C1B13] rounded-full w-3/4" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-[#3A241C]/70 mt-1.5 font-medium">
                      <span>Farm Chilling Center</span>
                      <span className="text-[#5C1B13] font-bold">Telibandha</span>
                      <span className="text-emerald-700 font-bold">Your Doorstep</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom nav bar */}
          <div className="flex items-center justify-around py-2 border-t border-[#E8DFD4]">
            {[FiHome, FiPackage, FiMapPin, FiUser].map((Icon, i) => (
              <span
                key={i}
                className={`text-sm ${i === index ? "text-[#5C1B13] opacity-100" : "text-[#3A241C] opacity-40"}`}
              >
                <Icon className="w-4 h-4" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Screen label */}
      <div className="text-center mt-4">
        <p className="text-sm font-semibold text-[#1A1008]">{screen.title}</p>
        <p className="text-xs text-[#3A241C]/60">{screen.subtitle}</p>
      </div>
    </div>
  );
}

export function AppShowcase() {
  const [activeScreenIndex, setActiveScreenIndex] = useState(1);
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.2 });

  // Phone mockups get a custom 3D-style entrance
  const phonesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = phonesRef.current;
    if (!el) return;

    const phones = el.querySelectorAll("[data-phone]");
    if (!phones.length) return;

    gsap.set(phones, { opacity: 0, y: 80, scale: 0.85, rotateY: 15 });

    const ctx = gsap.context(() => {
      gsap.to(phones, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: 0,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const featuresRef = useStaggerReveal<HTMLDivElement>("[data-app-feature]", {
    y: 40,
    stagger: 0.1,
    duration: 0.6,
  });
  const ctaRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0.1 });

  return (
    <Section background="default" id="app-showcase">
      {/* Badge */}
      <div ref={badgeRef} className="text-center mb-6">
        <span className="inline-flex items-center gap-2 bg-[#5C1B13]/10 border border-[#5C1B13]/20 text-[#5C1B13] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
          <FiSmartphone className="w-3.5 h-3.5" />
          <span>PuretyFarm Mobile App</span>
        </span>
      </div>

      <h2 ref={headingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
        Manage Everything{" "}
        <span className="text-[#5C1B13]">From Our App</span>
      </h2>

      <p ref={subtitleRef} className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
        Schedule deliveries, pause anytime, track your milkman live, and manage
        your subscription — all from one app.
      </p>

      {/* Interactive Screen Selector Tabs */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
        {APP_SCREENS.map((screen, i) => (
          <button
            key={screen.title}
            type="button"
            onClick={() => setActiveScreenIndex(i)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none ${
              activeScreenIndex === i
                ? "bg-[#5C1B13] text-white shadow-lg shadow-[#5C1B13]/25 scale-105"
                : "bg-white text-[#3A241C]/75 hover:bg-[#FAF3EA] border border-[#E8DFD4]"
            }`}
          >
            {screen.title}
          </button>
        ))}
      </div>

      {/* Real-time Push Notification Alert Card */}
      <div className="mt-6 flex justify-center px-4">
        <div className="inline-flex items-center gap-3 bg-[#1A1008] text-white rounded-2xl px-5 py-3 shadow-xl shadow-[#1A1008]/15 border border-white/15 max-w-lg w-full sm:w-auto">
          <FiTruck className="w-6 h-6 text-[#F5E729] flex-shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#F5E729] flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Delivery Alert
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white mt-0.5 leading-snug">
              Milked at dawn — Arriving 6:18 AM!
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 shrink-0">
            Active Slot
          </span>
        </div>
      </div>

      {/* Phone mockups carousel */}
      <div
        ref={phonesRef}
        data-lenis-prevent="true"
        data-lenis-prevent-touch="true"
        className="mt-8 sm:mt-10 w-full max-w-full overflow-x-auto pb-6 pt-2 scrollbar-hide flex justify-start sm:justify-center gap-4 sm:gap-6 snap-x snap-mandatory px-2 sm:px-4"
        style={{ perspective: "1200px" }}
      >
        {APP_SCREENS.map((screen, i) => (
          <PhoneMockup
            key={i}
            screen={screen}
            index={i}
            isActive={activeScreenIndex === i}
            onSelect={() => setActiveScreenIndex(i)}
          />
        ))}
      </div>

      {/* Feature badges */}
      <div ref={featuresRef} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {FEATURES.map((feature) => (
          <div
            key={feature.label}
            data-app-feature
            className="h-full"
          >
            <TiltCard tiltMaxAngle={6} scale={1.03} glare={true} className="h-full">
              <div className="flex flex-col items-center gap-2 bg-white rounded-xl border border-[#E8DFD4] p-4 shadow-sm hover:shadow-md transition-all duration-200 group h-full">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-[#5C1B13] group-hover:text-white transition-all duration-200">
                  <feature.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#1A1008] text-center group-hover:text-[#5C1B13] transition-colors">{feature.label}</p>
                <p className="text-xs text-[#3A241C]/60 text-center">{feature.detail}</p>
              </div>
            </TiltCard>
          </div>
        ))}
      </div>

      {/* Play Store CTA */}
      <div ref={ctaRef} className="mt-10 text-center">
        <button
          onClick={handleDownloadClick}
          className="inline-flex items-center gap-3 bg-[#1A1008] text-white rounded-xl px-7 py-3.5 hover:bg-[#2A2018] active:scale-95 hover:scale-105 transition-all duration-200 shadow-xl shadow-[#1A1008]/20 cursor-pointer"
        >
          <FaGooglePlay className="w-6 h-6 text-[#F5E729]" />
          <div className="text-left">
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">Get it on</p>
            <p className="text-base font-bold -mt-0.5">Google Play</p>
          </div>
        </button>

        {FLAGS.SHOW_3500_FAMILIES_LINE && (
          <p className="mt-4 text-sm text-[#3A241C]/60">
            Rated 4.8/5 by 3,500+ families across Shankar Nagar, Telibandha & VIP Road
          </p>
        )}
      </div>
    </Section>
  );
}
