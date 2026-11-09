import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/lib/config";
import { clientKey } from "@/lib/api/client-key";
import { searchFunds } from "@/lib/api/mfapi";
import { checkRateLimit } from "@/lib/api/rate-limit";
import {
  apiError,
  errorMessages,
  searchQuerySchema,
  type ApiResponse,
  type FundSearchResult,
} from "@/lib/api/schemas";

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const parsed = searchQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      apiError(
        "bad_input",
        parsed.error.issues[0]?.message
          ? `${parsed.error.issues[0].message}. Try again.`
          : errorMessages.bad_input,
      ),
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const limit = checkRateLimit(
    clientKey(request),
    Date.now(),
    apiConfig.rateLimit.maxRequests,
    apiConfig.rateLimit.windowMs,
  );

  if (!limit.allowed) {
    return NextResponse.json<ApiResponse<never>>(apiError("rate_limited"), {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(limit.retryAfterSeconds),
        "X-RateLimit-Limit": String(apiConfig.rateLimit.maxRequests),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  try {
    const results = await searchFunds(parsed.data);
    return NextResponse.json<ApiResponse<FundSearchResult[]>>(
      {
        ok: true,
        data: results,
        meta: { query: parsed.data, count: results.length },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          "X-RateLimit-Limit": String(apiConfig.rateLimit.maxRequests),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch {
    return NextResponse.json<ApiResponse<never>>(apiError("upstream_down"), {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
