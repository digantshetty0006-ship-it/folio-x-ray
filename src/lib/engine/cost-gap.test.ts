import { describe, expect, it } from "vitest";
import { computeCostGap, projectCostGap } from "./cost-gap";
import type { HoldingEvaluation } from "./types";

function holding(
  id: string,
  value: number,
  planType: "direct" | "regular",
): HoldingEvaluation {
  return {
    id,
    fundCode: Number(id.replace(/\D/g, "")) || 1,
    fundName: `Fund ${id}`,
    category: "equity",
    planType,
    mode: "units",
    ok: true,
    units: 1,
    value,
    invested: value / 2,
    latestNav: 1,
    latestDate: "2025-01-01",
    xirr: { rate: 0.1 },
    warnings: [],
    cashFlows: [],
  };
}

describe("projectCostGap", () => {
  it("compounds the value with and without the expense gap", () => {
    const result = projectCostGap({
      value: 100_000,
      assumedReturnPct: 11,
      expenseGapPct: 1,
      years: 10,
    });
    expect(result.withoutGap).toBeCloseTo(100_000 * Math.pow(1.11, 10), 6);
    expect(result.withGap).toBeCloseTo(100_000 * Math.pow(1.1, 10), 6);
    expect(result.difference).toBeCloseTo(
      100_000 * Math.pow(1.11, 10) - 100_000 * Math.pow(1.1, 10),
      6,
    );
  });
});

describe("computeCostGap", () => {
  it("uses only Regular-plan holdings and totals both horizons", () => {
    const result = computeCostGap(
      [holding("regular-1", 100_000, "regular"), holding("direct-2", 50_000, "direct")],
      11,
      1,
    );
    expect(result.hasRegular).toBe(true);
    expect(result.regularValue).toBe(100_000);
    expect(result.rows).toHaveLength(1);
    expect(result.totals.map((row) => row.years)).toEqual([10, 20]);
  });

  it("returns an honest empty state when there are no Regular plans", () => {
    const result = computeCostGap([holding("direct-1", 100_000, "direct")], 11, 1);
    expect(result.hasRegular).toBe(false);
    expect(result.regularValue).toBe(0);
    expect(result.rows).toHaveLength(0);
    expect(result.totals.every((row) => row.difference === 0)).toBe(true);
  });
});
