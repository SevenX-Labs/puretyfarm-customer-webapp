"use client";

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { handleTrialClick } from "@/lib/cta";
import { useScrollReveal, useStaggerReveal } from "@/lib/animations";

const BENEFITS = [
  "1 Litre daily delivered before 7:00 AM in sanitized glass bottles",
  "Free home delivery across Raipur — zero deposit required",
  "Daily WhatsApp & app updates with morning dispatch status",
  "100% money-back guarantee if you don't taste the difference",
] as const;

export function TrialOffer() {
  const badgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.6 });
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.2 });
  const benefitsRef = useStaggerReveal<HTMLDivElement>("[data-benefit]", {
    y: 40,
    x: -20,
    stagger: 0.15,
    duration: 0.6,
  });
  const ctaRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0.1 });

  return (
    <Section background="cream" id="trial-offer">
      <div className="max-w-3xl mx-auto">
        {/* Badge */}
        <div ref={badgeRef} className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-[#F5E729] text-[#1A1008] text-sm font-bold px-4 py-2 rounded-full">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            No-Risk Starter Experience
          </span>
        </div>

        <h2 ref={headingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)]">
          Experience Pure A2 Goodness for 7 Days
        </h2>

        <p ref={subtitleRef} className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
          Try our farm-fresh A2 Gir cow milk with zero commitment. If you
          don&apos;t love it, we&apos;ll refund every rupee.
        </p>

        {/* Benefits list */}
        <div ref={benefitsRef} className="mt-10 space-y-4">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              data-benefit
              className="flex items-start gap-4 bg-white rounded-xl p-4 border border-[#E8DFD4]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5C1B13]/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#5C1B13]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-[#1A1008] font-medium">{benefit}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-10 text-center">
          <Button variant="primary" size="lg" onClick={handleTrialClick}>
            Start My 7-Day Trial
          </Button>
          <p className="mt-3 text-sm text-[#3A241C]/60">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </Section>
  );
}
