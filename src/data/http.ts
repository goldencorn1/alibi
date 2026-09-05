import { DataSourceStatus } from "@/src/contracts";

export class UpstreamHttpError extends Error {
  constructor(
    message: string,
    public readonly source: DataSourceStatus,
    public readonly responseBody: unknown = null,
  ) {
    super(message);
    this.name = "UpstreamHttpError";
  }
}

export interface FetchJsonOptions {
  source: string;
  timeoutMs?: number;
  attempts?: number;
  headers?: HeadersInit;
}

export interface FetchJsonResult<T> {
  data: T;
  sourceStatus: DataSourceStatus;
}

function errorCodeForStatus(status: number | null): "rate_limited" | "upstream_unavailable" {
  return status === 429 ? "rate_limited" : "upstream_unavailable";
}

export async function fetchJsonWithRetry<T>(url: string, options: FetchJsonOptions): Promise<FetchJsonResult<T>> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const attempts = Math.max(1, Math.min(options.attempts ?? 3, 3));
  let lastError: UpstreamHttpError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response | null = null;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json", ...(options.headers ?? {}) },
        signal: controller.signal,
        cache: "no-store",
      });
      const text = await response.text();
      let body: unknown = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text.slice(0, 1000);
      }
      const baseStatus: DataSourceStatus = {
        source: options.source,
        source_url: url,
        data_status: "live",
        retrieved_at: new Date().toISOString(),
        http_status: response.status,
        attempts: attempt,
        retryable: response.status === 429 || response.status >= 500,
      };
      if (!response.ok) {
        const code = errorCodeForStatus(response.status);
        lastError = new UpstreamHttpError(`${options.source} returned HTTP ${response.status}.`, { ...baseStatus, error_code: code }, body);
        if (!baseStatus.retryable || attempt === attempts) throw lastError;
        await backoff(attempt, response.headers.get("retry-after"));
        continue;
      }
      return { data: body as T, sourceStatus: baseStatus };
    } catch (error) {
      if (error instanceof UpstreamHttpError) {
        lastError = error;
        if (attempt === attempts || !error.source.retryable) throw error;
        await backoff(attempt, null);
        continue;
      }
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      const baseStatus: DataSourceStatus = {
        source: options.source,
        source_url: url,
        data_status: "live",
        retrieved_at: new Date().toISOString(),
        http_status: response?.status ?? null,
        attempts: attempt,
        retryable: true,
        error_code: "upstream_unavailable",
      };
      lastError = new UpstreamHttpError(timedOut ? `${options.source} timed out.` : `${options.source} is unavailable.`, baseStatus);
      if (attempt === attempts) throw lastError;
      await backoff(attempt, null);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("Unexpected upstream error.");
}

async function backoff(attempt: number, retryAfter: string | null): Promise<void> {
  const parsed = retryAfter ? Number(retryAfter) : Number.NaN;
  const delay = Number.isFinite(parsed) ? Math.min(parsed * 1000, 30_000) : Math.min(1000 * 2 ** (attempt - 1), 30_000);
  await new Promise((resolve) => setTimeout(resolve, delay));
}
