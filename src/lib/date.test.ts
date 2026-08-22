import { describe, expect, it } from "vitest";
import {
  addDays,
  isBefore,
  isSameDay,
  isWithinRange,
  nightsBetween,
  parseISODate,
  rangesOverlap,
  startOfDay,
  toISODateString,
} from "./date";

describe("toISODateString / parseISODate round-trip", () => {
  it("round-trips a plain date without shifting", () => {
    const original = new Date(2026, 7, 26); // Aug 26, 2026 (local)
    expect(toISODateString(original)).toBe("2026-08-26");
    expect(parseISODate("2026-08-26")).toEqual(new Date(2026, 7, 26));
  });

  it("pads single-digit months and days", () => {
    expect(toISODateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("does not shift across a year boundary", () => {
    const nyeMidnight = new Date(2026, 11, 31);
    expect(toISODateString(nyeMidnight)).toBe("2026-12-31");
    expect(parseISODate("2026-12-31").getFullYear()).toBe(2026);
  });
});

describe("nightsBetween", () => {
  it("counts a real 3-night stay correctly", () => {
    // Matches an actual booking exercised in this app: Aug 26 -> Aug 29.
    expect(nightsBetween(new Date(2026, 7, 26), new Date(2026, 7, 29))).toBe(3);
  });

  it("returns 0 for the same day", () => {
    const d = new Date(2026, 7, 26);
    expect(nightsBetween(d, d)).toBe(0);
  });

  it("is unaffected by a time-of-day component", () => {
    const checkIn = new Date(2026, 7, 26, 23, 45);
    const checkOut = new Date(2026, 7, 29, 6, 15);
    expect(nightsBetween(checkIn, checkOut)).toBe(3);
  });

  it("counts correctly across a month boundary", () => {
    expect(nightsBetween(new Date(2026, 0, 30), new Date(2026, 1, 2))).toBe(3);
  });
});

describe("rangesOverlap", () => {
  it("detects identical ranges as overlapping", () => {
    const start = new Date(2026, 7, 26);
    const end = new Date(2026, 7, 29);
    expect(rangesOverlap(start, end, start, end)).toBe(true);
  });

  it("detects a partial overlap", () => {
    expect(
      rangesOverlap(
        new Date(2026, 7, 26),
        new Date(2026, 7, 29),
        new Date(2026, 7, 28),
        new Date(2026, 8, 2),
      ),
    ).toBe(true);
  });

  it("does not flag genuinely separate ranges", () => {
    expect(
      rangesOverlap(
        new Date(2026, 7, 1),
        new Date(2026, 7, 5),
        new Date(2026, 7, 20),
        new Date(2026, 7, 25),
      ),
    ).toBe(false);
  });

  it("treats a back-to-back checkout/check-in day as overlapping (stricter than the DB's half-open range)", () => {
    // The DB's exclusion constraint uses a half-open range `[)`, so a new
    // stay starting the day an old one ends is allowed there. This function
    // is more conservative and blocks it in the UI — documenting that gap
    // rather than assuming it away, since it governs what the calendar lets
    // a guest select.
    expect(
      rangesOverlap(
        new Date(2026, 7, 1),
        new Date(2026, 7, 5),
        new Date(2026, 7, 5),
        new Date(2026, 7, 10),
      ),
    ).toBe(true);
  });
});

describe("isWithinRange", () => {
  it("includes both endpoints", () => {
    const start = new Date(2026, 7, 26);
    const end = new Date(2026, 7, 29);
    expect(isWithinRange(start, start, end)).toBe(true);
    expect(isWithinRange(end, start, end)).toBe(true);
  });

  it("excludes a date outside the range", () => {
    expect(isWithinRange(new Date(2026, 7, 30), new Date(2026, 7, 26), new Date(2026, 7, 29))).toBe(
      false,
    );
  });
});

describe("isBefore / isSameDay", () => {
  it("ignores time-of-day", () => {
    const morning = new Date(2026, 7, 26, 6, 0);
    const night = new Date(2026, 7, 26, 23, 0);
    expect(isSameDay(morning, night)).toBe(true);
    expect(isBefore(morning, night)).toBe(false);
  });

  it("compares calendar days correctly", () => {
    expect(isBefore(new Date(2026, 7, 26), new Date(2026, 7, 27))).toBe(true);
    expect(isBefore(new Date(2026, 7, 27), new Date(2026, 7, 26))).toBe(false);
  });
});

describe("addDays / startOfDay", () => {
  it("rolls over month boundaries", () => {
    expect(addDays(new Date(2026, 7, 30), 3)).toEqual(new Date(2026, 8, 2));
  });

  it("zeroes out the time component", () => {
    const d = startOfDay(new Date(2026, 7, 26, 14, 32, 9));
    expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([0, 0, 0]);
  });
});
