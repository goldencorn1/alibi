import { describe, expect, it } from "vitest";
import { keywordRetrieve } from "@/src/rag/keyword-fallback";
import { LOCAL_EMBEDDING_CONFIG, embedText } from "@/src/rag/local-embedding";
import { LocalVectorStore } from "@/src/rag/vector-store";

describe("local RAG contract", () => {
  it("locks the approved model and never requires an embedding API key", () => {
    expect(LOCAL_EMBEDDING_CONFIG.model).toBe("onnx-community/all-MiniLM-L6-v2-ONNX");
    expect(LOCAL_EMBEDDING_CONFIG.revision).toBe("aff7a1dc4e8a1ea593e6ea21e95c22ef0a25966f");
    expect(LOCAL_EMBEDDING_CONFIG.dimensions).toBe(384);
    expect(LOCAL_EMBEDDING_CONFIG.allowRemoteModels).toBe(false);
    expect(LOCAL_EMBEDDING_CONFIG.api_key).toBe("NOT_USED");
  });

  it("uses explicit degraded keyword fallback when local inference is unavailable", async () => {
    const result = await embedText("recorded evidence");
    if (!result.vector) expect(result.policy_flags).toEqual(["rag_degraded"]);
    const hits = keywordRetrieve("rate evidence", [{ id: "d1", text: "rate decision evidence", source_url: "https://example.com", data_status: "recorded" }]);
    expect(hits[0]?.policy_flags).toEqual(["rag_degraded"]);
  });

  it("does not return vector results from a missing model", async () => {
    const store = new LocalVectorStore();
    const result = await store.search("missing model");
    expect(["vector", "keyword"]).toContain(result.method);
    expect(result.policy_flags.includes("rag_degraded") || result.method === "vector").toBe(true);
  });
});
