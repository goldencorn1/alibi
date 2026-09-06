import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as capabilitiesGet } from "@/app/api/v1/a2a/capabilities/route";
import { POST as screenPost } from "@/app/api/v1/screen/route";
import { RECORDED_LEADERBOARD } from "@/src/rankings/recorded-leaderboard";

const knownWallet = RECORDED_LEADERBOARD[0].wallet;
const unknownWallet = "0x1111111111111111111111111111111111111111";

describe("local A2A recorded surface", () => {
  it("screens multiple public addresses without inventing unavailable metrics", async () => {
    const request = new NextRequest("http://localhost/api/v1/screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallets: [knownWallet, unknownWallet], window: "30d", mode: "recorded" }),
    });
    const response = await screenPost(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ kind: "screen", data_status: "recorded", metric_status: "unavailable", payment: { payment_required: false, settlement: "not_performed" } });
    expect(body.results).toHaveLength(2);
    expect(body.results.every((row: { data_status: string; metric_status: string; lead_rate: null; coverage: null; eligible: null }) => row.data_status === "recorded" && row.metric_status === "unavailable" && row.lead_rate === null && row.coverage === null && row.eligible === null)).toBe(true);
    expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
  });

  it("fails closed for live screening without relabelling it recorded", async () => {
    const request = new NextRequest("http://localhost/api/v1/screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallets: [knownWallet], mode: "live" }),
    });
    const response = await screenPost(request);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "provider_unavailable", data_status: "live" } });
  });

  it("describes only the actual local MCP catalog and unimplemented capabilities honestly", async () => {
    const response = await capabilitiesGet();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ service: { name: "Alibi" }, capability_status: "recorded_only", erc8004: { registration_status: "not_registered" } });
    expect(body.endpoints.find((entry: { path: string }) => entry.path === "/api/v1/screen")).toMatchObject({ status: "recorded_only", pricing_class: "free_recorded_only" });
    expect(body.endpoints.filter((entry: { status: string }) => entry.status === "unavailable").length).toBeGreaterThanOrEqual(3);
    expect(body.mcp.tool_count).toBe(8);
    expect(body.mcp.tools).toHaveLength(8);
    expect(body.mcp.tools.every((tool: { input_schema: null; output_schema: null }) => tool.input_schema === null && tool.output_schema === null)).toBe(true);
  });
});
