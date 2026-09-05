import { createHash } from "node:crypto";

export interface RetrievalDocument { id: string; text: string; source_url: string; data_status: "live" | "recorded" | "synthetic" | "cached"; }
export interface RetrievalHit extends RetrievalDocument { score: number; method: "keyword" | "vector"; policy_flags: string[]; }
const tokens = (text: string) => new Set(text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 1));
export function keywordRetrieve(query: string, documents: RetrievalDocument[], limit = 5): RetrievalHit[] {
  const q = tokens(query);
  return documents.map((doc) => { const d = tokens(doc.text); const score = [...q].filter((token) => d.has(token)).length; return { ...doc, score, method: "keyword" as const, policy_flags: ["rag_degraded"] }; }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}
export function documentId(text: string): string { return `doc-${createHash("sha256").update(text).digest("hex").slice(0, 16)}`; }
