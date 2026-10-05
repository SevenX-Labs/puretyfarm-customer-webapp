import dynamic from "next/dynamic";
import { Hero } from "@/features/landing/components/Hero";
import { FLAGS } from "@/config/flags";

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
  () => import("@/features/landing/components/TrialOffer").then((mod) => mod.TrialOffer),
  {
    loading: () => <SectionSkeleton minHeight="380px" bg="bg-[#FAF3EA]" />,
  }
);

const WhyUs = dynamic(
  () => import("@/features/landing/components/WhyUs").then((mod) => mod.WhyUs),
  {
    loading: () => <SectionSkeleton minHeight="480px" bg="bg-[#FFFDF7]" />,
  }
);

const HowItWorks = dynamic(
  () => import("@/features/landing/components/HowItWorks").then((mod) => mod.HowItWorks),
  {
    loading: () => <SectionSkeleton minHeight="460px" bg="bg-[#FAF3EA]" />,
  }
);

const AppShowcase = dynamic(
  () => import("@/features/landing/components/AppShowcase").then((mod) => mod.AppShowcase),
  {
    loading: () => <SectionSkeleton minHeight="580px" bg="bg-[#FBF6EE]" />,
  }
);

const Pricing = dynamic(
  () => import("@/features/landing/components/Pricing").then((mod) => mod.Pricing),
  {
    loading: () => <SectionSkeleton minHeight="520px" bg="bg-[#FFFDF7]" />,
  }
);

const SocialProof = dynamic(
  () => import("@/features/landing/components/SocialProof").then((mod) => mod.SocialProof),
  {
    loading: () => <SectionSkeleton minHeight="480px" bg="bg-[#FFFDF7]" />,
  }
);

const ContactUs = dynamic(
  () => import("@/features/landing/components/ContactUs").then((mod) => mod.ContactUs),
  {
    loading: () => <SectionSkeleton minHeight="500px" bg="bg-[#FFFDF7]" />,
  }
);

const FaqCtaFooter = dynamic(
  () => import("@/features/landing/components/FaqCtaFooter").then((mod) => mod.FaqCtaFooter),
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
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero />
        <TrialOffer />
        <WhyUs />
        <HowItWorks />
        {FLAGS.SHOW_APP_FEATURES && <AppShowcase />}
        <Pricing />
        <SocialProof />
        <ContactUs />
        <FaqCtaFooter />
      </main>
      <StickyCtaBar />
    </>
  );
}
