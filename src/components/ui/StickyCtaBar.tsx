"use client";

import { useState, useEffect } from "react";
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
        px-4 py-3
        transition-transform duration-300 ease-out
        md:hidden
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `.trim()}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleTrialClick}
        >
          Start My 7-Day Trial
        </Button>
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={handleDownloadClick}
        >
          Download App
        </Button>
      </div>
    </div>
  );
}
