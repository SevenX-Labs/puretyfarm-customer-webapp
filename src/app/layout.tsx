import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PuretyFarm — Pure A2 Cow Milk Delivered Fresh in Raipur",
  description:
    "Farm-fresh, unadulterated A2 Gir cow milk delivered daily to your doorstep in Raipur. Start your 7-day trial today. FSSAI certified, glass bottle delivery.",
  keywords: [
    "A2 milk Raipur",
    "cow milk delivery",
    "PuretyFarm",
    "Gir cow milk",
    "organic milk Raipur",
    "milk subscription",
  ],
  openGraph: {
    title: "PuretyFarm — Pure A2 Cow Milk Delivered Fresh in Raipur",
    description:
      "Farm-fresh A2 Gir cow milk delivered before 7 AM. Start your risk-free 7-day trial.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretyfarm.example.com",
    siteName: "PuretyFarm",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
