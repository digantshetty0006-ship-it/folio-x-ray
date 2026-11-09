import { categoryOrder, categoryLabels } from "@/lib/fund-mapping";
import { concentrationThresholds } from "@/lib/config";
import type {
  AllocationResult,
  AllocationSlice,
  PortfolioFlag,
  PortfolioSummary,
  HoldingEvaluation,
  HoldingInput,
  XirrCashFlow,
} from "./types";
import { findNavOnOrAfter, normaliseHistory, parseIsoUtc } from "./date";
import { generateSipContributions } from "./sip";
import { xirr } from "./xirr";

function failedHolding(input: HoldingInput, reason: string): HoldingEvaluation {
  return {
    id: input.id,
    fundCode: input.fundCode,
    fundName: input.fundName,
    category: input.category,
    planType: input.planType,
    mode: input.mode,
    ok: false,
    error: reason,
    units: 0,
    value: 0,
    invested: 0,
    latestNav: input.latestNav,
    latestDate: input.latestDate,
    xirr: { rate: null, reason },
    warnings: [],
    cashFlows: [],
  };
}

export function evaluateHolding(input: HoldingInput): HoldingEvaluation {
  const latestDate = parseIsoUtc(input.latestDate);
  if (!latestDate) return failedHolding(input, "The latest NAV date is invalid.");
  if (!Number.isFinite(input.latestNav) || input.latestNav <= 0) {
    return failedHolding(input, "The latest NAV is not available.");
  }

  const history = normaliseHistory(input.history);
  if (history.length === 0) {
    return failedHolding(input, "There is no usable NAV history for this fund.");
  }

  if (input.mode === "units") {
    if (!Number.isFinite(input.units) || input.units <= 0) {
      return failedHolding(input, "Units held must be greater than zero.");
    }
    const purchaseDate = parseIsoUtc(input.purchaseDate);
    if (!purchaseDate) {
      return failedHolding(input, "The purchase date is not valid.");
    }
    if (purchaseDate > latestDate) {
      return failedHolding(
        input,
        "The purchase date is after the latest available NAV date.",
      );
    }

    const purchase = findNavOnOrAfter(history, input.purchaseDate);
    if (!purchase) {
      return failedHolding(
        input,
        "No NAV is available on or after the purchase date.",
      );
    }

    const units = input.units;
    const value = units * input.latestNav;
    const invested = units * purchase.nav;
    const warnings: string[] = [];
    if (purchase.date !== input.purchaseDate) {
      warnings.push(
        `The purchase date had no published NAV. The NAV from ${purchase.date} was used.`,
      );
    }
    if (input.purchaseDate < history[0].date) {
      warnings.push(
        "The available history starts after the purchase date. The first available NAV was used for cost.",
      );
    }

    const cashFlows: XirrCashFlow[] = [
      { date: purchase.date, amount: -invested },
      { date: input.latestDate, amount: value },
    ];
    const result = xirr(cashFlows);

    return {
      id: input.id,
      fundCode: input.fundCode,
      fundName: input.fundName,
      category: input.category,
      planType: input.planType,
      mode: "units",
      ok: true,
      units,
      value,
      invested,
      latestNav: input.latestNav,
      latestDate: input.latestDate,
      xirr: result,
      warnings,
      cashFlows,
    };
  }

  const sip = generateSipContributions({
    amount: input.sipAmount,
    startDate: input.sipStartDate,
    frequency: input.sipFrequency,
    endDate: input.latestDate,
    history,
  });

  if (!sip.ok) return failedHolding(input, sip.reason);

  const value = sip.units * input.latestNav;
  const cashFlows: XirrCashFlow[] = [
    ...sip.contributions.map((contribution) => ({
      date: contribution.navDate,
      amount: -contribution.amount,
    })),
    { date: input.latestDate, amount: value },
  ];
  const result = xirr(cashFlows);

  return {
    id: input.id,
    fundCode: input.fundCode,
    fundName: input.fundName,
    category: input.category,
    planType: input.planType,
    mode: "sip",
    ok: true,
    units: sip.units,
    value,
    invested: sip.invested,
    latestNav: input.latestNav,
    latestDate: input.latestDate,
    xirr: result,
    warnings: sip.warnings,
    contributions: sip.contributions,
    cashFlows,
  };
}

