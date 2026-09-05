import { ClusterAlert } from "@/src/contracts";

export interface RevisionRecord {
  alert_id: string;
  created_at: string;
  evidence_cutoff_at: string;
  revision: number;
  supersedes_revision: number | null;
}

export interface LanguageRevisionRecord {
  window_id: string;
  evidence_cutoff_at: string;
  revision: number;
  supersedes_revision: number | null;
}

export function nextRevision(previous: RevisionRecord | null, alertId: string, createdAt: string): RevisionRecord {
  const revision = (previous?.revision ?? 0) + 1;
  return {
    alert_id: alertId,
    created_at: createdAt,
    evidence_cutoff_at: createdAt,
    revision,
    supersedes_revision: previous?.revision ?? null,
  };
}

export function revisionRecord(alert: ClusterAlert): RevisionRecord {
  return {
    alert_id: alert.alert_id,
    created_at: alert.created_at,
    evidence_cutoff_at: alert.evidence_cutoff_at,
    revision: alert.revision,
    supersedes_revision: alert.supersedes_revision,
  };
}

export function nextLanguageRevision(previous: LanguageRevisionRecord | null, windowId: string, cutoff: string): LanguageRevisionRecord {
  return { window_id: windowId, evidence_cutoff_at: cutoff, revision: (previous?.revision ?? 0) + 1, supersedes_revision: previous?.revision ?? null };
}
