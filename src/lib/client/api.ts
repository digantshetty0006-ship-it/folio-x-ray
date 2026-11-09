import type {
  FundDetail,
  FundSearchResult,
} from "@/lib/api/schemas";

export class ClientApiError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "upstream_down"
      | "not_found"
      | "bad_input"
      | "rate_limited"
      | "network",
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ClientApiError(
      "The server sent a response we could not read. Try again.",
      "upstream_down",
      true,
    );
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "ok" in payload &&
    (payload as { ok: unknown }).ok === false
  ) {
    const error = (payload as {
      error?: { code?: string; message?: string; retryable?: boolean };
    }).error;
    const code =
      error?.code === "not_found" ||
      error?.code === "bad_input" ||
      error?.code === "rate_limited" ||
      error?.code === "upstream_down"
        ? error.code
        : "upstream_down";
    throw new ClientApiError(
      error?.message || "That lookup did not work. Try again.",
      code,
      Boolean(error?.retryable),
    );
  }

  if (!response.ok) {
    throw new ClientApiError(
      "The fund lookup did not work. Try again.",
      "upstream_down",
      true,
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("ok" in payload) ||
    (payload as { ok: unknown }).ok !== true
  ) {
    throw new ClientApiError(
      "The server sent an unexpected response. Try again.",
      "upstream_down",
      true,
    );
  }

  return (payload as unknown as { data: T }).data;
}

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ClientApiError(
      "The connection dropped before the fund data arrived. Check your network and try again.",
      "network",
      true,
    );
  }
  return readResponse<T>(response);
}

export function searchFundsClient(
  query: string,
  signal?: AbortSignal,
): Promise<FundSearchResult[]> {
  return request<FundSearchResult[]>(
    `/api/funds/search?q=${encodeURIComponent(query)}`,
    signal,
  );
}

export function getFundClient(
  code: number,
  signal?: AbortSignal,
): Promise<FundDetail> {
  return request<FundDetail>(`/api/funds/${code}`, signal);
}
