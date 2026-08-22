import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { CursorProvider } from "@/context/CursorContext";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import { images } from "@/data/content";

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
  title: "The Residence — Hampstead, London | Atelier North",
  description:
    "The Residence is a private architectural retreat in Hampstead, London, designed by Atelier North around light, proportion and natural materials.",
  keywords: [
    "The Residence",
    "Atelier North",
    "Hampstead",
    "London",
    "luxury property",
    "architecture",
  ],
  openGraph: {
    title: "The Residence — Hampstead, London",
    description: "Designed for extraordinary living.",
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
      <body className="bg-bone text-ink">
        <CursorProvider>
          <SmoothScroll>
            <Navbar />
            <ScrollProgress />
            {children}
            <CustomCursor />
          </SmoothScroll>
        </CursorProvider>
      </body>
    </html>
  );
}
