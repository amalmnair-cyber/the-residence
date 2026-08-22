import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { parseISODate } from "@/lib/date";
import type { DateRange } from "@/data/booking";

export async function getConfirmedDateRanges(propertyId: string): Promise<DateRange[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("status", "confirmed")
    .eq("property_id", propertyId);

  if (error || !data) {
    console.error("failed to load confirmed bookings", error);
    return [];
  }

  return data.map((row) => ({
    start: parseISODate(row.check_in),
    end: parseISODate(row.check_out),
  }));
}

export interface AdminBookingRow {
  id: string;
  created_at: string;
  check_in: string;
  check_out: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string | null;
  nights: number;
  total_amount: number;
  currency: string;
  status: "pending" | "confirmed" | "declined";
  properties: { name: string } | null;
}

export async function getAllBookings(): Promise<AdminBookingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, created_at, check_in, check_out, guests, name, email, phone, country, message, nights, total_amount, currency, status, properties(name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("failed to load bookings", error);
    return [];
  }

  return data as unknown as AdminBookingRow[];
}
