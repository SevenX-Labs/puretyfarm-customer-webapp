import type { ReactNode } from "react";

export function PfEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--pf-surface-soft)] border border-[var(--pf-border)] flex items-center justify-center text-[var(--pf-brown)] mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-[18px] font-bold text-[var(--pf-text)]">{title}</h3>
      {description && (
        <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)] max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
