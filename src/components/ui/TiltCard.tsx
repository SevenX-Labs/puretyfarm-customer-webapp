"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

export interface TiltCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  tiltMaxAngle?: number;
  scale?: number;
  glare?: boolean;
  className?: string;
}

export function TiltCard({
  children,
  tiltMaxAngle = 7,
  scale = 1.02,
  glare = true,
  className = "",
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Normalized mouse coordinates from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 260 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Tilt transforms
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle]);
  const smoothGlareOpacity = useSpring(glareOpacity, { damping: 20, stiffness: 200 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);

    glareX.set(x * 100);
    glareY.set(y * 100);
    glareOpacity.set(0.18);
  };

  const handleMouseLeave = () => {
    if (reduceMotion) return;
    mouseX.set(0);
    mouseY.set(0);
    glareOpacity.set(0);
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
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-1000 ${className}`.trim()}
      {...props}
    >
      {children}

      {/* Interactive radial sheen glare following mouse */}
      {glare && (
        <m.div
          aria-hidden="true"
          style={{
            opacity: smoothGlareOpacity,
            background: `radial-gradient(circle 240px at ${glareX.get()}% ${glareY.get()}%, rgba(245, 231, 41, 0.35), transparent 70%)`,
          }}
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl overflow-hidden transition-opacity duration-300"
        />
      )}
    </m.div>
  );
}
