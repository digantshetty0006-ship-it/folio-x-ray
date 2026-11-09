/**
 * Single source of truth for product copy, thresholds and defaults.
 * The accent colour is defined here and consumed as a CSS custom property.
 */

export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Folio X-Ray — a private mutual fund portfolio X-ray for Indian investors",
};

export const site = {
  name: "Folio X-Ray",
  shortName: "Folio X-Ray",
  tagline: "See what you actually own.",
  description:
    "A free, private tool for Indian mutual fund investors. Understand XIRR, overlap, costs and goal odds without uploading your portfolio.",
  location: "Mumbai, IN",
  contactEmail: "hello@folioxray.in",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://folio-xray.vercel.app",
  accent: "#E5482B",
  author: {
    name: "Red",
    role: "Third-year IT student",
    city: "Navi Mumbai",
  },
} as const;

export const concentrationThresholds = {
  /** One fund at or above this share of portfolio value. */
  singleFundPct: 35,
  /** One asset category at or above this share of portfolio value. */
  categoryPct: 80,
  /** This many funds in one category triggers a duplicate-category note. */
  duplicateFundsInCategory: 3,
} as const;

export const costGapDefaults = {
  /** Percentage points of annual return used to illustrate plan costs. */
  expenseGapPct: 1,
  /** Illustrative gross return, before the expense gap. */
  assumedReturnPct: 11,
  minAssumedReturnPct: 1,
  maxAssumedReturnPct: 20,
  minExpenseGapPct: 0,
  maxExpenseGapPct: 3,
  horizonYears: [10, 20] as const,
} as const;

export const riskMirror = {
  /** Equity above this share is treated as meaningful exposure in the mirror. */
  equityMeaningfulAbovePct: 30,
  /** Equity at or above this share is treated as heavy. */
  equityHeavyAtPct: 70,
} as const;

export const monteCarloDefaults = {
  runs: 1000,
  defaultYears: 15,
  minYears: 1,
  maxYears: 40,
  defaultMonthlySip: 10_000,
  defaultStepUpPct: 0,
  defaultExpectedReturnPct: 11,
  defaultVolatilityPct: 15,
  defaultInflationPct: 5,
  seed: 42,
} as const;

export const apiConfig = {
  baseUrl: "https://api.mfapi.in",
  timeoutMs: 8_000,
  searchRevalidateSeconds: 60 * 60,
  detailRevalidateSeconds: 6 * 60 * 60,
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 30,
  },
  maxSearchQueryLength: 80,
  historyYears: 25,
} as const;
