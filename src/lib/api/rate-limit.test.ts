import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitsForTests } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimitsForTests());

  it("allows requests up to the limit and blocks the next one", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit("key", now, 3, 60_000).allowed).toBe(true);
    }
    const blocked = checkRateLimit("key", now, 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);
  });

  it("resets after the window", () => {
    const now = 1_000_000;
    expect(checkRateLimit("key", now, 1, 1_000).allowed).toBe(true);
    expect(checkRateLimit("key", now + 500, 1, 1_000).allowed).toBe(false);
    expect(checkRateLimit("key", now + 1_001, 1, 1_000).allowed).toBe(true);
  });
});
