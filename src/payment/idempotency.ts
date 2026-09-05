import { NextRequest, NextResponse } from "next/server";
import { DataStatus, errorResponse } from "@/src/contracts";

const MAX_ENTRIES = 256;
const TTL_MS = 10 * 60 * 1000;

interface ResponseSnapshot {
  body: string;
  status: number;
  headers: Array<[string, string]>;
}

interface CacheEntry {
  fingerprint: string;
  expires_at: number;
  response: Promise<ResponseSnapshot>;
}

const cache = new Map<string, CacheEntry>();

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

async function requestFingerprint(request: Request, routeFamily: string): Promise<string> {
  const text = await request.clone().text();
  let body: unknown = text;
  try { body = text ? JSON.parse(text) : null; } catch { /* retain opaque non-JSON body */ }
  return `${routeFamily}|${request.headers.get("x-alibi-mode") ?? "recorded"}|${request.headers.get("x-alibi-input") ?? ""}|${stable(body)}`;
}

function statusForRequest(request: Request): DataStatus {
  return request.headers.get("x-alibi-mode") === "live" ? "live" : "recorded";
}

async function snapshot(response: Response): Promise<ResponseSnapshot> {
  const headers: Array<[string, string]> = [];
  response.headers.forEach((value, key) => {
    if (["payment-signature", "x-payment", "authorization", "set-cookie"].includes(key.toLowerCase())) return;
    headers.push([key, value]);
  });
  return { body: await response.clone().text(), status: response.status, headers };
}

function replay(value: ResponseSnapshot): NextResponse {
  return new NextResponse(value.body, { status: value.status, headers: value.headers });
}

function prune(now: number): void {
  for (const [key, entry] of cache) if (entry.expires_at <= now) cache.delete(key);
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
}

export async function withPaymentIdempotency(
  request: NextRequest,
  routeFamily: string,
  handler: (request: NextRequest) => Promise<Response>,
): Promise<NextResponse | Response> {
  const identifier = request.headers.get("PAYMENT-IDENTIFIER")?.trim();
  if (!identifier) return handler(request);
  if (identifier.length > 256) return replay(await snapshot(errorResponse("payment_invalid", "PAYMENT-IDENTIFIER is too long.", statusForRequest(request), false, 409)));
  const now = Date.now();
  prune(now);
  const fingerprint = await requestFingerprint(request, routeFamily);
  const key = `${routeFamily}|${identifier}`;
  const existing = cache.get(key);
  if (existing && existing.expires_at > now) {
    if (existing.fingerprint !== fingerprint) return replay(await snapshot(errorResponse("payment_invalid", "PAYMENT-IDENTIFIER was reused with a different request.", statusForRequest(request), false, 409)));
    return replay(await existing.response);
  }
  const responsePromise = handler(request).then(async (response) => {
    const value = await snapshot(response);
    // A 402 challenge must not pin the identifier: the client may retry the same
    // request with a valid PAYMENT-SIGNATURE after receiving the challenge.
    if (value.status === 402) cache.delete(key);
    return value;
  }).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { fingerprint, expires_at: now + TTL_MS, response: responsePromise });
  return replay(await responsePromise);
}

export function resetPaymentIdempotencyForTests(): void {
  cache.clear();
}
