import { describe, expect, it } from "vitest";
import {
  deriveCategory,
  deriveOption,
  derivePlanType,
  type FundCategory,
} from "./fund-mapping";

describe("deriveCategory", () => {
  const cases: Array<[string, FundCategory]> = [
    ["Equity Scheme - Large Cap Fund", "equity"],
    ["Equity Schemes - ELSS- Tax Saver Fund", "equity"],
    ["Equity Scheme - Flexi Cap Fund", "equity"],
    ["Debt Scheme - Liquid Fund", "debt"],
    ["Income/Debt Oriented Schemes - Banking and PSU Debt Fund", "debt"],
    ["Hybrid Scheme - Balanced Hybrid Fund", "hybrid"],
    ["Hybrid Scheme - Dynamic Asset Allocation or Balanced Advantage", "hybrid"],
    ["Other Scheme - Gold ETF", "gold-and-other"],
    ["Other Scheme - FoF Domestic", "gold-and-other"],
    ["Other Scheme - Index Funds", "gold-and-other"],
    ["", "gold-and-other"],
  ];

  it.each(cases)("maps %s to %s", (input, expected) => {
    expect(deriveCategory(input)).toBe(expected);
  });
});

describe("derivePlanType", () => {
  it("recognises direct plans in common naming styles", () => {
    expect(derivePlanType("Parag Parikh Flexi Cap Fund - Direct Plan - Growth")).toBe(
      "direct",
    );
    expect(derivePlanType("HDFC Fund Direct Growth")).toBe("direct");
    expect(derivePlanType("XYZ Fund - DIRECT - IDCW")).toBe("direct");
  });

  it("defaults to regular when direct is absent", () => {
    expect(derivePlanType("Parag Parikh Flexi Cap Fund - Regular Plan - Growth")).toBe(
      "regular",
    );
    expect(derivePlanType("SBI Bluechip Fund - Growth")).toBe("regular");
  });
});

describe("deriveOption", () => {
  it("separates growth, IDCW and other options", () => {
    expect(deriveOption("Fund - Direct Plan - Growth")).toBe("growth");
    expect(deriveOption("Fund - Direct Plan - Monthly IDCW Payout")).toBe("idcw");
    expect(deriveOption("Fund - Direct Plan - Bonus Option")).toBe("other");
  });
});
