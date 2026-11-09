export type FundCategory = "equity" | "debt" | "hybrid" | "gold-and-other";
export type PlanType = "direct" | "regular";
export type FundOption = "growth" | "idcw" | "other";

export const categoryLabels: Record<FundCategory, string> = {
  equity: "Equity",
  debt: "Debt",
  hybrid: "Hybrid",
  "gold-and-other": "Gold & other",
};

/**
 * api.mfapi.in does not provide a normalised asset class. It provides a
 * free-text scheme_category. We map the common SEBI-style labels into four
 * buckets, in priority order. "Other Scheme" includes index funds, fund of
 * funds, gold and commodity schemes, so it is kept as one transparent bucket.
 */
export function deriveCategory(schemeCategory: string): FundCategory {
  const value = schemeCategory.toLowerCase();

  if (/(gold|silver|commodit)/.test(value)) return "gold-and-other";
  if (/hybrid|balanced|arbitrage|multi asset|solution oriented/.test(value)) {
    return "hybrid";
  }
  if (/equity|elss|tax saver/.test(value)) return "equity";
  if (
    /debt|income|liquid|money market|gilt|overnight|credit risk|banking and psu|duration/.test(
      value,
    )
  ) {
    return "debt";
  }
  return "gold-and-other";
}

export function derivePlanType(schemeName: string): PlanType {
  return /(?:^|[\s\-_])direct(?:[\s\-_]|$)/i.test(schemeName)
    ? "direct"
    : "regular";
}

export function deriveOption(schemeName: string): FundOption {
  if (/idcw|dividend|reinvestment|payout/i.test(schemeName)) return "idcw";
  if (/growth/i.test(schemeName)) return "growth";
  return "other";
}

export const categoryOrder: FundCategory[] = [
  "equity",
  "debt",
  "hybrid",
  "gold-and-other",
];
