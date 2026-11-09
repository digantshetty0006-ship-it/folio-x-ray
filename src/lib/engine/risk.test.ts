import { describe, expect, it } from "vitest";
import type { AllocationSlice } from "./types";
import { readRiskMirror } from "./risk";

const mixed: AllocationSlice[] = [
  { key: "equity", label: "Equity", value: 60, pct: 60 },
  { key: "debt", label: "Debt", value: 30, pct: 30 },
  { key: "hybrid", label: "Hybrid", value: 5, pct: 5 },
  { key: "gold-and-other", label: "Gold & other", value: 5, pct: 5 },
];

const equityHeavy: AllocationSlice[] = [
  { key: "equity", label: "Equity", value: 80, pct: 80 },
  { key: "debt", label: "Debt", value: 15, pct: 15 },
  { key: "gold-and-other", label: "Gold & other", value: 5, pct: 5 },
];

const equityLight: AllocationSlice[] = [
  { key: "equity", label: "Equity", value: 20, pct: 20 },
  { key: "debt", label: "Debt", value: 70, pct: 70 },
  { key: "gold-and-other", label: "Gold & other", value: 10, pct: 10 },
];

describe("readRiskMirror", () => {
  it("requires all three answers and rejects unknown values", () => {
    expect(readRiskMirror({}, mixed).ok).toBe(false);
    expect(
      readRiskMirror({ horizon: "short", tolerance: "low" }, mixed).ok,
    ).toBe(false);
    expect(
      readRiskMirror(
        {
          horizon: "short",
          tolerance: "extreme" as never,
          share: "low",
        },
        mixed,
      ).ok,
    ).toBe(false);
  });

  it("maps hybrid and gold into the other bucket", () => {
    const result = readRiskMirror(
      { horizon: "medium", tolerance: "medium", share: "medium" },
      mixed,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.current).toEqual({ equity: 60, debt: 30, other: 10 });
      expect(result.headline).toContain("do not show a single obvious tension");
    }
  });

  it("flags a short horizon against meaningful equity exposure", () => {
    const result = readRiskMirror(
      { horizon: "short", tolerance: "medium", share: "medium" },
      equityHeavy,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.headline).toContain("horizon is shorter");
      expect(result.notes[0]).toContain("80.0%");
      expect(result.notes[0]).toContain("within three years");
    }
  });

  it("flags a low fall tolerance against meaningful equity exposure", () => {
    const result = readRiskMirror(
      { horizon: "medium", tolerance: "low", share: "medium" },
      mixed,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.headline).toContain("fall you described");
      expect(result.notes[0]).toContain("60.0%");
      expect(result.notes[0]).toContain("up to 10%");
    }
  });

  it("flags a heavy equity share when most savings are in the portfolio", () => {
    const result = readRiskMirror(
      { horizon: "medium", tolerance: "medium", share: "high" },
      equityHeavy,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.headline).toContain("Most of your investable savings");
      expect(result.notes[0]).toContain("80.0%");
      expect(result.notes[0]).toContain("more than 75%");
    }
  });

  it("flags a cautious mix when the answers allow more movement", () => {
    const result = readRiskMirror(
      { horizon: "long", tolerance: "high", share: "medium" },
      equityLight,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.headline).toContain("allow more movement");
      expect(result.notes[0]).toContain("20.0%");
    }
  });

  it("notes when cautious answers and a cautious mix agree", () => {
    const result = readRiskMirror(
      { horizon: "short", tolerance: "low", share: "low" },
      equityLight,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.headline).toContain("same cautious direction");
      expect(result.notes.some((note) => note.includes("less than 25%"))).toBe(
        true,
      );
    }
  });

  it("caps the number of observations at three", () => {
    const result = readRiskMirror(
      { horizon: "short", tolerance: "low", share: "high" },
      equityHeavy,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.notes).toHaveLength(3);
    }
  });
});
