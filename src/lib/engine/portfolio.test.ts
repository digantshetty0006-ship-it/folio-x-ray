import { describe, expect, it } from "vitest";
import {
  buildAllocation,
  buildFlags,
  evaluateHolding,
  evaluatePortfolio,
} from "./portfolio";
import type { HoldingInput, NavPoint } from "./types";

const history: NavPoint[] = [
  { date: "2024-01-01", nav: 10 },
  { date: "2024-06-01", nav: 20 },
  { date: "2025-01-01", nav: 25 },
];

function unitsHolding(overrides: Partial<HoldingInput> = {}): HoldingInput {
  return {
    id: "h1",
    fundCode: 1,
    fundName: "Fund One",
    category: "equity",
    planType: "direct",
    latestNav: 25,
    latestDate: "2025-01-01",
    history,
    mode: "units",
    units: 100,
    purchaseDate: "2024-01-01",
    ...overrides,
  } as HoldingInput;
}

describe("evaluateHolding", () => {
  it("values units at the latest NAV", () => {
    const result = evaluateHolding(unitsHolding());
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2_500);
    expect(result.invested).toBe(1_000);
    expect(result.xirr.rate).not.toBeNull();
  });

  it("computes SIP units from historical NAVs", () => {
    const result = evaluateHolding({
      ...unitsHolding(),
      id: "sip",
      mode: "sip",
      sipAmount: 1_000,
      sipStartDate: "2024-01-01",
      sipFrequency: "monthly",
    } as HoldingInput);
    expect(result.ok).toBe(true);
    expect(result.contributions?.length).toBeGreaterThan(5);
    expect(result.value).toBeGreaterThan(result.invested);
  });

  it("returns a human error instead of throwing for bad units", () => {
    const result = evaluateHolding(unitsHolding({ units: 0 } as never));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/greater than zero/i);
    expect(result.value).toBe(0);
  });
});

describe("allocation", () => {
  it("always sums category and fund percentages to exactly 100", () => {
    const allocation = buildAllocation([
      { fundCode: 1, fundName: "A", category: "equity", value: 100 },
      { fundCode: 2, fundName: "B", category: "debt", value: 200 },
      { fundCode: 3, fundName: "C", category: "hybrid", value: 300 },
    ]);
    const categorySum = allocation.byCategory.reduce(
      (sum, slice) => sum + slice.pct,
      0,
    );
    const fundSum = allocation.byFund.reduce((sum, slice) => sum + slice.pct, 0);
    expect(categorySum).toBe(100);
    expect(fundSum).toBe(100);
  });

  it("handles a zero-value portfolio without NaN", () => {
    const allocation = buildAllocation([
      { fundCode: 1, fundName: "A", category: "equity", value: 0 },
    ]);
    expect(allocation.byCategory).toEqual([]);
    expect(allocation.byFund).toEqual([]);
    expect(allocation.total).toBe(0);
  });
});

describe("flags", () => {
  const valuations = [
    { fundCode: 1, fundName: "Equity One", category: "equity" as const, value: 400 },
    { fundCode: 2, fundName: "Equity Two", category: "equity" as const, value: 300 },
    { fundCode: 3, fundName: "Equity Three", category: "equity" as const, value: 300 },
  ];

  it("flags single-fund and category concentration plus duplicate categories", () => {
    const allocation = buildAllocation(valuations);
    const flags = buildFlags(valuations, allocation);
    expect(flags.some((flag) => flag.kind === "single-fund")).toBe(true);
    expect(flags.some((flag) => flag.kind === "category")).toBe(true);
    expect(flags.some((flag) => flag.kind === "duplicate-category")).toBe(true);
  });

  it("does not flag a diversified portfolio", () => {
    const diversified = [
      { fundCode: 1, fundName: "Equity", category: "equity" as const, value: 30 },
      { fundCode: 2, fundName: "Debt", category: "debt" as const, value: 30 },
      { fundCode: 3, fundName: "Hybrid", category: "hybrid" as const, value: 20 },
      {
        fundCode: 4,
        fundName: "Gold",
        category: "gold-and-other" as const,
        value: 20,
      },
    ];
    const flags = buildFlags(diversified, buildAllocation(diversified));
    expect(flags).toHaveLength(0);
  });
});

describe("evaluatePortfolio", () => {
  it("aggregates value, invested and a portfolio XIRR", () => {
    const summary = evaluatePortfolio([
      unitsHolding(),
      unitsHolding({
        id: "h2",
        fundCode: 2,
        fundName: "Fund Two",
        category: "debt",
        planType: "regular",
        units: 50,
        purchaseDate: "2024-06-01",
      } as Partial<HoldingInput>),
    ]);
    expect(summary.totalValue).toBe(2_500 + 1_250);
    expect(summary.totalInvested).toBe(1_000 + 1_000);
    expect(summary.gain).toBe(1_750);
    expect(summary.xirr.rate).not.toBeNull();
    expect(summary.errorCount).toBe(0);
  });

  it("counts failed holdings without breaking the rest", () => {
    const summary = evaluatePortfolio([
      unitsHolding(),
      unitsHolding({ id: "bad", units: -5 } as Partial<HoldingInput>),
    ]);
    expect(summary.errorCount).toBe(1);
    expect(summary.totalValue).toBe(2_500);
  });
});
