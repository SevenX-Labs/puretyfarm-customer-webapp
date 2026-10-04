"use client";

import { Section } from "@/components/ui/Section";
import { SpotlightCard, ShinyText } from "@/components/reactbits";
import { useScrollReveal, useParallax } from "@/lib/animations";
import { ENV } from "@/config/env";
import { getWhatsAppUrl, getPhoneUrl, getEmailUrl } from "@/lib/cta";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiPhoneCall,
  FiArrowUpRight,
  FiHelpCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export function ContactUs() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 25, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const cardRevealRef = useScrollReveal<HTMLDivElement>({ y: 35, delay: 0.15, duration: 0.7 });

  const bgBlob1 = useParallax<HTMLDivElement>(-0.25);
  const bgBlob2 = useParallax<HTMLDivElement>(0.2);

  return (
    <Section background="default" id="contact" className="relative overflow-hidden py-14 sm:py-20">
      {/* Decorative ambient color blur blobs with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          ref={bgBlob1}
          className="absolute -top-24 -right-24 w-88 h-88 rounded-full bg-[#F5E729]/15 blur-3xl"
        />
        <div
          ref={bgBlob2}
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#5C1B13]/7 blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 px-4 sm:px-6">
        {/* Section Header with Scroll Reveal */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div ref={badgeRef}>
            <span className="inline-flex items-center gap-2 bg-[#5C1B13]/10 border border-[#5C1B13]/20 text-[#5C1B13] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4 shadow-2xs hover:scale-105 transition-transform duration-200">
              <FiPhoneCall className="w-3.5 h-3.5 text-[#5C1B13]" />
              <ShinyText text="Direct Contact & Support" speed={3.5} />
            </span>
          </div>

          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight"
          >
            We&apos;re Here to <span className="font-serif italic text-[#5C1B13]">Help You</span>
          </h2>

          <p
            ref={subtitleRef}
            className="mt-3 text-sm sm:text-base text-[#3A241C]/80 leading-relaxed max-w-xl mx-auto"
          >
            Have questions about pure A2 Gir cow milk delivery, custom quantities, or our daily cold chain in Raipur? Reach out directly via your preferred channel.
          </p>
        </div>

        {/* ─── CENTERED INTERACTIVE CONTACT BOX ─── */}
        <div ref={cardRevealRef} className="max-w-2xl mx-auto w-full">
          <SpotlightCard
            spotlightColor="rgba(245, 231, 41, 0.12)"
            className="rounded-3xl lg:rounded-[36px] bg-white border border-[#ECE4DA] shadow-[0_12px_45px_rgba(92,27,19,0.06)] hover:shadow-[0_16px_55px_rgba(92,27,19,0.1)] transition-all duration-300 relative overflow-hidden"
          >
            {/* Subtle warm ambient corner accents */}
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#F5E729]/15 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#5C1B13]/8 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 p-6 sm:p-9 lg:p-10 flex flex-col justify-between">
              <div>
                {/* Box Header */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-[#ECE4DA]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] text-xs font-bold uppercase tracking-wider mb-2">
                      <FiHelpCircle className="w-3.5 h-3.5 text-[#5C1B13]" />
                      <span>Direct Channels</span>
                    </span>
                    <h3 className="text-2xl sm:text-[28px] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug">
                      Get in Touch Directly
                    </h3>
                  </div>

                  {/* Pulsing Live Status Beacon */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80 shadow-2xs shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Online Now
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed mb-6">
                  Connect with our Raipur team via your preferred communication method. We are available every morning and evening to assist your household.
                </p>

                {/* 4 Details Contact Sub-Cards */}
                <div className="space-y-3.5">
                  {/* Channel 1: WhatsApp (High Priority) */}
                  <div className="group p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50/90 transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                        <FaWhatsapp className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-emerald-950">WhatsApp Chat</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 border border-emerald-300/40">
                            ~5m reply
                          </span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-emerald-900/80 font-semibold mt-0.5">
                          {ENV.WHATSAPP_DISPLAY}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 group/btn cursor-pointer"
                    >
                      <span>Chat</span>
                      <FiArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>

                  {/* Channel 2: Helpline Voice */}
                  <div className="group p-3.5 sm:p-4 rounded-2xl bg-[#FAF3EA]/70 border border-[#E8DFD4] hover:border-[#5C1B13]/30 hover:bg-[#FAF3EA] transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
                        <FiPhone className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-[#1A1008]">Voice Helpline</span>
                          <span className="text-[10px] text-[#3A241C]/70 font-medium flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-[#5C1B13]" />
                            7 AM – 8 PM
                          </span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-[#5C1B13] font-bold mt-0.5">
                          {ENV.PHONE_DISPLAY}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getPhoneUrl()}
                      className="px-4 py-2 min-h-[40px] rounded-xl bg-[#5C1B13] hover:bg-[#4A1510] active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 group/btn cursor-pointer"
                    >
                      <span>Call</span>
                      <FiArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>

                  {/* Channel 3: Email Desk */}
                  <div className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8DFD4] hover:border-[#5C1B13]/30 hover:bg-[#FAF4ED]/30 transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <FiMail className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-[#1A1008] block leading-tight">
                          Email Support
                        </span>
                        <p className="text-xs text-[#3A241C]/75 truncate max-w-[180px] sm:max-w-none mt-0.5 font-medium">
                          {ENV.SUPPORT_EMAIL}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getEmailUrl()}
                      className="px-4 py-2 min-h-[40px] rounded-xl bg-[#FAF3EA] hover:bg-[#5C1B13] hover:text-white text-[#5C1B13] text-xs font-bold transition-all border border-[#E8DFD4] flex items-center justify-center gap-1.5 shrink-0 group/btn cursor-pointer"
                    >
                      <span>Write</span>
                      <FiArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>

                  {/* Channel 4: Raipur Cold Chain Hub */}
                  <div className="group p-4 sm:p-5 rounded-2xl bg-[#FBF6EE]/90 border border-[#E8DFD4] hover:border-[#5C1B13]/30 transition-all duration-200 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110">
                        <FiMapPin className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-[#1A1008]">
                            Raipur Operations Hub
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Cold Chain Active
                          </span>
                        </div>
                        <p className="text-xs text-[#3A241C]/80 mt-1 leading-relaxed">
                          VIP Road Delivery Hub &amp; Farm Corridor, Raipur, Chhattisgarh.
                        </p>
                        <div className="mt-2.5 pt-2.5 border-t border-[#E8DFD4]/80 flex items-center gap-2 text-xs font-bold text-[#5C1B13]">
                          <FiClock className="w-3.5 h-3.5 text-[#5C1B13] shrink-0" />
                          <span>Morning Doorstep Dispatch: Delivered Before 10:00 AM Daily</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-7 pt-4 border-t border-[#ECE4DA] flex items-center justify-between text-xs text-[#3A241C]/75">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5C1B13]" />
                  100% Desi Gir Cow A2 Milk
                </span>
                <span className="font-bold text-[#5C1B13] inline-flex items-center gap-1">
                  Zero Plastic Touch
                </span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </Section>
  );
}
