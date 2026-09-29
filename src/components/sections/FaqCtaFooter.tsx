"use client";

import { useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { handleTrialClick, handleDownloadClick } from "@/lib/cta";

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
      "Simply download our app or contact us via WhatsApp. We start delivering 1 litre of fresh A2 milk daily for 7 days. No advance payment, no deposit. Pay only after your trial if you love it.",
  },
  {
    question: "What time is milk delivered?",
    answer:
      "We deliver between 5:30 AM and 7:00 AM every morning. You can track your delivery partner live on the app.",
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
  return (
    <div
      className={`rounded-xl border transition-colors ${
        isOpen
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
        <svg
          className={`w-5 h-5 text-[#5C1B13] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="px-5 text-[#3A241C] leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export function FaqCtaFooter() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      {/* FAQ */}
      <Section background="default" id="faq">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
          Frequently Asked Questions
        </h2>

        <p className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
          Everything you need to know about PuretyFarm.
        </p>

        <div className="mt-10 max-w-2xl mx-auto space-y-3">
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

      {/* Final CTA */}
      <section
        id="final-cta"
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#5C1B13] relative overflow-hidden"
      >
        {/* Decorative blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F5E729]/10 blur-3xl" />
          <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
            Ready to Taste the Difference?
          </h2>

          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Join 500+ Raipur families already enjoying pure A2 Gir cow milk.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Button variant="accent" size="lg" onClick={handleTrialClick}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Start 7-Day Trial
            </Button>
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 px-9 py-4 text-lg bg-white text-[#5C1B13] hover:bg-white/90 active:bg-white/80 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download App
            </button>
          </div>

          <p className="mt-6 text-sm text-white/50">
            No commitment • Free delivery • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#1A1008] px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
              PuretyFarm
            </h3>
            <p className="text-sm text-white/50 mt-1 uppercase tracking-wider">
              Pure A2 Gir Cow Milk
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <Link
              href="/terms"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
            <span className="text-white/20">•</span>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://wa.me/919XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Contact Us on WhatsApp
            </a>
          </div>

          {/* Social */}
          <div className="flex justify-center mb-8">
            <a
              href="https://instagram.com/puretyfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/40">
              © 2025 PuretyFarm. All rights reserved.
            </p>
            <p className="text-xs text-white/25 mt-1">
              Made with ❤️ in Raipur, Chhattisgarh
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
