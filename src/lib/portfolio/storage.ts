import { z } from "zod";
import type { FundCategory, FundOption, PlanType } from "@/lib/fund-mapping";
import type { SipFrequency } from "@/lib/engine/types";

export const STORAGE_KEY = "folio-xray.portfolio.v1";
export const REMEMBER_KEY = "folio-xray.remember.v1";

const categorySchema = z.enum([
  "equity",
  "debt",
  "hybrid",
  "gold-and-other",
]) satisfies z.ZodType<FundCategory>;

const planSchema = z.enum(["direct", "regular"]) satisfies z.ZodType<PlanType>;
const optionSchema = z.enum(["growth", "idcw", "other"]) satisfies z.ZodType<FundOption>;
const frequencySchema = z.enum([
  "monthly",
  "weekly",
  "quarterly",
]) satisfies z.ZodType<SipFrequency>;

export const storedHoldingSchema = z.object({
  id: z.string().min(1),
  fundCode: z.number().int().positive(),
  fundName: z.string().min(1),
  fundHouse: z.string(),
  category: categorySchema,
  planType: planSchema,
  option: optionSchema,
  mode: z.enum(["units", "sip"]),
  units: z.number().positive().optional(),
  purchaseDate: z.string().optional(),
  sipAmount: z.number().positive().optional(),
  sipStartDate: z.string().optional(),
  sipFrequency: frequencySchema.optional(),
});

export const storedPortfolioSchema = z.object({
  version: z.literal(1),
  holdings: z.array(storedHoldingSchema),
});

export type StoredHolding = z.infer<typeof storedHoldingSchema>;

export function readStoredPortfolio(): StoredHolding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = storedPortfolioSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.holdings : [];
  } catch {
    return [];
  }
}

export function writeStoredPortfolio(holdings: StoredHolding[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, holdings }),
    );
    window.localStorage.setItem(REMEMBER_KEY, "1");
  } catch {
    // Storage can be full or disabled. The tool still works in memory.
  }
}

export function clearStoredPortfolio(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // Nothing useful to do if storage is unavailable.
  }
}

export function readRememberPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    return false;
  }
}
