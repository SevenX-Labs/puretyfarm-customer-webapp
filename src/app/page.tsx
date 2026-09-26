import { Hero } from "@/components/sections/Hero";
import { TrialOffer } from "@/components/sections/TrialOffer";
import { WhyUs } from "@/components/sections/WhyUs";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { StickyCtaBar } from "@/components/ui/StickyCtaBar";

// Manthan's sections only (per information-architecture.md ownership)
// Hitesh's sections (ProblemSolution, AppShowcase, Pricing, SocialProof,
// TrustSection, FAQ, FinalCTA, Footer) will be added when he builds them.

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TrialOffer />
        <WhyUs />
        <HowItWorks />
      </main>
      <StickyCtaBar />
    </>
  );
}
