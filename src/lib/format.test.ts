import { describe, expect, it } from "vitest";
import { parseApiDate, readingTime, toIsoDate } from "./format";

describe("parseApiDate", () => {
  it("parses api.mfapi.in dates as UTC", () => {
    expect(parseApiDate("06-11-2026")?.toISOString()).toBe(
      "2026-11-06T00:00:00.000Z",
    );
  });

  it("rejects impossible dates", () => {
    expect(parseApiDate("31-02-2025")).toBeNull();
    expect(parseApiDate("2025-02-01")).toBeNull();
  });
});

describe("toIsoDate", () => {
  it("formats a UTC date without timezone drift", () => {
    expect(toIsoDate(new Date(Date.UTC(2025, 0, 1)))).toBe("2025-01-01");
  });
});

describe("readingTime", () => {
  it("never reports less than one minute", () => {
    expect(readingTime(10)).toBe("1 min read");
    expect(readingTime(660)).toBe("3 min read");
  });
});
