import { z } from "zod";
import type {
  FundCategory,
  FundOption,
  PlanType,
} from "@/lib/fund-mapping";

export const searchQuerySchema = z
  .string()
  .trim()
  .min(2, "Use at least two characters")
  .max(80, "Keep the search under 80 characters")
  .transform((value) => value.replace(/\s+/g, " "));

export const schemeCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,9}$/, "A fund code is a number");

export const rawSearchItemSchema = z.object({
  schemeCode: z.number().int().positive(),
  schemeName: z.string().min(1),
});

export const rawSearchSchema = z.array(rawSearchItemSchema);

export const rawNavPointSchema = z.object({
  date: z.string(),
  nav: z.string(),
});

export const rawFundMetaSchema = z.object({
  fund_house: z.string().default(""),
  scheme_type: z.string().default(""),
  scheme_category: z.string().default(""),
  scheme_code: z.number().int().nonnegative(),
  scheme_name: z.string().default(""),
  isin_growth: z.string().nullable().optional(),
  isin_div_reinvestment: z.string().nullable().optional(),
});

export const rawFundSchema = z.object({
  meta: rawFundMetaSchema,
  data: z.array(rawNavPointSchema),
  status: z.string(),
});

export type RawSearchItem = z.infer<typeof rawSearchItemSchema>;
export type RawFund = z.infer<typeof rawFundSchema>;

export type FundSearchResult = {
  code: number;
  name: string;
  planType: PlanType;
  option: FundOption;
};

export type NavPoint = {
  date: string;
  nav: number;
};

export type FundDetail = {
  code: number;
  name: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  category: FundCategory;
  planType: PlanType;
  option: FundOption;
  latestNav: number;
  latestDate: string;
  history: NavPoint[];
};

export type ApiErrorCode =
  | "upstream_down"
  | "not_found"
  | "bad_input"
  | "rate_limited";

export type ApiErrorPayload = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    retryable: boolean;
  };
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, string | number>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorPayload;

export const errorMessages: Record<ApiErrorCode, string> = {
  upstream_down:
    "The public fund data service is not responding right now. Your portfolio is still safe on this device. Try again in a moment.",
  not_found:
    "We could not find a fund with that code. Check the code and try again.",
  bad_input:
    "That lookup does not look right. Check what you typed and try again.",
  rate_limited:
    "Too many lookups from this connection. Wait a minute, then try again.",
};

export function apiError(
  code: ApiErrorCode,
  message = errorMessages[code],
): ApiErrorPayload {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: code === "upstream_down" || code === "rate_limited",
    },
  };
}
