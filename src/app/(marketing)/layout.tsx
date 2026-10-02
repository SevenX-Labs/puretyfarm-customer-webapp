import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MarketingMotion } from "@/components/layout/MarketingMotion";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import styles from "@/components/layout/MarketingShell.module.css";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingMotion>
      <ScrollProgress />
      <div className={styles.shell} data-marketing-shell>
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </MarketingMotion>
  );
}
