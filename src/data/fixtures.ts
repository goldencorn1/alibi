import syntheticFixture from "@/fixtures/synthetic/demo.json";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { AnalysisBundle, DataSourceStatus, Evidence, MarketRecord, PricePoint, Trade, InputRef } from "@/src/contracts";
import { emptySourceCoverage } from "@/src/analysis/cluster-language";
import { AppMode } from "@/src/config";

export interface FixtureDocument {
  schema_version: string;
  fixture_status: "synthetic" | "recorded";
  captured_at: string;
  markets: MarketRecord[];
  prices: PricePoint[];
  trades: Trade[];
  evidence: Evidence[];
  source_status?: DataSourceStatus[];
  limitations?: string[];
}

export const DEMO_PRESET_INPUTS = {
  market: "https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615",
  walletA: "0x674887d1ac838099a48b629dff53f25b7b87ee08",
  walletB: "0xc69bd5567b40ef4d11922eaa57e1f9be1c642076",
} as const;

export async function loadFixture(input: InputRef, mode: AppMode): Promise<FixtureDocument | null> {
  if (mode === "recorded") {
    const key = input.kind === "market" ? "demo-market" : input.normalized_id.toLowerCase();
    const file = path.join(process.cwd(), "fixtures", "recorded", `${safeKey(key)}.json`);
    try {
      const raw = await readFile(file, "utf8");
      const parsed = JSON.parse(raw) as FixtureDocument;
      return parsed.fixture_status === "recorded" ? parsed : null;
    } catch {
      return null;
    }
  }
  if (mode === "live") return null;
  return structuredClone(syntheticFixture as FixtureDocument);
}

export function sourceStatusForFixture(fixture: FixtureDocument): DataSourceStatus {
  return {
    source: fixture.fixture_status,
    source_url: "local://fixtures/" + fixture.fixture_status,
    data_status: fixture.fixture_status,
    retrieved_at: fixture.captured_at,
    http_status: 200,
    attempts: 1,
    retryable: false,
  };
}

export function fixtureBundle(input: InputRef, fixture: FixtureDocument): AnalysisBundle {
  const dataStatus = fixture.fixture_status;
  return {
    input,
    markets: fixture.markets,
    prices: fixture.prices,
    windows: [],
    evidence: fixture.evidence,
    trades: fixture.trades,
    wallet_metrics: null,
    source_status: fixture.source_status?.length ? fixture.source_status : [sourceStatusForFixture(fixture)],
    data_status: dataStatus,
    limitations: [...(fixture.limitations ?? []), ...(dataStatus === "synthetic" ? ["仅供测试；不是实时数据、录制数据或真实调查。"] : [])],
    cluster_alerts: [],
    language_windows: [],
    source_coverage: emptySourceCoverage(),
    evidence_cutoff_at: fixture.captured_at,
  };
}

function safeKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
