"use client";

import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from "react";
import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export interface TiltCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  tiltMaxAngle?: number;
  scale?: number;
  glare?: boolean;
  className?: string;
}

/**
 * TiltCard
 * Provides smooth elevation and interactive cursor sheen on hover
 * without 3D perspective or bitmap scaling so text remains 100% crisp and sharp.
 */
export function TiltCard({
  children,
  tiltMaxAngle: _tiltMaxAngle,
  scale: _scale,
  glare = true,
  className = "",
  style,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !canHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y });
    if (!isHovered) setIsHovered(true);
  };

  const handleMouseEnter = () => {
    if (!reduceMotion && canHover) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (reduceMotion) {
    return (
      <div className={`relative ${className}`} {...(props as any)}>
        {children}
      </div>
    );
  }

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={canHover ? { y: -4 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        ...style,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
        transform: "translateZ(0)",
      }}
      className={`relative ${className}`.trim()}
      {...props}
    >
      {children}

      {/* Interactive subtle radial sheen glare following mouse without blur */}
      {glare && (
        <div
          aria-hidden="true"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(245, 231, 41, 0.12), transparent 75%)`,
          }}
          className="pointer-events-none absolute inset-0 z-20 rounded-3xl overflow-hidden transition-opacity duration-300"
        />
      )}
    </m.div>
  );
}

