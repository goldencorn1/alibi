import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { LOGICAL_AGENT_IDS } from "@/src/contracts";

vi.mock("@x402/next", () => ({ withX402: (handler: unknown) => handler }));

import { POST as summaryPost } from "@/app/summary/route";
import { POST as attributionPost } from "@/app/attribution/route";
import { GET as auditGet } from "@/app/audit/route";

describe("Audit & Report Agent integration", () => {
  it("records a recorded summary run, exposes all logical workers, and exports Markdown", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
    vi.stubEnv("X402_NETWORK", "");
    const summaryRequest = new NextRequest("http://localhost/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615", mode: "recorded" }),
    });
    const summaryResponse = await summaryPost(summaryRequest);
    expect(summaryResponse.status).toBe(200);
    const summary = await summaryResponse.json();
    const runId = summary.meta.run_id as string;
    expect(runId).toMatch(/^[0-9a-f-]{36}$/i);

    const auditResponse = await auditGet(new NextRequest(`http://localhost/audit?run_id=${runId}`));
    expect(auditResponse.status).toBe(200);
    const report = await auditResponse.json();
    expect(report.kind).toBe("audit");
    expect(report.meta.data_status).toBe("recorded");
    expect(report.workers.map((worker: { agent_id: string }) => worker.agent_id)).toEqual([...LOGICAL_AGENT_IDS]);
    expect(report.workers.find((worker: { agent_id: string }) => worker.agent_id === "payment").status).toBe("skipped");
    expect(JSON.stringify(report)).not.toContain("PAYMENT-SIGNATURE");

    const markdownResponse = await auditGet(new NextRequest(`http://localhost/audit?run_id=${runId}&format=markdown`));
    expect(markdownResponse.status).toBe(200);
    expect(markdownResponse.headers.get("content-type")).toContain("text/markdown");
    await expect(markdownResponse.text()).resolves.toContain("# Alibi Audit & Report");
  });

  it("records a free unattributed detail result without persisting a payment challenge", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
    vi.stubEnv("X402_NETWORK", "");
    const summaryRequest = new NextRequest("http://localhost/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "0x674887d1ac838099a48b629dff53f25b7b87ee08", mode: "recorded" }),
    });
    const summaryResponse = await summaryPost(summaryRequest);
    const runId = ((await summaryResponse.json()) as { meta: { run_id: string } }).meta.run_id;
    const challengeResponse = await attributionPost(new NextRequest("http://localhost/attribution", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-alibi-input": "0x674887d1ac838099a48b629dff53f25b7b87ee08",
        "x-alibi-mode": "recorded",
        "x-alibi-run-id": runId,
      },
      body: JSON.stringify({ input: "0x674887d1ac838099a48b629dff53f25b7b87ee08", mode: "recorded" }),
    }));
    expect(challengeResponse.status).toBe(200);
    const detail = await challengeResponse.json();
    expect(detail.paid_access.access).toBe("free_unattributed");
    const reportResponse = await auditGet(new NextRequest(`http://localhost/audit?run_id=${runId}`));
    const report = await reportResponse.json();
    const paymentWorker = report.workers.find((worker: { agent_id: string }) => worker.agent_id === "payment");
    expect(paymentWorker.status).toBe("ok");
    expect(paymentWorker.policy_flags).toContain("unattributed");
    expect(JSON.stringify(report)).not.toContain("PAYMENT-REQUIRED");
    expect(JSON.stringify(report)).not.toContain("PAYMENT-SIGNATURE");
  });
});
