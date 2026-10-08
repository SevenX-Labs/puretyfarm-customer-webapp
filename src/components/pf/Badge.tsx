import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "error" | "brand" | "info";

const toneClasses: Record<Tone, string> = {
  neutral:
    "bg-[var(--pf-surface-soft)] text-[var(--pf-text-secondary)] border border-[var(--pf-border)]",
  success: "bg-[var(--pf-success-bg)] text-[var(--pf-success)]",
  warning: "bg-[var(--pf-warning-bg)] text-[var(--pf-warning)]",
  error: "bg-[var(--pf-error-bg)] text-[var(--pf-error)]",
  brand: "bg-[var(--pf-yellow)] text-[var(--pf-dark)]",
  info: "bg-[var(--pf-surface-soft)] text-[var(--pf-deep)]",
};

export function PfBadge({
  tone = "neutral",
  dot = false,
  children,
  className = "",
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none ${toneClasses[tone]} ${className}`.trim()}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
