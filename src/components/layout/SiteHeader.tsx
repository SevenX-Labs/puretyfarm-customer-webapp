"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ENV } from "@/config/env";
import { getPhoneUrl, getWhatsAppUrl } from "@/lib/cta";
import styles from "./MarketingShell.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Delivery Areas", href: "/service-area" },
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
        <Link
          href="/"
          className={styles.brand}
          aria-label="PuretyFarm home"
          onClick={closeMenu}
        >
          <span className={styles.logoFrame}>
            <Image
              src="/logo-mark.webp"
              alt=""
              fill
              sizes="44px"
              priority
            />
          </span>
          <span className={styles.brandName}>PuretyFarm</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link className={styles.navLink} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.contactActions}>
          <a className={styles.phoneLink} href={getPhoneUrl()}>
            {ENV.PHONE_DISPLAY}
          </a>
          <a
            className={styles.whatsAppLink}
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>

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
                {link.label}
              </Link>
            ))}
            <a className={styles.mobilePhoneLink} href={getPhoneUrl()}>
              Call {ENV.PHONE_DISPLAY}
            </a>
            <a
              className={styles.mobileWhatsAppLink}
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              Contact on WhatsApp
            </a>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
