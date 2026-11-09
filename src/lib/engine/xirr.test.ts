import { describe, expect, it } from "vitest";
import { xirr } from "./xirr";

describe("xirr", () => {
  it("finds a simple one-year 10% return", () => {
    const result = xirr([
      { date: "2021-01-01", amount: -10_000 },
      { date: "2022-01-01", amount: 11_000 },
    ]);
    expect(result.rate).not.toBeNull();
    expect(result.rate!).toBeCloseTo(0.1, 6);
    expect(result.reason).toBeUndefined();
  });

  it("handles multiple dated cash flows", () => {
    const targetRate = 0.12;
    const finalValue =
      1_000 * (1 + targetRate) +
      2_000 * Math.pow(1 + targetRate, 184 / 365);
    const result = xirr([
      { date: "2021-01-01", amount: -1_000 },
      { date: "2021-07-01", amount: -2_000 },
      { date: "2022-01-01", amount: finalValue },
    ]);
    expect(result.rate).not.toBeNull();
    expect(result.rate!).toBeCloseTo(targetRate, 5);
  });

  it("handles a negative return", () => {
    const result = xirr([
      { date: "2021-01-01", amount: -10_000 },
      { date: "2022-01-01", amount: 5_000 },
    ]);
    expect(result.rate).not.toBeNull();
    expect(result.rate!).toBeCloseTo(-0.5, 6);
  });

  it("returns a reason instead of NaN when cash flows go one way", () => {
    const result = xirr([
      { date: "2021-01-01", amount: -10_000 },
      { date: "2022-01-01", amount: -1_000 },
    ]);
    expect(result.rate).toBeNull();
    expect(result.reason).toMatch(/money going in and money coming out/i);
  });

  it("returns a reason when all cash flows are on one date", () => {
    const result = xirr([
      { date: "2021-01-01", amount: -10_000 },
      { date: "2021-01-01", amount: 11_000 },
    ]);
    expect(result.rate).toBeNull();
    expect(result.reason).toMatch(/different dates/i);
  });

  it("rejects invalid dates without producing NaN", () => {
    const result = xirr([
      { date: "not-a-date", amount: -10_000 },
      { date: "2022-01-01", amount: 11_000 },
    ]);
    expect(result.rate).toBeNull();
    expect(result.reason).toBeTruthy();
    expect(Number.isNaN(result.rate as number)).toBe(false);
  });
});
