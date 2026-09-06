import { Evidence, ReasonCode, RepricingWindow } from "@/src/contracts";
import { requestAnthropicAttribution } from "@/src/providers/anthropic";
import { validateEvidence } from "@/src/data/evidence";

/**
 * C22: the previous tolerance allowed `published_at <= end_at + 24h`, which let
 * a source published a full day *after* the repricing window still be treated
 * as a valid candidate for explaining that window. A whole day is far wider
 * than any real publisher clock skew, so it admitted post-hoc sources as if
 * they were contemporaneous.
 *
 * The tolerance now covers only plausible clock skew and minute-level timestamp
 * rounding between the upstream publisher and our observation clock. Anything
 * beyond it is not silently accepted: the candidate is dropped and the window
 * records `reason_code = "timestamp_uncertain"`. A timestamp landing in the
 * future relative to the window is never treated as a valid publication time.
 */
export const PUBLICATION_SKEW_TOLERANCE_MS = 5 * 60 * 1000;

export interface AttributionRun {
  windows: RepricingWindow[];
  evidence: Evidence[];
  provider: "anthropic" | "none";
  verified: boolean;
  limitations: string[];
  /** Reason codes per window id, for metrics that could not be established. */
  reason_codes: Record<string, ReasonCode>;
}

export async function attributeWindows(windows: RepricingWindow[], evidence: Evidence[]): Promise<AttributionRun> {
  const validation = validateEvidence(evidence);
  const limitations = validation.rejected.map((item) => `Evidence ${item.id} rejected: ${item.reason}`);
  const reasonCodes: Record<string, ReasonCode> = {};
  if (validation.valid.length === 0) {
    return { windows: windows.map((window) => ({ ...window, attribution_status: "unattributed", evidence_ids: [], confidence: null })), evidence, provider: "none", verified: false, limitations: [...limitations, "没有带可验证发布时间的合格来源，标记为 [Unattributed]。"], reason_codes: reasonCodes };
  }
  const results: RepricingWindow[] = [];
  let verified = false;
  for (const window of windows) {
    const endAt = Date.parse(window.end_at);
    const cutoff = endAt + PUBLICATION_SKEW_TOLERANCE_MS;
    let beyondTolerance = 0;
    const candidates = validation.valid.filter((item) => {
      const publishedAt = Date.parse(item.published_at as string);
      if (!Number.isFinite(publishedAt)) return false;
      // Timestamps landing beyond the skew tolerance are treated as uncertain,
      // never as a valid publication time for this window.
      if (publishedAt > cutoff) {
        beyondTolerance += 1;
        return false;
      }
      return true;
    });
    if (candidates.length === 0) {
      if (beyondTolerance > 0) {
        reasonCodes[window.id] = "timestamp_uncertain";
        limitations.push(`Window ${window.id}: ${beyondTolerance} source(s) are published after the window beyond the ${PUBLICATION_SKEW_TOLERANCE_MS / 60000}-minute skew tolerance; reason_code=timestamp_uncertain.`);
      }
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
  return { windows: results, evidence, provider: verified ? "anthropic" : "none", verified, limitations, reason_codes: reasonCodes };
}
