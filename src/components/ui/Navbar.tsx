"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { Button } from "./Button";
import { BrandLogo } from "./BrandLogo";
import { Magnet } from "@/components/reactbits";
import {
  handleTrialClick,
  handleDownloadClick,
} from "@/lib/cta";
import {
  FiChevronRight,
  FiSun,
  FiMenu,
  FiX,
  FiDownload,
} from "react-icons/fi";

const NAV_LINKS = [
  { label: "Why Us", href: "/#why-puretyfarm", id: "nav-why" },
  { label: "How It Works", href: "/#how-it-works", id: "nav-how" },
  { label: "Pricing", href: "/#pricing", id: "nav-pricing" },
  { label: "Testimonials", href: "/#testimonials", id: "nav-testimonials" },
  { label: "Contact", href: "/#contact", id: "nav-contact" },
  { label: "FAQs", href: "/#faq", id: "nav-faq" },
] as const;

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed top-2 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none transition-all duration-300"
    >
      {/* ─── FLOATING ROUNDED PILL CONTAINER ─── */}
      <div
        className={`pointer-events-auto mx-auto max-w-6xl rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 shadow-[0_12px_36px_rgba(26,16,8,0.08)] border border-[#E5DACD] py-1.5 sm:py-2 px-3 sm:px-5 scale-[0.99]"
            : "bg-white shadow-[0_8px_28px_rgba(26,16,8,0.06)] border border-[#ECE2D8] py-2 sm:py-2.5 px-3.5 sm:px-6"
        } backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Brand Logo */}
          <div className="shrink-0">
            <BrandLogo
              size="sm"
              condensed={isScrolled}
              onClick={closeMenu}
              priority
            />
          </div>

          {/* Center: Editorial Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full text-[13.5px] font-medium text-[#2A1E17] hover:text-[#541711] hover:bg-[#541711]/5 transition-all duration-180"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Primary Action Button: Download App (Desktop only, mobile/tablet uses hamburger drawer) */}
            <div className="hidden lg:block">
              <Magnet magnetStrength={0.15}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadClick}
                  className="rounded-full px-5 py-2.5 text-xs font-bold h-[38px] bg-[#541711] hover:bg-[#40110D] text-white shadow-md shadow-[#541711]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FiDownload className="w-3.5 h-3.5 text-white/95" />
                  <span>Download App</span>
                </Button>
              </Magnet>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-[#FBF6EE] border border-[#E8DFD4] flex items-center justify-center text-[#1A1008] hover:bg-[#5C1B13]/10 active:scale-95 transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5 text-[#5C1B13]" />
              ) : (
                <FiMenu className="w-5 h-5 text-[#1A1008]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE FLOATING CARD MENU ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto mt-2.5 mx-auto max-w-lg rounded-3xl bg-[#FFFDF7]/98 backdrop-blur-2xl border border-[#E8DFD4] shadow-2xl shadow-[#5C1B13]/15 p-5 overflow-hidden flex flex-col gap-4"
          >
            {/* Quick Status Notification */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF6EE] border border-[#E8DFD4] text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0">
                  <FiSun className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1008]">Morning Dispatch Active</p>
                  <p className="text-[10px] text-[#3A241C]/70">5:30 AM – 7:00 AM Raipur</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Daily Cold Chain
              </span>
            </div>

            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 gap-1.5 py-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD4]/70 hover:border-[#5C1B13]/30 text-xs font-semibold text-[#1A1008] hover:text-[#5C1B13] flex items-center justify-between transition-colors shadow-2xs"
                >
                  <span>{link.label}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-[#5C1B13]/60" />
                </Link>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  closeMenu();
                  handleDownloadClick();
                }}
                className="rounded-xl py-3 text-xs font-bold shadow-lg shadow-[#5C1B13]/20 flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4 text-[#F5E729]" />
                <span>Download Customer App</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  closeMenu();
                  handleTrialClick();
                }}
                className="rounded-xl py-2.5 text-xs font-semibold"
              >
                Start My 7-Day Starter Trial
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
