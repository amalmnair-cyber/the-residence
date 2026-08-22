import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { site } from "@/data/content";

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

// Brand-level only — this layout wraps the landing page AND both property
// pages, and can't know which property (if any) is active, so it can't
// correctly claim a specific price or room count. Real per-property SEO
// (title, description, JSON-LD with the right price/address) lives in
// [slug]/page.tsx's generateMetadata instead, where that data is available.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.brand} — Two private properties`,
  description: `${site.brand} — exclusive whole-house stays across two private architectural retreats in the UK.`,
  keywords: [site.brand, "luxury property", "luxury villa rental", "book a stay"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: site.brand,
    description: "Exclusive whole-house stays across two private architectural retreats.",
    type: "website",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-bone text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
