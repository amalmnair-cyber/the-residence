export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBefore(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isWithinRange(date: Date, start: Date, end: Date) {
  const t = startOfDay(date).getTime();
  return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime();
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return startOfDay(aStart) <= startOfDay(bEnd) && startOfDay(bStart) <= startOfDay(aEnd);
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// Local-date (not UTC) YYYY-MM-DD — safe to store/compare as a Postgres
// `date` column. Plain `date.toISOString()` converts to UTC first, which
// silently shifts the date by a day for guests in timezones ahead of UTC.
export function toISODateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Inverse of toISODateString — parses a Postgres `date` string ("YYYY-MM-DD")
// as local midnight, not UTC midnight (new Date("YYYY-MM-DD") is UTC and
// would shift the day back by one for anyone west of UTC).
export function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
