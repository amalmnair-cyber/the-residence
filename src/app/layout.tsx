import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { site, images } from "@/data/content";

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

export const metadata: Metadata = {
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
  openGraph: {
    title: `${site.propertyName} — ${site.location}`,
    description: `${site.tagline} Available to book.`,
    type: "website",
    images: [images.hero],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-bone text-ink">{children}</body>
    </html>
  );
}
