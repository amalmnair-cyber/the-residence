import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { CursorProvider } from "@/context/CursorContext";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import { getPropertyBySlug } from "@/lib/queries/properties";

export default async function PropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  return (
    <div data-theme={property.theme_key}>
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
