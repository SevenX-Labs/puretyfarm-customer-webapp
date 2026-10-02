"use client";

import { useRef, useEffect, useState } from "react";
import { m } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
}

/**
 * BlurText — React Bits Text Animation
 * Staggers words/characters into focus with a smooth Gaussian blur transition.
 */
export function BlurText({
  text,
  delay = 40,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.15,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const defaultFrom = {
    filter: "blur(10px)",
    opacity: 0,
    transform: direction === "top" ? "translate3d(0, -18px, 0)" : "translate3d(0, 18px, 0)",
  };

  const defaultTo = {
    filter: "blur(0px)",
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
  };

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((element, i) => (
        <m.span
          key={i}
          initial={defaultFrom}
          animate={inView ? defaultTo : defaultFrom}
          transition={{
            duration: 0.5,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block"
          style={{ willChange: "transform, filter, opacity" }}
        >
          {element === " " ? "\u00A0" : element}
          {animateBy === "words" && i < elements.length - 1 && "\u00A0"}
        </m.span>
      ))}
    </span>
  );
}
