"use client";

import { m } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ShinyText } from "@/components/reactbits";
import { handleTrialClick, getWhatsAppUrl } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import {
  FiClock,
  FiCheckCircle,
  FiCheck,
  FiX,
  FiAward,
  FiArrowRight,
  FiPackage,
} from "react-icons/fi";
import { FaCow, FaWhatsapp } from "react-icons/fa6";

const CORE_PILLARS = [
  {
    icon: FaCow,
    tag: "Indigenous Gir Heritage",
    title: "100% Pure A2 Gir Cow Milk",
    highlight: "Easy Digestion",
    description:
      "Sourced exclusively from desi Gir cows with natural A2 beta-casein protein. Identical in structure to mother's milk, so your family absorbs every nutrient without bloating, heaviness, or discomfort.",
    points: [
      "Naturally gentle on sensitive stomachs",
      "No A1 mutation, zero digestive heaviness",
      "Ethically reared, free-range grazing cows",
    ],
    badgeColor: "bg-[#5C1B13]/10 text-[#5C1B13]",
  },
  {
    icon: FiPackage,
    tag: "Zero Plastic Leaching",
    title: "Sanitized Glass Bottles",
    highlight: "100% Inert",
    description:
      "Ordinary plastic pouches leach harmful microplastics, BPA, and synthetic chemicals into warm milk. We deliver solely in sanitized, food-grade glass bottles collected and heat-sterilized at 85°C daily.",
    points: [
      "Zero chemical or microplastic contamination",
      "Retains crisp natural farm flavor",
      "Sanitized & doorstep collected daily",
    ],
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    icon: FiClock,
    tag: "Direct Cold Chain",
    title: "Dawn Milked to Doorstep",
    highlight: "< 3 Hours Fresh",
    description:
      "Commercial packet milk spends 2–4 days in collection centers and warehouses. PuretyFarm is milked at 4:30 AM, immediately chilled to 4°C, and delivered to your doorstep in Raipur before 10:00 AM.",
    points: [
      "Delivered before 10:00 AM every morning",
      "Temperature-locked at 4°C in insulated vans",
      "Zero warehouse pooling or multi-day storage",
    ],
    badgeColor: "bg-sky-100 text-sky-800",
  },
  {
    icon: FiCheckCircle,
    tag: "Zero Adulteration",
    title: "Raw, Whole & Unadulterated",
    highlight: "Golden Malai",
    description:
      "Pure milk forms a dense, golden layer of malai on boiling because we never skim or extract butterfat. Free from added water, synthetic thickeners, preservatives, and growth hormones. FSSAI licensed.",
    points: [
      "Thick, authentic malai crust on boiling",
      "Zero added water, starch, or synthetic fats",
      "100% unpasteurized raw farm goodness",
    ],
    badgeColor: "bg-amber-100 text-amber-900",
  },
] as const;

const COMPARISON_ROWS = [
  {
    feature: "Cow Breed & Protein",
    packet: "Crossbred cows with mutated A1 protein (triggers bloating & cramps)",
    puretyfarm: "100% Desi Gir cows with natural A2 protein (effortless digestion)",
  },
  {
    feature: "Packaging Quality",
    packet: "Single-use plastic pouches with chemical & microplastic leaching",
    puretyfarm: "Food-grade glass bottles heat-sanitized at 85°C daily (zero plastic touch)",
  },
  {
    feature: "Freshness & Transit",
    packet: "2–4 days old milk passed through multiple transit depots & bulk chillers",
    puretyfarm: "Milked at dawn, chilled at 4°C, and on your doorstep in under 3 hours",
  },
  {
    feature: "Natural Malai & Fat",
    packet: "Mechanically standardized & stripped of costly butterfat",
    puretyfarm: "Whole non-homogenized milk that forms a thick golden malai on boiling",
  },
  {
    feature: "Purity & Additives",
    packet: "Chemical emulsifiers, preservatives, and high risk of adulteration",
    puretyfarm: "100% unadulterated: zero added water, zero hormones, FSSAI certified",
  },
  {
    feature: "Morning Delivery",
    packet: "Self-pickup from neighborhood convenience stores",
    puretyfarm: "Free doorstep delivery before 10:00 AM across all Raipur localities",
  },
] as const;

