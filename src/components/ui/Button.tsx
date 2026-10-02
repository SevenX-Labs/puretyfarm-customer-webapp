"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#5C1B13] text-white hover:bg-[#4A1510] active:bg-[#3D110D] shadow-lg shadow-[#5C1B13]/25 hover:shadow-xl hover:shadow-[#5C1B13]/35",
  secondary:
    "bg-transparent text-[#5C1B13] border-2 border-[#5C1B13] hover:bg-[#5C1B13]/8 active:bg-[#5C1B13]/12",
  accent:
    "bg-[#F5E729] text-[#1A1008] hover:bg-[#E6D824] active:bg-[#D9CC20] shadow-lg shadow-[#F5E729]/25 hover:shadow-xl hover:shadow-[#F5E729]/35",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-base",
  lg: "px-9 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.button
      type={type}
      whileHover={reduceMotion ? undefined : { scale: 1.025, y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 450, damping: 22 }}
      className={`
        group relative overflow-hidden
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        cursor-pointer select-none
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C1B13]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {/* Premium light sheen shimmer sweep on hover */}
      {variant !== "secondary" && !reduceMotion && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
        />
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </m.button>
  );
}
