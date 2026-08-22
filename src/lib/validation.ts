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
