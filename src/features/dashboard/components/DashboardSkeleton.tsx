import { PfSkeleton } from "@/components/pf";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[22px] p-7">
          <PfSkeleton height={14} width={120} />
          <PfSkeleton className="mt-5" height={40} width="40%" />
          <PfSkeleton className="mt-3" height={20} width="30%" />
          <div className="mt-6 h-px bg-[var(--pf-border)]" />
          <div className="mt-5 flex gap-4">
            <PfSkeleton className="flex-1" height={48} />
            <PfSkeleton className="flex-1" height={48} />
          </div>
        </div>
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[22px] p-7">
          <PfSkeleton height={14} width={100} />
          <PfSkeleton className="mt-5" height={24} width="60%" />
          <PfSkeleton className="mt-2" height={14} width="40%" />
          <div className="mt-6 h-px bg-[var(--pf-border)]" />
          <PfSkeleton className="mt-5" height={14} />
          <PfSkeleton className="mt-2" height={14} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <PfSkeleton key={i} height={72} />
        ))}
      </div>

      <div>
        <PfSkeleton height={20} width={160} />
        <div className="mt-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[20px] p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <PfSkeleton key={i} height={44} />
          ))}
        </div>
      </div>
    </div>
  );
}
