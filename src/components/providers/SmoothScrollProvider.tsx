"use client";

import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

interface LenisContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => void;
  stop: () => void;
  start: () => void;
}

export const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    // Mark HTML for Lenis-controlled scrolling
    document.documentElement.classList.add("lenis", "lenis-smooth");

    // Initialize Lenis with optimized settings
    // syncTouch: false keeps native 60-120Hz hardware-accelerated momentum scrolling on touchscreens
    // while smoothWheel: true provides buttery smooth inertia for mousewheel on desktop.
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false, // Native touch scrolling on mobile eliminates input lag and sluggishness
      autoRaf: false, // Driven by GSAP central ticker
      overscroll: true,
      autoResize: true,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Ensure initial page load always starts cleanly at the top (Hero section)
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      // If the page was opened with a hash from a previous session, clean it up so it always shows Hero
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    }

    // Connect Lenis scroll to GSAP ScrollTrigger updates
    lenis.on("scroll", ScrollTrigger.update);

    // Synchronize requestAnimationFrame with GSAP's central ticker
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    // Synchronize Lenis dimensions and ScrollTrigger positions on mobile resize & orientation change
    const handleResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    // Smooth scroll for internal anchor links (e.g. /#pricing, #why-puretyfarm, #how-it-works)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      // Handle clicking Brand Logo / Home link to smoothly scroll back to top
      if (href === "/" && (window.location.pathname === "/" || window.location.pathname === "")) {
        e.preventDefault();
        lenis.scrollTo(0, {
          offset: 0,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        return;
      }

      const isInternalHash =
        href.startsWith("#") ||
        (href.startsWith("/#") && (window.location.pathname === "/" || window.location.pathname === ""));

      if (isInternalHash) {
        const hash = href.includes("#") ? href.substring(href.indexOf("#")) : "";
        if (!hash || hash === "#") return;

        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          const isMobile = window.innerWidth < 768;
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: isMobile ? -64 : -75, // Responsive offset for mobile and desktop floating navbar
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleAnchorClick);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      gsap.ticker.remove(updateRaf);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const defaultOffset = isMobile ? -64 : -75;
    lenisRef.current?.scrollTo(target as HTMLElement, {
      offset: options?.offset ?? defaultOffset,
      duration: options?.duration ?? 1.2,
      immediate: options?.immediate ?? false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollTo, stop, start }}>
      {children}
    </LenisContext.Provider>
  );
}
