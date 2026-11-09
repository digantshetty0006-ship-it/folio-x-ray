import { describe, expect, it } from "vitest";
import { generateSipContributions, nextSipDate } from "./sip";
import { parseIsoUtc, toIsoUtc } from "./date";
import type { NavPoint } from "./types";

const history: NavPoint[] = [
  { date: "2024-01-01", nav: 10 },
  { date: "2024-01-03", nav: 12 },
  { date: "2024-02-05", nav: 15 },
  { date: "2024-03-01", nav: 20 },
];

describe("generateSipContributions", () => {
  it("uses the next available NAV when the SIP date is a holiday or missing", () => {
    const result = generateSipContributions({
      amount: 1_000,
      startDate: "2024-01-02",
      frequency: "monthly",
      endDate: "2024-03-01",
      history,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.contributions).toHaveLength(2);
    expect(result.contributions[0].navDate).toBe("2024-01-03");
    expect(result.contributions[1].navDate).toBe("2024-02-05");
    expect(result.invested).toBe(2_000);
    expect(result.units).toBeCloseTo(1_000 / 12 + 1_000 / 15, 8);
  });

  it("preserves month-end SIP dates across shorter months", () => {
    const start = parseIsoUtc("2024-01-31")!;
    expect(toIsoUtc(nextSipDate(start, 0, "monthly"))).toBe("2024-01-31");
    expect(toIsoUtc(nextSipDate(start, 1, "monthly"))).toBe("2024-02-29");
    expect(toIsoUtc(nextSipDate(start, 2, "monthly"))).toBe("2024-03-31");
    expect(toIsoUtc(nextSipDate(start, 3, "monthly"))).toBe("2024-04-30");
  });

  it("counts weekly and quarterly instalments correctly", () => {
    const daily: NavPoint[] = [];
    for (let day = 1; day <= 31; day += 1) {
      daily.push({ date: `2024-01-${String(day).padStart(2, "0")}`, nav: 10 });
    }
    const weekly = generateSipContributions({
      amount: 500,
      startDate: "2024-01-01",
      frequency: "weekly",
      endDate: "2024-01-31",
      history: daily,
    });
    expect(weekly.ok).toBe(true);
    if (weekly.ok) expect(weekly.contributions).toHaveLength(5);

    const quarterlyHistory: NavPoint[] = [
      { date: "2024-01-01", nav: 10 },
      { date: "2024-04-01", nav: 10 },
      { date: "2024-07-01", nav: 10 },
      { date: "2024-10-01", nav: 10 },
    ];
    const quarterly = generateSipContributions({
      amount: 500,
      startDate: "2024-01-01",
      frequency: "quarterly",
      endDate: "2024-10-01",
      history: quarterlyHistory,
    });
    expect(quarterly.ok).toBe(true);
    if (quarterly.ok) {
      expect(quarterly.contributions).toHaveLength(4);
      expect(quarterly.contributions.map((item) => item.scheduledDate)).toEqual([
        "2024-01-01",
        "2024-04-01",
        "2024-07-01",
        "2024-10-01",
      ]);
    }
  });

  it("warns when the first NAV is more than a week after the start", () => {
    const result = generateSipContributions({
      amount: 1_000,
      startDate: "2024-01-01",
      frequency: "monthly",
      endDate: "2024-02-01",
      history: [
        { date: "2024-01-15", nav: 10 },
        { date: "2024-02-01", nav: 11 },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.contributions[0].navDate).toBe("2024-01-15");
  });

  it("fails cleanly when the start date is after the valuation date", () => {
    const result = generateSipContributions({
      amount: 1_000,
      startDate: "2024-04-01",
      frequency: "monthly",
      endDate: "2024-03-01",
      history,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/after the latest/i);
  });

  it("fails cleanly when no instalment can be matched", () => {
    const result = generateSipContributions({
      amount: 1_000,
      startDate: "2020-01-01",
      frequency: "monthly",
      endDate: "2020-03-01",
      history,
    });
    expect(result.ok).toBe(false);
  });
});
