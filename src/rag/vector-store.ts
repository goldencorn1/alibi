import { embedText, LOCAL_EMBEDDING_CONFIG } from "@/src/rag/local-embedding";
import { keywordRetrieve, RetrievalDocument, RetrievalHit } from "@/src/rag/keyword-fallback";

interface VectorDocument extends RetrievalDocument { vector: number[]; }
export class LocalVectorStore {
  private readonly documents: VectorDocument[] = [];
  add(document: RetrievalDocument, vector: number[]): void { if (vector.length !== LOCAL_EMBEDDING_CONFIG.dimensions) throw new Error("invalid_embedding_shape"); this.documents.push({ ...document, vector }); }
  async search(query: string, limit = 5): Promise<{ hits: RetrievalHit[]; method: "vector" | "keyword"; policy_flags: string[] }> {
    const embedding = await embedText(query);
    if (!embedding.vector) return { hits: keywordRetrieve(query, this.documents, limit), method: "keyword", policy_flags: ["rag_degraded"] };
    const hits = this.documents.map((doc) => ({ ...doc, score: cosine(embedding.vector as number[], doc.vector), method: "vector" as const, policy_flags: [] })).sort((a, b) => b.score - a.score).slice(0, limit).map(({ vector: _vector, ...hit }) => hit);
    return { hits, method: "vector", policy_flags: [] };
  }
  get size(): number { return this.documents.length; }
}
function cosine(a: number[], b: number[]): number { let dot = 0; let aa = 0; let bb = 0; for (let i = 0; i < a.length; i += 1) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; } return aa && bb ? dot / Math.sqrt(aa * bb) : 0; }
