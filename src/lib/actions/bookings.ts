"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/dal";
import { sendBookingNotification, sendGuestReceivedEmail, sendGuestStatusEmail } from "@/lib/email/resend";
import { bookingInputSchema } from "@/lib/validation";
import { nightsBetween, parseISODate, toISODateString } from "@/lib/date";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { buildCheckoutSession } from "@/lib/actions/payments";

export interface SubmitBookingResult {
  ok: boolean;
  message?: string;
  bookingId?: string;
}

export async function submitBooking(input: unknown): Promise<SubmitBookingResult> {
  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields." };
  }

  // Honeypot: silently "succeed" without writing anything, so a bot can't
  // tell its submission was rejected.
  if (parsed.data.website) {
    return { ok: true, bookingId: "ignored" };
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit(`booking:${ip}`, 5, 15);
  if (!allowed) {
    return { ok: false, message: "Too many requests. Please try again in a few minutes." };
  }

  const { propertyId, checkIn, checkOut, guests, name, email, phone, country, message, paymentPreference } =
    parsed.data;

  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("name, nightly_rate, cleaning_fee, currency, min_nights, max_guests")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    console.error("property lookup failed", propertyError);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < property.min_nights) {
    return { ok: false, message: `Minimum stay is ${property.min_nights} nights.` };
  }
  if (guests > property.max_guests) {
    return { ok: false, message: `This property sleeps up to ${property.max_guests} guests.` };
  }

  const totalAmount = nights * property.nightly_rate + property.cleaning_fee;

  const { data: row, error } = await supabase
    .from("bookings")
    .insert({
      property_id: propertyId,
      check_in: toISODateString(checkIn),
      check_out: toISODateString(checkOut),
      guests,
      name,
      email,
      phone,
      country,
      message: message || null,
      nights,
      nightly_rate: property.nightly_rate,
      cleaning_fee: property.cleaning_fee,
      total_amount: totalAmount,
      currency: property.currency,
      payment_preference: paymentPreference,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("booking insert failed", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const emailInput = {
    bookingId: row.id as string,
    propertyName: property.name,
    name,
    email,
    phone,
    country,
    message,
    checkIn,
    checkOut,
    nights,
    guests,
    totalAmount,
    currency: property.currency,
    paymentPreference,
  };

  // Both non-fatal — the booking itself is already saved and is the source
  // of truth. A guest who never got the receipt email still has a real
  // booking; failing the request over an email would be worse.
  try {
    await sendBookingNotification(emailInput);
  } catch (err) {
    console.error("booking notification email failed", err);
  }
  try {
    await sendGuestReceivedEmail(emailInput);
  } catch (err) {
    console.error("guest received email failed", err);
  }

  revalidatePath("/(site)/[slug]", "page");
  return { ok: true, bookingId: row.id as string };
}

export interface BookingStatusResult {
  ok: boolean;
  message?: string;
}

export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "declined",
): Promise<BookingStatusResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data: rawRow, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select(
      "name, email, phone, country, message, check_in, check_out, nights, guests, total_amount, currency, payment_preference, properties(name)",
    )
    .single();
  const row = rawRow as unknown as
    | {
        name: string;
        email: string;
        phone: string;
        country: string;
        message: string | null;
        check_in: string;
        check_out: string;
        nights: number;
        guests: number;
        total_amount: number;
        currency: string;
        payment_preference: "arrival" | "upfront";
        properties: { name: string } | null;
      }
    | null;

  if (error) {
    if (error.code === "23P01") {
      return {
        ok: false,
        message: "These dates overlap another confirmed booking.",
      };
    }
    console.error("booking status update failed", error);
    return { ok: false, message: "Could not update this booking. Please try again." };
  }

  // Guests only hear back on an actual decision — flipping back to
  // "pending" is a rare admin correction, not something worth an email.
  if (row && (status === "confirmed" || status === "declined")) {
    let paymentUrl: string | undefined;
    if (status === "confirmed" && row.payment_preference === "upfront") {
      // Non-fatal like the email below: a booking is still validly
      // confirmed even if link generation fails this once — admin can
      // regenerate one from the bookings dashboard. Guests who chose
      // "arrival" don't get one generated automatically at all — an admin
      // can still create one manually via PaymentLinkButton either way.
      try {
        const checkout = await buildCheckoutSession(bookingId);
        if (checkout.ok) paymentUrl = checkout.url;
      } catch (err) {
        console.error("checkout session creation failed", err);
      }
    }

    try {
      await sendGuestStatusEmail(
        {
          bookingId,
          propertyName: row.properties?.name ?? "your property",
          name: row.name,
          email: row.email,
          phone: row.phone,
          country: row.country,
          message: row.message ?? undefined,
          checkIn: parseISODate(row.check_in),
          checkOut: parseISODate(row.check_out),
          nights: row.nights,
          guests: row.guests,
          totalAmount: row.total_amount,
          currency: row.currency,
        },
        status,
        paymentUrl,
      );
    } catch (err) {
      console.error("guest status email failed", err);
    }
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/(site)/[slug]", "page");
  return { ok: true };
}

export async function deleteBooking(bookingId: string): Promise<BookingStatusResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

  if (error) {
    console.error("booking delete failed", error);
    return { ok: false, message: "Could not delete this booking. Please try again." };
  }

  // A deleted booking might have been the one blocking these dates on the
  // public calendar (if it was confirmed) — free them up immediately.
  revalidatePath("/admin/bookings");
  revalidatePath("/(site)/[slug]", "page");
  return { ok: true };
}
