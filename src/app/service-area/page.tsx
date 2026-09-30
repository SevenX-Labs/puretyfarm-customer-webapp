import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ServiceAreaChecker } from "@/components/sections/ServiceAreaChecker";
import { Navbar } from "@/components/ui/Navbar";
import { FaqCtaFooter } from "@/components/sections/FaqCtaFooter";

export const metadata: Metadata = {
  title: "Raipur Service Areas & Delivery Coverage",
  description:
    "Check daily morning A2 Gir cow milk delivery availability in your Raipur locality. Serving Shankar Nagar, Telibandha, VIP Road, Civil Lines, and 20+ areas.",
};

export default function ServiceAreaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFDF7] py-8">
        <ServiceAreaChecker />
      </main>
      <FaqCtaFooter />
    </>
  );
}
