"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import {
  handleTrialClick,
  handleDownloadClick,
} from "@/lib/cta";
import { useScrollReveal, useStaggerReveal, useParallax } from "@/lib/animations";
import { FiChevronDown, FiZap, FiDownload } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const FAQ_ITEMS = [
  {
    question: "What is A2 milk and how is it different?",
    answer:
      "A2 milk comes from indigenous Gir cows that naturally produce only the A2 beta-casein protein. Unlike regular milk (which contains A1 protein), A2 milk is easier to digest, reduces bloating, and is closer to the milk our ancestors consumed.",
  },
  {
    question: "What areas in Raipur do you deliver to?",
    answer:
      "We currently deliver across Shankar Nagar, Samta Colony, VIP Road, Telibandha, Civil Lines, Devendra Nagar, and surrounding areas. Check our app for real-time service area coverage.",
  },
  {
    question: "How does the 7-day trial work?",
    answer:
      "Simply download our app or contact us via WhatsApp. We start delivering 1 litre of fresh A2 milk daily for 7 days. No advance payment required. Pay only after your trial if you love it.",
  },
  {
    question: "What time is milk delivered?",
    answer:
      "We deliver before 10:00 AM every morning. You can track your delivery partner live on the app.",
  },
  {
    question: "Can I pause or cancel my subscription?",
    answer:
      "Yes! You can pause deliveries anytime through the app — for a day, a week, or longer. There are zero cancellation charges.",
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

  // Animate FAQ answer open/close with GSAP
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
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(el, { height: "auto" });
          },
        }
      );
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    }

    return () => {
      gsap.killTweensOf(el);
    };
  }, [isOpen]);

  return (
    <div
      data-faq-item
      className={`rounded-xl border transition-colors ${isOpen
        ? "bg-[#FBF6EE] border-[#E8DFD4]"
        : "bg-white border-[#E8DFD4] hover:border-[#5C1B13]/20"
        }`}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-[#1A1008] pr-4">
          {item.question}
        </span>
        <FiChevronDown
          className={`w-5 h-5 text-[#5C1B13] flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <div ref={answerRef} className="overflow-hidden" style={{ height: 0 }}>
        <p className="px-5 pb-5 text-[#3A241C] leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export function FaqCtaFooter() {
  const [openIndex, setOpenIndex] = useState(0);

  // FAQ section animations
  const faqHeadingRef = useScrollReveal<HTMLHeadingElement>({ y: 40 });
  const faqSubRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.1 });
  const faqListRef = useStaggerReveal<HTMLDivElement>("[data-faq-item]", {
    y: 40,
    stagger: 0.1,
    duration: 0.6,
  });

  // Final CTA section animations
  const ctaSectionRef = useRef<HTMLElement>(null);
  const ctaBlob1 = useParallax<HTMLDivElement>(-0.15);
  const ctaBlob2 = useParallax<HTMLDivElement>(0.1);

  useEffect(() => {
    const el = ctaSectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const items = el.querySelectorAll("[data-cta-anim]");
      gsap.set(items, { opacity: 0, y: 40 });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => ctx.revert();
  }, []);


  return (
    <>
      {/* FAQ */}
      <Section background="default" id="faq">
        <h2 ref={faqHeadingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
          Frequently Asked Questions
        </h2>

        <p ref={faqSubRef} className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
          Everything you need to know about PuretyFarm.
        </p>

        <div ref={faqListRef} className="mt-10 max-w-2xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
