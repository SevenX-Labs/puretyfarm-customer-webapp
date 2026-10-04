"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { SERVICEABLE_AREAS } from "@/data/serviceableAreas";
import { getWhatsAppUrl } from "@/lib/cta";
import { FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export function EmptyStateContent() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFDF7] flex items-center justify-center px-4 py-16">
        <m.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DFD4] shadow-sm text-center"
        >
          {/* Friendly Icon */}
          <m.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: "easeInOut",
            }}
            className="w-20 h-20 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] mx-auto flex items-center justify-center mb-6"
          >
            <FiMapPin className="w-10 h-10" />
          </m.div>

          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#5C1B13] bg-[#5C1B13]/10 rounded-full px-3.5 py-1 mb-3">
            Coverage Inquiry
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
            Locality Not Yet Covered
          </h1>

          <p className="mt-3 text-base text-[#3A241C]/80 leading-relaxed">
            We are actively expanding our early-morning cold chain across Raipur. If your colony is not on our current delivery list, let us know!
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <m.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href={getWhatsAppUrl("Hi PuretyFarm, I would like to request A2 milk delivery for my locality.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Request on WhatsApp</span>
            </m.a>
            <m.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link
                href="/#contact"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#E8DFD4] text-sm font-semibold text-[#3A241C] hover:bg-[#FBF6EE] transition-colors"
              >
                Contact Support
              </Link>
            </m.div>
          </div>

          {/* Active Areas reference */}
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-[#E8DFD4] text-left"
          >
            <p className="text-xs font-bold text-[#1A1008] mb-2 uppercase tracking-wide">
              Currently Servicing 23+ Raipur Localities:
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs text-[#3A241C]/75">
              {SERVICEABLE_AREAS.slice(0, 12).map((a) => (
                <span key={a} className="bg-[#FBF6EE] px-2 py-1 rounded-md border border-[#E8DFD4]/60">
                  {a}
                </span>
              ))}
              <span className="text-[#5C1B13] font-medium self-center pl-1">+ {SERVICEABLE_AREAS.length - 12} more</span>
            </div>
          </m.div>
        </m.div>
      </main>
    </>
  );
}
