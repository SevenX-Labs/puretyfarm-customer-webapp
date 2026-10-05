"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SpotlightCard, ShinyText } from "@/components/reactbits";
import { useScrollReveal, useParallax } from "@/lib/animations";
import { ENV } from "@/config/env";
import { getWhatsAppUrl, getPhoneUrl, getEmailUrl } from "@/lib/cta";
import confetti from "canvas-confetti";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiPhoneCall,
  FiArrowUpRight,
  FiHelpCircle,
  FiSend,
  FiUser,
  FiCheckCircle,
  FiMessageSquare,
  FiAlertCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export function ContactUs() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 25, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const cardRevealRef = useScrollReveal<HTMLDivElement>({ y: 35, delay: 0.15, duration: 0.7 });

  const bgBlob1 = useParallax<HTMLDivElement>(-0.25);
  const bgBlob2 = useParallax<HTMLDivElement>(0.2);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    locality: "",
    inquiryType: "7-Day Trial",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError("Please enter your name and contact phone number.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#5C1B13", "#F5E729", "#10B981"],
        });
      } catch {
        // Safe fallback
      }
    }, 650);
  };

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

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
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
            Have questions about pure A2 Gir cow milk delivery, custom quantities, or our daily cold chain in Raipur? Reach out directly or send us a message below.
          </p>
        </div>

        {/* ─── SIDE-BY-SIDE CONTACT SECTION: CHANNELS (LEFT) + FORM (RIGHT) ─── */}
        <div
          ref={cardRevealRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch"
        >
          {/* ─── LEFT: DIRECT CHANNELS BOX ─── */}
          <div className="lg:col-span-6 flex flex-col">
            <SpotlightCard
              spotlightColor="rgba(245, 231, 41, 0.12)"
              className="h-full rounded-3xl lg:rounded-[36px] bg-white border border-[#ECE4DA] shadow-[0_12px_45px_rgba(92,27,19,0.06)] hover:shadow-[0_16px_55px_rgba(92,27,19,0.1)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
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

              <div className="relative z-10 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full">
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

          {/* ─── RIGHT: INTERACTIVE CONTACT & INQUIRY FORM BOX ─── */}
          <div className="lg:col-span-6 flex flex-col">
            <SpotlightCard
              spotlightColor="rgba(92, 27, 19, 0.08)"
              className="h-full rounded-3xl lg:rounded-[36px] bg-white border border-[#ECE4DA] shadow-[0_12px_45px_rgba(92,27,19,0.06)] hover:shadow-[0_16px_55px_rgba(92,27,19,0.1)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle ambient blur accents */}
              <div
                aria-hidden="true"
                className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-[#5C1B13]/8 blur-3xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-[#F5E729]/15 blur-3xl pointer-events-none"
              />

              <div className="relative z-10 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full">
                {isSubmitted ? (
                  /* ─── SUCCESS CONFIRMATION STATE ─── */
                  <div className="flex flex-col items-center justify-center text-center py-8 my-auto animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-4 shadow-sm">
                      <FiCheckCircle className="w-8 h-8" />
                    </div>

                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                      Inquiry Received
                    </span>

                    <h4 className="text-2xl sm:text-3xl font-black text-[#1A1008] font-[family-name:var(--font-heading)] mb-2">
                      Thank You, {formData.name}!
                    </h4>

                    <p className="text-sm text-[#3A241C]/80 max-w-md mb-6 leading-relaxed">
                      We have received your request for{" "}
                      <strong className="text-[#5C1B13]">{formData.inquiryType}</strong>
                      {formData.locality ? ` in ${formData.locality}` : ""}. Our Raipur morning dispatch team will contact you on{" "}
                      <strong className="text-[#1A1008]">{formData.phone}</strong> shortly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                      <a
                        href={getWhatsAppUrl(
                          `Hello PuretyFarm, I submitted an inquiry on the website:\n- Name: ${formData.name}\n- Phone: ${formData.phone}\n- Locality: ${formData.locality || "Raipur"}\n- Service: ${formData.inquiryType}${formData.message ? `\n- Note: ${formData.message}` : ""}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: "",
                            phone: "",
                            locality: "",
                            inquiryType: "7-Day Trial",
                            message: "",
                          });
                        }}
                        className="px-4 py-3 rounded-xl bg-[#FAF3EA] hover:bg-[#5C1B13] hover:text-white text-[#5C1B13] font-bold text-xs sm:text-sm border border-[#E8DFD4] transition-all cursor-pointer"
                      >
                        Send Another
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ─── ACTIVE INQUIRY FORM ─── */
                  <div>
                    {/* Form Box Header */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-[#ECE4DA]">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] text-xs font-bold uppercase tracking-wider mb-2">
                          <FiSend className="w-3.5 h-3.5 text-[#5C1B13]" />
                          <span>Direct Inquiry</span>
                        </span>
                        <h3 className="text-2xl sm:text-[28px] font-bold text-[#1A1008] font-[family-name:var(--font-heading)] leading-snug">
                          Send Us a Message
                        </h3>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EA] text-[#5C1B13] text-xs font-bold border border-[#E8DFD4] shadow-2xs shrink-0">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>Quick Reply</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#3A241C]/80 leading-relaxed mb-5">
                      Need milk delivery for your home or have a custom inquiry? Fill out this quick form and our team will get back to you promptly.
                    </p>

                    {formError && (
                      <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                        <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Full Name & Phone Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                            Full Name <span className="text-[#5C1B13]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5C1B13]/60">
                              <FiUser className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm text-[#1A1008] bg-[#FFFDF7] border border-[#E8DFD4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all placeholder:text-[#3A241C]/40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                            Phone / WhatsApp <span className="text-[#5C1B13]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5C1B13]/60">
                              <FiPhone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="10-digit mobile number"
                              className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm text-[#1A1008] bg-[#FFFDF7] border border-[#E8DFD4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all placeholder:text-[#3A241C]/40"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Locality in Raipur */}
                      <div>
                        <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                          Delivery Locality in Raipur
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5C1B13]/60">
                            <FiMapPin className="w-4 h-4" />
                          </div>
                          <select
                            value={formData.locality}
                            onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#1A1008] bg-[#FFFDF7] border border-[#E8DFD4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all cursor-pointer"
                          >
                            <option value="">Select your Raipur locality...</option>
                            <option value="Shankar Nagar">Shankar Nagar</option>
                            <option value="VIP Road Corridor">VIP Road Corridor</option>
                            <option value="Civil Lines">Civil Lines</option>
                            <option value="Samta Colony">Samta Colony</option>
                            <option value="Devendra Nagar">Devendra Nagar</option>
                            <option value="Pandri / Mowa">Pandri / Mowa</option>
                            <option value="Telibandha">Telibandha / Marine Drive</option>
                            <option value="Tatibandh">Tatibandh</option>
                            <option value="Kamal Vihar">Kamal Vihar</option>
                            <option value="Sadar Bazar">Sadar Bazar</option>
                            <option value="Other Locality in Raipur">Other Area in Raipur</option>
                          </select>
                        </div>
                      </div>

                      {/* Inquiry Type Pill Selector */}
                      <div>
                        <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                          I am interested in:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: "7-Day Trial", val: "7-Day Trial" },
                            { label: "Daily Milk", val: "Daily Subscription" },
                            { label: "Bulk / Sample", val: "Sample / Bulk" },
                            { label: "General", val: "General Inquiry" },
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => setFormData({ ...formData, inquiryType: item.val })}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                                formData.inquiryType === item.val
                                  ? "bg-[#5C1B13] text-white shadow-2xs scale-[1.02]"
                                  : "bg-[#FAF3EA] text-[#3A241C] border border-[#E8DFD4] hover:bg-[#5C1B13]/10"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional Message / Notes */}
                      <div>
                        <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                          Message / Delivery Note <span className="text-[#3A241C]/50 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-[#5C1B13]/60">
                            <FiMessageSquare className="w-4 h-4 mt-0.5" />
                          </div>
                          <textarea
                            rows={3}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Preferred morning delivery time, milk volume, or any question..."
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#1A1008] bg-[#FFFDF7] border border-[#E8DFD4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all placeholder:text-[#3A241C]/40 resize-none"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          fullWidth
                          disabled={isSubmitting}
                          className="w-full justify-center text-sm font-bold"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Sending Inquiry...</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <FiSend className="w-4 h-4" />
                              <span>Submit Message</span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Bottom Assurance */}
                <div className="mt-6 pt-4 border-t border-[#ECE4DA] flex items-center justify-between text-xs text-[#3A241C]/75">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Same-Day Contact Guarantee
                  </span>
                  <span className="font-semibold text-[#5C1B13]">
                    Pure A2 Gir Desi Milk
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </Section>
  );
}

