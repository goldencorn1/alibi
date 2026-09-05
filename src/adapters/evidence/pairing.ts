import { LanguageSource } from "@/src/contracts";

export type PairingResult = "verified" | "pairing_unverified";

export function pairLanguageSources(local: LanguageSource, english: LanguageSource): PairingResult {
  if (local.source_tier === "aggregator" || english.source_tier === "aggregator" || local.observation_role === "discovery_only" || english.observation_role === "discovery_only") return "pairing_unverified";
  if (local.official_release_id && local.official_release_id === english.official_release_id) return "verified";
  const crossLinked = Boolean(
    local.official_cross_link && local.official_cross_link === english.official_cross_link &&
    local.publisher.trim().toLowerCase() === english.publisher.trim().toLowerCase() &&
    local.normalized_topic && local.normalized_topic === english.normalized_topic &&
    local.published_date && local.published_date === english.published_date,
  );
  return crossLinked ? "verified" : "pairing_unverified";
}
