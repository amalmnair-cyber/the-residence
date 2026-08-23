import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { CursorProvider } from "@/context/CursorContext";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import { getProperties, getPropertyBySlug } from "@/lib/queries/properties";

// Matches the page's own revalidate — see the comment there.
export const revalidate = 60;

export default async function PropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [property, properties] = await Promise.all([
    getPropertyBySlug(slug),
    getProperties(),
  ]);
  if (!property) notFound();

  return (
    <div data-theme={property.theme_key}>
      <CursorProvider>
        <SmoothScroll>
          <Navbar
            properties={properties.map((p) => ({ slug: p.slug, name: p.name }))}
            currentSlug={slug}
          />
          <ScrollProgress />
          {children}
          <CustomCursor />
        </SmoothScroll>
      </CursorProvider>
    </div>
  );
}
