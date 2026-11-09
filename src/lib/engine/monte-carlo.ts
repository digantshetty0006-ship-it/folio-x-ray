import { monteCarloDefaults } from "@/lib/config";
import { percentile } from "./date";
import type { MonteCarloInput, MonteCarloResult } from "./types";

export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function drawStandardNormal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Monthly simulation with lognormal returns.
 *
 * expectedReturnPct is an arithmetic annual return. Monthly log drift is
 * ln(1 + annual return) / 12 minus half the monthly variance, so the expected
 * simple monthly return compounds to the stated annual figure. Volatility is
 * annualised and scaled by sqrt(12). SIPs are invested at the start of each
 * month. Step-up is applied at the start of every 12-month block.
 */
export function runMonteCarlo(input: MonteCarloInput): MonteCarloResult {
  const runs = Math.max(10, Math.round(input.runs ?? monteCarloDefaults.runs));
  const years = Math.max(
    monteCarloDefaults.minYears,
    Math.min(
      monteCarloDefaults.maxYears,
      Math.round(input.years || monteCarloDefaults.defaultYears),
    ),
  );
  const months = years * 12;
  const seed = Number.isFinite(input.seed)
    ? Math.trunc(input.seed as number)
    : monteCarloDefaults.seed;
  const expectedReturn = input.expectedReturnPct / 100;
  const volatility = Math.max(0, input.volatilityPct / 100);
  const sigmaMonthly = volatility / Math.sqrt(12);
  const muMonthly =
    Math.log(1 + expectedReturn) / 12 - 0.5 * sigmaMonthly * sigmaMonthly;
  const stepUp = Math.max(0, input.stepUpPct) / 100;
  const goalAtHorizon =
    input.goalToday * Math.pow(1 + input.inflationPct / 100, years);
  const rng = createSeededRng(seed);

  const valuesByMonth: number[][] = Array.from(
    { length: months + 1 },
    () => [],
  );
  let successes = 0;

  for (let run = 0; run < runs; run += 1) {
    let value = Math.max(0, input.initialValue);
    valuesByMonth[0].push(value);

    for (let month = 0; month < months; month += 1) {
      const yearIndex = Math.floor(month / 12);
      const contribution =
        Math.max(0, input.monthlySip) * Math.pow(1 + stepUp, yearIndex);
      const shock = drawStandardNormal(rng);
      const monthlyReturn = Math.exp(muMonthly + sigmaMonthly * shock) - 1;
      value = (value + contribution) * (1 + monthlyReturn);
      valuesByMonth[month + 1].push(value);
    }

    if (value >= goalAtHorizon) successes += 1;
  }

  const sortedByMonth = valuesByMonth.map((values) =>
    values.slice().sort((a, b) => a - b),
  );
  const paths = {
    p10: sortedByMonth.map((values) => percentile(values, 0.1)),
    p50: sortedByMonth.map((values) => percentile(values, 0.5)),
    p90: sortedByMonth.map((values) => percentile(values, 0.9)),
  };
  const finals = sortedByMonth[months];

  return {
    runs,
    seed,
    months,
    goalToday: input.goalToday,
    goalAtHorizon,
    probabilityPct: (successes / runs) * 100,
    finalPercentiles: {
      p10: percentile(finals, 0.1),
      p50: percentile(finals, 0.5),
      p90: percentile(finals, 0.9),
    },
    paths,
    assumptions: {
      ...input,
      years,
      runs,
      seed,
    },
  };
}
