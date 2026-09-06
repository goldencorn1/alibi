import { DataStatus } from "@/src/contracts";
import { AppMode, getAppMode } from "@/src/config";

export const MCP_TOOL_NAMES = [
  "alibi_summary",
  "alibi_detail",
  "alibi_wallet_report",
  "alibi_rankings",
  "alibi_agent_run",
  "alibi_evidence",
  "alibi_health",
  "alibi_subscription_status",
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

/**
 * C24 — how each tool's `data_status` is determined.
 *
 * Previously all eight were hardcoded `data_status: "recorded"`. That was wrong
 * in both directions: it labelled hardcoded stub payloads as if they were
 * replayed real captures, and it would keep reporting `recorded` when the
 * server runs with `ALIBI_DATA_MODE=live`, mislabelling live data.
 *
 * - `mode_dependent`  serves analysis data, so it follows `getAppMode()`:
 *                     `recorded` when replaying fixtures, `live` when reading
 *                     the approved read-only upstreams.
 * - `static_stub`     the handler returns a hardcoded literal with no upstream
 *                     read at all. Labelled `synthetic`, because claiming
 *                     `recorded` would assert a real capture that does not
 *                     exist.
 * - `process_state`   reports the running process's own configuration, read at
 *                     call time. `live` here refers to server state, not to
 *                     market data.
 */
export type DataStatusBasis = "mode_dependent" | "static_stub" | "process_state";

interface ToolDataStatusSpec {
  basis: DataStatusBasis;
  /** Why this basis is correct for this tool, tied to handler behaviour. */
  evidence: string;
}

const TOOL_DATA_STATUS: Record<McpToolName, ToolDataStatusSpec> = {
  alibi_summary: {
    basis: "mode_dependent",
    evidence: "Serves summary analysis; recorded replays fixtures, live reads approved read-only sources.",
  },
  alibi_detail: {
    basis: "mode_dependent",
    evidence: "Serves paid detail analysis behind the payment boundary; follows the active data mode.",
  },
  alibi_wallet_report: {
    basis: "mode_dependent",
    evidence: "Serves wallet metrics derived from trade data; follows the active data mode.",
  },
  alibi_rankings: {
    basis: "mode_dependent",
    evidence: "Serves rankings derived from wallet metrics; follows the active data mode.",
  },
  alibi_agent_run: {
    basis: "static_stub",
    evidence: "Handler echoes the run_id and a fixed read_only_lookup status; no run store is read.",
  },
  alibi_evidence: {
    basis: "static_stub",
    evidence: "Handler returns a hardcoded empty evidence array; no evidence store is read.",
  },
  alibi_health: {
    basis: "process_state",
    evidence: "Handler returns getSafeConfig() for the running process, evaluated at call time.",
  },
  alibi_subscription_status: {
    basis: "static_stub",
    evidence: "Handler returns a hardcoded not_enabled status and a constant network id.",
  },
};

/**
 * Tools named in the spec that are deliberately NOT registered.
 *
 * Implementing them would require screening infrastructure that does not exist
 * (a market universe scan and a per-wallet assessment pipeline). Registering
 * hollow stubs would be worse than their absence: callers would receive
 * confident-looking empty results. They are reported as unimplemented instead.
 */
export const UNIMPLEMENTED_TOOL_NAMES = ["alibi_assess", "alibi_screen", "alibi_market_screen"] as const;

export function toolResult(payload: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(payload) }] }; }

export function resolveToolDataStatus(name: McpToolName, mode: AppMode): DataStatus {
  const spec = TOOL_DATA_STATUS[name];
  if (spec.basis === "process_state") return "live";
  if (spec.basis === "static_stub") return "synthetic";
  return mode === "live" ? "live" : "recorded";
}

export interface McpToolCatalogEntry {
  name: McpToolName;
  data_status: DataStatus;
  data_status_basis: DataStatusBasis;
  data_status_evidence: string;
  mutates_business_result: false;
}

/**
 * `mode` defaults to the active app mode rather than a constant, so the catalog
 * cannot silently report `recorded` for a live deployment.
 */
export function toolCatalog(mode: AppMode = getAppMode()): McpToolCatalogEntry[] {
  return MCP_TOOL_NAMES.map((name) => ({
    name,
    data_status: resolveToolDataStatus(name, mode),
    data_status_basis: TOOL_DATA_STATUS[name].basis,
    data_status_evidence: TOOL_DATA_STATUS[name].evidence,
    mutates_business_result: false as const,
  }));
}
