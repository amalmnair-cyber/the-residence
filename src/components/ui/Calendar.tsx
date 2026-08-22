"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  formatMonthYear,
  getMonthGrid,
  isBefore,
  isSameDay,
  isWithinRange,
  rangesOverlap,
  startOfDay,
  WEEKDAY_LABELS,
} from "@/lib/date";
import type { DateRange } from "@/data/booking";
import { cn } from "@/lib/cn";
import ArrowIcon from "./ArrowIcon";

interface CalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
  unavailableRanges: DateRange[];
  minNights: number;
}

const MAX_MONTHS_AHEAD = 12;

export default function Calendar({
  checkIn,
  checkOut,
  onChange,
  unavailableRanges,
  minNights,
}: CalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [hovered, setHovered] = useState<Date | null>(null);

  const cells = useMemo(() => getMonthGrid(view.year, view.month), [view]);

  const minView = { year: today.getFullYear(), month: today.getMonth() };
  const maxDate = addDays(today, MAX_MONTHS_AHEAD * 31);

  function isDisabled(date: Date) {
    if (isBefore(date, today)) return true;
    if (date > maxDate) return true;
    return unavailableRanges.some((r) => isWithinRange(date, r.start, r.end));
  }

  function isBlockedBetween(a: Date, b: Date) {
    const [start, end] = a < b ? [a, b] : [b, a];
    return unavailableRanges.some((r) => rangesOverlap(start, end, r.start, r.end));
  }

  function handleClick(date: Date) {
    if (isDisabled(date)) return;

    if (!checkIn || checkOut) {
      onChange(date, null);
      return;
    }

    if (!isBefore(checkIn, date)) {
      onChange(date, null);
      return;
    }

    if (isBlockedBetween(checkIn, date)) {
      onChange(date, null);
      return;
    }

    onChange(checkIn, date);
  }

  function changeMonth(delta: number) {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1);
      const candidate = { year: next.getFullYear(), month: next.getMonth() };
      if (candidate.year < minView.year || (candidate.year === minView.year && candidate.month < minView.month)) {
        return v;
      }
      return candidate;
    });
  }

  const previewEnd = checkIn && !checkOut ? hovered : null;
  const atMin = view.year === minView.year && view.month === minView.month;

  return (
    <div className="w-full max-w-sm select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={atMin}
          aria-label="Previous month"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowIcon direction="left" />
        </button>
        <p className="font-display text-lg text-ink">{formatMonthYear(new Date(view.year, view.month, 1))}</p>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="text-[10px] uppercase tracking-[0.1em] text-stone-light">
            {d}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;

          const disabled = isDisabled(date);
          const isCheckIn = checkIn && isSameDay(date, checkIn);
          const isCheckOut = checkOut && isSameDay(date, checkOut);
          const rangeEnd = checkOut ?? previewEnd;
          const inRange =
            checkIn && rangeEnd && !isCheckIn && !isCheckOut
              ? isWithinRange(date, checkIn < rangeEnd ? checkIn : rangeEnd, checkIn < rangeEnd ? rangeEnd : checkIn)
              : false;

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(date)}
              onMouseEnter={() => setHovered(date)}
              className={cn(
                "relative flex h-9 items-center justify-center text-[13px] transition-colors",
                disabled && "cursor-not-allowed text-stone-light/40 line-through",
                !disabled && "cursor-pointer text-ink hover:text-brass",
                inRange && "bg-brass/12",
                (isCheckIn || isCheckOut) && "bg-ink font-medium text-bone hover:text-bone",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-stone">
        Minimum stay {minNights} nights. Select a check-in date, then a check-out date.
      </p>
    </div>
  );
}
