"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/dal";
import { sendBookingNotification } from "@/lib/email/resend";
import { booking as bookingConfig } from "@/data/booking";
import { bookingInputSchema } from "@/lib/validation";
import { nightsBetween, toISODateString } from "@/lib/date";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

  const { checkIn, checkOut, guests, name, email, phone, country, message } = parsed.data;

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < bookingConfig.minNights) {
    return { ok: false, message: `Minimum stay is ${bookingConfig.minNights} nights.` };
  }

  const totalAmount = nights * bookingConfig.nightlyRate + bookingConfig.cleaningFee;
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("bookings")
    .insert({
      check_in: toISODateString(checkIn),
      check_out: toISODateString(checkOut),
      guests,
      name,
      email,
      phone,
      country,
      message: message || null,
      nights,
      nightly_rate: bookingConfig.nightlyRate,
      cleaning_fee: bookingConfig.cleaningFee,
      total_amount: totalAmount,
      currency: bookingConfig.currency,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("booking insert failed", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  try {
    await sendBookingNotification({
      bookingId: row.id,
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
      currency: bookingConfig.currency,
    });
  } catch (err) {
    // Non-fatal — the booking itself is already saved and is the source of truth.
    console.error("booking notification email failed", err);
  }

  revalidatePath("/");
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
  const { error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId);

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

  revalidatePath("/admin/bookings");
  revalidatePath("/");
  return { ok: true };
}
