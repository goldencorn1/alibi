import { Evidence, RepricingWindow } from "@/src/contracts";
import { requestAnthropicAttribution } from "@/src/providers/anthropic";
import { validateEvidence } from "@/src/data/evidence";

export interface AttributionRun {
  windows: RepricingWindow[];
  evidence: Evidence[];
  provider: "anthropic" | "none";
  verified: boolean;
  limitations: string[];
}

export async function attributeWindows(windows: RepricingWindow[], evidence: Evidence[]): Promise<AttributionRun> {
  const validation = validateEvidence(evidence);
  const limitations = validation.rejected.map((item) => `Evidence ${item.id} rejected: ${item.reason}`);
  if (validation.valid.length === 0) {
    return { windows: windows.map((window) => ({ ...window, attribution_status: "unattributed", evidence_ids: [], confidence: null })), evidence, provider: "none", verified: false, limitations: [...limitations, "没有带可验证发布时间的合格来源，标记为 [Unattributed]。"] };
  }
  const results: RepricingWindow[] = [];
  let verified = false;
  for (const window of windows) {
    const candidates = validation.valid.filter((item) => {
      const publishedAt = Date.parse(item.published_at as string);
      const startAt = Date.parse(window.start_at);
      const endAt = Date.parse(window.end_at);
      return publishedAt <= endAt + 24 * 60 * 60 * 1000;
    });
    if (candidates.length === 0) {
      results.push({ ...window, attribution_status: "unattributed", evidence_ids: [], confidence: null });
      continue;
    }
    const provider = await requestAnthropicAttribution({ window, evidence: candidates });
    if (provider.ok && provider.decision) {
      verified = true;
      results.push({ ...window, attribution_status: provider.decision.status, evidence_ids: provider.decision.evidence_ids, confidence: provider.decision.confidence, limitation: provider.decision.limitation });
    } else {
      results.push({ ...window, attribution_status: "unattributed", evidence_ids: [], confidence: null, limitation: provider.error_code === "credentials_missing" ? "Anthropic provider unavailable; live attribution is unverified and no conclusion is made." : `Attribution provider failed: ${provider.error_code ?? "unknown"}.` });
      if (provider.error_code) limitations.push(`Anthropic provider: ${provider.error_code}.`);
    }
  }
  return { windows: results, evidence, provider: verified ? "anthropic" : "none", verified, limitations };
}
