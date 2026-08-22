import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/sections/Hero";
import Introduction from "@/components/sections/Introduction";
import PropertyStats from "@/components/sections/PropertyStats";
import Architecture from "@/components/sections/Architecture";
import RoomShowcase from "@/components/sections/RoomShowcase";
import FloorPlan from "@/components/sections/FloorPlan";
import Location from "@/components/sections/Location";
import Lifestyle from "@/components/sections/Lifestyle";
import Booking from "@/components/sections/Booking";
import Footer from "@/components/layout/Footer";
import { getPropertyBySlug, getPropertyImages } from "@/lib/queries/properties";
import { unsplash } from "@/lib/unsplash";
import { site } from "@/data/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  return {
    title: `${property.name} — ${property.location} | ${site.brand}`,
    description: `${property.name} is available for exclusive whole-house stays with ${site.brand}. ${property.description}`,
    alternates: { canonical: `/${property.slug}` },
    openGraph: {
      title: `${property.name} — ${property.location}`,
      description: property.tagline,
      type: "website",
    },
  };
}

// RoomShowcase/FloorPlan/Architecture/Location/Lifestyle stay Elmstead-only
// for now: their content (specific rooms, an actual floor plan SVG,
// specific amenities/distances) doesn't exist yet for Kiln House, and
// showing Elmstead's would just be wrong on Kiln's page, not a reasonable
// placeholder. Real content-authoring work for a follow-up, not a code
// change like the rest of this conversion was.
const RICH_CONTENT_SLUGS = new Set(["the-elmstead"]);

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [heroImages, galleryImages] = await Promise.all([
    getPropertyImages(property.id, "hero"),
    getPropertyImages(property.id, "gallery"),
  ]);

  // Falls back to the original hardcoded Elmstead photo until real images
  // are uploaded via the admin panel (property_images is empty right now).
  const heroImage = heroImages[0]?.url ?? unsplash("1748063578185-3d68121b11ff", 2400);
  const introImage = galleryImages[0]?.url ?? unsplash("1679364297777-1db77b6199be", 1800);

  const stats = [
    { value: property.bedrooms, label: "Bedrooms" },
    { value: property.bathrooms, label: "Bathrooms" },
    { value: property.square_feet, label: "Square Feet" },
    { value: property.floors, label: "Floors" },
    { value: property.max_guests, label: "Sleeps" },
  ];

  const hasRichContent = RICH_CONTENT_SLUGS.has(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: `${property.name} — ${site.brand}`,
    description: property.description,
    url: `${siteUrl}/${property.slug}`,
    image: heroImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location.split(",")[0]?.trim(),
      addressCountry: "GB",
    },
    numberOfRooms: property.bedrooms,
    priceRange: `${property.currency}${property.nightly_rate.toLocaleString("en-GB")} per night`,
    petsAllowed: false,
  };

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero
        propertyName={property.name}
        location={property.location}
        tagline={property.tagline}
        heroImage={heroImage}
      />
      <Introduction propertyName={property.name} description={property.description} image={introImage} />
      <PropertyStats stats={stats} />
      {hasRichContent && (
        <>
          <Architecture />
          <RoomShowcase />
          <FloorPlan />
          <Location />
          <Lifestyle />
        </>
      )}
      <Booking property={property} />
      <Footer />
    </main>
  );
}
