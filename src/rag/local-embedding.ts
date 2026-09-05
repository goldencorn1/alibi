import { createHash } from "node:crypto";
import path from "node:path";

export const LOCAL_EMBEDDING_CONFIG = {
  model: "onnx-community/all-MiniLM-L6-v2-ONNX",
  revision: "aff7a1dc4e8a1ea593e6ea21e95c22ef0a25966f",
  task: "feature-extraction",
  dimensions: 384,
  pooling: "mean",
  normalize: true,
  runtime: "@huggingface/transformers@3.7.0",
  allowRemoteModels: false,
  api_key: "NOT_USED",
} as const;

export type EmbeddingResult = { vector: number[]; model: typeof LOCAL_EMBEDDING_CONFIG.model; revision: string; data_status: "recorded" | "live" | "cached"; method: "local-onnx" } | { vector: null; model: typeof LOCAL_EMBEDDING_CONFIG.model; revision: string; data_status: "recorded"; method: "keyword-fallback"; policy_flags: ["rag_degraded"]; error_code: "embedding_unavailable" };

let extractorPromise: Promise<(text: string, options: { pooling: "mean"; normalize: true }) => Promise<{ data: ArrayLike<number> }>> | null = null;
async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(async ({ env, pipeline }) => {
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      const configuredPath = process.env.ALIBI_MODEL_PATH;
      env.localModelPath = configuredPath ?? path.join(process.cwd(), "models");
      const extractor = await pipeline("feature-extraction", LOCAL_EMBEDDING_CONFIG.model, { revision: LOCAL_EMBEDDING_CONFIG.revision, dtype: "q4" });
      return async (text: string, options: { pooling: "mean"; normalize: true }) => extractor(text, options) as unknown as Promise<{ data: ArrayLike<number> }>;
    });
  }
  return extractorPromise;
}

export async function embedText(text: string, dataStatus: "recorded" | "live" | "cached" = "recorded"): Promise<EmbeddingResult> {
  try {
    const output = await (await getExtractor())(text, { pooling: "mean", normalize: true });
    const vector = Array.from(output.data, Number);
    if (vector.length !== LOCAL_EMBEDDING_CONFIG.dimensions || vector.some((value) => !Number.isFinite(value))) throw new Error("invalid_embedding_shape");
    return { vector, model: LOCAL_EMBEDDING_CONFIG.model, revision: LOCAL_EMBEDDING_CONFIG.revision, data_status: dataStatus, method: "local-onnx" };
  } catch {
    return { vector: null, model: LOCAL_EMBEDDING_CONFIG.model, revision: LOCAL_EMBEDDING_CONFIG.revision, data_status: "recorded", method: "keyword-fallback", policy_flags: ["rag_degraded"], error_code: "embedding_unavailable" };
  }
}

export function embeddingDigest(vector: number[]): string { return createHash("sha256").update(JSON.stringify(vector)).digest("hex"); }
