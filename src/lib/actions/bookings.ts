"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/dal";
import { sendBookingNotification, sendGuestReceivedEmail, sendGuestStatusEmail } from "@/lib/email/resend";
import { booking as bookingConfig } from "@/data/booking";
import { bookingInputSchema } from "@/lib/validation";
import { nightsBetween, parseISODate, toISODateString } from "@/lib/date";
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

  const emailInput = {
    bookingId: row.id as string,
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
  const { data: row, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select(
      "name, email, phone, country, message, check_in, check_out, nights, guests, total_amount, currency",
    )
    .single();

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
    try {
      await sendGuestStatusEmail(
        {
          bookingId,
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
      );
    } catch (err) {
      console.error("guest status email failed", err);
    }
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/");
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
  revalidatePath("/");
  return { ok: true };
}
