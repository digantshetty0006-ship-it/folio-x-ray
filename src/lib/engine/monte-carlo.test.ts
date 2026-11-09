import { describe, expect, it } from "vitest";
import { runMonteCarlo } from "./monte-carlo";

const baseInput = {
  initialValue: 100_000,
  monthlySip: 10_000,
  years: 10,
  stepUpPct: 5,
  expectedReturnPct: 10,
  volatilityPct: 12,
  inflationPct: 5,
  goalToday: 3_000_000,
  seed: 42,
  runs: 200,
};

describe("runMonteCarlo", () => {
  it("is deterministic for the same seed", () => {
    const first = runMonteCarlo(baseInput);
    const second = runMonteCarlo(baseInput);
    expect(second).toEqual(first);
    expect(first.paths.p50).toHaveLength(121);
    expect(first.probabilityPct).toBeGreaterThanOrEqual(0);
    expect(first.probabilityPct).toBeLessThanOrEqual(100);
  });

  it("changes the output with a different seed", () => {
    const first = runMonteCarlo(baseInput);
    const second = runMonteCarlo({ ...baseInput, seed: 43 });
    expect(second.finalPercentiles.p50).not.toBe(first.finalPercentiles.p50);
  });

  it("inflates the goal and keeps percentile bands ordered", () => {
    const result = runMonteCarlo(baseInput);
    expect(result.goalAtHorizon).toBeCloseTo(3_000_000 * Math.pow(1.05, 10), 6);
    for (let index = 0; index < result.paths.p10.length; index += 1) {
      expect(result.paths.p10[index]).toBeLessThanOrEqual(result.paths.p50[index]);
      expect(result.paths.p50[index]).toBeLessThanOrEqual(result.paths.p90[index]);
    }
  });

  it("matches a deterministic SIP path when volatility is zero", () => {
    const result = runMonteCarlo({
      initialValue: 0,
      monthlySip: 1_000,
      years: 1,
      stepUpPct: 0,
      expectedReturnPct: 0,
      volatilityPct: 0,
      inflationPct: 0,
      goalToday: 12_000,
      seed: 7,
      runs: 50,
    });
    expect(result.finalPercentiles.p10).toBeCloseTo(12_000, 6);
    expect(result.finalPercentiles.p50).toBeCloseTo(12_000, 6);
    expect(result.finalPercentiles.p90).toBeCloseTo(12_000, 6);
    expect(result.probabilityPct).toBe(100);
  });

  it("compounds a lump sum at the stated annual return with zero volatility", () => {
    const result = runMonteCarlo({
      initialValue: 12_000,
      monthlySip: 0,
      years: 1,
      stepUpPct: 0,
      expectedReturnPct: 12,
      volatilityPct: 0,
      inflationPct: 0,
      goalToday: 13_440,
      seed: 1,
      runs: 20,
    });
    expect(result.finalPercentiles.p50).toBeCloseTo(13_440, 6);
    expect(result.probabilityPct).toBe(100);
  });

  it("defaults to 1,000 runs", () => {
    const result = runMonteCarlo({ ...baseInput, runs: undefined });
    expect(result.runs).toBe(1_000);
  });
});
