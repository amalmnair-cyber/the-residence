"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/dal";
import { getStripeClient, toStripeCurrency } from "@/lib/stripe";

export interface CreateCheckoutResult {
  ok: boolean;
  url?: string;
  message?: string;
}

export async function createCheckoutSession(bookingId: string): Promise<CreateCheckoutResult> {
  await requireAdmin();
  return buildCheckoutSession(bookingId);
}

// Split out from createCheckoutSession so updateBookingStatus (which
// already calls requireAdmin itself) can generate a payment link when
// confirming a booking without a second, redundant auth check.
export async function buildCheckoutSession(bookingId: string): Promise<CreateCheckoutResult> {
  const supabase = await createClient();
  const { data: rawBooking, error } = await supabase
    .from("bookings")
    .select("id, name, email, nights, total_amount, currency, properties(name)")
    .eq("id", bookingId)
    .single();
  const booking = rawBooking as unknown as
    | {
        id: string;
        name: string;
        email: string;
        nights: number;
        total_amount: number;
        currency: string;
        properties: { name: string } | null;
      }
    | null;

  if (error || !booking) {
    return { ok: false, message: "Booking not found." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const propertyName = booking.properties?.name ?? "your stay";

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.email,
      line_items: [
        {
          price_data: {
            currency: toStripeCurrency(booking.currency),
            product_data: { name: `${propertyName} — ${booking.nights} nights` },
            unit_amount: Math.round(booking.total_amount * 100),
          },
          quantity: 1,
        },
      ],
      // Read back by the webhook to know which booking a completed session
      // belongs to — never trust the client for this, only Stripe's own
      // signed event.
      metadata: { booking_id: booking.id },
      success_url: `${siteUrl}/payment-complete?result=success`,
      cancel_url: `${siteUrl}/payment-complete?result=cancelled`,
    });

    if (!session.url) {
      return { ok: false, message: "Could not create a payment link." };
    }
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("stripe checkout session creation failed", err);
    return { ok: false, message: "Could not create a payment link." };
  }
}
