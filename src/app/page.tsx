import { Hero } from "@/components/sections/Hero";
import { TrialOffer } from "@/components/sections/TrialOffer";
import { WhyUs } from "@/components/sections/WhyUs";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { Pricing } from "@/components/sections/Pricing";
import { SocialProof } from "@/components/sections/SocialProof";
import { FaqCtaFooter } from "@/components/sections/FaqCtaFooter";
import { StickyCtaBar } from "@/components/ui/StickyCtaBar";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TrialOffer />
        <WhyUs />
        <HowItWorks />
        <AppShowcase />
        <Pricing />
        <SocialProof />
        <FaqCtaFooter />
      </main>
      <StickyCtaBar />
    </>
  );
}
