"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { ShinyText, Magnet } from "@/components/reactbits";
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
  FiSend,
  FiUser,
  FiCheckCircle,
  FiMessageSquare,
  FiHelpCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const RAIPUR_LOCALITIES = [
  "Shankar Nagar",
  "VIP Road",
  "Telibandha",
  "Civil Lines",
  "Samta Colony",
  "Devendra Nagar",
  "Pandri",
  "Avanti Vihar",
  "Khamardih",
  "Pachpedi Naka",
  "Tatibandh",
  "Mowa",
  "Sadar Bazar",
  "Kamal Vihar",
  "Other Raipur Area",
];

const QUERY_TOPICS = [
  "Start 7-Day Trial",
  "Subscription Setup",
  "Delivery Pause / Change",
  "Sample Bottle Request",
  "Bulk / Corporate Order",
  "General Inquiry",
];

export function ContactUs() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 25, duration: 0.5 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.2 });
  const gridRef = useStaggerReveal<HTMLDivElement>("[data-contact-box]", {
    y: 45,
    stagger: 0.16,
    duration: 0.7,
    ease: "back.out(1.15)",
  });

  const bgBlob1 = useParallax<HTMLDivElement>(-0.25);
  const bgBlob2 = useParallax<HTMLDivElement>(0.2);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    locality: RAIPUR_LOCALITIES[0],
    topic: QUERY_TOPICS[0],
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setSubmitting(true);
    // Simulate brief network submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleWhatsAppRedirect = () => {
    const text = `Hi PuretyFarm Raipur!%0A*Name:* ${encodeURIComponent(
      formData.name
    )}%0A*Phone:* ${encodeURIComponent(formData.phone)}%0A*Locality:* ${encodeURIComponent(
      formData.locality
    )}%0A*Inquiry:* ${encodeURIComponent(formData.topic)}%0A*Message:* ${encodeURIComponent(
      formData.message || "Please share trial details and morning delivery slots."
    )}`;
    const cleanNumber = ENV.WHATSAPP_NUMBER.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      phone: "",
      locality: RAIPUR_LOCALITIES[0],
      topic: QUERY_TOPICS[0],
      message: "",
    });
  };

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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header with Scroll Reveal */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div ref={badgeRef}>
            <span className="inline-flex items-center gap-2 bg-[#5C1B13]/10 border border-[#5C1B13]/20 text-[#5C1B13] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider mb-4 shadow-2xs hover:scale-105 transition-transform duration-200">
              <FiPhoneCall className="w-3.5 h-3.5 text-[#5C1B13]" />
              <ShinyText text="Direct Contact & Support" speed={3.5} />
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
            Have questions about pure A2 Gir cow milk delivery, custom quantities, or our daily cold chain in Raipur? Reach out directly or send us an inquiry below.
          </p>
        </div>

        {/* ─── 2 BOXES SIDE BY SIDE ─── */}
        {/* Left Box: Detailed Contact Info | Right Box: Contact Query Form */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* ═══════════════════════════════════════════════════════════════════
              LEFT BOX: DETAILED CONTACT INFORMATION & CHANNELS
          ═══════════════════════════════════════════════════════════════════ */}
          <div data-contact-box className="h-full">
            <TiltCard tiltMaxAngle={2.5} scale={1.008} glare={true} className="h-full">
              <div className="h-full p-5 sm:p-8 lg:p-9 rounded-3xl bg-white border border-[#E8DFD4] shadow-sm hover:shadow-xl hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Left Box Header */}
                  <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E8DFD4]">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] text-xs font-bold uppercase tracking-wider mb-2">
                        <FiHelpCircle className="w-3.5 h-3.5 text-[#5C1B13]" />
                        <span>Direct Channels</span>
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                        Get in Touch Directly
                      </h3>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shrink-0">
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
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-300 transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                          <FaWhatsapp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-950">WhatsApp Chat</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-900">~5m reply</span>
                          </div>
                          <p className="text-xs text-emerald-900/80 font-semibold">{ENV.PHONE_DISPLAY}</p>
                        </div>
                      </div>
                      <a
                        href={getWhatsAppUrl("Hi PuretyFarm, I would like to inquire about fresh A2 milk delivery in Raipur.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                      >
                        <span>Chat</span>
                        <FiArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Channel 2: Helpline Voice */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF3EA]/70 border border-[#E8DFD4] hover:border-[#5C1B13]/30 transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0 font-bold">
                          <FiPhone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1A1008]">Voice Helpline</span>
                            <span className="text-[10px] text-[#3A241C]/60 flex items-center gap-1">
                              <FiClock className="w-2.5 h-2.5" />
                              7 AM – 8 PM
                            </span>
                          </div>
                          <p className="text-xs text-[#5C1B13] font-bold">{ENV.PHONE_DISPLAY}</p>
                        </div>
                      </div>
                      <a
                        href={getPhoneUrl()}
                        className="px-3.5 py-2 min-h-[38px] rounded-lg bg-[#5C1B13] hover:bg-[#4A1510] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                      >
                        <span>Call</span>
                        <FiArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Channel 3: Email Desk */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8DFD4] hover:border-[#5C1B13]/30 transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center shrink-0">
                          <FiMail className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1A1008] block">Email Support</span>
                          <p className="text-xs text-[#3A241C]/75 truncate max-w-[180px] sm:max-w-none">{ENV.SUPPORT_EMAIL}</p>
                        </div>
                      </div>
                      <a
                        href={getEmailUrl()}
                        className="px-3.5 py-2 min-h-[38px] rounded-lg bg-[#FAF3EA] hover:bg-[#5C1B13] text-[#5C1B13] hover:text-white text-xs font-bold transition-all border border-[#E8DFD4] flex items-center justify-center gap-1 shrink-0"
                      >
                        <span>Write</span>
                        <FiArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Channel 4: Raipur Cold Chain Hub */}
                    <div className="p-4 rounded-2xl bg-[#FBF6EE]/90 border border-[#E8DFD4]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center shrink-0 mt-0.5">
                          <FiMapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#1A1008]">Raipur Operations Hub</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Cold Chain Active
                            </span>
                          </div>
                          <p className="text-xs text-[#3A241C]/80 mt-1 leading-relaxed">
                            Kumhari Farm Gaushala &amp; VIP Road Delivery Corridor, Raipur 492001.
                          </p>
                          <div className="mt-2 pt-2 border-t border-[#E8DFD4]/80 flex items-center gap-2 text-[11px] font-bold text-[#5C1B13]">
                            <FiClock className="w-3.5 h-3.5 text-[#5C1B13]" />
                            <span>Morning Doorstep Dispatch: 5:30 AM – 7:00 AM Daily</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFD4] flex items-center justify-between text-xs text-[#3A241C]/70">
                  <span>100% Desi Gir Cow A2 Milk</span>
                  <span className="font-bold text-[#5C1B13]">Zero Plastic Touch</span>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT BOX: CONTACT QUERY FORM
          ═══════════════════════════════════════════════════════════════════ */}
          <div data-contact-box className="h-full">
            <TiltCard tiltMaxAngle={2.5} scale={1.008} glare={true} className="h-full">
              <div className="h-full p-5 sm:p-8 lg:p-9 rounded-3xl bg-white border border-[#E8DFD4] shadow-sm hover:shadow-xl hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Right Box Header */}
                  <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E8DFD4]">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E729]/30 text-[#5C1B13] text-xs font-bold uppercase tracking-wider mb-2">
                        <FiMessageSquare className="w-3.5 h-3.5 text-[#5C1B13]" />
                        <span>Contact Query</span>
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                        Send a Message
                      </h3>
                    </div>
                    <span className="text-xs text-[#3A241C]/60 font-semibold">
                      Fast 15m Response
                    </span>
                  </div>

                  {submitted ? (
                    /* Success / Thank You Confirmation View */
                    <div className="py-8 text-center animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FiCheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
                        Thank You, {formData.name}!
                      </h4>
                      <p className="text-xs sm:text-sm text-[#3A241C]/80 mt-2 max-w-md mx-auto leading-relaxed">
                        Your inquiry regarding <strong className="text-[#5C1B13]">{formData.topic}</strong> for <strong className="text-[#5C1B13]">{formData.locality}</strong> has been received by our morning delivery coordinator.
                      </p>

                      <div className="mt-6 p-4 rounded-2xl bg-[#FAF3EA] border border-[#E8DFD4] text-xs text-[#3A241C]/85 max-w-md mx-auto text-left space-y-1.5">
                        <p><strong>Contact:</strong> {formData.phone}</p>
                        {formData.message && <p><strong>Note:</strong> {formData.message}</p>}
                        <p className="text-[11px] text-emerald-800 font-bold pt-1">
                          Our Raipur desk will reach out via WhatsApp or call shortly.
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleWhatsAppRedirect}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                          <span>Open in WhatsApp Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="px-4 py-2.5 rounded-xl bg-white border border-[#E8DFD4] hover:bg-[#FAF3EA] text-[#3A241C] font-bold text-xs transition-all cursor-pointer"
                        >
                          Send Another Query
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* The Interactive Query Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name & Phone Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A241C]/40" />
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#FFFDF7] border border-[#E8DFD4] text-base sm:text-sm text-[#1A1008] placeholder:text-[#3A241C]/40 focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                            Phone / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3A241C]/60">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="91316 13141"
                              className="w-full pl-12 pr-3.5 py-3 rounded-xl bg-[#FFFDF7] border border-[#E8DFD4] text-base sm:text-sm text-[#1A1008] placeholder:text-[#3A241C]/40 focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Locality in Raipur & Query Topic */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                            Locality in Raipur
                          </label>
                          <select
                            value={formData.locality}
                            onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                            className="w-full px-3.5 py-3 rounded-xl bg-[#FFFDF7] border border-[#E8DFD4] text-base sm:text-sm text-[#1A1008] focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all cursor-pointer"
                          >
                            {RAIPUR_LOCALITIES.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                            Inquiry Type
                          </label>
                          <select
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            className="w-full px-3.5 py-3 rounded-xl bg-[#FFFDF7] border border-[#E8DFD4] text-base sm:text-sm text-[#1A1008] focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all cursor-pointer"
                          >
                            {QUERY_TOPICS.map((top) => (
                              <option key={top} value={top}>
                                {top}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Message / Query Textarea */}
                      <div>
                        <label className="block text-xs font-bold text-[#1A1008] mb-1.5">
                          Your Message or Questions <span className="text-[#3A241C]/40 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us about your milk preference, daily requirement (liters), or preferred delivery timing..."
                          className="w-full p-3.5 rounded-xl bg-[#FFFDF7] border border-[#E8DFD4] text-base sm:text-sm text-[#1A1008] placeholder:text-[#3A241C]/40 focus:outline-none focus:ring-2 focus:ring-[#5C1B13] focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      {/* Submit CTA Button with Magnet effect */}
                      <div className="pt-2">
                        <Magnet magnetStrength={0.15} className="w-full">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 px-6 rounded-xl bg-[#5C1B13] hover:bg-[#4A1510] disabled:bg-[#5C1B13]/60 text-white font-bold text-sm shadow-md shadow-[#5C1B13]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            {submitting ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending Query...
                              </span>
                            ) : (
                              <>
                                <FiSend className="w-4 h-4" />
                                <span>Submit Query to Raipur Team</span>
                              </>
                            )}
                          </button>
                        </Magnet>
                      </div>

                      <p className="text-[11px] text-center text-[#3A241C]/60 pt-1">
                        🔒 Zero spam guarantee. We only use your number to respond to this delivery inquiry.
                      </p>
                    </form>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFD4] flex items-center justify-between text-xs text-[#3A241C]/70">
                  <span>Average Reply: ~15 mins</span>
                  <button
                    type="button"
                    onClick={handleWhatsAppRedirect}
                    className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5" />
                    <span>Quick WhatsApp Instead</span>
                  </button>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </Section>
  );
}
