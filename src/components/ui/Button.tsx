"use client";

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#5C1B13] text-white hover:bg-[#4A1510] active:bg-[#3D110D] shadow-lg shadow-[#5C1B13]/20",
  secondary:
    "bg-transparent text-[#5C1B13] border-2 border-[#5C1B13] hover:bg-[#5C1B13]/5 active:bg-[#5C1B13]/10",
  accent:
    "bg-[#F5E729] text-[#1A1008] hover:bg-[#E6D824] active:bg-[#D9CC20] shadow-lg shadow-[#F5E729]/20",
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
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200 ease-out
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
      {children}
    </button>
  );
}
