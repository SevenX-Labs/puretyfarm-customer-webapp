"use client";

import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { ShinyText } from "@/components/reactbits";
import { handleTrialClick, getWhatsAppUrl } from "@/lib/cta";
import { useScrollReveal } from "@/lib/animations";
import { FLAGS } from "@/config/flags";
import {
  FiActivity,
  FiPackage,
  FiClock,
  FiLayers,
  FiHeart,
  FiShield,
  FiSun,
  FiThermometer,
  FiDroplet,
  FiCoffee,
  FiAward,
  FiStar,
  FiAlertTriangle,
  FiGrid,
  FiRepeat,
  FiCompass,
  FiCheckCircle,
  FiCheck,
  FiX,
  FiCheckSquare,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

type TabMode = "bento" | "scanner" | "journey" | "tests";

// ─── COMPARISON SCANNER DATA ──────────────────────────────────────────────
const COMPARISON_CATEGORIES = [
  {
    id: "protein",
    icon: FiActivity,
    title: "Protein & Digestion",
    commercial: {
      label: "A1 Beta-Casein (Mutated)",
      source: "Crossbred European HF/Jersey cows",
      mechanism: "Releases BCM-7 opioid peptide during human digestion",
      symptoms: "Abdominal bloating, cramps, inflammation, brain fog",
      processing: "Mechanically homogenized; fat globule membranes ruptured",
      badge: "Digestive Discomfort",
    },
    puretyfarm: {
      label: "100% Pure A2 Beta-Casein",
      source: "Indigenous Bos Indicus Gir cows with sacred hump",
      mechanism: "Proline bond prevents BCM-7 release; identical to mother's milk",
      symptoms: "Effortlessly absorbed; soothing on stomach & gut lining",
      processing: "Raw & non-homogenized; whole natural butterfat intact",
      badge: "Gentle & Nourishing",
    },
  },
  {
    id: "packaging",
    icon: FiPackage,
    title: "Packaging & Safety",
    commercial: {
      label: "Single-Use Plastic Pouches",
      source: "Recycled thin polyethylene plastic bags",
      mechanism: "Hot pasteurized milk filled directly into plastic film",
      symptoms: "Microplastics, phthalates, and Bisphenol-A (BPA) leach into milk",
      processing: "Non-degradable waste discarded into landfills daily",
      badge: "Chemical Leach Risk",
    },
    puretyfarm: {
      label: "Sterilized Food-Grade Glass",
      source: "100% inert thick glass bottles sealed with tamper foil",
      mechanism: "Zero chemical leaching at any ambient or chilled temperature",
      symptoms: "Pure, pristine taste without synthetic polymer odor",
      processing: "Returned daily, washed & heat-sanitized at 85°C, zero waste",
      badge: "Zero Plastic Touch",
    },
  },
  {
    id: "freshness",
    icon: FiClock,
    title: "Freshness & Transit",
    commercial: {
      label: "Multi-Day Depot Milk",
      source: "Pooled from hundreds of unmonitored middleman contractors",
      mechanism: "Stored in chilling centers, tankers, and depots for days",
      symptoms: "Natural enzymes destroyed; reconstituted with milk solids & water",
      processing: "Reaches your kitchen 48 to 96 hours after milking",
      badge: "3–4 Days Old",
    },
    puretyfarm: {
      label: "Dawn Milked to Doorstep",
      source: "Our dedicated single-origin Gir cow gaushala near Raipur",
      mechanism: "Plate-chilled to 4°C within 15 mins of dawn milking",
      symptoms: "Living enzymes, active vitamins & natural sweetness retained",
      processing: "Milked at 4:30 AM, delivered to your door before 7:00 AM",
      badge: "< 3 Hours Fresh",
    },
  },
  {
    id: "malai",
    icon: FiLayers,
    title: "Butterfat & Malai",
    commercial: {
      label: "Standardized Toned Milk",
      source: "Centrifuged to extract costly butterfat for commercial sale",
      mechanism: "Stripped down to artificially low 3.0% or 3.5% fat level",
      symptoms: "Thin, watery texture; almost zero malai crust on boiling",
      processing: "Synthetic emulsifiers added to disguise watery consistency",
      badge: "Stripped Fat",
    },
    puretyfarm: {
      label: "Whole 4.2%+ Golden Malai",
      source: "Untouched, unstandardized natural whole cow milk",
      mechanism: "Rich natural fat globules rise naturally to the surface",
      symptoms: "Forms a thick, velvety golden clotted cream layer on boiling",
      processing: "Traditional churned desi ghee can be made directly at home",
      badge: "Thick Natural Malai",
    },
  },
  {
    id: "welfare",
    icon: FiHeart,
    title: "Ahimsa Cow Care",
    commercial: {
      label: "Factory Dairy Farming",
      source: "High-density stalls; cows tethered on hard concrete floors",
      mechanism: "Oxytocin injections to artificially force abnormal milk yield",
      symptoms: "Calves taken away at birth; aging cows sold off commercially",
      processing: "High animal stress hormones leach into daily milk supply",
      badge: "Commercial Exploitation",
    },
    puretyfarm: {
      label: "Sacred Ahimsa Sanctuary",
      source: "Open-range grazing under warm sunlight with organic herbal greens",
      mechanism: "Zero hormone injections; cows milked only by gentle hand/cup",
      symptoms: "Calves drink their full fill first before morning collection",
      processing: "Lifelong sanctuary care for retired mothers; zero slaughter",
      badge: "Ahimsa Cruelty-Free",
    },
  },
] as const;

// ─── DAWN-TO-DOORSTEP TIMELINE DATA ───────────────────────────────────────
const JOURNEY_STEPS = [
  {
    time: "04:30 AM",
    phase: "Dawn Awakening",
    title: "Vedic Milking & Calves Drink First",
    location: "Raipur Farm Gaushala",
    temperature: "37°C (Natural)",
    description:
      "Our Desi Gir cows wake to soothing Indian classical ragas. Every calf drinks its full fill from its mother before clean, untouched milking begins.",
    keyMetrics: [
      { label: "Calf Priority", value: "100%" },
      { label: "Oxytocin Used", value: "0.0%" },
      { label: "Feed Type", value: "Organic Greens" },
    ],
    statusPill: "Sacred Milking",
  },
  {
    time: "04:55 AM",
    phase: "Cold Lock",
    title: "Instant 4°C Plate Heat-Exchanger Chilling",
    location: "On-Farm Dairy Processing Unit",
    temperature: "4.0°C (Cold Locked)",
    description:
      "Within 15 minutes of milking, fresh milk passes through rapid stainless steel plate heat exchangers, locking in live enzymes without high-heat boiling.",
    keyMetrics: [
      { label: "Chill Speed", value: "< 15 Mins" },
      { label: "Core Temp", value: "4°C Fixed" },
      { label: "Enzyme Retention", value: "99.8%" },
    ],
    statusPill: "Bacteria Guard",
  },
  {
    time: "05:25 AM",
    phase: "Lab Screening",
    title: FLAGS.SHOW_40_TESTS_CLAIM
      ? "40+ Digital Lab Purity & Safety Checks"
      : "Digital Lab Purity & Safety Checks",
    location: "Certified Quality Testing Lab",
    temperature: "4.0°C (Controlled)",
    description:
      "Digital lactometers and biochemical testing kits test every single batch for water adulteration, detergents, urea, starch, antibiotics, and synthetic adulterants.",
    keyMetrics: [
      {
        label: "Parameters Tested",
        value: FLAGS.SHOW_40_TESTS_CLAIM ? "40+" : "Screened",
      },
      { label: "Added Water", value: "0.0%" },
      { label: "Batch Clearance", value: "Verified" },
    ],
    statusPill: "Lab Certified",
  },
  {
    time: "05:55 AM",
    phase: "Aseptic Packaging",
    title: "Bottled in 85°C Sanitized Glass Bottles",
    location: "Automated Bottling Line",
    temperature: "4.0°C (Insulated)",
    description:
      "Chilled milk flows into heavy, food-grade glass bottles that were sanitized at 85°C and foil-sealed. Zero plastic touch, zero chemical microplastic leaching.",
    keyMetrics: [
      { label: "Plastic Touch", value: "0.0%" },
      { label: "Sanitization Temp", value: "85°C" },
      { label: "Tamper Proof", value: "Foil Sealed" },
    ],
    statusPill: "Zero Plastic",
  },
  {
    time: "06:40 AM",
    phase: "Direct Delivery",
    title: "Delivered to Your Doorstep in Raipur",
    location: "Raipur Neighborhoods",
    temperature: "4.2°C (Insulated Vans)",
    description:
      "Our dedicated temperature-controlled delivery vans deliver the sealed glass bottles right to your doorstep before 7:00 AM, in time for your morning tea.",
    keyMetrics: [
      { label: "Transit Time", value: "< 180 Mins" },
      { label: "Delivery By", value: "07:00 AM" },
      { label: "Doorstep Fresh", value: "100%" },
    ],
    statusPill: "Before 7:00 AM",
  },
] as const;

// ─── KITCHEN PURITY TESTS DATA ────────────────────────────────────────────
const KITCHEN_TESTS = [
  {
    id: "malai",
    icon: FiLayers,
    name: "The Golden Malai Boil Test",
    badge: "Fat & Processing Test",
    objective: "Verify raw whole butterfat content vs commercial stripped milk",
    steps: [
      "Pour 1 litre of PuretyFarm milk into a clean heavy-bottomed vessel.",
      "Bring it slowly to a gentle boil on medium flame, then turn off heat.",
      "Allow it to cool naturally to room temperature, then refrigerate for 3 hours.",
    ],
    puretyResult: {
      headline: "Forms a thick, velvety layer of golden natural malai",
      detail:
        "You can lift a full clotted cream disc with a spoon. Perfect for churning homemade aromatic Desi Danedar Ghee. Real cow beta-carotene gives it a distinct golden hue.",
    },
    adulteratedWarning:
      "Commercial homogenized packet milk forms only a thin, fragile, watery skin because natural fat has been stripped out to make commercial cream and butter.",
  },
  {
    id: "glass",
    icon: FiDroplet,
    name: "The Glass Wall Sheen Test",
    badge: "Water & Chalk Test",
    objective: "Detect added water, chalk, or synthetic chemical thinning",
    steps: [
      "Pour 100ml of cold PuretyFarm milk into a clear, dry glass tumbler.",
      "Tilt the glass gently to coat the inside walls with milk, then hold it upright.",
      "Observe the residue trail as milk drains down the glass surface.",
    ],
    puretyResult: {
      headline: "Leaves an even, translucent white coating with zero sediment",
      detail:
        "The milk clings smoothly to the glass wall without streaking or dropping instantaneously like water. No chalky powder settles at the bottom of the glass.",
    },
    adulteratedWarning:
      "Watered-down milk flows down instantly without coating the glass. Adulterated milk containing chalk or starch leaves a gritty, powdery ring on the glass walls.",
  },
  {
    id: "stomach",
    icon: FiHeart,
    name: "The Light Stomach Absorption Test",
    badge: "Gut Health & Digestion",
    objective: "Feel zero bloating, acid reflux, or post-milk heaviness",
    steps: [
      "Drink one warm 250ml cup of PuretyFarm A2 milk on an empty stomach in the morning.",
      "Observe how your digestion and energy feels over the following 2 hours.",
      "Compare with your typical reaction to commercial pouch or packet milk.",
    ],
    puretyResult: {
      headline: "Light, energizing, and deeply soothing on the gut",
      detail:
        "Because pure Gir cow milk carries the 100% natural A2 proline bond, human digestive enzymes break it down effortlessly without producing inflammatory BCM-7 peptides.",
    },
    adulteratedWarning:
      "Commercial A1 packet milk frequently triggers gut spasms, bloating, heaviness, and lactose-intolerance symptoms within 30–60 minutes of drinking.",
  },
  {
    id: "chai",
    icon: FiCoffee,
    name: "The Morning Chai Aroma & Color Test",
    badge: "Natural Sweetness Test",
    objective: "Experience authentic taste without artificial milk powders",
    steps: [
      "Brew your daily morning chai using PuretyFarm milk without adding any sugar initially.",
      "Take a slow sip to taste the natural sweetness of the milk.",
      "Inhale the aroma rising from your freshly brewed tea cup.",
    ],
    puretyResult: {
      headline: "Rich creamy body with natural sweet fragrance and deep amber color",
      detail:
        "Requires significantly less sugar because fresh Gir cow milk possesses natural sweetness. The chai turns a rich, creamy, appetizing cafe-style amber.",
    },
    adulteratedWarning:
      "Packet milk chai often tastes flat, watery, or has a faint burnt/chemical odor from powdered milk reconstitution and artificial preservatives.",
  },
] as const;

// ─── LAB TEST CHIPS WITH DETAILED INSPECTION ──────────────────────────────
const LAB_TEST_CHIPS = [
  { name: "Synthetic Milk", result: "0.0%", status: "Negative", info: "Checked for caustic soda & vegetable oil emulsions" },
  { name: "Detergents", result: "0.0%", status: "Negative", info: "Zero synthetic foam stabilizers or lathering agents" },
  { name: "Urea", result: "0.0%", status: "Negative", info: "Enzymatic testing ensures zero nitrogen adulteration" },
  { name: "Starch & Flour", result: "0.0%", status: "Negative", info: "Iodine reagent test reveals zero thickening agents" },
  { name: "Added Water", result: "0.0%", status: "Pure", info: "Digital lactometer reading calibrated to pure 1.032 density" },
  { name: "Antibiotics", result: "0.0%", status: "Negative", info: "Zero trace pharmaceutical residue from healthy cows" },
  { name: "Oxytocin Hormones", result: "0.0%", status: "Negative", info: "100% natural let-down without artificial hormonal stimulants" },
  { name: "Preservatives", result: "0.0%", status: "Negative", info: "Zero formalin, hydrogen peroxide, or benzoic acid" },
  { name: "Heavy Metals", result: "0.0%", status: "Safe", info: "Screened for lead, arsenic, and cadmium contamination" },
  { name: "Coliform Bacteria", result: "SAFE", status: "Certified", info: "Rapid chill to 4°C prevents microbial proliferation" },
] as const;

export function WhyUs() {
  const [activeTab, setActiveTab] = useState<TabMode>("bento");
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);
  const [activeKitchenTest, setActiveKitchenTest] = useState<number>(0);
  const [inspectedLabChip, setInspectedLabChip] = useState<number | null>(null);

  const badgeRef = useScrollReveal<HTMLSpanElement>({ y: 20, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });

  return (
    <Section background="cream" id="why-puretyfarm" className="relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div
        aria-hidden="true"
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#F5E729]/15 via-[#FAF3EA]/40 to-transparent blur-3xl pointer-events-none -z-10"
      />

      {/* ─── SECTION HEADER ─── */}
      <div className="text-center mb-8 max-w-4xl mx-auto">
        <span
          ref={badgeRef}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 border border-[#5C1B13]/20 rounded-full px-4 py-1.5 mb-4 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#5C1B13] animate-pulse" />
          <ShinyText text="The PuretyFarm Gold Standard" speed={3.5} />
        </span>

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

        {/* ─── CREATIVE EXPERIENCE MODE TABS (DRIBBLE/PINTEREST STYLE) ─── */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("bento")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === "bento"
                ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/25 scale-105"
                : "bg-white text-[#3A241C] border border-[#E8DFD4] hover:bg-[#FAF3EA]"
            }`}
          >
            <FiGrid className="w-4 h-4" />
            <span>The 6 Sacred Pillars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scanner")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === "scanner"
                ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/25 scale-105"
                : "bg-white text-[#3A241C] border border-[#E8DFD4] hover:bg-[#FAF3EA]"
            }`}
          >
            <FiRepeat className="w-4 h-4" />
            <span>Packet vs. Glass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("journey")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === "journey"
                ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/25 scale-105"
                : "bg-white text-[#3A241C] border border-[#E8DFD4] hover:bg-[#FAF3EA]"
            }`}
          >
            <FiCompass className="w-4 h-4" />
            <span>Dawn-to-Doorstep</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === "tests"
                ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/25 scale-105"
                : "bg-white text-[#3A241C] border border-[#E8DFD4] hover:bg-[#FAF3EA]"
            }`}
          >
            <FiCheckSquare className="w-4 h-4" />
            <span>At-Home Kitchen Lab</span>
          </button>
        </div>
      </div>

      {/* ─── TAB CONTENT PANELS ─── */}
      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════════════════════════════════
            MODE 1: THE MASTER ASYMMETRICAL BENTO GRID
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "bento" && (
          <m.div
            key="bento"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto items-stretch"
          >
            {/* ─── ROW 1: CARD 1 (Spans 2 cols) + CARD 2 (Spans 1 col) ─── */}

            {/* Bento Card 1: The Gir Cow Genetics & Ahimsa Pastures (Spans 2 columns) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col">
              <TiltCard tiltMaxAngle={3} scale={1.01} glare={true} className="h-full">
                <div className="relative h-full bg-gradient-to-br from-white via-[#FFFDF7] to-[#FAF3EA] rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                  <div
                    aria-hidden="true"
                    className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#F5E729]/20 blur-3xl pointer-events-none"
                  />

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13] text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
                        <FiAward className="w-3.5 h-3.5 text-[#F5E729]" />
                        <span>Pillar 01 · Indigenous Gir Heritage</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-3 py-1 rounded-full">
                        Surya Ketu Nadi Genetics
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-tight">
                      Sacred Gir Cows Grazing in Natural Organic Pastures
                    </h3>

                    <p className="mt-3 text-sm sm:text-base text-[#3A241C]/85 leading-relaxed max-w-2xl">
                      Commercial dairies crossbreed European HF/Jersey cows for volume. Our indigenous Desi Gir cows possess the sacred hump that absorbs solar energy through the Surya Ketu Nadi, synthesizing 100% natural A2 beta-casein with uncompromised vitality.
                    </p>
                  </div>

                  {/* 4 Aligned proof metric tiles */}
                  <div className="mt-6 pt-6 border-t border-[#E8DFD4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-white/90 border border-[#E8DFD4] shadow-2xs transition-transform hover:-translate-y-0.5">
                      <p className="text-lg sm:text-xl font-black text-[#5C1B13]">0%</p>
                      <p className="text-[11px] font-semibold text-[#3A241C]/75">Oxytocin / Hormones</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/90 border border-[#E8DFD4] shadow-2xs transition-transform hover:-translate-y-0.5">
                      <p className="text-lg sm:text-xl font-black text-[#5C1B13]">100%</p>
                      <p className="text-[11px] font-semibold text-[#3A241C]/75">Herbal Organic Diet</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/90 border border-[#E8DFD4] shadow-2xs transition-transform hover:-translate-y-0.5">
                      <p className="text-lg sm:text-xl font-black text-[#5C1B13]">Ahimsa</p>
                      <p className="text-[11px] font-semibold text-[#3A241C]/75">Calves Feed First</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/90 border border-[#E8DFD4] shadow-2xs transition-transform hover:-translate-y-0.5">
                      <p className="text-lg sm:text-xl font-black text-[#5C1B13]">100% A2</p>
                      <p className="text-[11px] font-semibold text-[#3A241C]/75">Natural Proline Bond</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Bento Card 2: Glass Bottle Showcase with Visual Asset (Spans 1 column) */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
              <TiltCard tiltMaxAngle={4} scale={1.015} glare={true} className="h-full">
                <div className="h-full bg-gradient-to-br from-white to-[#FAF6F0] rounded-3xl border border-[#E8DFD4] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1B13] bg-[#FAF3EA] px-2.5 py-1 rounded-full border border-[#E8DFD4] flex items-center gap-1">
                        <FiPackage className="w-3 h-3" />
                        <span>Pillar 02 · Zero Plastic</span>
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        85°C Sanitized
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                      Hermetic Eco-Glass Bottles
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
                      Hot milk in plastic pouches leaches endocrine-disrupting BPA and microplastics. We chill milk instantly to 4°C into thick, food-grade glass.
                    </p>
                  </div>

                  {/* Bottle Visual Cutout */}
                  <div className="relative my-3 flex items-center justify-center h-32">
                    <Image
                      src="/pure-milk-bottle-3d.webp"
                      alt="PuretyFarm Sterilized Glass Bottle"
                      width={120}
                      height={160}
                      className="h-28 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-1 bg-white/95 backdrop-blur-xs border border-[#E8DFD4] text-[10px] font-bold text-[#1A1008] px-3 py-1 rounded-full shadow-2xs">
                      Deposit Waived · Doorstep Pickup
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8DFD4] flex items-center justify-between text-xs font-semibold text-[#3A241C]/80">
                    <span>100% Inert Material</span>
                    <span className="text-emerald-700 font-bold">Zero Plastic Leach</span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* ─── ROW 2: 3 EQUAL BALANCED PILLARS (CARD 3, CARD 4, CARD 5) ─── */}

            {/* Bento Card 3: Dawn Milking to Doorstep */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
              <TiltCard tiltMaxAngle={4} scale={1.015} glare={true} className="h-full">
                <div className="h-full bg-white rounded-3xl border border-[#E8DFD4] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#F5E729]/30 text-[#5C1B13] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiSun className="w-5 h-5 text-[#5C1B13]" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1B13] bg-[#FAF3EA] px-2.5 py-1 rounded-full border border-[#E8DFD4]">
                        Pillar 03 · Dawn Milking
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] min-h-[56px] flex items-center">
                      Milked at 4:30 AM · Delivered by 7:00 AM
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
                      Zero warehouse pooling or multi-day cold storage. Milked at dawn, temperature locked at 4°C, and on your doorstep in Raipur in under 3 hours.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E8DFD4]/80 flex items-center justify-between text-xs text-[#3A241C]/75 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Raipur Local Van Fleet
                    </span>
                    <span className="text-[#5C1B13] font-bold">&lt; 180 Mins Fresh</span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Bento Card 4: Authentic Malai Layer */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
              <TiltCard tiltMaxAngle={4} scale={1.015} glare={true} className="h-full">
                <div className="h-full bg-white rounded-3xl border border-[#E8DFD4] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiLayers className="w-5 h-5 text-[#5C1B13]" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1B13] bg-[#FAF3EA] px-2.5 py-1 rounded-full border border-[#E8DFD4]">
                        Pillar 04 · Natural Malai
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] min-h-[56px] flex items-center">
                      Whole Natural Golden Malai Crust
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
                      We never strip butterfat or mechanically homogenize our milk. Boil once, cool, and lift a thick velvety crust of authentic golden cream ready for homemade ghee.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E8DFD4]/80 flex items-center justify-between text-xs text-[#3A241C]/75 font-semibold">
                    <span>Non-Homogenized 4.2%+</span>
                    <span className="text-[#5C1B13] font-bold">Raw & Untouched</span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Bento Card 5: Sacred Ahimsa Sanctuary & Mother-Calf Care (Completes the 3-column row!) */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
              <TiltCard tiltMaxAngle={4} scale={1.015} glare={true} className="h-full">
                <div className="h-full bg-white rounded-3xl border border-[#E8DFD4] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#5C1B13] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiHeart className="w-5 h-5 text-rose-700" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        Pillar 05 · Ahimsa Sanctuary
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] min-h-[56px] flex items-center">
                      Calves Feed First &amp; Lifelong Care
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed">
                      Every calf drinks its full fill from its mother before milking begins. Our aging cows enjoy lifelong sanctuary care with zero slaughter or commercial exploitation.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E8DFD4]/80 flex items-center justify-between text-xs text-[#3A241C]/75 font-semibold">
                    <span>Cruelty-Free Sanctuary</span>
                    <span className="text-emerald-700 font-bold">100% Ethical</span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* ─── ROW 3: CARD 6 (Command Station Spans Full 3 Columns) ─── */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
              <TiltCard tiltMaxAngle={2} scale={1.008} glare={true} className="h-full">
                <div className="h-full bg-gradient-to-r from-white via-[#FAF3EA]/80 to-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13] text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
                        <FiShield className="w-3.5 h-3.5 text-[#F5E729]" />
                        <span>Pillar 06 · Digital On-Farm Lab Station</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                          Zero Adulteration Tolerance
                        </span>
                        <span className="hidden sm:inline-block text-xs font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#E8DFD4] px-3 py-1 rounded-full">
                          {FLAGS.SHOW_FSSAI_CLAIM
                            ? "FSSAI Compliant · Click Test to Inspect"
                            : "Daily Quality Screening · Click Test to Inspect"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                      {FLAGS.SHOW_40_TESTS_CLAIM
                        ? "40+ Daily Laboratory Checks Every Morning Before Dispatch"
                        : "Rigorous Daily Laboratory Checks Every Morning Before Dispatch"}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed max-w-3xl">
                      Every single morning batch is digitally tested on-farm before dispatch to Raipur. Click any test chip below to inspect our testing methodology and tolerance score.
                    </p>
                  </div>

                  {/* Interactive Test Tag Badges Grid */}
                  <div className="mt-5 pt-4 border-t border-[#E8DFD4] flex flex-wrap gap-2">
                    {LAB_TEST_CHIPS.map((chip, index) => {
                      const isSelected = inspectedLabChip === index;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setInspectedLabChip(isSelected ? null : index)}
                          className={`text-[11px] font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-xs scale-105"
                              : "bg-white border-[#E8DFD4] text-[#1A1008] hover:bg-[#FAF3EA] hover:border-[#5C1B13]/30"
                          }`}
                        >
                          <FiCheck className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-emerald-600"}`} />
                          <span>{chip.name}:</span>
                          <span className={isSelected ? "text-[#F5E729]" : "text-[#5C1B13]"}>{chip.result}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inspected test detail overlay */}
                  {inspectedLabChip !== null && (
                    <m.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-white rounded-2xl border border-[#5C1B13]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#5C1B13]">
                          {LAB_TEST_CHIPS[inspectedLabChip].name}:{" "}
                        </span>
                        <span className="text-[#3A241C]/85">
                          {LAB_TEST_CHIPS[inspectedLabChip].info}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto">
                        Status: {LAB_TEST_CHIPS[inspectedLabChip].status}
                      </span>
                    </m.div>
                  )}
                </div>
              </TiltCard>
            </div>
          </m.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODE 2: THE INTERACTIVE PURITY SCANNER (COMMERCIAL VS PURETYFARM)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "scanner" && (
          <m.div
            key="scanner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Category Switcher Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {COMPARISON_CATEGORIES.map((cat, idx) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(idx)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeCategory === idx
                        ? "bg-[#5C1B13] text-white shadow-md shadow-[#5C1B13]/20 scale-105"
                        : "bg-white text-[#3A241C] border border-[#E8DFD4] hover:bg-[#FAF3EA]"
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Split Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Ordinary Commercial Packet Milk */}
              <div className="rounded-3xl bg-[#FAF6F0] border-2 border-red-300/80 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-100/90 border border-red-200 px-3 py-1 rounded-full">
                      Commercial Packet Milk
                    </span>
                    <FiAlertTriangle className="w-5 h-5 text-red-600" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                    {COMPARISON_CATEGORIES[activeCategory].commercial.label}
                  </h3>

                  <div className="mt-6 space-y-4 text-xs sm:text-sm text-[#3A241C]/85">
                    <div className="flex items-start gap-3">
                      <FiX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Source</p>
                        <p className="text-[#3A241C]/80 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].commercial.source}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Mechanism</p>
                        <p className="text-[#3A241C]/80 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].commercial.mechanism}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Impact On You</p>
                        <p className="text-[#3A241C]/80 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].commercial.symptoms}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Processing Method</p>
                        <p className="text-[#3A241C]/80 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].commercial.processing}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-red-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 bg-red-100 px-3 py-1 rounded-lg">
                    Risk: {COMPARISON_CATEGORIES[activeCategory].commercial.badge}
                  </span>
                  <span className="text-xs text-red-700/80 font-semibold">Ordinary Pouch Standard</span>
                </div>
              </div>

              {/* PuretyFarm 100% Pure A2 Gir Cow Milk */}
              <div className="rounded-3xl bg-gradient-to-br from-white via-[#FFFDF7] to-[#FAF3EA] border-2 border-[#5C1B13] p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-[#5C1B13]/10 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-[#F5E729]/25 blur-2xl pointer-events-none"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-white bg-[#5C1B13] px-3.5 py-1 rounded-full shadow-xs">
                      PuretyFarm 100% Raw A2
                    </span>
                    <FiStar className="w-5 h-5 text-[#F5E729]" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                    {COMPARISON_CATEGORIES[activeCategory].puretyfarm.label}
                  </h3>

                  <div className="mt-6 space-y-4 text-xs sm:text-sm text-[#1A1008]">
                    <div className="flex items-start gap-3">
                      <FiCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Source</p>
                        <p className="text-[#3A241C]/85 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].puretyfarm.source}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Mechanism</p>
                        <p className="text-[#3A241C]/85 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].puretyfarm.mechanism}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Impact On You</p>
                        <p className="text-[#3A241C]/85 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].puretyfarm.symptoms}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="font-bold text-[#1A1008]">Processing Method</p>
                        <p className="text-[#3A241C]/85 mt-0.5">{COMPARISON_CATEGORIES[activeCategory].puretyfarm.processing}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E8DFD4] relative z-10 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">
                    Benefit: {COMPARISON_CATEGORIES[activeCategory].puretyfarm.badge}
                  </span>
                  <span className="text-xs font-bold text-[#5C1B13]">
                    100% Raw Chilled
                  </span>
                </div>
              </div>
            </div>
          </m.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODE 3: THE DAWN-TO-DOORSTEP JOURNEY TIMELINE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "journey" && (
          <m.div
            key="journey"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Interactive Timeline Stepper Buttons */}
            <div className="relative mb-10">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-[#E8DFD4] -translate-y-1/2 -z-10" />

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
                {JOURNEY_STEPS.map((step, idx) => {
                  const isActive = activeJourneyStep === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveJourneyStep(idx)}
                      className={`p-3 rounded-2xl border text-left sm:text-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-md shadow-[#5C1B13]/25 scale-105"
                          : "bg-white text-[#3A241C] border-[#E8DFD4] hover:bg-[#FAF3EA]"
                      }`}
                    >
                      <p className={`text-xs font-black uppercase ${isActive ? "text-[#F5E729]" : "text-[#5C1B13]"}`}>
                        {step.time}
                      </p>
                      <p className="text-xs font-bold mt-1 truncate">
                        {step.phase}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[#FAF3EA] text-[#3A241C]/70"
                      }`}>
                        {step.statusPill}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Journey Detail Card */}
            <div className="bg-gradient-to-br from-white via-[#FFFDF7] to-[#FAF3EA] rounded-3xl border-2 border-[#5C1B13]/20 p-6 sm:p-8 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8DFD4]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C1B13] bg-[#FAF3EA] px-3 py-1 rounded-full border border-[#E8DFD4]">
                    Stage 0{activeJourneyStep + 1} of 05 · {JOURNEY_STEPS[activeJourneyStep].phase}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] mt-2">
                    {JOURNEY_STEPS[activeJourneyStep].title}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD4] text-xs font-bold text-[#1A1008] shadow-2xs">
                    <FiCompass className="w-3.5 h-3.5 text-amber-600" />
                    <span>{JOURNEY_STEPS[activeJourneyStep].location}</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    {JOURNEY_STEPS[activeJourneyStep].temperature}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm sm:text-base text-[#3A241C]/85 leading-relaxed max-w-3xl">
                {JOURNEY_STEPS[activeJourneyStep].description}
              </p>

              {/* Real-Time Live Farm Metrics */}
              <div className="mt-6 pt-6 border-t border-[#E8DFD4] grid grid-cols-1 sm:grid-cols-3 gap-4">
                {JOURNEY_STEPS[activeJourneyStep].keyMetrics.map((metric, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#E8DFD4] shadow-2xs">
                    <p className="text-xs font-semibold text-[#3A241C]/70">{metric.label}</p>
                    <p className="text-xl font-black text-[#5C1B13] mt-1">{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 flex items-center justify-between text-xs text-[#3A241C]/70 font-semibold">
                <button
                  type="button"
                  disabled={activeJourneyStep === 0}
                  onClick={() => setActiveJourneyStep((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#E8DFD4] bg-white hover:bg-[#FAF3EA] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
                >
                  <FiArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Stage</span>
                </button>
                <span>Step {activeJourneyStep + 1} of 5</span>
                <button
                  type="button"
                  disabled={activeJourneyStep === JOURNEY_STEPS.length - 1}
                  onClick={() => setActiveJourneyStep((prev) => Math.min(JOURNEY_STEPS.length - 1, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#E8DFD4] bg-white hover:bg-[#FAF3EA] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold text-[#5C1B13] inline-flex items-center gap-1"
                >
                  <span>Next Stage</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </m.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODE 4: AT-HOME KITCHEN LAB (EMPIRICAL VERIFICATION TESTS)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "tests" && (
          <m.div
            key="tests"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Test Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {KITCHEN_TESTS.map((t, idx) => {
                const TestIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveKitchenTest(idx)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      activeKitchenTest === idx
                        ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-md shadow-[#5C1B13]/20 scale-102"
                        : "bg-white text-[#3A241C] border-[#E8DFD4] hover:bg-[#FAF3EA]"
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mb-2">
                        <TestIcon className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${activeKitchenTest === idx ? "text-[#F5E729]" : "text-[#5C1B13]"}`}>
                        Test 0{idx + 1}
                      </p>
                      <p className="text-xs sm:text-sm font-bold mt-0.5 leading-tight">
                        {t.name}
                      </p>
                    </div>
                    <span className={`inline-block mt-3 text-[10px] px-2 py-0.5 rounded-md ${
                      activeKitchenTest === idx ? "bg-white/20 text-white" : "bg-[#FAF3EA] text-[#3A241C]/70"
                    }`}>
                      {t.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Test Workbench Card */}
            <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8DFD4]">
                <div>
                  <span className="text-xs font-bold text-[#5C1B13] uppercase tracking-wider bg-[#FAF3EA] px-3 py-1 rounded-full border border-[#E8DFD4]">
                    {KITCHEN_TESTS[activeKitchenTest].badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] mt-2">
                    {KITCHEN_TESTS[activeKitchenTest].name}
                  </h3>
                </div>

                <div className="text-xs font-bold text-[#1A1008] bg-[#FAF3EA] px-3.5 py-1.5 rounded-xl border border-[#E8DFD4]">
                  Objective: {KITCHEN_TESTS[activeKitchenTest].objective}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A241C]/70 mb-3">
                  How To Perform In Your Kitchen (3 Steps):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {KITCHEN_TESTS[activeKitchenTest].steps.map((step, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DFD4] text-xs leading-relaxed">
                      <span className="inline-block w-5 h-5 rounded-full bg-[#5C1B13] text-white text-[11px] font-bold text-center leading-5 mb-2">
                        {i + 1}
                      </span>
                      <p className="text-[#3A241C]/85 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PuretyFarm Result vs Common Market Failure */}
              <div className="mt-6 pt-6 border-t border-[#E8DFD4] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                      <FiCheck className="w-4 h-4 text-emerald-600" />
                      <span>PuretyFarm Result:</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Pass Guaranteed</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-emerald-950">
                    {KITCHEN_TESTS[activeKitchenTest].puretyResult.headline}
                  </p>
                  <p className="mt-1 text-xs text-emerald-900/80 leading-relaxed">
                    {KITCHEN_TESTS[activeKitchenTest].puretyResult.detail}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-700 font-bold text-sm flex items-center gap-1.5">
                      <FiX className="w-4 h-4 text-red-600" />
                      <span>Commercial Packet Warning:</span>
                    </span>
                    <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">Common Risk</span>
                  </div>
                  <p className="text-xs text-red-900/85 leading-relaxed">
                    {KITCHEN_TESTS[activeKitchenTest].adulteratedWarning}
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── DIRECT TRIAL GUARANTEE FOOTER ─── */}
      <div className="mt-12 text-center bg-gradient-to-br from-white via-[#FFFDF7] to-[#FAF3EA] rounded-3xl border-2 border-[#5C1B13]/15 p-6 sm:p-8 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#F5E729]/20 blur-2xl pointer-events-none"
        />

        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#5C1B13] bg-[#FAF3EA] px-3.5 py-1 rounded-full border border-[#E8DFD4] mb-3">
          Raipur Direct 7-Day Guarantee
        </span>

        <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
          Taste the Authentic Difference for 7 Days
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[#3A241C]/80 max-w-lg mx-auto leading-relaxed">
          Zero plastic. Zero deposit required for eco-glass bottles. Milked at dawn and on your doorstep before 7:00 AM.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
          <Button variant="primary" size="md" onClick={handleTrialClick} className="shadow-md shadow-[#5C1B13]/20">
            Start My 7-Day Trial
          </Button>
          <a
            href={getWhatsAppUrl("Hi PuretyFarm, I would like to learn more about the 7-day trial and farm purity tests.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5C1B13] bg-white hover:bg-[#FAF3EA] border border-[#E8DFD4] px-5 py-3 rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <FaWhatsapp className="w-4 h-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#3A241C]/70 font-semibold">
          <span className="inline-flex items-center gap-1"><FiCheck className="w-3.5 h-3.5 text-emerald-600" /> Pause / Resume Anytime</span>
          <span className="text-[#E8DFD4]">•</span>
          <span className="inline-flex items-center gap-1"><FiCheck className="w-3.5 h-3.5 text-emerald-600" /> Free Bottle Exchange</span>
          <span className="text-[#E8DFD4]">•</span>
          <span className="inline-flex items-center gap-1"><FiCheck className="w-3.5 h-3.5 text-emerald-600" /> Shankar Nagar, Civil Lines, VIP Rd & All Raipur</span>
        </div>
      </div>
    </Section>
  );
}