export function WhyUs() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 25, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.15 });
  const cardsRef = useStaggerReveal<HTMLDivElement>("[data-pillar-card]", {
    y: 40,
    stagger: 0.12,
    duration: 0.6,
  });
  const compareRef = useScrollReveal<HTMLDivElement>({ y: 40, delay: 0.2 });

  return (
    <Section background="default" id="why-puretyfarm" className="scroll-mt-20">
      <span id="why-us" className="sr-only" aria-hidden="true" />
      {/* ─── HEADER ─── */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div ref={badgeRef}>
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 border border-[#5C1B13]/20 rounded-full px-4 py-1.5 mb-4 shadow-2xs">
            <FiAward className="w-4 h-4 text-[#5C1B13]" />
            <ShinyText text="The PuretyFarm Difference" speed={3.5} />
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight leading-tight"
        >
          Why Discerning Raipur Families Choose{" "}
          <span className="text-[#5C1B13] font-serif italic relative inline-block">
            PuretyFarm
            <span className="absolute bottom-1.5 left-0 right-0 h-2.5 bg-[#F5E729]/35 -z-10 rounded-sm" />
          </span>
        </h2>

        <p
          ref={subRef}
          className="mt-4 text-base sm:text-lg text-[#3A241C]/80 leading-relaxed max-w-2xl mx-auto"
        >
          Pure, unadulterated Gir cow milk delivered fresh to your doorstep every
          morning in eco-friendly glass bottles.
        </p>
      </div>

      {/* ─── 4 CORE PILLARS GRID ─── */}
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
      >
        {CORE_PILLARS.map((pillar) => {
          const PillarIcon = pillar.icon;
          return (
            <div
              key={pillar.title}
              data-pillar-card
              className="group relative rounded-3xl bg-white border border-[#E8DFD4] p-6 sm:p-8 shadow-xs hover:shadow-xl hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Highlight */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#5C1B13] group-hover:text-white transition-all duration-300 shrink-0">
                      <PillarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B584C] block">
                        {pillar.tag}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap self-start ${pillar.badgeColor}`}
                  >
                    {pillar.highlight}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed mb-5">
                  {pillar.description}
                </p>

                {/* Key Bullet Points */}
                <ul className="space-y-2.5 pt-4 border-t border-[#F2ECE4]">
                  {pillar.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2.5 text-xs text-[#2A1E17] font-medium"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FiCheck className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── SIDE-BY-SIDE COMPARISON CARD ─── */}
      <div ref={compareRef} className="mt-14 sm:mt-18 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5C1B13] bg-[#FAF3EA] px-3.5 py-1 rounded-full border border-[#E8DFD4]">
            Clear Comparison
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] mt-2.5">
            How PuretyFarm Compares to Packet Milk
          </h3>
          <p className="text-xs sm:text-sm text-[#3A241C]/75 mt-1 max-w-lg mx-auto">
            See why switching from single-use commercial pouch milk makes an immediate
            difference to your family&apos;s health.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-[#E8DFD4] shadow-md overflow-hidden">
          {/* Comparison Table Header */}
          <div className="grid grid-cols-12 bg-[#FAF3EA] border-b border-[#E8DFD4] text-xs sm:text-sm font-bold text-[#1A1008] p-4 sm:p-5 items-center">
            <div className="col-span-4 sm:col-span-3 text-[#6B584C] font-semibold uppercase tracking-wider text-[11px]">
              Feature
            </div>
            <div className="col-span-4 sm:col-span-4 text-red-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Commercial Packet Milk</span>
            </div>
            <div className="col-span-4 sm:col-span-5 text-[#5C1B13] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PuretyFarm A2 Glass Milk</span>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-[#F2ECE4]">
            {COMPARISON_ROWS.map((row, idx) => (
              <div
                key={row.feature}
                className={`grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-[#FFFDF7]/60"
                } hover:bg-[#FAF4ED]/50`}
              >
                {/* Metric Name */}
                <div className="col-span-4 sm:col-span-3 font-bold text-[#1A1008] pr-2">
                  {row.feature}
                </div>

                {/* Packet Milk Value */}
                <div className="col-span-4 sm:col-span-4 pr-3 flex items-start gap-2 text-[#5A453A]">
                  <FiX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="leading-snug">{row.packet}</span>
                </div>

                {/* PuretyFarm Value */}
                <div className="col-span-4 sm:col-span-5 flex items-start gap-2 font-medium text-[#1A1008] bg-[#FAF3EA]/40 -my-4 sm:-my-5 py-4 sm:py-5 px-3 rounded-lg border-l-2 border-[#5C1B13]">
                  <FiCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="leading-snug">{row.puretyfarm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ACTION BANNER ─── */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FAF3EA] via-white to-[#FAF3EA] border border-[#E8DFD4] shadow-sm max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
      >
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full mb-2">
            7-Day Starter Trial
          </span>
          <h4 className="text-xl sm:text-2xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
            Taste the PuretyFarm Difference
          </h4>
          <p className="text-xs sm:text-sm text-[#3A241C]/80 mt-1 max-w-md">
            Start your 7-day trial with non-refundable deposit and convenient daily morning delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleTrialClick}
            className="w-full sm:w-auto shadow-lg shadow-[#5C1B13]/25"
          >
            <span>Start 7-Day Trial</span>
            <FiArrowRight className="w-4 h-4" />
          </Button>

          <a
            href={getWhatsAppUrl("Hi PuretyFarm, I would like to know more about your A2 milk.")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#E8DFD4] text-[#1A1008] text-sm font-semibold hover:bg-[#FAF3EA] hover:border-[#5C1B13]/30 transition-all cursor-pointer min-h-[46px]"
          >
            <FaWhatsapp className="w-4 h-4 text-emerald-600" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>
      </m.div>
    </Section>
  );
}
