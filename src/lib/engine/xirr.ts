import { daysBetween, parseIsoUtc } from "./date";
import type { XirrCashFlow, XirrResult } from "./types";

const DAYS_PER_YEAR = 365;
const MAX_ITERATIONS = 120;
const LOW_RATE = -0.999999;

type PreparedFlow = {
  time: number;
  amount: number;
};

function prepareFlows(flows: XirrCashFlow[]):
  | { ok: true; flows: PreparedFlow[]; start: Date }
  | { ok: false; reason: string } {
  if (flows.length < 2) {
    return {
      ok: false,
      reason: "XIRR needs at least two cash flows.",
    };
  }

  const prepared: Array<{ date: Date; amount: number }> = [];
  for (const flow of flows) {
    const date = parseIsoUtc(flow.date);
    if (!date || !Number.isFinite(flow.amount) || flow.amount === 0) {
      return {
        ok: false,
        reason: "One of the cash flows has an invalid date or amount.",
      };
    }
    prepared.push({ date, amount: flow.amount });
  }

  prepared.sort((a, b) => a.date.getTime() - b.date.getTime());
  const hasNegative = prepared.some((flow) => flow.amount < 0);
  const hasPositive = prepared.some((flow) => flow.amount > 0);

  if (!hasNegative || !hasPositive) {
    return {
      ok: false,
      reason:
        "XIRR needs money going in and money coming out. These cash flows only go one way.",
    };
  }

  const start = prepared[0].date;
  const last = prepared[prepared.length - 1].date;
  if (last.getTime() === start.getTime()) {
    return {
      ok: false,
      reason: "XIRR needs cash flows on at least two different dates.",
    };
  }

  return {
    ok: true,
    start,
    flows: prepared.map((flow) => ({
      time: daysBetween(start, flow.date) / DAYS_PER_YEAR,
      amount: flow.amount,
    })),
  };
}

function npv(rate: number, flows: PreparedFlow[]): number {
  if (rate <= -1) return Number.NaN;
  const base = 1 + rate;
  let sum = 0;
  for (const flow of flows) {
    sum += flow.amount / Math.pow(base, flow.time);
  }
  return sum;
}

function derivative(rate: number, flows: PreparedFlow[]): number {
  if (rate <= -1) return Number.NaN;
  const base = 1 + rate;
  let sum = 0;
  for (const flow of flows) {
    sum += (-flow.time * flow.amount) / Math.pow(base, flow.time + 1);
  }
  return sum;
}

function bisect(flows: PreparedFlow[]): XirrResult {
  let low = LOW_RATE;
  let high = 1;
  let fLow = npv(low, flows);
  let fHigh = npv(high, flows);

  for (let i = 0; i < 80 && Number.isFinite(fLow) && Number.isFinite(fHigh); i += 1) {
    if (fLow * fHigh <= 0) break;
    high *= 10;
    fHigh = npv(high, flows);
  }

  if (
    !Number.isFinite(fLow) ||
    !Number.isFinite(fHigh) ||
    fLow * fHigh > 0
  ) {
    return {
      rate: null,
      reason: "No consistent annual rate was found for these cash flows.",
    };
  }

  for (let i = 0; i < 240; i += 1) {
    const mid = (low + high) / 2;
    const fMid = npv(mid, flows);
    if (!Number.isFinite(fMid)) {
      return {
        rate: null,
        reason: "The rate calculation became unstable for these cash flows.",
      };
    }
    if (Math.abs(fMid) < 1e-7 || high - low < 1e-12) {
      return { rate: mid, method: "bisection", iterations: i + 1 };
    }
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return {
    rate: null,
    reason: "The XIRR calculation did not settle on a stable rate.",
  };
}

/**
 * XIRR solves: Σ cashFlow_i / (1 + rate) ^ (days_i / 365) = 0.
 * Newton-Raphson is tried first; bisection is used if it fails.
 */
export function xirr(flows: XirrCashFlow[]): XirrResult {
  const prepared = prepareFlows(flows);
  if (!prepared.ok) return { rate: null, reason: prepared.reason };

  let rate = 0.1;
  for (let i = 1; i <= MAX_ITERATIONS; i += 1) {
    const value = npv(rate, prepared.flows);
    if (!Number.isFinite(value)) break;
    if (Math.abs(value) < 1e-8) {
      return { rate, method: "newton", iterations: i };
    }

    const slope = derivative(rate, prepared.flows);
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-12) break;

    const next = rate - value / slope;
    if (!Number.isFinite(next) || next <= -1 || next > 1_000_000) break;
    if (Math.abs(next - rate) < 1e-11) {
      const check = npv(next, prepared.flows);
      if (Number.isFinite(check) && Math.abs(check) < 1e-5) {
        return { rate: next, method: "newton", iterations: i };
      }
      break;
    }
    rate = next;
  }

  return bisect(prepared.flows);
}
