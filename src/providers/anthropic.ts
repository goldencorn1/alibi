import Anthropic from "@anthropic-ai/sdk";
import { RepricingWindow, Evidence, AttributionStatus, clampConfidence } from "@/src/contracts";
import { canSpend, recordSpend } from "@/src/budget";
import { getAnthropicModel, hasAnthropicCredentials } from "@/src/config";

export interface AttributionProviderRequest {
  window: RepricingWindow;
  evidence: Evidence[];
}

export interface AttributionDecision {
  status: AttributionStatus;
  evidence_ids: string[];
  confidence: number | null;
  explanation: string;
  limitation: string;
}

export interface AttributionProviderResult {
  ok: boolean;
  decision: AttributionDecision | null;
  provider: "anthropic";
  verified: boolean;
  error_code?: "credentials_missing" | "budget_exceeded" | "timeout" | "rate_limited" | "invalid_output" | "upstream_unavailable";
  estimated_cost_usd: number;
}

export const ANTHROPIC_ATTRIBUTION_SCHEMA = {
  status: ["information_consistent", "capital_consistent", "unattributed"],
  evidence_ids: "array of IDs drawn only from supplied evidence",
  confidence: "number from 0 to 1 or null",
  explanation: "one conservative sentence",
  limitation: "one limitation sentence",
};

export async function requestAnthropicAttribution(request: AttributionProviderRequest): Promise<AttributionProviderResult> {
  if (!hasAnthropicCredentials()) return unavailable("credentials_missing");
  const estimatedCost = 0.01;
  if (!canSpend(estimatedCost)) return unavailable("budget_exceeded");
  let lastError: AttributionProviderResult["error_code"] = "upstream_unavailable";
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 12_000, maxRetries: 0 });
      const response = await client.messages.create({
        model: getAnthropicModel(),
        max_tokens: 350,
        temperature: 0,
        system: "You classify evidence against a price window. Never infer identity, causality, insider trading, or a guaranteed information advantage. Use only evidence_ids supplied by the caller. Return JSON only.",
        messages: [{ role: "user", content: JSON.stringify({ output_schema: ANTHROPIC_ATTRIBUTION_SCHEMA, window: request.window, evidence: request.evidence }) }],
      });
      recordSpend(estimatedCost, { provider: "anthropic", purpose: "evidence-repricing-attribution", request_count: attempt });
      const text = response.content.find((block) => block.type === "text")?.text ?? "";
      const decision = parseAttributionDecision(text, request.evidence.map((item) => item.id));
      if (!decision) return { ok: false, decision: null, provider: "anthropic", verified: false, error_code: "invalid_output", estimated_cost_usd: estimatedCost };
      return { ok: true, decision, provider: "anthropic", verified: true, estimated_cost_usd: estimatedCost };
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      lastError = name.includes("Timeout") || message.includes("timeout") ? "timeout" : message.includes("429") ? "rate_limited" : /\b5\d\d\b/.test(message) ? "upstream_unavailable" : "upstream_unavailable";
      if (attempt < 2) continue;
    }
  }
  return { ok: false, decision: null, provider: "anthropic", verified: false, error_code: lastError, estimated_cost_usd: 0 };
}

export function parseAttributionDecision(text: string, allowedEvidenceIds: string[]): AttributionDecision | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const status = parsed.status;
    if (status !== "information_consistent" && status !== "capital_consistent" && status !== "unattributed") return null;
    const evidenceIds = Array.isArray(parsed.evidence_ids) ? parsed.evidence_ids.filter((value): value is string => typeof value === "string" && allowedEvidenceIds.includes(value)) : [];
    const confidence = parsed.confidence === null ? null : clampConfidence(typeof parsed.confidence === "number" ? parsed.confidence : null);
    const explanation = typeof parsed.explanation === "string" ? parsed.explanation.slice(0, 500) : "No explanation supplied.";
    const limitation = typeof parsed.limitation === "string" ? parsed.limitation.slice(0, 500) : "Confidence is not causal probability.";
    return { status: evidenceIds.length === 0 ? "unattributed" : status, evidence_ids: evidenceIds, confidence, explanation, limitation };
  } catch {
    return null;
  }
}

function unavailable(error_code: AttributionProviderResult["error_code"]): AttributionProviderResult {
  return { ok: false, decision: null, provider: "anthropic", verified: false, error_code, estimated_cost_usd: 0 };
}
