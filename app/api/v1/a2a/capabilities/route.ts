import { NextResponse } from "next/server";
import { getAppMode } from "@/src/config";
import { MCP_TOOL_NAMES, toolCatalog } from "@/mcp/tools/catalog";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const mode = getAppMode();
  const mcp = toolCatalog(mode);
  const response = {
    service: { name: "Alibi", version: "0.7.0", role: "evidence infrastructure for prediction-market agents" },
    capability_status: "recorded_only" as const,
    data_modes: ["recorded", "live"],
    endpoints: [
      { method: "GET", path: "/api/v1/leaderboard", status: "recorded_only", pricing_class: "free", payment_required: false },
      { method: "GET", path: "/api/v1/wallet/{address}/metrics", status: "recorded_only", pricing_class: "free", payment_required: false },
      { method: "GET", path: "/api/v1/wallet/{address}/lead-rate", status: "recorded_only", pricing_class: "free", payment_required: false },
      {
        method: "POST",
        path: "/api/v1/screen",
        status: "recorded_only",
        pricing_class: "free_recorded_only",
        payment_required: false,
        input_schema: { wallets: "public EVM address[] (1–50)", window: "string", max_lead_rate: "number|null", min_coverage: "number|null", my_delay: "number|null", my_size_usd: "number|null", min_retained_return: "number|null", mode: "recorded|live" },
        output_schema: { kind: "screen", data_status: "recorded", metric_status: "unavailable", results: "array", limitations: "string[]" },
      },
      { method: "POST", path: "/api/v1/summary", status: "recorded_only", pricing_class: "free", payment_required: false },
      { method: "POST", path: "/api/v1/attribution", status: "recorded_only", pricing_class: "x402_when_billable", payment_required: "conditional" },
      { method: "POST", path: "/api/v1/assess", status: "unavailable", pricing_class: "not_available", payment_required: "not_verified" },
      { method: "POST", path: "/api/v1/market-screen", status: "unavailable", pricing_class: "not_available", payment_required: "not_verified" },
      { method: "GET", path: "/api/v1/evidence/{id}", status: "unavailable", pricing_class: "not_available", payment_required: "not_verified" },
    ],
    input_schemas: {
      wallet: "public EVM address",
      wallets: "public EVM address[]",
      market: "supported Polymarket market or event URL",
      policy: ["analysis window", "max_lead_rate", "min_coverage", "my_delay", "my_size_usd", "min_retained_return"],
    },
    output_schemas: ["summary JSON", "detail JSON", "recorded screen JSON", "audit JSON", "MCP tool result"],
    payment: { summary: "free", unattributed: "free", detail: "0.01 USDC when a billable result exists", network: "eip155:84532", scheme: "exact", settlement: "not_performed_in_local_demo" },
    mcp: {
      availability: "local_only",
      tools: mcp.map((entry) => ({
        name: entry.name,
        data_status: entry.data_status,
        availability: entry.data_status === "recorded" ? "recorded_only" : "not_verified",
        input_schema: null,
        output_schema: null,
        schema_note: "The current local MCP catalog does not expose JSON Schemas; no schema is invented here.",
        pricing_class: entry.name === "alibi_detail" ? "x402_when_billable" : "free_or_not_enabled",
      })),
      tool_count: MCP_TOOL_NAMES.length,
    },
    erc8004: { registration_status: "not_registered" },
    limitations: [
      "This capability document describes the current local surface; recorded_only is not live verification.",
      "Unimplemented assess, market-screen, and evidence detail routes remain unavailable and are not represented as ready.",
      "The local demo does not automatically trade, sign, custody wallets, or make investment recommendations.",
    ],
  };
  return NextResponse.json(response, { status: 200, headers: { "cache-control": "no-store" } });
}
