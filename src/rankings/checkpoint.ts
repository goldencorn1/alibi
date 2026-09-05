import { createHash } from "node:crypto";
import { WalletUniverseRecord } from "@/src/rankings/universe";

export interface RankingCheckpoint { checkpoint_id: string; generated_at: string; window_days: 90; input_digest: string; row_count: number; data_status: "recorded" | "live" | "synthetic" | "cached"; }
export function makeRankingCheckpoint(rows: WalletUniverseRecord[], dataStatus: RankingCheckpoint["data_status"] = "recorded"): RankingCheckpoint {
  const input_digest = createHash("sha256").update(JSON.stringify(rows)).digest("hex");
  return { checkpoint_id: `rank-${input_digest.slice(0, 16)}`, generated_at: new Date().toISOString(), window_days: 90, input_digest, row_count: rows.length, data_status: dataStatus };
}
