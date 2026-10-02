"use client";

import React, { type CSSProperties } from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shimmerColor?: string;
}

/**
 * ShinyText — React Bits Text Animation
 * Adds an iridescent shimmering light effect gliding across text.
 */
export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
  shimmerColor = "rgba(255, 255, 255, 0.8)",
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  const style: CSSProperties & { [key: string]: string | number } = {
    backgroundImage: `linear-gradient(120deg, currentColor 0%, currentColor 38%, ${shimmerColor} 50%, currentColor 62%, currentColor 100%)`,
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    "--shine-duration": `${speed}s`,
  };

  return (
    <span
      className={`inline-block animate-shine select-none ${className}`}
      style={style}
    >
      {text}
    </span>
  );
}
