"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { getWhatsAppUrl, getEmailUrl } from "@/lib/cta";
import type { LegalDocument } from "@/data/privacyContent";
import {
  FiArrowLeft,
  FiSearch,
  FiFileText,
  FiShield,
  FiLock,
  FiCreditCard,
  FiCheck,
  FiClock,
  FiAlertTriangle,
  FiMail,
  FiMapPin,
  FiChevronRight,
  FiX,
  FiType,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export type HighlightIconType = "shield" | "lock" | "map" | "clock" | "check" | "card";

const HIGHLIGHT_ICONS: Record<HighlightIconType, typeof FiShield> = {
  shield: FiShield,
  lock: FiLock,
  map: FiMapPin,
  clock: FiClock,
  check: FiCheck,
  card: FiCreditCard,
};

interface LegalPageShellProps {
  document: LegalDocument;
  activeSlug: "privacy" | "terms" | "terms-and-conditions" | "privacy-policy";
  highlights: {
    icon: HighlightIconType;
    title: string;
    description: string;
    tag?: string;
  }[];
}

export function LegalPageShell({
  document,
  activeSlug,
  highlights,
}: LegalPageShellProps) {
  const { scrollTo } = useLenis();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string>(
    document.sections[0]?.id || ""
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [textScale, setTextScale] = useState<"normal" | "large" | "xlarge">("normal");

  const isPrivacyPage = activeSlug === "privacy" || activeSlug === "privacy-policy";

  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic typography scale classes
  const bodyTextClass = useMemo(() => {
    switch (textScale) {
      case "xlarge":
        return "text-lg sm:text-xl leading-relaxed sm:leading-9 text-[#140C07] font-normal";
      case "large":
        return "text-base sm:text-lg leading-relaxed sm:leading-8 text-[#140C07] font-normal";
      default:
        return "text-[15px] sm:text-base leading-relaxed sm:leading-7 text-[#140C07] font-normal";
    }
  }, [textScale]);

  const subItemTextClass = useMemo(() => {
    switch (textScale) {
      case "xlarge":
        return "text-base sm:text-lg leading-relaxed text-[#140C07]";
      case "large":
        return "text-[15px] sm:text-base leading-relaxed text-[#140C07]";
      default:
        return "text-sm sm:text-[15px] leading-relaxed text-[#140C07]";
    }
  }, [textScale]);

  // Track scroll position for active ToC link and reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = window.document.documentElement.scrollHeight;
      const totalScrollable = docHeight - windowHeight;

      if (totalScrollable > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (scrollY / totalScrollable) * 100)));
      }

      // If user triggered programmatic click scroll, let the clicked active id stay
      if (isProgrammaticScroll.current) return;

      const sections = Array.from(
        window.document.querySelectorAll<HTMLElement>("section[data-legal-section]")
      );
      if (sections.length === 0) return;

      // 1. If at or near bottom of document (within 160px of the footer), ALWAYS activate the last section
      const isNearBottom = windowHeight + scrollY >= docHeight - 160;
      if (isNearBottom) {
        setActiveSectionId(sections[sections.length - 1].id);
        return;
      }

      // 2. Viewport-based detection: find the active section that is crossing or past the top trigger zone
      const triggerOffset = 100;
      let current = sections[0].id;

      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= triggerOffset) {
          current = sections[i].id;
        } else {
          break;
        }
      }

      if (current) {
        setActiveSectionId(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return document.sections;
    const q = searchQuery.toLowerCase().trim();

    return document.sections.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchBadge = sec.badge?.toLowerCase().includes(q) ?? false;
      const matchIntro = sec.intro?.toLowerCase().includes(q) ?? false;
      const matchParas = sec.paragraphs?.some((p) => p.toLowerCase().includes(q)) ?? false;
      const matchSubs = sec.subsections?.some(
        (sub) =>
          sub.title?.toLowerCase().includes(q) ||
          sub.description?.toLowerCase().includes(q) ||
          sub.items?.some((it) => it.content.toLowerCase().includes(q)) ||
          sub.paragraphs?.some((p) => p.toLowerCase().includes(q))
      ) ?? false;
      const matchCallout =
        sec.callout?.title.toLowerCase().includes(q) ||
        sec.callout?.text.toLowerCase().includes(q);

      return matchTitle || matchBadge || matchIntro || matchParas || matchSubs || matchCallout;
    });
  }, [document.sections, searchQuery]);

  const handleSmoothScrollTo = (id: string) => {
    // Immediately set the clicked option as active
    setActiveSectionId(id);
    setMobileTocOpen(false);

    // Suppress scroll-event override during smooth scrolling
    isProgrammaticScroll.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1100);

    const target = window.document.getElementById(id);
    if (!target) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    const targetOffset = isMobile ? -60 : -28;

    if (scrollTo) {
      scrollTo(target, { offset: targetOffset, duration: 1.1 });
    } else {
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition + targetOffset, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#140C07] flex flex-col justify-between selection:bg-[#F5E729] selection:text-[#5C1B13]">
      {/* ─── READING PROGRESS BAR ─── */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#E8DFD4]/50 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#5C1B13] via-[#7B241C] to-[#E5A823] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ─── STICKY MOBILE TABLE OF CONTENTS BAR (Screens < lg) ─── */}
      <div className="lg:hidden sticky top-0 z-30 w-full bg-[#FFFDF7]/95 backdrop-blur-xl border-b border-[#DDD0C2] px-4 py-2.5 shadow-2xs transition-all print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C1B13] text-white text-xs font-bold shadow-xs hover:bg-[#7B241C] active:scale-95 transition-all cursor-pointer"
            aria-expanded={mobileTocOpen}
            aria-label="Toggle Table of Contents"
          >
            <FiFileText className="w-3.5 h-3.5 text-[#F5E729]" />
            <span>Table of Contents ({document.sections.length})</span>
            <FiChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileTocOpen ? "rotate-90" : ""}`} />
          </button>

          {/* Current Active Clause Indicator */}
          <div className="text-[11px] text-[#5C1B13] font-semibold truncate max-w-[170px] sm:max-w-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="truncate">
              {activeSectionId
                ? document.sections.find((s) => s.id === activeSectionId)?.title
                : "Overview"}
            </span>
          </div>
        </div>

        {/* Collapsible Mobile Table of Contents Drawer */}
        {mobileTocOpen && (
          <div className="mt-2.5 max-w-7xl mx-auto p-3.5 rounded-2xl bg-[#FAF3EA] border border-[#DDD0C2] shadow-xl max-h-[60vh] overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD0C2]/80 mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C1B13]">
                Jump to Clause
              </span>
              <button
                type="button"
                onClick={() => setMobileTocOpen(false)}
                className="text-[#5C1B13] p-1 hover:bg-[#5C1B13]/10 rounded-lg text-xs cursor-pointer"
                aria-label="Close Table of Contents"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            {document.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  handleSmoothScrollTo(sec.id);
                  setMobileTocOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${activeSectionId === sec.id
                    ? "bg-[#5C1B13] text-white font-bold shadow-xs"
                    : "text-[#140C07] bg-white hover:bg-[#FAF3EA] font-medium"
                  }`}
              >
                <span className="truncate pr-2">
                  <span className="font-mono opacity-70 mr-1.5">{sec.number}.</span>
                  {sec.title}
                </span>
                <FiChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── HERO HEADER BANNER ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF3EA] via-[#FAF3EA]/60 to-[#FFFDF7] border-b border-[#DDD0C2] pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12">
        <div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-[#F5E729]/20 blur-3xl pointer-events-none -z-10"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2C1810] mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-[#5C1B13] transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <FiChevronRight className="w-3 h-3 text-[#5C1B13]/60" />
              <span className="font-bold text-[#5C1B13]">{document.title}</span>
            </div>

            {/* Header Top Row: Title & Official Contact */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDD0C2]/70">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#140C07] font-[family-name:var(--font-heading)] tracking-tight leading-tight">
                {document.title}
              </h1>

              {/* Official Contact Email */}
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD0C2] shadow-2xs text-xs sm:text-sm font-semibold text-[#2C1810]">
                <FiMail className="w-3.5 h-3.5 text-[#5C1B13] shrink-0" />
                <a href={`mailto:${document.officialEmail}`} className="text-[#5C1B13] hover:underline">
                  {document.officialEmail}
                </a>
              </div>
            </div>

            {/* ─── FULL-WIDTH OFFICIAL DOCUMENT PREAMBLE BOX (Covers Entire Right Screen) ─── */}
            <div className="mt-6 w-full p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD0C2] shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDD0C2]/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#5C1B13]/10 flex items-center justify-center shrink-0">
                    <FiShield className="w-4 h-4 text-[#5C1B13]" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#5C1B13] block">
                      Official Document Preamble
                    </span>
                    <span className="text-[11px] text-[#7A685D] block">
                      Statutory Statement of Purpose &amp; Governance
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    ● Legally Binding Record
                  </span>
                  <span className="text-[11px] font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#DDD0C2] px-3 py-1 rounded-full">
                    IT Act, 2000
                  </span>
                </div>
              </div>

              <p className="text-[15px] sm:text-base text-[#140C07] leading-relaxed sm:leading-8 font-normal">
                {document.preamble}
              </p>

              <div className="mt-5 pt-4 border-t border-[#F2EAE0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A685D]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span className="font-medium text-[#2C1810]">
                    Registered Office: {document.registeredOffice}
                  </span>
                </div>
                <div className="text-[#5C1B13] font-semibold">
                  Valid across India • Governed by the Laws of India
                </div>
              </div>
            </div>
          </m.div>

          {/* ─── KEY HIGHLIGHTS CARDS ─── */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((item, idx) => {
              const Icon = HIGHLIGHT_ICONS[item.icon] || FiShield;
              return (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.12 + idx * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-5 rounded-2xl bg-white border border-[#DDD0C2] shadow-xs hover:shadow-md hover:border-[#5C1B13]/40 transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF3EA] text-[#5C1B13] border border-[#DDD0C2] flex items-center justify-center font-bold">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      {item.tag && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#5C1B13]/10 text-[#5C1B13]">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#140C07] mb-1.5 font-[family-name:var(--font-heading)]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#2C1810] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── MAIN DOCUMENT BODY WITH STICKY SIDEBAR ─── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Interactive Search Bar & Mobile Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C1B13]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search across all ${document.sections.length} sections (e.g. refunds, cut-off, wallet, storage)...`}
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-[#DDD0C2] text-sm sm:text-base text-[#140C07] placeholder:text-[#5C1B13]/60 focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C1B13] hover:text-[#7B241C] cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Text Scale Adjuster */}
            <div className="flex items-center bg-[#FAF3EA] border border-[#DDD0C2] rounded-full p-1 text-xs font-bold">
              <span className="px-2 text-[#5C1B13] flex items-center gap-1">
                <FiType className="w-3 h-3" />
                <span className="hidden sm:inline">Text:</span>
              </span>
              <button
                type="button"
                onClick={() => setTextScale("normal")}
                className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                  textScale === "normal"
                    ? "bg-[#5C1B13] text-white shadow-2xs"
                    : "text-[#2C1810] hover:text-[#5C1B13]"
                }`}
                title="Default text size"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setTextScale("large")}
                className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                  textScale === "large"
                    ? "bg-[#5C1B13] text-white shadow-2xs"
                    : "text-[#2C1810] hover:text-[#5C1B13]"
                }`}
                title="Large text size"
              >
                Large
              </button>
              <button
                type="button"
                onClick={() => setTextScale("xlarge")}
                className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                  textScale === "xlarge"
                    ? "bg-[#5C1B13] text-white shadow-2xs"
                    : "text-[#2C1810] hover:text-[#5C1B13]"
                }`}
                title="Extra large text size"
              >
                X-Large
              </button>
            </div>
          </div>
        </div>

        {/* ─── TWO COLUMN LAYOUT: SIDEBAR (DESKTOP) + CLAUSE CONTENT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 self-start sticky top-6 lg:top-8 max-h-[calc(100vh-3rem)] overflow-y-auto pr-3 scrollbar-hide z-20">
            <div className="p-5 rounded-3xl bg-white border border-[#DDD0C2] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD0C2] mb-3">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-4 h-4 text-[#5C1B13]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#140C07]">
                    Table of Contents
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3EA] text-[#5C1B13] border border-[#DDD0C2]">
                  {document.sections.length} Clauses
                </span>
              </div>

              <nav className="space-y-1">
                {document.sections.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleSmoothScrollTo(sec.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-[13px] sm:text-sm ${isActive
                          ? "bg-[#5C1B13] text-white font-bold shadow-xs scale-[1.01]"
                          : "text-[#2C1810] hover:bg-[#FAF3EA] hover:text-[#5C1B13] font-medium"
                        }`}
                    >
                      <span className="truncate pr-2">
                        <span className="font-mono text-xs font-bold opacity-75 mr-1.5">
                          {sec.number.toString().padStart(2, "0")}.
                        </span>
                        {sec.title}
                      </span>
                      <FiChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "opacity-100 translate-x-0.5" : "opacity-40"
                          }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Support Card in Sidebar */}
              <div className="mt-5 pt-4 border-t border-[#DDD0C2] text-xs text-[#2C1810]">
                <p className="font-bold text-[#140C07] mb-1">Official Legal &amp; Grievance Desk</p>
                <p className="text-[#3A2218] font-medium">All Days 10:00 AM – 6:30 PM IST</p>
                <a
                  href={`mailto:${document.officialEmail}`}
                  className="mt-2 text-[#5C1B13] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <FiMail className="w-3.5 h-3.5" />
                  <span>{document.officialEmail}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right: Clause Articles */}
          <div className="lg:col-span-8 space-y-7">
            {filteredSections.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-[#DDD0C2]">
                <FiSearch className="w-8 h-8 text-[#5C1B13]/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#140C07]">
                  No clauses match &ldquo;{searchQuery}&rdquo;
                </h3>
                <p className="text-sm text-[#2C1810] mt-1">
                  Try searching for keywords like &ldquo;refund&rdquo;, &ldquo;wallet&rdquo;, &ldquo;cut-off&rdquo;, &ldquo;cancellation&rdquo;, or &ldquo;grievance&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-5 py-2 rounded-full bg-[#5C1B13] text-white text-xs font-bold cursor-pointer hover:bg-[#7B241C]"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  data-legal-section
                  className="scroll-mt-24 p-6 sm:p-9 rounded-3xl bg-white border border-[#DDD0C2] shadow-xs hover:border-[#5C1B13]/40 transition-all"
                >
                  {/* Section Title Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#DDD0C2]">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#5C1B13] text-[#F5E729] font-mono text-xs sm:text-sm font-black flex items-center justify-center shrink-0 shadow-2xs">
                        {sec.number}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#140C07] font-[family-name:var(--font-heading)] tracking-tight">
                        {sec.title}
                      </h2>
                    </div>
                    {sec.badge && (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF3EA] text-[#5C1B13] border border-[#DDD0C2]">
                        {sec.badge}
                      </span>
                    )}
                  </div>

                  {/* Intro Text / Paragraphs */}
                  {sec.intro && (
                    <p className={`${bodyTextClass} mb-5`}>
                      {sec.intro}
                    </p>
                  )}

                  {sec.paragraphs && sec.paragraphs.length > 0 && (
                    <div className="space-y-4 mb-5">
                      {sec.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className={bodyTextClass}>
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Subsections with Bullet Items */}
                  {sec.subsections && sec.subsections.length > 0 && (
                    <div className="space-y-5 my-5">
                      {sec.subsections.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-5 sm:p-6 rounded-2xl bg-[#FCFAF7] border border-[#DDD0C2] shadow-2xs hover:border-[#5C1B13]/30 transition-colors"
                        >
                          {sub.title && (
                            <h3 className="text-base sm:text-lg font-black text-[#140C07] mb-2 font-[family-name:var(--font-heading)] flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#5C1B13] shrink-0" />
                              <span>{sub.title}</span>
                            </h3>
                          )}
                          {sub.description && (
                            <p className="text-sm sm:text-[15px] font-semibold text-[#2C1810] mb-3 leading-relaxed">
                              {sub.description}
                            </p>
                          )}
                          {sub.paragraphs && sub.paragraphs.length > 0 && (
                            <div className="space-y-2.5 mb-4">
                              {sub.paragraphs.map((sp, spIdx) => (
                                <p key={spIdx} className={subItemTextClass}>
                                  {sp}
                                </p>
                              ))}
                            </div>
                          )}
                          {sub.items && sub.items.length > 0 && (
                            <ul className="space-y-2.5">
                              {sub.items.map((it, itIdx) => (
                                <li key={itIdx} className={`flex items-start gap-3 ${subItemTextClass}`}>
                                  {it.label && (
                                    <span className="font-bold text-[#5C1B13] bg-[#F3ECE3] border border-[#D5C6B7] px-2.5 py-0.5 rounded-md text-xs sm:text-sm shrink-0 min-w-[28px] text-center mt-0.5 shadow-2xs">
                                      {it.label}
                                    </span>
                                  )}
                                  <span className="flex-1 text-[#140C07] font-normal leading-relaxed">{it.content}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Highlight Callout Alert Box */}
                  {sec.callout && (
                    <div
                      className={`mt-5 p-5 sm:p-6 rounded-2xl border flex items-start gap-3.5 ${sec.callout.type === "security"
                          ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                          : sec.callout.type === "warning"
                            ? "bg-amber-50/90 border-amber-300 text-amber-950"
                            : sec.callout.type === "contact"
                              ? "bg-[#FAF3EA] border-[#5C1B13]/40 text-[#140C07]"
                              : "bg-[#FFF9EA] border-[#E2BF36] text-[#140C07] shadow-2xs"
                        }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {sec.callout.type === "security" ? (
                          <FiShield className="w-5 h-5 text-emerald-600" />
                        ) : sec.callout.type === "warning" ? (
                          <FiAlertTriangle className="w-5 h-5 text-amber-700" />
                        ) : sec.callout.type === "contact" ? (
                          <FiMail className="w-5 h-5 text-[#5C1B13]" />
                        ) : (
                          <FiClock className="w-5 h-5 text-[#5C1B13]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[#140C07] font-[family-name:var(--font-heading)] mb-1">
                          {sec.callout.title}
                        </h4>
                        <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-[#140C07]">
                          {sec.callout.text}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              ))
            )}

            {/* ─── BOTTOM CONTACT & COMPLIANCE CARD ─── */}
            <div className="mt-10 p-6 sm:p-9 rounded-3xl bg-gradient-to-br from-[#5C1B13] via-[#4A140E] to-[#2C1810] text-white shadow-xl relative overflow-hidden border border-[#5C1B13]">
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#F5E729]/15 blur-3xl pointer-events-none"
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="text-xs font-black uppercase tracking-wider text-[#F5E729] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    Official Support &amp; Grievance Redressal
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-3 font-[family-name:var(--font-heading)] text-white">
                    Need Clarification on Our Policies?
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mt-2 leading-relaxed font-normal">
                    Our compliance and customer delight desk is available all days from 10:00 AM to 6:30 PM. For subscription changes, pauses, or legal inquiries, reach out to us directly.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                  <a
                    href={getWhatsAppUrl("Hello PuretyFarm Support, I have a query regarding your terms and policies.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <FaWhatsapp className="w-4.5 h-4.5" />
                    <span>WhatsApp Desk</span>
                  </a>
                  <a
                    href={getEmailUrl("Policy & Legal Query")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#FAF3EA] text-[#5C1B13] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <FiMail className="w-4.5 h-4.5" />
                    <span>Email Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── LEGAL PAGE FOOTER ─── */}
      <footer className="border-t border-[#DDD0C2] bg-[#FAF3EA] py-8 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-[#2C1810] font-medium">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Puretyfarms Raipur. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-bold text-[#5C1B13]">
            {isPrivacyPage ? (
              <Link href="/terms-and-conditions" className="hover:underline">
                Terms &amp; Conditions
              </Link>
            ) : (
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            )}
            <span className="text-[#DDD0C2]">·</span>
            <Link href="/service-area" className="hover:underline">
              Delivery Coverage
            </Link>
            <span className="text-[#DDD0C2]">·</span>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
