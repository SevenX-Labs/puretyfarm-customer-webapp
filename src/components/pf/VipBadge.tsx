type VipSize = "xs" | "sm" | "md";

const sizeClasses: Record<VipSize, string> = {
  xs: "px-1.5 py-[1px] text-[8px] gap-0.5",
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-[11px] gap-1",
};

const iconSize: Record<VipSize, number> = { xs: 8, sm: 10, md: 12 };

export function VipBadge({
  size = "sm",
  className = "",
}: {
  size?: VipSize;
  className?: string;
}) {
  const s = iconSize[size];
  return (
    <span
      className={`inline-flex items-center shrink-0 rounded-full font-bold uppercase tracking-wide bg-gradient-to-r from-[#D4A853] to-[#B8872E] text-white shadow-sm ${sizeClasses[size]} ${className}`.trim()}
    >
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M5 16L3 5l5.5 5L12 3l3.5 7L21 5l-2 11H5z" />
        <path d="M5 19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H5v1z" />
      </svg>
      VIP
    </span>
  );
}
