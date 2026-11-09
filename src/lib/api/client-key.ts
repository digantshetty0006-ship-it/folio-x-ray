import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/** We only keep a short, non-reversible hash in memory, never a raw IP. */
export function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 20);
}
