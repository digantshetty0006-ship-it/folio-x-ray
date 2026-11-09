import type { FundDetail } from "@/lib/api/schemas";
import type {
  HoldingInput,
  SipFrequency,
} from "@/lib/engine/types";
import type { StoredHolding } from "./storage";

export type ToolHolding = {
  id: string;
  fund: FundDetail;
  mode: "units" | "sip";
  units?: number;
  purchaseDate?: string;
  sipAmount?: number;
  sipStartDate?: string;
  sipFrequency?: SipFrequency;
};

export function newHoldingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `holding-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function toEngineHolding(holding: ToolHolding): HoldingInput {
  const base = {
    id: holding.id,
    fundCode: holding.fund.code,
    fundName: holding.fund.name,
    category: holding.fund.category,
    planType: holding.fund.planType,
    latestNav: holding.fund.latestNav,
    latestDate: holding.fund.latestDate,
    history: holding.fund.history,
  };

  if (holding.mode === "units") {
    return {
      ...base,
      mode: "units",
      units: holding.units ?? 0,
      purchaseDate: holding.purchaseDate ?? "",
    };
  }

  return {
    ...base,
    mode: "sip",
    sipAmount: holding.sipAmount ?? 0,
    sipStartDate: holding.sipStartDate ?? "",
    sipFrequency: holding.sipFrequency ?? "monthly",
  };
}

export function toStoredHolding(holding: ToolHolding): StoredHolding {
  return {
    id: holding.id,
    fundCode: holding.fund.code,
    fundName: holding.fund.name,
    fundHouse: holding.fund.fundHouse,
    category: holding.fund.category,
    planType: holding.fund.planType,
    option: holding.fund.option,
    mode: holding.mode,
    units: holding.units,
    purchaseDate: holding.purchaseDate,
    sipAmount: holding.sipAmount,
    sipStartDate: holding.sipStartDate,
    sipFrequency: holding.sipFrequency,
  };
}

export function fromStoredHolding(
  stored: StoredHolding,
  fund: FundDetail,
): ToolHolding | null {
  if (stored.mode === "units") {
    if (!stored.units || !stored.purchaseDate) return null;
    return {
      id: stored.id,
      fund,
      mode: "units",
      units: stored.units,
      purchaseDate: stored.purchaseDate,
    };
  }

  if (!stored.sipAmount || !stored.sipStartDate) return null;
  return {
    id: stored.id,
    fund,
    mode: "sip",
    sipAmount: stored.sipAmount,
    sipStartDate: stored.sipStartDate,
    sipFrequency: stored.sipFrequency ?? "monthly",
  };
}
