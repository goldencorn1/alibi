import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchJsonWithRetry, UpstreamHttpError } from "@/src/data/http";

afterEach(() => vi.unstubAllGlobals());

describe("bounded upstream HTTP adapter", () => {
  it("retries a 429 with Retry-After and returns the successful attempt", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      calls += 1;
      if (calls === 1) return new Response(JSON.stringify({ error: "rate limit" }), { status: 429, headers: { "retry-after": "0" } });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }));
    const result = await fetchJsonWithRetry<{ ok: boolean }>("https://example.invalid/fault", { source: "synthetic-fault", attempts: 2 });
    expect(result.data).toEqual({ ok: true });
    expect(result.sourceStatus.attempts).toBe(2);
    expect(calls).toBe(2);
  });

  it("returns a structured timeout/upstream error after the configured attempt limit", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new DOMException("timeout", "AbortError"); }));
    await expect(fetchJsonWithRetry("https://example.invalid/timeout", { source: "synthetic-timeout", attempts: 1 })).rejects.toMatchObject({ name: "UpstreamHttpError" } satisfies Partial<UpstreamHttpError>);
  });
});
