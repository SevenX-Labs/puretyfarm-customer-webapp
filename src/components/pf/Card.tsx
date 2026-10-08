import type { HTMLAttributes, ReactNode } from "react";

export interface PfCardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  padding?: "sm" | "md" | "lg" | "none";
  elevated?: boolean;
  children: ReactNode;
}

const paddingClasses = {
  none: "",
  sm: "p-5",
  md: "p-6 sm:p-7",
  lg: "p-7 sm:p-8",
};

export function PfCard({
  as: Tag = "div",
  padding = "md",
  elevated = false,
  className = "",
  children,
  ...rest
}: PfCardProps) {
  return (
    <Tag
      className={`bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[20px] ${
        elevated ? "shadow-[var(--pf-shadow-card)]" : "shadow-[var(--pf-shadow-sm)]"
      } ${paddingClasses[padding]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function PfSectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="min-w-0">
        <h2 className="text-[22px] sm:text-[24px] font-bold text-[var(--pf-text)] leading-[1.2] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[14px] text-[var(--pf-text-secondary)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
