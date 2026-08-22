import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { site, images } from "@/data/content";
import { booking } from "@/data/booking";
import { stats } from "@/data/stats";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.propertyName} — ${site.location} | ${site.brand}`,
  description: `${site.propertyName} is a private architectural retreat in ${site.location}, available for exclusive whole-house stays with ${site.brand}. Designed around light, proportion and natural materials.`,
  keywords: [
    site.propertyName,
    site.brand,
    "Hampstead",
    "London",
    "luxury property",
    "luxury villa rental",
    "book a stay",
    "architecture",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${site.propertyName} — ${site.location}`,
    description: `${site.tagline} Available to book.`,
    type: "website",
    url: siteUrl,
    images: [images.hero],
  },
};

function statValue(label: string) {
  return stats.find((s) => s.label === label)?.value;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: `${site.propertyName} — ${site.brand}`,
    description: `${site.propertyName} is a private architectural retreat in ${site.location}, available for exclusive whole-house stays with ${site.brand}.`,
    url: siteUrl,
    image: images.hero,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hampstead",
      addressRegion: "London",
      addressCountry: "GB",
    },
    numberOfRooms: statValue("Bedrooms"),
    priceRange: `${booking.currency}${booking.nightlyRate.toLocaleString("en-GB")} per night`,
    petsAllowed: false,
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-bone text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
