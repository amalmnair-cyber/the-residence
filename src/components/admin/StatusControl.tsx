"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirm" },
  { value: "declined", label: "Decline" },
] as const;

export default function StatusControl({
  bookingId,
  status,
}: {
  bookingId: string;
  status: "pending" | "confirmed" | "declined";
}) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(next: (typeof OPTIONS)[number]["value"]) {
    if (next === current) return;
    setError(null);
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, next);
      if (!result.ok) {
        setCurrent(previous);
        setError(result.message ?? "Could not update this booking.");
      }
    });
  }

  return (
    <div>
      <div className="flex gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isPending}
            onClick={() => handleClick(opt.value)}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              current === opt.value
                ? "border-ink bg-ink text-bone"
                : "border-line text-stone hover:border-ink hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
