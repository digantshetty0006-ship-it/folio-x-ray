import {
  addDays,
  addMonthsClamped,
  daysBetween,
  findNavOnOrAfter,
  normaliseHistory,
  parseIsoUtc,
  toIsoUtc,
} from "./date";
import type {
  NavPoint,
  SipContribution,
  SipFrequency,
  SipResult,
} from "./types";

const MAX_CONTRIBUTIONS = 6_000;

export function nextSipDate(
  start: Date,
  index: number,
  frequency: SipFrequency,
): Date {
  if (frequency === "weekly") return addDays(start, index * 7);
  return addMonthsClamped(start, index * (frequency === "quarterly" ? 3 : 1));
}

export function generateSipContributions(input: {
  amount: number;
  startDate: string;
  frequency: SipFrequency;
  endDate: string;
  history: NavPoint[];
}): SipResult {
  const warnings: string[] = [];
  const start = parseIsoUtc(input.startDate);
  const end = parseIsoUtc(input.endDate);
  const history = normaliseHistory(input.history);

  if (!start) {
    return { ok: false, reason: "The SIP start date is not valid.", warnings };
  }
  if (!end) {
    return {
      ok: false,
      reason: "The valuation date is not valid.",
      warnings,
    };
  }
  if (start > end) {
    return {
      ok: false,
      reason: "The SIP start date is after the latest available NAV date.",
      warnings,
    };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return {
      ok: false,
      reason: "The SIP amount must be greater than zero.",
      warnings,
    };
  }
  if (history.length === 0) {
    return {
      ok: false,
      reason: "There is no NAV history for this fund.",
      warnings,
    };
  }

  const contributions: SipContribution[] = [];
  let lateNavCount = 0;
  let firstNavGapCount = 0;

  for (let index = 0; index < MAX_CONTRIBUTIONS; index += 1) {
    const scheduled = nextSipDate(start, index, input.frequency);
    if (scheduled > end) break;

    const scheduledIso = toIsoUtc(scheduled);
    const point = findNavOnOrAfter(history, scheduledIso);
    if (!point) break;
    if (point.date > toIsoUtc(end)) break;

    const delay = daysBetween(scheduled, parseIsoUtc(point.date)!);
    if (delay > 7) lateNavCount += 1;
    if (index === 0 && history[0].date > scheduledIso) firstNavGapCount += 1;

    contributions.push({
      scheduledDate: scheduledIso,
      navDate: point.date,
      amount: input.amount,
      nav: point.nav,
      units: input.amount / point.nav,
    });
  }

  if (contributions.length === 0) {
    return {
      ok: false,
      reason:
        "No SIP instalments could be matched to this fund's NAV history. Check the start date and frequency.",
      warnings,
    };
  }

  if (lateNavCount > 0) {
    warnings.push(
      `${lateNavCount} instalment${lateNavCount === 1 ? "" : "s"} used a later published NAV because the exact date had no NAV.`,
    );
  }
  if (
    firstNavGapCount > 0 &&
    parseIsoUtc(contributions[0].navDate)! > start
  ) {
    warnings.push(
      "The fund's available NAV history starts after your first SIP date. Early instalments used the first available NAV.",
    );
  }

  const invested = contributions.reduce((sum, item) => sum + item.amount, 0);
  const units = contributions.reduce((sum, item) => sum + item.units, 0);

  return { ok: true, contributions, invested, units, warnings };
}
