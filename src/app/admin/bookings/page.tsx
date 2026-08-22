import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/dal";
import { getAllBookings } from "@/lib/queries/bookings";
import { logout } from "@/lib/actions/auth";
import { formatDate, parseISODate } from "@/lib/date";
import { cn } from "@/lib/cn";
import StatusControl from "@/components/admin/StatusControl";
import DeleteBookingButton from "@/components/admin/DeleteBookingButton";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const FILTERS = ["all", "pending", "confirmed", "declined"] as const;

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeFilter = FILTERS.includes(status as (typeof FILTERS)[number])
    ? (status as (typeof FILTERS)[number])
    : "all";

  const bookings = await getAllBookings();
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    declined: bookings.filter((b) => b.status === "declined").length,
  };
  const visible =
    activeFilter === "all" ? bookings : bookings.filter((b) => b.status === activeFilter);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Reservations</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Bookings</h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="cursor-pointer text-[12px] uppercase tracking-[0.12em] text-stone transition-colors hover:text-ink"
          >
            Log out
          </button>
        </form>
      </div>

      <div className="mt-8 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/bookings" : `/admin/bookings?status=${f}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] capitalize transition-colors",
              activeFilter === f
                ? "border-ink bg-ink text-bone"
                : "border-line text-stone hover:border-ink hover:text-ink",
            )}
          >
            {f} <span className="text-[11px] opacity-60">({counts[f]})</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-stone">No bookings here yet.</p>
        )}

        {visible.map((b) => (
          <details key={b.id} className="group py-5">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg text-ink">{b.name}</p>
                <p className="mt-1 text-[13px] text-stone">
                  {formatDate(parseISODate(b.check_in))} – {formatDate(parseISODate(b.check_out))}{" "}
                  · {b.nights} nights · {b.guests} guests
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-base text-ink">
                  {b.currency}
                  {b.total_amount.toLocaleString("en-GB")}
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.06em]",
                    b.status === "confirmed" && "bg-brass/15 text-brass",
                    b.status === "declined" && "bg-red-100 text-red-700",
                    b.status === "pending" && "bg-line-soft text-stone",
                  )}
                >
                  {b.status}
                </span>
              </div>
            </summary>

            <div className="mt-4 grid gap-6 border-t border-line-soft pt-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-sm text-stone">
                <p>
                  <span className="text-ink">Email:</span> {b.email}
                </p>
                <p>
                  <span className="text-ink">Phone:</span> {b.phone}
                </p>
                <p>
                  <span className="text-ink">Country:</span> {b.country}
                </p>
                {b.message && (
                  <p>
                    <span className="text-ink">Message:</span> {b.message}
                  </p>
                )}
                <p className="text-stone">
                  Submitted {formatDate(new Date(b.created_at))}
                </p>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-stone">Status</p>
                  <StatusControl bookingId={b.id} status={b.status} />
                </div>
                <DeleteBookingButton bookingId={b.id} guestName={b.name} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
