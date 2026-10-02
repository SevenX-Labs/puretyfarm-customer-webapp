"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ENV } from "@/config/env";
import { getPhoneUrl, getWhatsAppUrl, handleTrialClick } from "@/lib/cta";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "./MarketingShell.module.css";

const NAV_LINKS = [
  { label: "Why Us", href: "/#why-puretyfarm" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "7-Day Trial", href: "/#trial-offer" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Delivery Areas", href: "/service-area" },
  { label: "FAQs", href: "/#faq" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const updateHeader = () => setCondensed(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`${styles.header} ${condensed ? styles.headerCondensed : ""}`}
    >
      <div className={styles.headerInner}>
        <BrandLogo
          condensed={condensed}
          onClick={closeMenu}
          priority
        />

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link className={styles.navLink} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA / Contact group */}
        <div className={styles.contactActions}>
          <a
            className={styles.whatsAppLink}
            href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with PuretyFarm on WhatsApp"
          >
            <span>💬 WhatsApp</span>
          </a>
          <Button variant="primary" size="sm" onClick={handleTrialClick} className="px-3.5 py-1.5 text-xs font-bold h-[34px]">
            Start Trial
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="primary" size="sm" onClick={handleTrialClick} className="px-3 py-1 text-xs font-bold h-8">
            Start Trial
          </Button>
          <button
            className={styles.menuToggle}
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="marketing-mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`${styles.menuBar} ${menuOpen ? styles.menuBarTopOpen : ""}`} />
            <span className={`${styles.menuBar} ${menuOpen ? styles.menuBarMiddleOpen : ""}`} />
            <span className={`${styles.menuBar} ${menuOpen ? styles.menuBarBottomOpen : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.nav
            id="marketing-mobile-navigation"
            className={styles.mobileNav}
            aria-label="Mobile navigation"
            initial={reduceMotion ? false : { height: 0, y: -8, opacity: 0 }}
            animate={{ height: "auto", y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, y: -8, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                className={styles.mobileNavLink}
                href={link.href}
                key={link.href}
                onClick={closeMenu}
              >
                <span>{link.label}</span>
                <span className="text-[#5C1B13] text-xs font-bold">→</span>
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <a className={styles.mobilePhoneLink} href={getPhoneUrl()}>
                📞 Call {ENV.PHONE_DISPLAY}
              </a>
              <a
                className={styles.mobileWhatsAppLink}
                href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
