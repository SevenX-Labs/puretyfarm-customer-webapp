import Image from "next/image";
import Link from "next/link";

export interface BrandLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Condensed state for scrolled sticky header */
  condensed?: boolean;
  /** Whether to show the text wordmark alongside the logo mark */
  showWordmark?: boolean;
  /** Whether to show the Raipur A2 Dairy subtitle */
  showSubtitle?: boolean;
  /** Priority loading for LCP / above-the-fold header */
  priority?: boolean;
  /** Additional CSS class names for the link wrapper */
  className?: string;
  /** Optional click handler (e.g. to close mobile menu) */
  onClick?: () => void;
}

export function BrandLogo({
  size = "md",
  condensed = false,
  showWordmark = true,
  showSubtitle = true,
  priority = true,
  className = "",
  onClick,
}: BrandLogoProps) {
  // Dimension mappings in exact pixels: chip is strictly >= 44px on desktop and mobile
  const markSizePx = size === "sm" ? 44 : size === "lg" ? 52 : condensed ? 44 : 46;
  const imageSizePx = markSizePx - 4; // 2px border on each side

  const titleSizes = {
    sm: "text-base",
    md: condensed ? "text-base sm:text-lg" : "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
  }[size];

  const subSizes = {
    sm: "text-[8px]",
    md: condensed ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]",
    lg: "text-[10px]",
  }[size];

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="PuretyFarm Home"
      className={`inline-flex items-center gap-2.5 min-h-[44px] min-w-[44px] group rounded-xl transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13] focus-visible:ring-offset-2 ${className}`}
    >
      {/* High-contrast Maroon-bordered Chip container */}
      <span
        className="relative rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{
          width: `${markSizePx}px`,
          height: `${markSizePx}px`,
          minWidth: `${markSizePx}px`,
          minHeight: `${markSizePx}px`,
          backgroundColor: "#FDEE57",
          border: "2px solid #5C1B13",
          boxShadow: "0 2px 6px rgba(92, 27, 19, 0.22)",
          overflow: "hidden",
        }}
      >
        <span
          className="relative block rounded-full overflow-hidden"
          style={{
            width: `${imageSizePx}px`,
            height: `${imageSizePx}px`,
          }}
        >
          <Image
            src="/logo-mark-clean.webp"
            alt="PuretyFarm Logo"
            fill
            sizes={`${imageSizePx}px`}
            priority={priority}
            className="object-contain p-0.5"
          />
        </span>
      </span>

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <span className="flex flex-col select-none text-left">
          <span
            className={`${titleSizes} font-bold text-[#1A1008] tracking-tight leading-none group-hover:text-[#5C1B13] transition-colors`}
            style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
          >
            PuretyFarm
          </span>
          {showSubtitle && (
            <span
              className={`${subSizes} font-bold text-[#5C1B13] uppercase leading-none mt-1`}
              style={{ letterSpacing: "0.08em" }}
            >
              Raipur A2 Dairy
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
