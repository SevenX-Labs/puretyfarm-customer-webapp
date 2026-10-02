"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Shared Defaults ────────────────────────────────────────────────────────

const EASE = "power3.out";
const EASE_BOUNCE = "back.out(1.4)";
const DURATION = 0.8;

// ─── useScrollReveal ─────────────────────────────────────────────────────────
// Fades-in + slides-up a single element when it enters the viewport.

export function useScrollReveal<T extends HTMLElement>(
  options: {
    y?: number;
    x?: number;
    duration?: number;
    delay?: number;
    ease?: string;
    start?: string;
  } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 60,
      x = 0,
      duration = DURATION,
      delay = 0,
      ease = EASE,
      start = "top 85%",
    } = options;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y, x });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

// ─── useStaggerReveal ────────────────────────────────────────────────────────
// Staggers children (selected by `childSelector`) into view.

export function useStaggerReveal<T extends HTMLElement>(
  childSelector: string,
  options: {
    y?: number;
    x?: number;
    stagger?: number;
    duration?: number;
    delay?: number;
    ease?: string;
    start?: string;
  } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 50,
      x = 0,
      stagger = 0.12,
      duration = 0.7,
      delay = 0,
      ease = EASE,
      start = "top 85%",
    } = options;

    const children = el.querySelectorAll(childSelector);
    if (!children.length) return;

    const ctx = gsap.context(() => {
      gsap.set(children, { opacity: 0, y, x });
      gsap.to(children, {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        stagger,
        ease,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

// ─── useParallax ─────────────────────────────────────────────────────────────
// Moves an element at a different speed on scroll for parallax depth.

export function useParallax<T extends HTMLElement>(speed: number = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: () => speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

// ─── useCountUp ──────────────────────────────────────────────────────────────
// Animates a number from 0 to `end` when scrolled into view.

export function useCountUp(
  end: number,
  options: { duration?: number; decimals?: number; suffix?: string } = {}
) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { duration = 2, decimals = 0, suffix = "" } = options;
    const obj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: end,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          el.textContent = obj.val.toFixed(decimals) + suffix;
        },
      });
    });

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

// ─── useScaleReveal ──────────────────────────────────────────────────────────
// Scales-in an element from 0.85 → 1 with a slight bounce.

export function useScaleReveal<T extends HTMLElement>(
  options: { delay?: number; start?: string } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { delay = 0, start = "top 85%" } = options;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, scale: 0.85 });
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        delay,
        ease: EASE_BOUNCE,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

// ─── useFloating ─────────────────────────────────────────────────────────────
// Gives an element a gentle, perpetual float animation (bobbing up & down).

export function useFloating<T extends HTMLElement>(
  options: { distance?: number; duration?: number } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { distance = 12, duration = 3 } = options;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -distance,
        duration,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}

// ─── useHeroEntrance ─────────────────────────────────────────────────────────
// Full cinematic hero entrance timeline — staggers badge, heading, paragraph,
// CTA buttons, and social proof in sequence.

export function useHeroEntrance<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE } });

      // All animated children start hidden
      tl.set("[data-hero-anim]", { opacity: 0, y: 30 });

      // Stagger in text elements
      tl.to("[data-hero-anim]", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
      });

      // Pop in the hero visual slightly overlapping if present
      const visualEl = el.querySelector("[data-hero-visual]");
      if (visualEl) {
        tl.set(visualEl, { opacity: 0, scale: 0.9, y: 40 });
        tl.to(
          visualEl,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: EASE_BOUNCE,
          },
          "-=0.4"
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── useDrawLine ─────────────────────────────────────────────────────────────
// Draws an SVG path or CSS border/line on scroll.

export function useDrawLine<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { scaleX: 0, transformOrigin: "left center" });
      gsap.to(el, {
        scaleX: 1,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── useMagneticHover ────────────────────────────────────────────────────────
// Makes an element subtly follow the cursor on hover for a magnetic feel.

export function useMagneticHover<T extends HTMLElement>(strength: number = 0.3) {
  const ref = useRef<T>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power2.out",
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return ref;
}
