import type { SipFrequency } from "@/lib/engine/types";

export type SampleHolding = {
  fundCode: number;
  mode: "units" | "sip";
  units?: number;
  purchaseDate?: string;
  sipAmount?: number;
  sipStartDate?: string;
  sipFrequency?: SipFrequency;
};

/**
 * Real funds, invented holdings. The values are not a recommendation and are
 * not based on any real person's portfolio.
 */
export const sampleHoldings: SampleHolding[] = [
  {
    fundCode: 122639,
    mode: "sip",
    sipAmount: 7_500,
    sipStartDate: "2021-04-05",
    sipFrequency: "monthly",
  },
  {
    fundCode: 118989,
    mode: "units",
    units: 150,
    purchaseDate: "2020-08-17",
  },
  {
    fundCode: 119598,
    mode: "units",
    units: 400,
    purchaseDate: "2022-02-14",
  },
  {
    fundCode: 100868,
    mode: "units",
    units: 300,
    purchaseDate: "2023-01-09",
  },
];

export const sampleNote =
  "Sample portfolio: four real funds with invented holdings. It is here to show the report, not to suggest a portfolio. Replace it with your own details or clear it.";
