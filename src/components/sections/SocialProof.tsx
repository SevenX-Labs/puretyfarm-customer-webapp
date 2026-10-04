"use client";

import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { ShinyText } from "@/components/reactbits";
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
import { FaStar, FaQuoteLeft } from "react-icons/fa";

interface TestimonialItem {
  quote: string;
  name: string;
  location: string;
  tag: string;
  initials: string;
  rating: number;
}

const TESTIMONIALS: readonly TestimonialItem[] = [
  {
    quote:
      "The milk tastes exactly like what we used to get from our ancestral village. Natural sweetness, thick malai layer, and my kids drink it warm every morning without chocolate powder!",
    name: "Priya Sharma",
    location: "Shankar Nagar",
    tag: "Subscribed 8 Mos",
    initials: "PS",
    rating: 5,
  },
  {
    quote:
      "Been using PuretyFarm for 6 months now. Doorstep punctuality before 6:45 AM and zero plastic packaging makes the freshness unmatched anywhere in Raipur.",
    name: "Rajesh Tiwari",
    location: "VIP Road",
    tag: "Daily Morning",
    initials: "RT",
    rating: 5,
  },
  {
    quote:
      "As a pediatrician, I am cautious about hormones and oxytocin in dairy. PuretyFarm's 100% Desi Gir A2 milk is gentle on my kids' digestion. The chilled glass bottle delivery is genuinely gold standard.",
    name: "Dr. Anita Verma",
    location: "Civil Lines",
    tag: "Doctor & Mother",
    initials: "AV",
    rating: 5,
  },
  {
    quote:
      "We collect the thick cream on weekends to make homemade Desi Ghee. The golden granular Danedar texture and sacred aroma take you back 30 years. Truly unadulterated Gir cow purity.",
    name: "Vikramaditya Singh",
    location: "Samta Colony",
    tag: "Ghee Connoisseur",
    initials: "VS",
    rating: 5,
  },
  {
    quote:
      "Switching from plastic pouch milk to PuretyFarm eliminated our morning heaviness. It boils cleanly with zero synthetic residue or burnt smell. The customer care on WhatsApp is also wonderfully responsive.",
    name: "Sunita Dewangan",
    location: "Devendra Nagar",
    tag: "Family of 5",
    initials: "SD",
    rating: 5,
  },
  {
    quote:
      "Punctual morning delivery before 10:00 AM without fail. In peak summer, the milk arrives properly chilled at 4°C in temperature-controlled bags. Top notch consistency and transparent billing.",
    name: "CA Manish Agrawal",
    location: "Pandri",
    tag: "Daily Subscriber",
    initials: "MA",
    rating: 5,
  },
  {
    quote:
      "We tested their milk with our home lactometer and boiling test out of curiosity — zero added water, zero starch. Pure, thick, naturally fragrant Gir cow milk as promised.",
    name: "Meenakshi Dubey",
    location: "Tatibandh",
    tag: "Verified Resident",
    initials: "MD",
    rating: 5,
  },
  {
    quote:
      "My morning protein shakes taste 10x richer with this milk. No bloating or gut discomfort at all. You can genuinely feel the nutritional vitality of grass-fed cows.",
    name: "Rohan Kothari",
    location: "Mowa",
    tag: "Fitness Enthusiast",
    initials: "RK",
    rating: 5,
  },
  {
    quote:
      "My elderly parents have sensitive stomachs and could never tolerate regular commercial milk. PuretyFarm A2 has been so light and easy on them. Essential daily nutrition for our whole family.",
    name: "Kavita Chawla",
    location: "Sadar Bazar",
    tag: "3 Generations",
    initials: "KC",
    rating: 5,
  },
  {
    quote:
      "The sealed sterilized glass bottles feel premium and eco-friendly. No plastic leaching, crisp 4°C chill, and delivered quietly while Raipur is still asleep.",
    name: "Amitabh Baghel",
    location: "Kamal Vihar",
    tag: "Early Adopter",
    initials: "AB",
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

  // Duplicated for seamless infinite marquee loop
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <>
      {/* Testimonials */}
      {(FLAGS.SHOW_TESTIMONIALS || FLAGS.SHOW_500_FAMILIES_BADGE) && (
        <Section background="default" id="testimonials" className="overflow-hidden">
          {FLAGS.SHOW_500_FAMILIES_BADGE && (
            <div ref={testBadgeRef} className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-[#F5E729]/20 border border-[#F5E729]/40 text-[#1A1008] text-sm font-bold px-4 py-2 rounded-full">
                <FaStar className="w-3.5 h-3.5 text-amber-500" />
                <ShinyText text="500+ Happy Families in Raipur" speed={3.5} />
              </span>
            </div>
          )}

          {FLAGS.SHOW_TESTIMONIALS && (
            <div className="text-center max-w-3xl mx-auto mb-4">
              <h2
                ref={testHeadingRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)] tracking-tight"
              >
                Loved by Families Across{" "}
                <span className="text-[#5C1B13] font-serif italic relative inline-block">
                  Raipur
                  <span className="absolute bottom-1.5 left-0 right-0 h-2.5 bg-[#F5E729]/35 -z-10 rounded-sm" />
                </span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#3A241C]/80">
                Real mornings, authentic Desi Gir goodness, and zero plastic packaging verified by local households.
              </p>
            </div>
          )}

          {/* Dynamic Animated Statistics Counters */}
          <div
            ref={statsRef}
            className={`mt-6 mb-10 grid grid-cols-2 ${FLAGS.SHOW_500_FAMILIES_BADGE || FLAGS.SHOW_40_TESTS_CLAIM
              ? "md:grid-cols-4 max-w-4xl"
              : "max-w-xl"
              } gap-4 mx-auto`}
          >
            {FLAGS.SHOW_500_FAMILIES_BADGE && (
              <StatCounter end={500} suffix="+" label="Happy Families" icon={<FiUsers className="w-6 h-6 text-[#5C1B13]" />} />
            )}
            {FLAGS.SHOW_40_TESTS_CLAIM && (
              <StatCounter end={40} suffix="+" label="Lab Quality Tests" icon={<FiCheckCircle className="w-6 h-6 text-emerald-600" />} />
            )}
            <StatCounter end={100} suffix="%" label="A2 Desi Gir Milk" icon={<FiDroplet className="w-6 h-6 text-blue-600" />} />
            <StatCounter end={4} suffix="°C" label="Chilled Cold Chain" icon={<FiThermometer className="w-6 h-6 text-cyan-600" />} />
          </div>

          {/* Continuous Left-to-Right Looping Marquee */}
          {FLAGS.SHOW_TESTIMONIALS && (
            <div className="relative mt-8">
              {/* Marquee viewport container with break-out width */}
              <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-3">
                {/* Left gradient mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 md:w-40 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/90 to-transparent z-10"
                />
                {/* Right gradient mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 md:w-40 bg-gradient-to-l from-[#FFFDF7] via-[#FFFDF7]/90 to-transparent z-10"
                />

                {/* Left-to-Right Non-Stop Infinite Animated Loop Track */}
                <div className="animate-marquee-ltr flex items-stretch py-2">
                  {duplicatedTestimonials.map((testimonial, idx) => (
                    <div
                      key={`${testimonial.name}-${idx}`}
                      className="w-[310px] sm:w-[360px] md:w-[390px] shrink-0 h-full flex flex-col px-2.5 sm:px-3"
                    >
                      <div className="bg-white h-full rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-[#5C1B13]/30 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                          {/* Top row: Stars & Verified Badge */}
                          <div className="flex items-center justify-between gap-2 mb-3.5">
                            <div className="flex gap-1 group-hover:scale-105 transition-transform duration-200">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className="w-3.5 h-3.5 text-[#F5E729] drop-shadow-2xs"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 inline-flex items-center gap-1.5 shadow-2xs">
                              <FiCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Raipur</span>
                            </span>
                          </div>

                          {/* Decorative Quote Icon & Content */}
                          <div className="relative mb-5">
                            <FaQuoteLeft className="w-4 h-4 text-[#5C1B13]/15 mb-2" />
                            <p className="text-[#3A241C]/90 text-sm leading-relaxed">
                              &ldquo;{testimonial.quote}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Customer Details Footer */}
                        <div className="flex items-center gap-3 pt-3.5 border-t border-[#E8DFD4]/60 mt-auto">
                          <div className="w-10 h-10 rounded-full bg-[#5C1B13]/10 flex items-center justify-center border border-[#5C1B13]/20 shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-[#5C1B13]">
                              {testimonial.initials}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-sm font-bold text-[#1A1008] truncate">
                                {testimonial.name}
                              </p>
                              <span className="text-[10px] font-semibold text-[#5C1B13] bg-[#5C1B13]/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {testimonial.tag}
                              </span>
                            </div>
                            <p className="text-xs text-[#3A241C]/65 truncate">
                              {testimonial.location}, Raipur
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>
      )}
    </>
  );
}
