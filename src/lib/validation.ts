import { z } from "zod";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^[+\d][\d\s()-]{6,18}$/;

export const bookingInputSchema = z.object({
  propertyId: z.string().uuid(),
  checkIn: z.date(),
  checkOut: z.date(),
  // Generic sanity bound only — the real, property-specific max (which
  // varies: Elmstead sleeps 12, Kiln House 8) is checked in submitBooking
  // itself, once it knows which property this is for.
  guests: z.number().int().min(1).max(20),
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().regex(emailPattern, "Please enter a valid email address."),
  phone: z.string().trim().regex(phonePattern, "Please enter a valid phone number."),
  country: z.string().min(1, "Please select your country."),
  message: z.string().trim().max(2000).optional(),
  // Honeypot: real visitors never fill this (it's visually hidden). Bots often do.
  website: z.string().max(0).optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

// slug and theme_key are deliberately not editable here: slug is load-bearing
// for URLs/bookmarks/canonicals, and theme_key keys into a fixed set of CSS
// presets in code (see the properties migration) — both are structural, not
// content, and changing either belongs in code, not an admin form.
export const propertyUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  tagline: z.string().trim().min(2).max(200),
  location: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  nightly_rate: z.number().int().min(0).max(1_000_000),
  cleaning_fee: z.number().int().min(0).max(1_000_000),
  min_nights: z.number().int().min(1).max(30),
  max_guests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  square_feet: z.number().int().min(0).max(1_000_000),
  floors: z.number().int().min(1).max(20),
});

export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

export const propertyImageUploadSchema = z.object({
  propertyId: z.string().uuid(),
  category: z.enum(["hero", "gallery"]),
  alt: z.string().trim().max(200).optional(),
});

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
