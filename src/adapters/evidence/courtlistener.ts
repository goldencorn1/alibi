import { LanguageSource } from "@/src/contracts";

export interface CourtListenerResult {
  connector: "courtlistener";
  status: "healthy" | "provider_unavailable";
  sources: LanguageSource[];
  limitation: string | null;
}

export function courtListenerUnavailable(): CourtListenerResult {
  return {
    connector: "courtlistener",
    status: "provider_unavailable",
    sources: [],
    limitation: "CourtListener is optional and no verified connector credential is available.",
  };
}

export function normalizeCourtListenerSource(source: LanguageSource): LanguageSource {
  return { ...source, source_tier: source.source_tier === "aggregator" ? "aggregator" : "primary" };
}

