"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { m, useSpring } from "framer-motion";

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  className?: string;
}

/**
 * Magnet — React Bits Interactive Physics
 * Pulls the element towards the cursor with tactile spring physics on hover.
 */
export function Magnet({
  children,
  disabled = false,
  magnetStrength = 0.28,
  className = "",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setIsActive] = useState(false);

  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * magnetStrength);
    y.set(distanceY * magnetStrength);
    setIsActive(true);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsActive(false);
  };

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </m.div>
  );
}
