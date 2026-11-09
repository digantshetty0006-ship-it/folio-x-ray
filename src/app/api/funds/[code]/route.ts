import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/lib/config";
import { clientKey } from "@/lib/api/client-key";
import { FundDataError, getFund } from "@/lib/api/mfapi";
import { checkRateLimit } from "@/lib/api/rate-limit";
import {
  apiError,
  errorMessages,
  schemeCodeSchema,
  type ApiResponse,
  type FundDetail,
} from "@/lib/api/schemas";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params;
  const parsed = schemeCodeSchema.safeParse(rawCode);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(apiError("bad_input"), {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
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
    const fund = await getFund(Number(parsed.data));
    return NextResponse.json<ApiResponse<FundDetail>>(
      { ok: true, data: fund },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
          "X-RateLimit-Limit": String(apiConfig.rateLimit.maxRequests),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof FundDataError && error.code === "not_found") {
      return NextResponse.json<ApiResponse<never>>(
        apiError("not_found", errorMessages.not_found),
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json<ApiResponse<never>>(apiError("upstream_down"), {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
