"use client";

import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { useScrollReveal, useStaggerReveal, useCountUp } from "@/lib/animations";
import { FLAGS } from "@/config/flags";

const TESTIMONIALS = [
  {
    quote:
      "The milk tastes exactly like what we used to get from our village. My kids love it!",
    name: "Priya Sharma",
    location: "Shankar Nagar",
    initials: "PS",
    rating: 5,
  },
  {
    quote:
      "Been using PuretyFarm for 6 months now. The consistency and purity is unmatched in Raipur.",
    name: "Rajesh Tiwari",
    location: "VIP Road",
    initials: "RT",
    rating: 5,
  },
  {
    quote:
      "I was skeptical about A2 milk claims, but the taste difference is real. Glass bottles are a nice touch!",
    name: "Anita Verma",
    location: "Civil Lines",
    initials: "AV",
    rating: 5,
  },
] as const;

const TRUST_ITEMS = [
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "100% A2 Gir Cow Milk",
    description:
      "Our cows are indigenous Gir breed, naturally producing only the A2 beta-casein protein.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "No Adulteration Ever",
    description:
      "Every batch is tested. Zero added water, preservatives, or hormones.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "Glass Bottle Delivery",
    description:
      "Eco-friendly sealed glass bottles, sanitized and reused responsibly.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Farm-Fresh Daily",
    description:
      "Milked at dawn, chilled immediately, delivered within hours.",
  },
] as const;

function StatCounter({
  end,
  suffix = "",
  label,
  icon,
}: {
  end: number;
  suffix?: string;
  label: string;
  icon: string;
}) {
  const countRef = useCountUp(end, { duration: 2, suffix });
  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#E8DFD4] shadow-xs hover:shadow-md transition-shadow group">
      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span ref={countRef} className="text-2xl sm:text-3xl font-black text-[#5C1B13] tracking-tight">
        0{suffix}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-[#3A241C]/80 text-center mt-1">
        {label}
      </span>
    </div>
  );
}

export function SocialProof() {
  // Testimonials section
  const testBadgeRef = useScrollReveal<HTMLDivElement>({ y: 30, duration: 0.5 });
  const testHeadingRef = useScrollReveal<HTMLHeadingElement>({ y: 40, delay: 0.1 });
  const statsRef = useScrollReveal<HTMLDivElement>({ y: 30, delay: 0.15 });
  const testimonialsRef = useStaggerReveal<HTMLDivElement>("[data-testimonial]", {
    y: 50,
    stagger: 0.18,
    duration: 0.7,
  });

  // Trust section
  const trustHeadingRef = useScrollReveal<HTMLHeadingElement>({ y: 40 });
  const trustSubRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0.1 });
  const trustGridRef = useStaggerReveal<HTMLDivElement>("[data-trust-item]", {
    y: 50,
    x: -20,
    stagger: 0.15,
    duration: 0.7,
  });
  const trustFootRef = useScrollReveal<HTMLDivElement>({ y: 20, delay: 0.1 });

  return (
    <>
      {/* Testimonials (Preserved; conditionally shown when verified) */}
      {(FLAGS.SHOW_TESTIMONIALS || FLAGS.SHOW_500_FAMILIES_BADGE) && (
        <Section background="default" id="social-proof">
          {FLAGS.SHOW_500_FAMILIES_BADGE && (
            <div ref={testBadgeRef} className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-[#F5E729]/20 border border-[#F5E729]/40 text-[#1A1008] text-sm font-bold px-4 py-2 rounded-full">
                ⭐ 500+ Happy Families in Raipur
              </span>
            </div>
          )}

          {FLAGS.SHOW_TESTIMONIALS && (
            <h2 ref={testHeadingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
              What Our Families Say
            </h2>
          )}

          {/* Dynamic Animated Statistics Counters */}
          <div ref={statsRef} className="mt-8 mb-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {FLAGS.SHOW_500_FAMILIES_BADGE && (
              <StatCounter end={500} suffix="+" label="Happy Families" icon="🏡" />
            )}
            {FLAGS.SHOW_40_TESTS_CLAIM && (
              <StatCounter end={40} suffix="+" label="Lab Quality Tests" icon="🔬" />
            )}
            <StatCounter end={100} suffix="%" label="A2 Desi Gir Milk" icon="🥛" />
            <StatCounter end={4} suffix="°C" label="Chilled Cold Chain" icon="❄️" />
          </div>

          {FLAGS.SHOW_TESTIMONIALS && (
            <div ref={testimonialsRef} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {TESTIMONIALS.map((testimonial) => (
                <div
                  key={testimonial.name}
                  data-testimonial
                  className="h-full"
                >
                  <TiltCard tiltMaxAngle={5} scale={1.02} glare={true} className="h-full">
                    <div className="bg-white h-full rounded-2xl border border-[#E8DFD4] p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                      <div>
                        {/* Stars and verified customer pill */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex gap-0.5 group-hover:scale-105 transition-transform duration-200">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg
                                key={i}
                                className="w-4 h-4 text-[#F5E729]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            ✓ Verified Raipur
                          </span>
                        </div>

                        {/* Quote */}
                        <p className="text-[#3A241C]/90 text-sm italic leading-relaxed mb-6">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-3 border-t border-[#E8DFD4]/50">
                        <div className="w-10 h-10 rounded-full bg-[#5C1B13]/10 flex items-center justify-center border border-[#5C1B13]/20">
                          <span className="text-sm font-bold text-[#5C1B13]">
                            {testimonial.initials}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1008]">
                            {testimonial.name}
                          </p>
                          <p className="text-xs text-[#3A241C]/60">
                            {testimonial.location}, Raipur
                          </p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Trust / Transparency */}
      <Section background="cream" id="trust">
        <h2 ref={trustHeadingRef} className="text-3xl sm:text-4xl font-bold text-[#1A1008] text-center font-[family-name:var(--font-heading)] tracking-tight">
          Pure from Farm to{" "}
          <span className="text-[#5C1B13]">Your Doorstep</span>
        </h2>

        <p ref={trustSubRef} className="mt-4 text-lg text-[#3A241C] text-center max-w-xl mx-auto">
          We believe in complete transparency about our milk.
        </p>

        <div ref={trustGridRef} className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              data-trust-item
              className="h-full"
            >
              <TiltCard tiltMaxAngle={6} scale={1.02} glare={true} className="h-full">
                <div className="bg-white h-full rounded-xl border border-[#E8DFD4] p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-full bg-[#5C1B13] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1008] mb-2 font-[family-name:var(--font-heading)] group-hover:text-[#5C1B13] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#3A241C] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>

        <div ref={trustFootRef} className="mt-10 text-center space-y-2">
          <a
            href="/terms"
            className="text-sm font-medium text-[#5C1B13] underline underline-offset-4 hover:text-[#4A1510] transition-colors"
          >
            Read our Terms & Conditions
          </a>
          <p className="text-xs text-[#3A241C]/50">
            {FLAGS.SHOW_FSSAI_CLAIM ? "FSSAI Licensed • Raipur, Chhattisgarh" : "Raipur, Chhattisgarh"}
          </p>
        </div>
      </Section>
    </>
  );
}
