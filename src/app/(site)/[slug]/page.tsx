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
import { richContentBySlug } from "@/data/property-content";
import { propertyCoordinates } from "@/data/coordinates";
import { getCurrentWeather } from "@/lib/weather";

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

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const coordinates = propertyCoordinates[slug];
  const [heroImages, galleryImages, weather] = await Promise.all([
    getPropertyImages(property.id, "hero"),
    getPropertyImages(property.id, "gallery"),
    coordinates ? getCurrentWeather(coordinates.lat, coordinates.lon) : Promise.resolve(null),
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

  const content = richContentBySlug[slug];

  // The Location section's big heading is derived from the same editable
  // property.location field used everywhere else (Hero, Footer, metadata)
  // rather than the separate hardcoded heading in property-content.ts —
  // otherwise editing "Location" in admin wouldn't visibly change the one
  // place on the page most obviously named "Location".
  const [locationCity, ...locationRest] = property.location.split(",").map((s) => s.trim());
  const locationHeading: [string, string] = [locationCity, locationRest.join(", ")];

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
      {content && (
        <>
          <Architecture propertyName={property.name} architecture={content.architecture} />
          <RoomShowcase rooms={content.rooms} />
          <FloorPlan
            propertyName={property.name}
            rooms={content.floorPlan.rooms}
            bounds={content.floorPlan.bounds}
          />
          <Location location={{ ...content.location, heading: locationHeading }} weather={weather} />
          <Lifestyle propertyName={property.name} lifestyle={content.lifestyle} />
        </>
      )}
      <Booking property={property} />
      <Footer propertyName={property.name} location={property.location} />
    </main>
  );
}
