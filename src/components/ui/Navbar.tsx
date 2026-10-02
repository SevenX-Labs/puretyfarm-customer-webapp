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
              <svg className="w-3.5 h-3.5 text-[#5C1B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
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
                  <svg className="w-4 h-4 text-[#3A241C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 text-base font-semibold text-[#1A1008] hover:text-[#5C1B13] flex items-center justify-between"
              >
                <span>Terms & Conditions</span>
                <svg className="w-4 h-4 text-[#3A241C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.761.814 2.791.814 3.18 0 5.766-2.587 5.767-5.766.001-3.182-2.585-5.768-5.767-5.768zm3.376 8.167c-.145.411-.741.776-1.026.822-.27.043-.618.067-2.001-.508-1.503-.625-2.482-2.148-2.558-2.248-.074-.1-1.006-1.336-1.006-2.548 0-1.213.633-1.808.859-2.051.226-.243.493-.304.657-.304.164 0 .328.003.473.01.152.008.358-.058.558.423.208.498.711 1.733.774 1.86.062.128.104.278.02.443-.082.164-.124.267-.248.411-.124.145-.262.324-.374.436-.124.124-.253.259-.109.507.145.248.643 1.061 1.381 1.718.951.848 1.753 1.111 2.001 1.235.248.124.394.104.539-.062.145-.164.622-.724.787-.972.164-.248.33-.207.558-.124.227.083 1.442.68 1.69.804.248.124.413.186.474.29.062.103.062.597-.083 1.008z" />
                  </svg>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
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
