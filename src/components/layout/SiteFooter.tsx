"use client";

import Link from "next/link";
import Image from "next/image";
import { ENV } from "@/config/env";
import { getEmailUrl, getPhoneUrl, getWhatsAppUrl } from "@/lib/cta";
import { SERVICEABLE_AREAS } from "@/data/serviceableAreas";
import { FiShield, FiPhone, FiMail, FiMapPin, FiArrowRight, FiArrowUp } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import styles from "./MarketingShell.module.css";

const FEATURED_AREAS = [
  "Shankar Nagar",
  "VIP Road",
  "Telibandha",
  "Civil Lines",
  "Samta Colony",
  "Devendra Nagar",
  "Pandri",
  "Avanti Vihar",
  "Khamardih",
  "Pachpedi Naka",
  "Tatibandh",
];

export function SiteFooter() {
  const { scrollTo } = useLenis();

  const scrollToTop = () => {
    if (scrollTo) {
      scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Column 1: Brand & Ethical Statement */}
          <div className={styles.footerCol}>
            <Link href="/" className={styles.footerBrandName}>
              <span className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E8DFD4] bg-[#FDEE57] shrink-0">
                <Image
                  src="/logo-mark-clean.webp"
                  alt=""
                  fill
                  sizes="32px"
                />
              </span>
              <span>PuretyFarm</span>
            </Link>

            <p className={styles.footerBrandDesc}>
              Raipur&apos;s trusted source for 100% raw, unadulterated A2 Gir cow milk. Ethically reared, milked at dawn, chilled at 4°C, and delivered to your doorstep in sanitized glass bottles before 7:00 AM.
            </p>

            <div className={styles.footerTrustBadge}>
              <FiShield className="w-4 h-4 text-[#F5E729] shrink-0" />
              <span>FSSAI Certified · Zero Adulteration</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Explore PuretyFarm</h3>
            <ul className={styles.footerNavList}>
              <li>
                <Link href="/#why-puretyfarm">Why PuretyFarm</Link>
              </li>
              <li>
                <Link href="/#how-it-works">How It Works</Link>
              </li>
              <li>
                <Link href="/#trial-offer">7-Day Starter Trial</Link>
              </li>
              <li>
                <Link href="/#pricing">Subscription Plans</Link>
              </li>
              <li>
                <Link href="/#app-showcase">PuretyFarm Mobile App</Link>
              </li>
              <li>
                <Link href="/#faq">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Raipur Delivery Corridors */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Raipur Delivery Sectors</h3>
            <div className={styles.footerSectorGrid}>
              {FEATURED_AREAS.map((area) => (
                <Link
                  key={area}
                  href={`/service-area`}
                  className={styles.footerSectorChip}
                >
                  {area}
                </Link>
              ))}
            </div>
            <Link
              href="/service-area"
              className="text-xs text-[#F5E729] hover:underline font-semibold mt-1 inline-flex items-center gap-1"
            >
              <span>View all {SERVICEABLE_AREAS.length} active delivery zones</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Column 4: Contact & Morning Dispatch Support */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Morning Dispatch &amp; Support</h3>
            <div className="flex flex-col gap-3">
              <a href={getPhoneUrl()} className={styles.footerContactItem}>
                <FiPhone className="w-4 h-4 text-[#F5E729] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{ENV.PHONE_DISPLAY}</p>
                  <p className="text-xs text-white/50">Daily Helpline: 5:30 AM – 7:00 PM</p>
                </div>
              </a>

              <a
                href={getWhatsAppUrl("Hi PuretyFarm, I would like to get fresh A2 milk delivered to my home in Raipur.")}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerContactItem}
              >
                <FaWhatsapp className="w-4 h-4 text-[#6ee7b7] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#6ee7b7]">Instant WhatsApp Assistance</p>
                  <p className="text-xs text-white/50">Vacation pause &amp; plan changes</p>
                </div>
              </a>

              <a href={getEmailUrl("Delivery Inquiry")} className={styles.footerContactItem}>
                <FiMail className="w-4 h-4 text-[#F5E729] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{ENV.SUPPORT_EMAIL}</p>
                  <p className="text-xs text-white/50">Customer service &amp; corporate supply</p>
                </div>
              </a>

              <div className="mt-2 text-xs text-white/50 leading-relaxed flex items-start gap-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-[#F5E729] shrink-0 mt-0.5" />
                <span>VIP Road Delivery Hub &amp; Cold Chaining Center, Raipur, CG 492001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Back to Top Bar */}
        <div className={styles.footerBottomBar}>
          <div className={styles.footerLegalLinks}>
            <span>© {new Date().getFullYear()} PuretyFarm Raipur. All rights reserved.</span>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/service-area">Delivery Coverage</Link>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className={styles.backToTopBtn}
            aria-label="Scroll back to top of page"
          >
            <span className="flex items-center gap-1.5">
              <FiArrowUp className="w-3.5 h-3.5" />
              <span>Back to top</span>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
