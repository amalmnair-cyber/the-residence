"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBooking } from "@/lib/actions/bookings";

export default function DeleteBookingButton({
  bookingId,
  guestName,
}: {
  bookingId: string;
  guestName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Permanently delete ${guestName}'s booking? This can't be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteBooking(bookingId);
      if (!result.ok) {
        setError(result.message ?? "Could not delete this booking.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-red-700 transition-colors hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
