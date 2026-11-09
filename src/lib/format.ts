const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "Not available";
  return inr.format(value);
}

export function formatINRCompact(value: number): string {
  if (!Number.isFinite(value)) return "Not available";
  return inrCompact.format(value);
}

export function formatPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "Not available";
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "Not available";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
  }).format(value);
}

/** Parses the dd-mm-yyyy date strings returned by api.mfapi.in as UTC dates. */
export function parseApiDate(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
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

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function readingTime(words: number): string {
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}
