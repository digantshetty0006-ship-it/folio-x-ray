import { apiConfig } from "@/lib/config";
import {
  deriveCategory,
  deriveOption,
  derivePlanType,
} from "@/lib/fund-mapping";
import { parseApiDate, toIsoDate } from "@/lib/format";
import {
  rawFundSchema,
  rawSearchSchema,
  type FundDetail,
  type FundSearchResult,
  type NavPoint,
} from "./schemas";

export class FundDataError extends Error {
  constructor(
    public readonly code: "upstream_down" | "not_found",
    message: string,
  ) {
    super(message);
    this.name = "FundDataError";
  }
}

async function fetchMfApi(
  path: string,
  revalidateSeconds: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    return await fetch(`${apiConfig.baseUrl}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: revalidateSeconds },
    });
  } catch {
    throw new FundDataError(
      "upstream_down",
      "The public fund data service timed out or could not be reached.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new FundDataError(
      "upstream_down",
      "The public fund data service returned an unreadable response.",
    );
  }
}

export async function searchFunds(query: string): Promise<FundSearchResult[]> {
  const response = await fetchMfApi(
    `/mf/search?q=${encodeURIComponent(query)}`,
    apiConfig.searchRevalidateSeconds,
  );

  if (!response.ok) {
    throw new FundDataError(
      "upstream_down",
      `The fund search service returned ${response.status}.`,
    );
  }

  const parsed = rawSearchSchema.safeParse(await readJson(response));
  if (!parsed.success) {
    throw new FundDataError(
      "upstream_down",
      "The fund search service returned an unexpected format.",
    );
  }

  const seen = new Set<number>();
  const results: FundSearchResult[] = [];

  for (const item of parsed.data) {
    if (seen.has(item.schemeCode)) continue;
    seen.add(item.schemeCode);
    results.push({
      code: item.schemeCode,
      name: item.schemeName,
      planType: derivePlanType(item.schemeName),
      option: deriveOption(item.schemeName),
    });
    if (results.length >= 20) break;
  }

  return results;
}

function parseHistory(
  points: Array<{ date: string; nav: string }>,
): NavPoint[] {
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - apiConfig.historyYears);
  const cutoffIso = toIsoDate(cutoff);
  const deduped = new Map<string, number>();

  for (const point of points) {
    const parsedDate = parseApiDate(point.date);
    const nav = Number(point.nav);
    if (!parsedDate || !Number.isFinite(nav) || nav <= 0) continue;
    const iso = toIsoDate(parsedDate);
    if (iso < cutoffIso) continue;
    deduped.set(iso, nav);
  }

  return [...deduped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, nav]) => ({ date, nav }));
}

export async function getFund(code: number): Promise<FundDetail> {
  const response = await fetchMfApi(
    `/mf/${code}`,
    apiConfig.detailRevalidateSeconds,
  );

  if (response.status === 404) {
    throw new FundDataError("not_found", "No fund exists with that code.");
  }

  if (!response.ok) {
    throw new FundDataError(
      "upstream_down",
      `The fund data service returned ${response.status}.`,
    );
  }

  const parsed = rawFundSchema.safeParse(await readJson(response));
  if (!parsed.success) {
    throw new FundDataError(
      "upstream_down",
      "The fund data service returned an unexpected format.",
    );
  }

  const { meta, data, status } = parsed.data;
  if (
    status.toUpperCase() !== "SUCCESS" ||
    meta.scheme_code === 0 ||
    data.length === 0
  ) {
    throw new FundDataError("not_found", "No fund exists with that code.");
  }

  const history = parseHistory(data);
  const latest = history.at(-1);
  if (!latest) {
    throw new FundDataError(
      "not_found",
      "This fund has no usable NAV history right now.",
    );
  }

  return {
    code: meta.scheme_code,
    name: meta.scheme_name || `Fund ${code}`,
    fundHouse: meta.fund_house,
    schemeType: meta.scheme_type,
    schemeCategory: meta.scheme_category,
    category: deriveCategory(meta.scheme_category),
    planType: derivePlanType(meta.scheme_name),
    option: deriveOption(meta.scheme_name),
    latestNav: latest.nav,
    latestDate: latest.date,
    history,
  };
}
