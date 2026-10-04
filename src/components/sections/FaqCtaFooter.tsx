"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";
import {
  FiChevronDown,
  FiMapPin,
  FiShield,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa6";

gsap.registerPlugin(ScrollTrigger);

const FAQ_ITEMS = [
  {
    num: "01",
    question: "What is A2 milk and how is it different?",
    answer:
      "A2 milk comes from indigenous Gir cows that naturally produce only the A2 beta-casein protein. Unlike regular milk (which contains A1 protein), A2 milk is easier to digest, reduces bloating, and is closer to the milk our ancestors consumed.",
    badge: {
      label: "Gentle on Stomach",
      icon: FaLeaf,
      bg: "bg-[#EBF3E7]",
      border: "border-[#D5E4D0]",
      text: "text-[#3D6832]",
    },
    closedNum: {
      bg: "bg-[#F5ECE1]",
      text: "text-[#5C2818]",
    },
  },
  {
    num: "02",
    question: "What areas in Raipur do you deliver to?",
    answer:
      "We currently deliver across Shankar Nagar, Samta Colony, VIP Road, Telibandha, Civil Lines, Devendra Nagar, and surrounding areas. Check our app for real-time service area coverage.",
    badge: {
      label: "Raipur & Nearby",
      icon: FiMapPin,
      bg: "bg-[#FCEEE2]",
      border: "border-[#F4DAC4]",
      text: "text-[#8D4926]",
    },
    closedNum: {
      bg: "bg-[#FCEEE2]",
      text: "text-[#8D4926]",
    },
  },
  {
    num: "03",
    question: "How does the 7-day trial work?",
    answer:
      "Simply download our app or contact us via WhatsApp. We start delivering 1 litre of fresh A2 milk daily for 7 days. No advance payment required. Pay only after your trial if you love it.",
    badge: {
      label: "Risk Free",
      icon: FiShield,
      bg: "bg-[#EEF5EB]",
      border: "border-[#D6E6D1]",
      text: "text-[#416E37]",
    },
    closedNum: {
      bg: "bg-[#F7EFE4]",
      text: "text-[#7C5029]",
    },
  },
  {
    num: "04",
    question: "What time is milk delivered?",
    answer:
      "We deliver before 10:00 AM every morning (dispatches begin as early as 5:30 AM). You can track your delivery partner live on the app with real-time route updates.",
    badge: {
      label: "Before 7:00 AM",
      icon: FiClock,
      bg: "bg-[#F4EDF9]",
      border: "border-[#E5D3F0]",
      text: "text-[#694282]",
    },
    closedNum: {
      bg: "bg-[#EBF3EA]",
      text: "text-[#3F683A]",
    },
  },
  {
    num: "05",
    question: "Can I pause or cancel my subscription?",
    answer:
      "Yes! You can pause deliveries anytime through the app — for a day, a week, or longer. There are zero cancellation charges.",
    badge: {
      label: "Flexible",
      icon: FiRefreshCw,
      bg: "bg-[#EAF3FB]",
      border: "border-[#D0E3F4]",
      text: "text-[#285D83]",
    },
    closedNum: {
      bg: "bg-[#FAECEB]",
      text: "text-[#8C3A38]",
    },
  },
] as const;

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);
  const BadgeIcon = item.badge.icon;

  useEffect(() => {
    const el = answerRef.current;
    if (!el) return;

    gsap.killTweensOf(el);

    if (isOpen) {
      gsap.set(el, { height: "auto" });
      const h = el.scrollHeight;
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: h,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(el, { height: "auto" });
          },
        }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }

    return () => {
      gsap.killTweensOf(el);
    };
  }, [isOpen]);

  return (
    <div
      data-faq-item
      className={`rounded-2xl sm:rounded-[22px] border transition-all duration-300 ${
        isOpen
          ? "bg-[#FFFDFB] border-[#E8CEB9] shadow-[0_8px_30px_rgba(92,27,19,0.06)] ring-1 ring-[#E8CEB9]/60"
          : "bg-white border-[#EFE8DE] shadow-[0_2px_12px_rgba(30,18,10,0.02)] hover:border-[#DCC8B8] hover:shadow-[0_4px_18px_rgba(30,18,10,0.04)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 sm:px-6 py-4 sm:py-5 text-left cursor-pointer gap-3 sm:gap-4 select-none focus:outline-hidden"
        aria-expanded={isOpen}
      >
        {/* Left Number Circle */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors duration-200 ${
            isOpen
              ? "bg-[#3E1810] text-white shadow-xs"
              : `${item.closedNum.bg} ${item.closedNum.text}`
          }`}
        >
          {item.num}
        </div>

        {/* Question Heading */}
        <span className="font-serif text-[#1A1008] text-base sm:text-[18px] font-bold tracking-tight pr-1 sm:pr-2 flex-1 leading-snug">
          {item.question}
        </span>

        {/* Right Badge (Visible in header only when CLOSED, matching the mockup) */}
        {!isOpen && (
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${item.badge.bg} ${item.badge.border} ${item.badge.text} border shrink-0`}
          >
            <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.badge.label}</span>
          </div>
        )}

        {/* Chevron Icon */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
            isOpen ? "text-[#3E1810] rotate-180" : "text-[#5A483C]"
          }`}
        >
          <FiChevronDown className="w-5 h-5" />
        </div>
      </button>

      {/* Accordion Answer Content */}
      <div
        ref={answerRef}
        className="overflow-hidden"
        style={{ height: isOpen ? "auto" : 0 }}
      >
        <div className="px-4 sm:px-6 pb-5 pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1 sm:pt-2 border-t border-[#F2EAE0]/70 pl-0 sm:pl-14">
            <p className="text-[#5C4E44] text-[14.5px] sm:text-[15.5px] leading-relaxed max-w-xl">
              {item.answer}
            </p>

            {/* Badge placed inside answer block when OPEN (matching card 01 in the mockup) */}
            <div
              className={`self-start sm:self-end shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${item.badge.bg} ${item.badge.border} ${item.badge.text} border shadow-2xs`}
            >
              <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.badge.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqCtaFooter() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 25 });
  const faqHeadingRef = useScrollReveal<HTMLHeadingElement>({ y: 35, delay: 0.05 });
  const faqSubRef = useScrollReveal<HTMLParagraphElement>({ y: 25, delay: 0.1 });
  const leafDividerRef = useScrollReveal<HTMLDivElement>({ y: 20, delay: 0.15 });
  const faqListRef = useStaggerReveal<HTMLDivElement>("[data-faq-item]", {
    y: 30,
    stagger: 0.08,
    duration: 0.5,
  });

  return (
    <section
      id="faq"
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] relative overflow-hidden"
    >
      {/* Subtle warm ambient radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#F5EAD9]/40 via-[#FDF8F0]/60 to-[#F0E3D0]/30 rounded-full blur-3xl -z-10"
      />

      <div className="max-w-4xl mx-auto">
        {/* Top Pill Badge */}
        <div ref={badgeRef} className="flex justify-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5B3A2]/80 bg-white/40 backdrop-blur-xs text-[#5A483C] text-[11px] sm:text-xs font-semibold tracking-[0.16em] uppercase select-none shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A483C]" aria-hidden="true" />
            Frequently Asked Questions
          </div>
        </div>

        {/* Main Heading */}
        <h2
          ref={faqHeadingRef}
          className="text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight leading-[1.15]"
        >
          Frequently Asked Questions
        </h2>

        {/* Subtitle */}
        <p
          ref={faqSubRef}
          className="mt-3 sm:mt-3.5 text-base sm:text-lg text-[#6B584C] text-center max-w-xl mx-auto font-normal leading-relaxed"
        >
          Everything you need to know about PuretyFarm.
        </p>

        {/* Decorative Leaf Divider */}
        <div
          ref={leafDividerRef}
          className="mt-6 mb-8 sm:mt-7 sm:mb-10 flex items-center justify-center gap-3 sm:gap-4 select-none"
        >
          <div className="w-16 sm:w-24 h-px bg-[#D6C7B7]" />
          <FaLeaf
            className="w-4 h-4 text-[#5E7951] transform -rotate-12"
            aria-hidden="true"
          />
          <div className="w-16 sm:w-24 h-px bg-[#D6C7B7]" />
        </div>

        {/* Accordion List */}
        <div
          ref={faqListRef}
          className="max-w-[760px] mx-auto space-y-3.5 sm:space-y-4"
        >
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={item.num}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
