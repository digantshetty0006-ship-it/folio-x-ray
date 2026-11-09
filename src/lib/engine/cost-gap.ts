import { costGapDefaults } from "@/lib/config";
import type {
  CostGapProjection,
  CostGapResult,
  CostGapRow,
  HoldingEvaluation,
} from "./types";

export function projectCostGap(input: {
  value: number;
  assumedReturnPct: number;
  expenseGapPct: number;
  years: number;
}): CostGapProjection {
  const withoutGap =
    input.value *
    Math.pow(1 + input.assumedReturnPct / 100, input.years);
  const withGap =
    input.value *
    Math.pow(
      1 + (input.assumedReturnPct - input.expenseGapPct) / 100,
      input.years,
    );

  return {
    years: input.years,
    withoutGap,
    withGap,
    difference: withoutGap - withGap,
  };
}

/**
 * Illustrative projection of today's Regular-plan value at a chosen gross
 * return, once without an expense gap and once with it. The gap is not a TER
 * claim; the user supplies it.
 */
export function computeCostGap(
  holdings: HoldingEvaluation[],
  assumedReturnPct: number,
  expenseGapPct: number,
): CostGapResult {
  const regular = holdings.filter(
    (holding) => holding.ok && holding.planType === "regular" && holding.value > 0,
  );
  const safeReturn = Number.isFinite(assumedReturnPct) ? assumedReturnPct : 0;
  const safeGap = Number.isFinite(expenseGapPct) ? expenseGapPct : 0;

  const rows: CostGapRow[] = regular.map((holding) => ({
    holdingId: holding.id,
    fundCode: holding.fundCode,
    fundName: holding.fundName,
    value: holding.value,
    projections: costGapDefaults.horizonYears.map((years) =>
      projectCostGap({
        value: holding.value,
        assumedReturnPct: safeReturn,
        expenseGapPct: safeGap,
        years,
      }),
    ),
  }));

  const regularValue = regular.reduce((sum, holding) => sum + holding.value, 0);
  const totals = costGapDefaults.horizonYears.map((years) =>
    projectCostGap({
      value: regularValue,
      assumedReturnPct: safeReturn,
      expenseGapPct: safeGap,
      years,
    }),
  );

  return {
    hasRegular: regular.length > 0,
    regularValue,
    assumedReturnPct: safeReturn,
    expenseGapPct: safeGap,
    rows,
    totals,
  };
}
