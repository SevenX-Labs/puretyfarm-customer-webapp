import { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiChevronRight, FiMail, FiTrash2, FiSmartphone, FiShield, FiAlertTriangle, FiCheckCircle, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ENV } from "@/config/env";
import { getEmailUrl, getWhatsAppUrl } from "@/lib/cta";

export const metadata: Metadata = {
  title: {
    absolute: "Delete Your Account | Purety Farm",
  },
  description:
    "Learn how to delete your account and associated personal data for the Purety Farm mobile app (PuretyFarm - Pure A2 Milk). Follow in-app steps or submit an email deletion request.",
  openGraph: {
    title: "Delete Your Account | Purety Farm",
    description:
      "Account and data deletion instructions for the Purety Farm mobile app (PuretyFarm - Pure A2 Milk).",
    url: "https://puretyfarm.in/delete-account",
    type: "website",
  },
  alternates: {
    canonical: "/delete-account",
  },
};

export default function DeleteAccountPage() {
  const emailDeletionMailto = `mailto:${ENV.SUPPORT_EMAIL}?subject=Delete%20my%20account&body=Hello%20PuretyFarm%20Team%2C%0A%0APlease%20delete%20my%20PuretyFarm%20account%20and%20associated%20data.%0A%0ARegistered%20Mobile%20Number%3A%20%0AName%3A%20%0A%0AThank%20you.`;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#140C07] flex flex-col justify-between selection:bg-[#F5E729] selection:text-[#5C1B13]">
      {/* ─── HERO HEADER BANNER ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF3EA] via-[#FAF3EA]/60 to-[#FFFDF7] border-b border-[#DDD0C2] pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12">
        <div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-[#F5E729]/20 blur-3xl pointer-events-none -z-10"
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2C1810] mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[#5C1B13] transition-colors"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <FiChevronRight className="w-3 h-3 text-[#5C1B13]/60" />
            <span className="font-bold text-[#5C1B13]">Delete Account</span>
          </div>

          {/* Header Top Row: Title & Official Contact */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDD0C2]/70">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] text-xs font-bold uppercase tracking-wider mb-3">
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Account &amp; Data Deletion</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#140C07] font-[family-name:var(--font-heading)] tracking-tight leading-tight">
                Delete your Purety Farm account
              </h1>
            </div>

            {/* Official Contact Email */}
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD0C2] shadow-2xs text-xs sm:text-sm font-semibold text-[#2C1810] self-start md:self-auto shrink-0">
              <FiMail className="w-3.5 h-3.5 text-[#5C1B13] shrink-0" />
              <a href={`mailto:${ENV.SUPPORT_EMAIL}`} className="text-[#5C1B13] hover:underline">
                {ENV.SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          {/* Preamble / Intro Box */}
          <div className="mt-6 w-full p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD0C2] shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDD0C2]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#5C1B13]/10 flex items-center justify-center shrink-0">
                  <FiShield className="w-4 h-4 text-[#5C1B13]" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#5C1B13] block">
                    Google Play Data Safety &amp; Privacy Compliance
                  </span>
                  <span className="text-[11px] text-[#7A685D] block">
                    Transparency &amp; User Control Policy
                  </span>
                </div>
              </div>

              <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ● 100% User Controlled
              </span>
            </div>

            <p className="text-[15px] sm:text-base text-[#140C07] leading-relaxed sm:leading-8 font-normal">
              This page explains how to delete your account and data for the Purety Farm mobile app (PuretyFarm - Pure A2 Milk).
            </p>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* OPTION 1 & OPTION 2 GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* OPTION 1: DELETE FROM THE APP */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD0C2] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#5C1B13]/30 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF3EA] border border-[#DDD0C2] flex items-center justify-center text-[#5C1B13] font-bold shadow-2xs">
                  <FiSmartphone className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Instant &amp; Automated
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#140C07] font-[family-name:var(--font-heading)] mb-4">
                Option 1: Delete from the app
              </h2>

              <ol className="space-y-3.5 text-[#140C07] text-[15px]">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#DDD0C2] w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Open the Purety Farm app and log in with your mobile number.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#DDD0C2] w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Go to Profile.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#DDD0C2] w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Tap Delete Account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#5C1B13] bg-[#FAF3EA] border border-[#DDD0C2] w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    4
                  </span>
                  <span className="leading-relaxed">
                    Confirm the deletion.
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F2EAE0] text-xs text-[#7A685D] flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Processes immediately inside the mobile app</span>
            </div>
          </section>

          {/* OPTION 2: REQUEST DELETION BY EMAIL */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD0C2] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#5C1B13]/30 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF3EA] border border-[#DDD0C2] flex items-center justify-center text-[#5C1B13] font-bold shadow-2xs">
                  <FiMail className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#5C1B13] bg-[#FAF3EA] border border-[#DDD0C2] px-3 py-1 rounded-full">
                  Assisted Deletion Desk
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#140C07] font-[family-name:var(--font-heading)] mb-4">
                Option 2: Request deletion by email
              </h2>

              <p className="text-[15px] text-[#140C07] leading-relaxed sm:leading-7 mb-4">
                Send an email to{" "}
                <a
                  href={emailDeletionMailto}
                  className="font-bold text-[#5C1B13] underline hover:text-[#7B241C]"
                >
                  {ENV.SUPPORT_EMAIL}
                </a>{" "}
                with the subject <strong className="font-bold text-[#140C07]">&ldquo;Delete my account&rdquo;</strong> and include the mobile number registered with your account. We will confirm the request and delete your account within 7 days.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F2EAE0] flex items-center justify-between gap-3">
              <a
                href={emailDeletionMailto}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#5C1B13] hover:bg-[#7B241C] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <FiMail className="w-4 h-4 text-[#F5E729]" />
                <span>Send Deletion Email</span>
              </a>

              <span className="text-xs font-semibold text-[#7A685D]">
                Response within 7 days
              </span>
            </div>
          </section>
        </div>

        {/* ─── DATA DETAILS: WHAT IS DELETED & WHAT IS KEPT ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* DATA THAT IS DELETED */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD0C2] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold shadow-2xs">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#140C07] font-[family-name:var(--font-heading)]">
                  Data that is deleted
                </h2>
                <p className="text-xs text-[#7A685D]">Permanently purged from active databases</p>
              </div>
            </div>

            <ul className="space-y-3 mt-5">
              <li className="flex items-start gap-3 text-[15px] text-[#140C07]">
                <span className="w-5 h-5 rounded-md bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <FiCheck className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed font-medium">Name and mobile number</span>
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[#140C07]">
                <span className="w-5 h-5 rounded-md bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <FiCheck className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed font-medium">Delivery addresses and location data</span>
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[#140C07]">
                <span className="w-5 h-5 rounded-md bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <FiCheck className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed font-medium">Subscription and delivery preferences</span>
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[#140C07]">
                <span className="w-5 h-5 rounded-md bg-rose-100 border border-rose-300 text-rose-800 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <FiCheck className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed font-medium">Wallet details and app login sessions</span>
              </li>
            </ul>
          </section>

          {/* DATA THAT IS KEPT */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD0C2] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold shadow-2xs">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#140C07] font-[family-name:var(--font-heading)]">
                  Data that is kept
                </h2>
                <p className="text-xs text-[#7A685D]">Statutory and regulatory retention requirements</p>
              </div>
            </div>

            <ul className="space-y-4 mt-5">
              <li className="flex items-start gap-3 text-[15px] text-[#140C07]">
                <span className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xs shrink-0 mt-1 font-bold">
                  !
                </span>
                <span className="leading-relaxed font-medium">
                  Order, invoice and payment records are kept for up to 8 years where required by Indian tax and accounting law. After that period they are deleted.
                </span>
              </li>
              <li className="flex items-start gap-3 text-[15px] text-[#140C07]">
                <span className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xs shrink-0 mt-1 font-bold">
                  !
                </span>
                <span className="leading-relaxed font-medium">
                  Any unused wallet balance should be used or a refund requested before deleting your account.
                </span>
              </li>
            </ul>

            <div className="mt-5 p-4 rounded-2xl bg-[#FFF9EA] border border-[#E2BF36] text-xs text-[#140C07] flex items-start gap-2.5">
              <FiAlertTriangle className="w-4 h-4 text-[#5C1B13] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Wallet refunds must be initiated prior to account deletion. Contact customer support if you need assistance withdrawing remaining credits.
              </p>
            </div>
          </section>
        </div>

        {/* ─── BOTTOM CONTACT & HELP CARD ─── */}
        <div className="mt-10 p-6 sm:p-9 rounded-3xl bg-gradient-to-br from-[#5C1B13] via-[#4A140E] to-[#2C1810] text-white shadow-xl relative overflow-hidden border border-[#5C1B13]">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#F5E729]/15 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-black uppercase tracking-wider text-[#F5E729] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Customer Support &amp; Grievance Redressal
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mt-3 font-[family-name:var(--font-heading)] text-white">
                Have Questions or Need Help?
              </h3>
              <p className="text-sm sm:text-base text-white/90 mt-2 leading-relaxed font-normal">
                If you are having trouble deleting your account or have questions about data handling, our team in Raipur is available to assist you.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <a
                href={getWhatsAppUrl("Hello PuretyFarm Support, I have a query regarding account deletion.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <FaWhatsapp className="w-4.5 h-4.5" />
                <span>WhatsApp Desk</span>
              </a>
              <a
                href={emailDeletionMailto}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#FAF3EA] text-[#5C1B13] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <FiMail className="w-4.5 h-4.5" />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#DDD0C2] bg-[#FAF3EA] py-8 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-[#2C1810] font-medium">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Puretyfarms Raipur. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-bold text-[#5C1B13]">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <span className="text-[#DDD0C2]">·</span>
            <Link href="/terms-and-conditions" className="hover:underline">
              Terms &amp; Conditions
            </Link>
            <span className="text-[#DDD0C2]">·</span>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
