import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#5C1B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "100% Desi Gir Cows",
    description: "Ethically reared, free-range grazing in organic pastures",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#5C1B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "Glass Bottle Delivery",
    description: "Eco-friendly packaging maintaining crisp 4°C chill",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#5C1B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "40+ Quality Tests",
    description: "Zero antibiotics, water, or synthetic fats guaranteed",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#5C1B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Farm-to-Table in Hours",
    description: "Milked at 4:30 AM, at your door before 7:00 AM",
  },
] as const;

export function WhyUs() {
  return (
    <Section background="cream" id="why-puretyfarm">
      <div className="text-center mb-12">
        <span className="inline-block text-sm font-semibold text-[#5C1B13] bg-[#5C1B13]/10 rounded-full px-4 py-1.5 mb-4">
          Our Promise
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1008] font-[family-name:var(--font-heading)]">
          Why PuretyFarm?
        </h2>
        <p className="mt-4 text-lg text-[#3A241C] max-w-xl mx-auto">
          Every glass of PuretyFarm milk is a promise of purity, freshness, and
          trust — from our farm to your family.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Card key={i} hover padding="lg">
            <div className="w-14 h-14 rounded-2xl bg-[#5C1B13]/10 flex items-center justify-center mb-5">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-[#1A1008]">
              {feature.title}
            </h3>
            <p className="mt-2 text-[#3A241C]/80 leading-relaxed">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
