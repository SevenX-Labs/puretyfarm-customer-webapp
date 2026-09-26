import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Header */}
      <header className="w-full border-b border-[#E8DFD4] bg-[#FFFDF7]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E8DFD4] shadow-sm bg-[#FDEE57] shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo-mark.jpg"
                alt="PuretyFarm Logo"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <span className="font-[family-name:var(--font-heading)] font-bold text-xl text-[#1A1008] tracking-tight">
              PuretyFarm
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#5C1B13] hover:text-[#4A1510] transition-colors font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
          Terms & Conditions
        </h1>

        <div className="mt-8 p-8 bg-[#FBF6EE] rounded-2xl border border-[#E8DFD4]">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-6 h-6 text-[#5C1B13]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-semibold text-[#1A1008]">Coming Soon</p>
          </div>
          <p className="text-[#3A241C]/70 leading-relaxed">
            Our Terms & Conditions are currently being finalized. They will be
            published here before the official launch of PuretyFarm&apos;s
            subscription service. If you have any questions in the meantime,
            please reach out to us via WhatsApp.
          </p>
        </div>
      </main>
    </div>
  );
}
