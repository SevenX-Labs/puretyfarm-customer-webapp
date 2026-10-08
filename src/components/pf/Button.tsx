"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "tertiary" | "ghost";
type Size = "sm" | "md" | "lg";

export interface PfButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  href?: string;
  children: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--pf-brown)] text-white hover:bg-[var(--pf-brown-hover)] active:bg-[#541810]",
  secondary:
    "bg-transparent text-[var(--pf-text)] border border-[var(--pf-border-strong)] hover:bg-[var(--pf-surface-soft)]",
  tertiary:
    "bg-transparent text-[var(--pf-brown)] hover:bg-[var(--pf-surface-soft)]",
  ghost:
    "bg-transparent text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-soft)] hover:text-[var(--pf-text)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-6 text-[15px]",
};

const base =
  "pf-focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[11px] font-semibold transition-all duration-200 ease-out select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

export function PfButton({
  variant = "primary",
  size = "md",
  fullWidth,
  href,
  className = "",
  children,
  loading,
  disabled,
  ...rest
}: PfButtonProps) {
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${
    fullWidth ? "w-full" : ""
  } ${className}`.trim();

  const content = loading ? (
    <span className="inline-flex items-center gap-2">
      <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {children}
    </span>
  ) : (
    children
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
