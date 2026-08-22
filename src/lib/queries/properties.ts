import "server-only";
import { createClient } from "@/lib/supabase/server";

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
}

const PROPERTY_COLUMNS =
  "id, slug, name, tagline, location, description, nightly_rate, cleaning_fee, currency, min_nights, max_guests, bedrooms, bathrooms, square_feet, floors, theme_key, sort_order";

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient();
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

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_COLUMNS)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getPropertyImages(
  propertyId: string,
  category?: "hero" | "gallery",
): Promise<PropertyImage[]> {
  const supabase = await createClient();
  let query = supabase
    .from("property_images")
    .select("id, property_id, url, alt, category, sort_order")
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
