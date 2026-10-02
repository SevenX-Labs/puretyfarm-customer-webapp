"use client";

import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { useScrollReveal, useStaggerReveal, useParallax } from "@/lib/animations";
import { ENV } from "@/config/env";
import { getWhatsAppUrl, getPhoneUrl, getEmailUrl } from "@/lib/cta";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiPhoneCall,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export function ContactUs() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 25, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const cardsRef = useStaggerReveal<HTMLDivElement>("[data-contact-card]", {
    y: 50,
    stagger: 0.14,
    duration: 0.7,
    ease: "back.out(1.2)",
  });

  const bgBlob1 = useParallax<HTMLDivElement>(-0.25);
  const bgBlob2 = useParallax<HTMLDivElement>(0.2);

  return (
    <Section background="default" id="contact" className="relative overflow-hidden">
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

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header with Scroll Reveal */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div ref={badgeRef}>
            <span className="inline-flex items-center gap-2 bg-[#5C1B13]/10 border border-[#5C1B13]/20 text-[#5C1B13] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4 shadow-2xs hover:scale-105 transition-transform duration-200">
              <FiPhoneCall className="w-3.5 h-3.5 text-[#5C1B13]" />
              <span>Contact Us</span>
            </span>
          </div>

          <h2
            ref={headingRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight"
          >
            We&apos;re Here to <span className="text-[#5C1B13]">Help You</span>
          </h2>

          <p
            ref={subtitleRef}
            className="mt-4 text-base sm:text-lg text-[#3A241C]/80 leading-relaxed"
          >
            Have questions about pure A2 Gir cow milk delivery, custom quantities, or our daily cold chain in Raipur? Reach out directly through any channel below.
          </p>
        </div>

        {/* 2x2 Balanced Cards Grid with Staggered Reveal and 3D Tilt */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: WhatsApp (High Priority) */}
          <div data-contact-card className="h-full">
            <TiltCard
              tiltMaxAngle={5}
              scale={1.02}
              glare={true}
              className="h-full group"
            >
              <div className="h-full p-7 sm:p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <FaWhatsapp className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 shadow-2xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Online Now
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-emerald-950 mb-2 font-[family-name:var(--font-heading)] group-hover:text-emerald-900 transition-colors">
                    Chat on WhatsApp
                  </h3>
                  <p className="text-sm text-emerald-900/80 leading-relaxed mb-6">
                    Fastest response (~5 mins). Message us for subscription inquiries, sample bottles, or daily delivery updates.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-emerald-200/60">
                  <span className="block text-base font-bold text-emerald-950 tracking-tight">
                    {ENV.PHONE_DISPLAY}
                  </span>
                  <a
                    id="contact-whatsapp-btn"
                    href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>Open WhatsApp Chat</span>
                    <FiArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 2: Phone Support */}
          <div data-contact-card className="h-full">
            <TiltCard
              tiltMaxAngle={5}
              scale={1.02}
              glare={true}
              className="h-full group"
            >
              <div className="h-full p-7 sm:p-8 rounded-3xl bg-white border border-[#E8DFD4] shadow-xs hover:shadow-xl hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#5C1B13] group-hover:text-white transition-all duration-300">
                      <FiPhone className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13]/5 text-[#5C1B13] text-xs font-bold border border-[#5C1B13]/15">
                      Voice Support
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors">
                    Call Our Helpline
                  </h3>
                  <p className="text-sm text-[#3A241C]/80 leading-relaxed mb-6">
                    Speak directly with our Raipur customer care team for personalized subscription setup or urgent queries.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#E8DFD4]">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#5C1B13] tracking-tight">
                      {ENV.PHONE_DISPLAY}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#3A241C]/70">
                      <FiClock className="w-3.5 h-3.5 text-[#5C1B13]" />
                      <span>7:00 AM – 8:00 PM</span>
                    </div>
                  </div>
                  <a
                    id="contact-call-btn"
                    href={getPhoneUrl()}
                    className="group/btn w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#5C1B13] hover:bg-[#4A1510] text-white font-bold text-sm shadow-md shadow-[#5C1B13]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FiPhone className="w-4 h-4" />
                    <span>Call Helpline</span>
                    <FiArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 3: Email Support */}
          <div data-contact-card className="h-full">
            <TiltCard
              tiltMaxAngle={5}
              scale={1.02}
              glare={true}
              className="h-full group"
            >
              <div className="h-full p-7 sm:p-8 rounded-3xl bg-white border border-[#E8DFD4] shadow-xs hover:shadow-xl hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#5C1B13] group-hover:text-white transition-all duration-300">
                      <FiMail className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3EA] text-[#5C1B13] text-xs font-bold border border-[#E8DFD4]">
                      Within 2–4 hrs
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors">
                    Email Inquiries
                  </h3>
                  <p className="text-sm text-[#3A241C]/80 leading-relaxed mb-6">
                    For corporate orders, bulk requirements, partnerships, or detailed feedback, write to our support desk.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#E8DFD4]">
                  <span className="block text-base font-bold text-[#1A1008] tracking-tight">
                    {ENV.SUPPORT_EMAIL}
                  </span>
                  <a
                    id="contact-email-btn"
                    href={getEmailUrl()}
                    className="group/btn w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#FFFDF7] border border-[#DFCFC2] hover:bg-[#FAF3EA] text-[#5C1B13] font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FiMail className="w-4 h-4" />
                    <span>Send Email</span>
                    <FiArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 4: Raipur Operations Hub */}
          <div data-contact-card className="h-full">
            <TiltCard
              tiltMaxAngle={5}
              scale={1.02}
              glare={true}
              className="h-full group"
            >
              <div className="h-full p-7 sm:p-8 rounded-3xl bg-[#FBF6EE] border border-[#E8DFD4] shadow-xs hover:shadow-xl hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#5C1B13] group-hover:text-white transition-all duration-300">
                      <FiMapPin className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      Cold Chain Hub
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors">
                    Raipur Operations Hub
                  </h3>
                  <p className="text-sm text-[#3A241C]/80 leading-relaxed mb-6">
                    VIP Road &amp; Shankar Nagar Delivery Corridor, Raipur, Chhattisgarh 492001. Serving Shankar Nagar, Telibandha, VIP Road, Civil Lines, and 20+ localities.
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#E8DFD4]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5C1B13]">
                    <FiClock className="w-4 h-4 shrink-0" />
                    <span>Morning Dispatch: 5:30 AM – 7:00 AM Daily</span>
                  </div>
                  <p className="text-[11px] text-[#3A241C]/70">
                    Ethically chilled &amp; delivered fresh in sanitized glass bottles.
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </Section>
  );
}
