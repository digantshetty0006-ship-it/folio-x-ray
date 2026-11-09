import type { FundCategory, PlanType } from "@/lib/fund-mapping";

export type SipFrequency = "monthly" | "weekly" | "quarterly";

export type NavPoint = {
  date: string;
  nav: number;
};

export type HoldingBase = {
  id: string;
  fundCode: number;
  fundName: string;
  category: FundCategory;
  planType: PlanType;
  latestNav: number;
  latestDate: string;
  history: NavPoint[];
};

export type UnitsHoldingInput = HoldingBase & {
  mode: "units";
  units: number;
  purchaseDate: string;
};

export type SipHoldingInput = HoldingBase & {
  mode: "sip";
  sipAmount: number;
  sipStartDate: string;
  sipFrequency: SipFrequency;
};

export type HoldingInput = UnitsHoldingInput | SipHoldingInput;

export type XirrCashFlow = {
  date: string;
  amount: number;
};

export type XirrResult = {
  rate: number | null;
  reason?: string;
  method?: "newton" | "bisection";
  iterations?: number;
};

export type SipContribution = {
  scheduledDate: string;
  navDate: string;
  amount: number;
  nav: number;
  units: number;
};

export type SipResult =
  | {
      ok: true;
      contributions: SipContribution[];
      invested: number;
      units: number;
      warnings: string[];
    }
  | {
      ok: false;
      reason: string;
      warnings: string[];
    };

export type HoldingEvaluation = {
  id: string;
  fundCode: number;
  fundName: string;
  category: FundCategory;
  planType: PlanType;
  mode: "units" | "sip";
  ok: boolean;
  error?: string;
  units: number;
  value: number;
  invested: number;
  latestNav: number;
  latestDate: string;
  xirr: XirrResult;
  warnings: string[];
  contributions?: SipContribution[];
  cashFlows: XirrCashFlow[];
};

export type AllocationSlice = {
  key: string;
  label: string;
  value: number;
  pct: number;
};

export type AllocationResult = {
  total: number;
  byCategory: AllocationSlice[];
  byFund: AllocationSlice[];
};

export type PortfolioFlag = {
  id: string;
  kind: "single-fund" | "category" | "duplicate-category";
  tone: "note" | "watch";
  title: string;
  detail: string;
};

export type PortfolioSummary = {
  holdings: HoldingEvaluation[];
  totalValue: number;
  totalInvested: number;
  gain: number;
  gainPct: number | null;
  xirr: XirrResult;
  allocation: AllocationResult;
  flags: PortfolioFlag[];
  errorCount: number;
};

export type CostGapProjection = {
  years: number;
  withoutGap: number;
  withGap: number;
  difference: number;
};

export type CostGapRow = {
  holdingId: string;
  fundCode: number;
  fundName: string;
  value: number;
  projections: CostGapProjection[];
};

export type CostGapResult = {
  hasRegular: boolean;
  regularValue: number;
  assumedReturnPct: number;
  expenseGapPct: number;
  rows: CostGapRow[];
  totals: CostGapProjection[];
};

export type RiskAllocation = {
  equity: number;
  debt: number;
  other: number;
};

export type RiskMirrorResult =
  | {
      ok: true;
      current: RiskAllocation;
      headline: string;
      notes: string[];
    }
  | {
      ok: false;
      reason: string;
    };

export type MonteCarloInput = {
  initialValue: number;
  monthlySip: number;
  years: number;
  stepUpPct: number;
  expectedReturnPct: number;
  volatilityPct: number;
  inflationPct: number;
  goalToday: number;
  seed?: number;
  runs?: number;
};

export type MonteCarloResult = {
  runs: number;
  seed: number;
  months: number;
  goalToday: number;
  goalAtHorizon: number;
  probabilityPct: number;
  finalPercentiles: {
    p10: number;
    p50: number;
    p90: number;
  };
  paths: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  assumptions: MonteCarloInput;
};
