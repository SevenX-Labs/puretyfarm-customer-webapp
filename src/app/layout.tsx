import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { ENV } from "@/config/env";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { AuthProvider } from "@/context/AuthContext";
import { MarketingMotion } from "@/components/layout/MarketingMotion";
import "./globals.css";

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5C1B13",
};

export const metadata: Metadata = {
  metadataBase: new URL(ENV.SITE_URL),
  title: {
    default: "PuretyFarm — Pure A2 Desi Cow Milk Delivered Fresh in Raipur",
    template: "%s | PuretyFarm",
  },
  description:
    "Farm-fresh, unadulterated A2 Gir cow milk delivered daily before 10:00 AM across Raipur. FSSAI certified, chilled at 4°C, eco-friendly sanitized glass bottles. Start your risk-free 7-day trial today.",
  keywords: [
    "A2 milk Raipur",
    "pure cow milk Raipur",
    "Gir cow milk Raipur",
    "PuretyFarm",
    "glass bottle milk delivery",
    "milk subscription Raipur",
    "unadulterated milk",
    "Shankar Nagar milk delivery",
    "VIP Road Raipur milk",
    "organic A2 milk",
  ],
  authors: [{ name: "PuretyFarm Raipur" }],
  creator: "PuretyFarm",
  publisher: "PuretyFarm",
  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "PuretyFarm — Pure A2 Desi Cow Milk Delivered Fresh in Raipur",
    description:
      "Farm-fresh A2 Gir cow milk delivered before 10:00 AM daily in glass bottles across Raipur. Start your risk-free 7-day trial today.",
    url: ENV.SITE_URL,
    siteName: "PuretyFarm",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1024,
        height: 1024,
        alt: "PuretyFarm — 100% Pure A2 Gir Cow Milk Delivered Fresh in Raipur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PuretyFarm — Pure A2 Cow Milk Delivered Fresh in Raipur",
    description:
      "Farm-fresh A2 Gir cow milk delivered before 10:00 AM daily in glass bottles. Start your risk-free 7-day trial.",
    images: ["/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "RTKzL81qaD6KGdS-jXIte2LpZjQC4brBvfA3wMcDcgg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${ENV.SITE_URL}/#business`,
        name: "PuretyFarm",
        image: `${ENV.SITE_URL}/logo.webp`,
        telephone: ENV.PHONE_NUMBER,
        email: ENV.SUPPORT_EMAIL,
        url: ENV.SITE_URL,
        priceRange: "₹45 - ₹180",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Raipur",
          addressRegion: "Chhattisgarh",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 21.2514,
          longitude: 81.6296,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "05:30",
          closes: "19:00",
        },
        areaServed: {
          "@type": "City",
          name: "Raipur",
        },
      },
      {
        "@type": "Product",
        "@id": `${ENV.SITE_URL}/#product`,
        name: "Pure A2 Desi Gir Cow Milk",
        description:
          "Raw, unadulterated chilled A2 beta-casein cow milk delivered daily in eco-friendly glass bottles before 10:00 AM in Raipur.",
        brand: {
          "@type": "Brand",
          name: "PuretyFarm",
        },
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "45",
          highPrice: "180",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          <AuthProvider>
            <MarketingMotion>{children}</MarketingMotion>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
