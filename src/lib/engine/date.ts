import type { NavPoint } from "./types";

const MS_PER_DAY = 86_400_000;

export function parseIsoUtc(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toIsoUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Preserves the original day of month, clamping only when a month is shorter. */
export function addMonthsClamped(date: Date, months: number): Date {
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDay),
    ),
  );
}

export function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_DAY;
}

export function normaliseHistory(history: NavPoint[]): NavPoint[] {
  const byDate = new Map<string, number>();
  for (const point of history) {
    if (!parseIsoUtc(point.date)) continue;
    if (!Number.isFinite(point.nav) || point.nav <= 0) continue;
    byDate.set(point.date, point.nav);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, nav]) => ({ date, nav }));
}

/** Returns the first published NAV on or after the requested date. */
export function findNavOnOrAfter(
  history: NavPoint[],
  targetDate: string,
): NavPoint | null {
  let low = 0;
  let high = history.length - 1;
  let result: NavPoint | null = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (history[mid].date >= targetDate) {
      result = history[mid];
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}
