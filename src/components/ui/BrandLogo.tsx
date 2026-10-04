import Image from "next/image";
import Link from "next/link";

export interface BrandLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Condensed state for scrolled sticky header */
  condensed?: boolean;
  /** Whether to show the text wordmark alongside the logo mark */
  showWordmark?: boolean;
  /** Whether to show the Raipur’s No.1 A2 Milk subtitle */
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
  // Proportional chip dimensions for floating rounded pill navbar
  const markSizePx = size === "sm" ? 40 : size === "lg" ? 58 : condensed ? 42 : 46;
  const imageSizePx = markSizePx - 2; // Minimal border inset for maximum image area

  const titleSizes = {
    sm: "text-base font-extrabold",
    md: condensed ? "text-base sm:text-lg" : "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
  }[size];

  const subSizes = {
    sm: "text-[8.5px] leading-none",
    md: condensed ? "text-[8.5px] sm:text-[9.5px]" : "text-[9px] sm:text-[10px]",
    lg: "text-[10px]",
  }[size];

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="PuretyFarm Home"
      className={`inline-flex items-center gap-3 min-h-[44px] min-w-[44px] group rounded-xl transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C1B13] focus-visible:ring-offset-2 ${className}`}
    >
      {/* Logo mark container — warm sand/tan artisan tile matching reference design */}
      <span
        className="relative rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
        style={{
          width: `${markSizePx}px`,
          height: `${markSizePx}px`,
          minWidth: `${markSizePx}px`,
          minHeight: `${markSizePx}px`,
          background: "#F5E6D3",
          border: "1.5px solid #E8D3BD",
          boxShadow: "0 2px 8px rgba(92, 27, 19, 0.08)",
          overflow: "hidden",
        }}
      >
        <span
          className="relative block rounded-xl overflow-hidden"
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
            className="object-contain scale-110"
          />
        </span>
      </span>

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <span className="flex flex-col select-none text-left">
          <span
            className={`${titleSizes} font-bold text-[#1A1008] tracking-tight leading-none group-hover:text-[#541711] transition-colors`}
            style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
          >
            PuretyFarm
          </span>
          {showSubtitle && (
            <span
              className={`${subSizes} font-bold text-[#541711] uppercase leading-none mt-1 whitespace-nowrap`}
              style={{ letterSpacing: "0.14em" }}
            >
              Raipur’s No.1 A2 Milk
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