function allocatePercentages(
  entries: Array<{ key: string; label: string; value: number }>,
  total: number,
): AllocationSlice[] {
  if (total <= 0) {
    return entries.map((entry) => ({ ...entry, pct: 0 }));
  }

  const raw = entries.map((entry) => ({
    ...entry,
    rawPct: (entry.value / total) * 100,
  }));
  const floorTenths = raw.map((entry) => Math.floor(entry.rawPct * 10));
  let remaining = 1000 - floorTenths.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((entry, index) => ({
      index,
      remainder: entry.rawPct * 10 - floorTenths[index],
    }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  const tenths = [...floorTenths];
  for (let i = 0; i < order.length && remaining > 0; i += 1) {
    tenths[order[i].index] += 1;
    remaining -= 1;
  }

  return raw.map((entry, index) => ({
    key: entry.key,
    label: entry.label,
    value: entry.value,
    pct: tenths[index] / 10,
  }));
}

export function buildAllocation(
  valuations: Array<{
    fundCode: number;
    fundName: string;
    category: HoldingEvaluation["category"];
    value: number;
  }>,
): AllocationResult {
  const total = valuations.reduce((sum, item) => sum + item.value, 0);
  const categoryTotals = new Map<string, number>();
  const fundTotals = new Map<
    number,
    { label: string; value: number }
  >();

  for (const item of valuations) {
    if (item.value <= 0) continue;
    categoryTotals.set(
      item.category,
      (categoryTotals.get(item.category) ?? 0) + item.value,
    );
    const existing = fundTotals.get(item.fundCode);
    fundTotals.set(item.fundCode, {
      label: item.fundName,
      value: (existing?.value ?? 0) + item.value,
    });
  }

  const categories = categoryOrder
    .filter((category) => (categoryTotals.get(category) ?? 0) > 0)
    .map((category) => ({
      key: category,
      label: categoryLabels[category],
      value: categoryTotals.get(category) ?? 0,
    }));

  const funds = [...fundTotals.entries()]
    .map(([code, item]) => ({
      key: String(code),
      label: item.label,
      value: item.value,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    total,
    byCategory: allocatePercentages(categories, total),
    byFund: allocatePercentages(funds, total),
  };
}

export function buildFlags(
  valuations: Array<{
    fundCode: number;
    fundName: string;
    category: HoldingEvaluation["category"];
    value: number;
  }>,
  allocation: AllocationResult,
): PortfolioFlag[] {
  const flags: PortfolioFlag[] = [];

  const topFund = allocation.byFund[0];
  if (topFund && topFund.pct >= concentrationThresholds.singleFundPct) {
    flags.push({
      id: `single-fund-${topFund.key}`,
      kind: "single-fund",
      tone: "watch",
      title: `One fund is ${topFund.pct.toFixed(1)}% of the portfolio`,
      detail: `${topFund.label} carries most of the value. If its strategy has a poor stretch, most of the portfolio feels it.`,
    });
  }

  for (const category of allocation.byCategory) {
    if (category.pct >= concentrationThresholds.categoryPct) {
      flags.push({
        id: `category-${category.key}`,
        kind: "category",
        tone: "watch",
        title: `${category.label} is ${category.pct.toFixed(1)}% of the portfolio`,
        detail: `Most of the value sits in one asset category. A shock to that category would reach nearly the whole portfolio.`,
      });
    }
  }

  const uniqueFundsByCategory = new Map<
    HoldingEvaluation["category"],
    Map<number, string>
  >();
  for (const item of valuations) {
    if (item.value <= 0) continue;
    const funds = uniqueFundsByCategory.get(item.category) ?? new Map();
    funds.set(item.fundCode, item.fundName);
    uniqueFundsByCategory.set(item.category, funds);
  }

  for (const [category, funds] of uniqueFundsByCategory) {
    if (funds.size >= concentrationThresholds.duplicateFundsInCategory) {
      const names = [...funds.values()].join(", ");
      flags.push({
        id: `duplicate-${category}`,
        kind: "duplicate-category",
        tone: "note",
        title: `${funds.size} funds share the ${categoryLabels[category]} category`,
        detail: `${names}. Different labels can still own similar companies or bonds. The factsheet holdings are the place to check what is duplicated.`,
      });
    }
  }

  return flags;
}

export function evaluatePortfolio(inputs: HoldingInput[]): PortfolioSummary {
  const holdings = inputs.map(evaluateHolding);
  const valid = holdings.filter(
    (holding): holding is HoldingEvaluation & { ok: true } => holding.ok,
  );
  const totalValue = valid.reduce((sum, holding) => sum + holding.value, 0);
  const totalInvested = valid.reduce((sum, holding) => sum + holding.invested, 0);
  const cashFlows = valid.flatMap((holding) => holding.cashFlows);
  const allocation = buildAllocation(valid);
  const portfolioXirr =
    totalValue > 0 && cashFlows.length >= 2
      ? xirr(cashFlows)
      : {
          rate: null,
          reason:
            holdings.length === 0
              ? "Add a holding to calculate XIRR."
              : valid.length === 0
                ? "No holding could be valued, so XIRR is not available. Check the holding errors below."
                : "There are not enough cash flows to calculate XIRR.",
        };

  return {
    holdings,
    totalValue,
    totalInvested,
    gain: totalValue - totalInvested,
    gainPct:
      totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : null,
    xirr: portfolioXirr,
    allocation,
    flags: buildFlags(valid, allocation),
    errorCount: holdings.length - valid.length,
  };
}
