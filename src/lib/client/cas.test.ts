import { describe, expect, it } from "vitest";
import { extractSchemeCodes, normalisePdfText } from "./cas";

describe("extractSchemeCodes", () => {
  it("finds explicitly labelled AMFI scheme codes", () => {
    const text = "AMFI Scheme Code: 122639\nScheme code - 118989";
    expect(extractSchemeCodes(text)).toEqual([122639, 118989]);
  });

  it("finds a six-digit code at the start of a line", () => {
    expect(extractSchemeCodes("122639 Parag Parikh Flexi Cap Fund")).toEqual([
      122639,
    ]);
  });

  it("deduplicates codes and caps the result", () => {
    const labelled =
      "AMFI Scheme Code: 122639\nAMFI Scheme Code: 122639\nScheme code - 118989";
    expect(extractSchemeCodes(labelled)).toEqual([122639, 118989]);

    const many = Array.from(
      { length: 20 },
      (_, index) => `AMFI code: ${122600 + index}`,
    ).join("\n");
    expect(extractSchemeCodes(many)).toHaveLength(12);
  });

  it("ignores bare six-digit numbers that are not labelled or at a line start", () => {
    expect(extractSchemeCodes("Folio 123456, units 12.345")).toEqual([]);
  });

  it("returns an empty list when no scheme codes exist", () => {
    expect(extractSchemeCodes("Folio 12345678, units 12.345")).toEqual([]);
  });
});

describe("normalisePdfText", () => {
  it("normalises spaces but keeps line breaks for line-start codes", () => {
    expect(normalisePdfText("A   fund\n\n  name")).toBe("A fund\n\nname");
  });
});
