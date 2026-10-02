"use client";

import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { useScrollReveal, useStaggerReveal, useCountUp } from "@/lib/animations";
import { FLAGS } from "@/config/flags";
import {
  FiHeart,
  FiShield,
  FiPackage,
  FiSun,
  FiCheck,
  FiUsers,
  FiCheckCircle,
  FiDroplet,
  FiThermometer,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

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
    icon: <FiHeart className="w-6 h-6 text-white" />,
    title: "100% A2 Gir Cow Milk",
    description:
      "Our cows are indigenous Gir breed, naturally producing only the A2 beta-casein protein.",
  },
  {
    icon: <FiShield className="w-6 h-6 text-white" />,
    title: "No Adulteration Ever",
    description:
      "Every batch is tested. Zero added water, preservatives, or hormones.",
  },
  {
    icon: <FiPackage className="w-6 h-6 text-white" />,
    title: "Glass Bottle Delivery",
    description:
      "Eco-friendly sealed glass bottles, sanitized and reused responsibly.",
  },
  {
    icon: <FiSun className="w-6 h-6 text-white" />,
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
  icon: React.ReactNode;
}) {
  const countRef = useCountUp(end, { duration: 2, suffix });
  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#E8DFD4] shadow-xs hover:shadow-md transition-shadow group">
      <div className="mb-2 group-hover:scale-110 transition-transform duration-200">{icon}</div>
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
                <FaStar className="w-3.5 h-3.5 text-amber-500" />
                <span>500+ Happy Families in Raipur</span>
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
              <StatCounter end={500} suffix="+" label="Happy Families" icon={<FiUsers className="w-6 h-6 text-[#5C1B13]" />} />
            )}
            {FLAGS.SHOW_40_TESTS_CLAIM && (
              <StatCounter end={40} suffix="+" label="Lab Quality Tests" icon={<FiCheckCircle className="w-6 h-6 text-emerald-600" />} />
            )}
            <StatCounter end={100} suffix="%" label="A2 Desi Gir Milk" icon={<FiDroplet className="w-6 h-6 text-blue-600" />} />
            <StatCounter end={4} suffix="°C" label="Chilled Cold Chain" icon={<FiThermometer className="w-6 h-6 text-cyan-600" />} />
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
                              <FaStar
                                key={i}
                                className="w-3.5 h-3.5 text-[#F5E729]"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-flex items-center gap-1">
                            <FiCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Raipur</span>
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
