import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient, createPublicClient } from "@/lib/supabase/server";

export interface Property {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string;
  description: string;
  nightly_rate: number;
  cleaning_fee: number;
  currency: string;
  min_nights: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  floors: number;
  theme_key: string;
  sort_order: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt: string;
  category: "hero" | "gallery";
  sort_order: number;
  storage_path: string | null;
}

const PROPERTY_COLUMNS =
  "id, slug, name, tagline, location, description, nightly_rate, cleaning_fee, currency, min_nights, max_guests, bedrooms, bathrooms, square_feet, floors, theme_key, sort_order";

// This whole file reads data that's the same for every visitor (RLS: both
// properties/property_images are "Anyone can view"), so it's wrapped in
// unstable_cache instead of hitting Supabase on every single page view.
// Safe to combine with the revalidatePath("/(site)/[slug]", "page") calls
// already in every property/image mutation — revalidatePath invalidates
// unstable_cache entries too, not just page-level caching, so admin edits
// still show up immediately despite the 60s time-based ceiling below.

async function fetchProperties(): Promise<Property[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_COLUMNS)
    .order("sort_order");

  if (error || !data) {
    console.error("failed to load properties", error);
    return [];
  }
  return data;
}

export const getProperties = unstable_cache(fetchProperties, ["properties-list"], {
  tags: ["properties"],
  revalidate: 60,
});

async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_COLUMNS)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

// cache(): dedupes within a single request (the layout and page both call
// this). unstable_cache: persists the result across requests/visitors,
// which is the part that actually saves a database round-trip.
export const getPropertyBySlug = cache(
  unstable_cache(fetchPropertyBySlug, ["property-by-slug"], {
    tags: ["properties"],
    revalidate: 60,
  }),
);

// Admin-only lookup (only used from /admin/properties/[id], which is
// already gated by requireAdmin and needs to see the latest edit
// immediately) — left on the regular cookie-aware client, uncached.
export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_COLUMNS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

async function fetchPropertyImages(
  propertyId: string,
  category?: "hero" | "gallery",
): Promise<PropertyImage[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("property_images")
    .select("id, property_id, url, alt, category, sort_order, storage_path")
    .eq("property_id", propertyId)
    .order("sort_order");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error || !data) {
    console.error("failed to load property images", error);
    return [];
  }
  return data;
}

export const getPropertyImages = unstable_cache(fetchPropertyImages, ["property-images"], {
  tags: ["properties"],
  revalidate: 60,
});
