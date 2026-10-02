"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const NAV_LINKS = [
  { label: "Why Us", href: "#why-puretyfarm", id: "nav-why" },
  { label: "How It Works", href: "#how-it-works", id: "nav-how" },
  { label: "Pricing", href: "#pricing", id: "nav-pricing" },
  { label: "Check Area", href: "#service-area", id: "nav-area" },
  { label: "FAQs", href: "#faq", id: "nav-faq" },
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

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav
      aria-label="Main Navigation"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled
          ? "bg-[#FFFDF7]/95 backdrop-blur-md shadow-sm border-b border-[#E8DFD4]"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16">
          {/* Logo & Brand */}
          <BrandLogo
            condensed={isScrolled}
            onClick={() => setMobileMenuOpen(false)}
            priority
          />

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs sm:text-sm font-semibold text-[#3A241C]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#5C1B13] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#5C1B13] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions: Clickable Phone, WhatsApp, and Trial Button */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Clickable Phone Number */}
            <a
              href={getPhoneUrl()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C1B13] bg-[#5C1B13]/5 hover:bg-[#5C1B13]/10 px-3 py-1.5 rounded-full transition-colors border border-[#5C1B13]/15 h-[34px]"
              title="Call PuretyFarm Farm Support"
            >
              <FiPhone className="w-3.5 h-3.5 text-[#5C1B13]" />
              <span>{ENV.PHONE_DISPLAY}</span>
            </a>

            {/* Clickable WhatsApp */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors border border-emerald-200 h-[34px]"
              title="Chat with us on WhatsApp"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WhatsApp</span>
            </a>

            {/* Start Trial Button */}
            <Button variant="primary" size="sm" onClick={handleTrialClick} className="px-3.5 py-1.5 text-xs font-bold h-[34px]">
              Start Trial
            </Button>
          </div>

          {/* Mobile Right Controls: Trial Button + Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleTrialClick} className="px-3 py-1 text-xs font-bold h-8">
              Start Trial
            </Button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#1A1008] hover:bg-[#1A1008]/5 focus:outline-none focus:ring-2 focus:ring-[#5C1B13] transition-colors w-9 h-9 flex items-center justify-center border border-[#E8DFD4]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-[#1A1008] rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? "rotate-45 translate-x-0.5 -translate-y-0.5" : ""
                    }`}
                />
                <span
                  className={`w-full h-0.5 bg-[#1A1008] rounded-full transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                />
                <span
                  className={`w-full h-0.5 bg-[#1A1008] rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? "-rotate-45 translate-x-0.5 translate-y-0.5" : ""
                    }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Backdrop & Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[60px] sm:top-[68px] z-50 bg-[#1A1008]/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-h-[calc(100vh-68px)] overflow-y-auto bg-[#FFFDF7] border-b border-[#E8DFD4] shadow-xl p-6 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Status Notification */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FBF6EE] border border-[#E8DFD4] text-xs text-[#3A241C]">
              <span className="text-base">🥛</span>
              <div>
                <p className="font-semibold text-[#1A1008]">Morning Delivery Active</p>
                <p className="text-[11px] text-[#3A241C]/70">5:30 AM – 7:00 AM across Raipur</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col divide-y divide-[#E8DFD4]/60">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3.5 text-base font-semibold text-[#1A1008] hover:text-[#5C1B13] flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <FiChevronRight className="w-4 h-4 text-[#3A241C]/40" />
                </a>
              ))}
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 text-base font-semibold text-[#1A1008] hover:text-[#5C1B13] flex items-center justify-between"
              >
                <span>Terms & Conditions</span>
                <FiChevronRight className="w-4 h-4 text-[#3A241C]/40" />
              </Link>
            </div>

            {/* Direct Contact Actions (Clickable Phone, WhatsApp, Email) */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-[#E8DFD4]">
              <p className="text-xs font-bold text-[#3A241C]/60 uppercase tracking-wider">
                Direct Contact
              </p>

              {/* Clickable Phone */}
              <a
                href={getPhoneUrl()}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#5C1B13]/30 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#5C1B13]/10 flex items-center justify-center text-[#5C1B13]">
                  <FiPhone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#3A241C]/60">Call Farm Support</p>
                  <p className="text-sm font-bold text-[#1A1008]">{ENV.PHONE_DISPLAY}</p>
                </div>
              </a>

              {/* Clickable WhatsApp */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <FaWhatsapp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-emerald-800/70">Chat on WhatsApp</p>
                  <p className="text-sm font-bold text-emerald-950">Fast 15-min Reply</p>
                </div>
              </a>

              {/* Clickable Email */}
              <a
                href={getEmailUrl()}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#5C1B13]/30 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#5C1B13]/10 flex items-center justify-center text-[#5C1B13]">
                  <FiMail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#3A241C]/60">Email Support</p>
                  <p className="text-sm font-bold text-[#1A1008]">{ENV.SUPPORT_EMAIL}</p>
                </div>
              </a>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleTrialClick();
                }}
              >
                Start My 7-Day Trial
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDownloadClick();
                }}
              >
                Download Customer App
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
