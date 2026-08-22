import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { CursorProvider } from "@/context/CursorContext";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Navbar from "@/components/layout/Navbar";

// Temporary until the properties migration is live: hardcoded slug ->
// theme map. Once getPropertyBySlug() can actually query the DB, this
// becomes `property.theme_key` instead — the data-theme wiring below
// doesn't change either way.
const KNOWN_SLUGS: Record<string, string> = {
  "the-elmstead": "elmstead",
  "the-kiln-house": "kiln",
};

export default async function PropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = KNOWN_SLUGS[slug];
  if (!theme) notFound();

  return (
    <div data-theme={theme}>
      <CursorProvider>
        <SmoothScroll>
          <Navbar />
          <ScrollProgress />
          {children}
          <CustomCursor />
        </SmoothScroll>
      </CursorProvider>
    </div>
  );
}
