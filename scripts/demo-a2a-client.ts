import { decodePaymentRequiredHeader } from "@x402/core/http";

type Json = Record<string, unknown>;
type CallResult = { status: number; body: unknown; payment_challenge: Json | null };

const baseUrl = (process.env.ALIBI_DEMO_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

function challengeSummary(header: string | null): Json | null {
  if (!header) return null;
  try {
    const decoded = decodePaymentRequiredHeader(header) as unknown as Json;
    const accepts = Array.isArray(decoded.accepts) ? decoded.accepts : [];
    const first = (accepts[0] ?? {}) as Json;
    return {
      received: true,
      x402Version: decoded.x402Version ?? null,
      scheme: first.scheme ?? null,
      network: first.network ?? null,
      asset: first.asset ?? null,
      amount: first.amount ?? null,
      payTo: first.payTo ?? null,
      resource: first.resource ?? null,
      settlement: "not_performed",
    };
  } catch {
    return { received: true, parseable: false, settlement: "not_performed" };
  }
}

async function call(path: string, init?: RequestInit): Promise<CallResult> {
  const response = await fetch(baseUrl + path, {
    ...init,
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = { parse_error: true };
  }
  return { status: response.status, body, payment_challenge: challengeSummary(response.headers.get("PAYMENT-REQUIRED")) };
}

function asObject(value: unknown): Json {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
}

async function main() {
  const capabilities = await call("/api/v1/a2a/capabilities");
  const leaderboard = await call("/api/v1/leaderboard");
  const rows: unknown[] = Array.isArray(asObject(leaderboard.body).rows) ? asObject(leaderboard.body).rows as unknown[] : [];
  const wallets = rows.slice(0, 20).map((row) => asObject(row).wallet).filter((wallet): wallet is string => typeof wallet === "string");
  if (wallets.length === 0) throw new Error("Recorded leaderboard did not return a public wallet address.");
  const wallet = wallets[0];

  const metrics = await call(`/api/v1/wallet/${encodeURIComponent(wallet)}/metrics`);
  const leadRate = await call(`/api/v1/wallet/${encodeURIComponent(wallet)}/lead-rate`);
  const screen = await call("/api/v1/screen", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      wallets,
      window: "30d",
      max_lead_rate: 0.5,
      min_coverage: 0.4,
      my_delay: 0,
      my_size_usd: 1000,
      min_retained_return: 0.1,
      mode: "recorded",
    }),
  });

  const output = {
    service: "Alibi",
    caller_agent: "demo-a2a-client",
    base_url: baseUrl,
    data_status: "recorded",
    endpoints: { capabilities, leaderboard, wallet_metrics: metrics, wallet_lead_rate: leadRate, screen },
    wallets_requested: wallets.length,
    limitations: [
      "This client performs read-only local recorded requests.",
      "No payment, signing, chain transaction, wallet custody, or investment recommendation is performed.",
      "A payment challenge, if returned by a tested endpoint, is decoded for display only and is never settled.",
    ],
  };
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ status: "failed", error: error instanceof Error ? error.message : "unknown" }));
  process.exitCode = 1;
});
