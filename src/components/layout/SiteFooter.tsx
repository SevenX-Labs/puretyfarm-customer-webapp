import Link from "next/link";
import { ENV } from "@/config/env";
import { getEmailUrl, getPhoneUrl, getWhatsAppUrl } from "@/lib/cta";
import styles from "./MarketingShell.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.footerBrandName}>
            PuretyFarm
          </Link>
          <p className={styles.footerTagline}>Pure A2 Gir Cow Milk</p>
        </div>

        <div className={styles.footerLinks} aria-label="Footer navigation">
          <Link href="/service-area">Delivery Areas</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
        </div>

        <div className={styles.footerContact}>
          <a href={getPhoneUrl()}>{ENV.PHONE_DISPLAY}</a>
          <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={getEmailUrl()}>{ENV.SUPPORT_EMAIL}</a>
        </div>

        <p className={styles.footerCopyright}>© 2025 PuretyFarm. All rights reserved.</p>
      </div>
    </footer>
  );
}
