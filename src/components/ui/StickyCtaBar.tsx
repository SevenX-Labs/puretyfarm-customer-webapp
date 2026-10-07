"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./Button";
import { handleTrialClick, handleDownloadClick } from "@/lib/cta";

export function StickyCtaBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past hero (approx 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      data-testid="sticky-cta-bar"
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white/95 backdrop-blur-md border-t border-[#E8DFD4]
        px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]
        shadow-[0_-4px_20px_rgba(92,27,19,0.08)]
        transition-transform duration-300 ease-out
        md:hidden
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `.trim()}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <Link href="/account?tab=subscription" className="w-full">
          <Button
            variant="primary"
            size="md"
            fullWidth
            className="h-11 text-xs font-bold shadow-md shadow-[#5C1B13]/20 cursor-pointer"
          >
            Start My 7-Day Trial
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleDownloadClick}
          className="h-11 text-xs font-bold"
        >
          Download App
        </Button>
      </div>
    </div>
  );
}
