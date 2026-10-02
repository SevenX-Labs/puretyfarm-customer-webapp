import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";

function SectionSkeleton({
  minHeight = "400px",
  bg = "bg-[#FFFDF7]",
}: {
  minHeight?: string;
  bg?: string;
}) {
  return (
    <div
      style={{ minHeight }}
      className={`w-full ${bg} flex items-center justify-center`}
      aria-busy="true"
    />
  );
}

const TrialOffer = dynamic(
  () => import("@/components/sections/TrialOffer").then((mod) => mod.TrialOffer),
  {
    loading: () => <SectionSkeleton minHeight="380px" bg="bg-[#FAF3EA]" />,
  }
);

const WhyUs = dynamic(
  () => import("@/components/sections/WhyUs").then((mod) => mod.WhyUs),
  {
    loading: () => <SectionSkeleton minHeight="480px" bg="bg-[#FFFDF7]" />,
  }
);

const HowItWorks = dynamic(
  () => import("@/components/sections/HowItWorks").then((mod) => mod.HowItWorks),
  {
    loading: () => <SectionSkeleton minHeight="460px" bg="bg-[#FAF3EA]" />,
  }
);

const AppShowcase = dynamic(
  () => import("@/components/sections/AppShowcase").then((mod) => mod.AppShowcase),
  {
    loading: () => <SectionSkeleton minHeight="580px" bg="bg-[#FBF6EE]" />,
  }
);

const Pricing = dynamic(
  () => import("@/components/sections/Pricing").then((mod) => mod.Pricing),
  {
    loading: () => <SectionSkeleton minHeight="520px" bg="bg-[#FFFDF7]" />,
  }
);

const ServiceAreaChecker = dynamic(
  () =>
    import("@/components/sections/ServiceAreaChecker").then(
      (mod) => mod.ServiceAreaChecker
    ),
  {
    loading: () => <SectionSkeleton minHeight="480px" bg="bg-[#FAF3EA]" />,
  }
);

const SocialProof = dynamic(
  () => import("@/components/sections/SocialProof").then((mod) => mod.SocialProof),
  {
    loading: () => <SectionSkeleton minHeight="480px" bg="bg-[#FFFDF7]" />,
  }
);

const FaqCtaFooter = dynamic(
  () => import("@/components/sections/FaqCtaFooter").then((mod) => mod.FaqCtaFooter),
  {
    loading: () => <SectionSkeleton minHeight="600px" bg="bg-[#5C1B13]" />,
  }
);

const StickyCtaBar = dynamic(
  () => import("@/components/ui/StickyCtaBar").then((mod) => mod.StickyCtaBar)
);

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
        <ServiceAreaChecker />
        <SocialProof />
        <FaqCtaFooter />
      </main>
      <StickyCtaBar />
    </>
  );
}
