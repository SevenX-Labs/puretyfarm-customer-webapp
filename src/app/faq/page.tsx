import { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { FaqCtaFooter } from "@/features/landing";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — A2 Desi Cow Milk | PuretyFarm Raipur",
  description:
    "Find answers to all your questions about PuretyFarm fresh A2 Gir cow milk delivery in Raipur, 7-day risk-free trials, pricing, morning timings, and hygiene standards.",
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF6F0] pt-20 sm:pt-24">
        <FaqCtaFooter />
      </main>
      <SiteFooter />
    </>
  );
}
