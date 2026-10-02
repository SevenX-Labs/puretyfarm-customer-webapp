"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { Button } from "./Button";
import { BrandLogo } from "./BrandLogo";
import { ENV } from "@/config/env";
import {
  handleTrialClick,
  handleDownloadClick,
  getWhatsAppUrl,
  getPhoneUrl,
  getEmailUrl,
} from "@/lib/cta";
import {
  FiPhone,
  FiChevronRight,
  FiMail,
  FiSun,
  FiMenu,
  FiX,
  FiShield,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const NAV_LINKS = [
  { label: "Why Us", href: "/#why-puretyfarm", id: "nav-why" },
  { label: "How It Works", href: "/#how-it-works", id: "nav-how" },
  { label: "7-Day Trial", href: "/#trial-offer", id: "nav-trial" },
  { label: "Pricing", href: "/#pricing", id: "nav-pricing" },
  { label: "Delivery Areas", href: "/service-area", id: "nav-area" },
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
      className="sticky top-2 sm:top-4 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300"
    >
      {/* ─── FLOATING ROUNDED-OVAL PILL CONTAINER ─── */}
      <div
        className={`pointer-events-auto mx-auto max-w-6xl rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FFFDF7]/95 shadow-[0_14px_40px_rgba(92,27,19,0.12)] border border-[#DFCFC2] py-1.5 sm:py-2 px-3 sm:px-4 scale-[0.99]"
            : "bg-[#FFFDF7]/90 shadow-[0_8px_30px_rgba(92,27,19,0.07)] border border-[#E8DFD4] py-2 sm:py-2.5 px-3.5 sm:px-5"
        } backdrop-blur-xl ring-1 ring-white/80`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo in Compact Chip */}
          <div className="shrink-0">
            <BrandLogo
              size="sm"
              condensed={isScrolled}
              onClick={closeMenu}
              priority
            />
          </div>

          {/* Center: Floating Oval Pill Menu Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-[#FBF6EE]/80 border border-[#E8DFD4]/70 rounded-full px-2 py-1 shadow-inner">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#3A241C] hover:text-[#5C1B13] hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Clickable Phone (xl screens) */}
            <a
              href={getPhoneUrl()}
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C1B13] bg-[#5C1B13]/5 hover:bg-[#5C1B13]/10 px-3 py-1.5 rounded-full transition-colors border border-[#5C1B13]/15 h-[34px]"
              title="Call PuretyFarm Farm Support"
            >
              <FiPhone className="w-3.5 h-3.5 text-[#5C1B13]" />
              <span>{ENV.PHONE_DISPLAY}</span>
            </a>

            {/* Live WhatsApp Pill with Pulsing Status Beacon */}
            <a
              href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 sm:px-3.5 py-1.5 rounded-full transition-all border border-emerald-200 h-[34px] hover:scale-105 active:scale-95 shadow-2xs"
              title="Chat with us on WhatsApp"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <FaWhatsapp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Primary Action Button: Start Trial */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleTrialClick}
              className="rounded-full px-4 sm:px-5 py-1.5 text-xs font-bold h-[34px] shadow-md shadow-[#5C1B13]/20 hover:scale-105 active:scale-95 transition-all"
            >
              Start Trial
            </Button>

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

            {/* Direct Contact Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8DFD4]">
              <a
                href={getPhoneUrl()}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-[#E8DFD4] hover:bg-[#FAF3EA] text-xs font-bold text-[#5C1B13] shadow-2xs transition-colors"
              >
                <FiPhone className="w-3.5 h-3.5 text-[#5C1B13]" />
                <span>Call Helpline</span>
              </a>

              <a
                href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 shadow-2xs transition-colors"
              >
                <FaWhatsapp className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  closeMenu();
                  handleTrialClick();
                }}
                className="rounded-xl py-3 text-xs font-bold shadow-lg shadow-[#5C1B13]/20"
              >
                Start My 7-Day Starter Trial
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  closeMenu();
                  handleDownloadClick();
                }}
                className="rounded-xl py-2.5 text-xs font-semibold"
              >
                Download Customer App
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
