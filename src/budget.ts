import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

export const APPROVED_BUDGET_USD = 10;
let spentUsd = 0;

export interface BudgetState {
  approvedUsd: number;
  spentUsd: number;
  remainingUsd: number;
}

export function getBudgetState(): BudgetState {
  return { approvedUsd: APPROVED_BUDGET_USD, spentUsd, remainingUsd: Math.max(0, APPROVED_BUDGET_USD - spentUsd) };
}

export function budgetSnapshot(): BudgetState {
  return getBudgetState();
}

export function canSpend(estimatedUsd: number): boolean {
  return estimatedUsd >= 0 && spentUsd + estimatedUsd <= APPROVED_BUDGET_USD;
}

export function recordSpend(estimatedUsd: number, event: { provider?: string; purpose?: string; request_count?: number; estimated_tokens?: number } = {}): BudgetState {
  if (estimatedUsd < 0 || spentUsd + estimatedUsd > APPROVED_BUDGET_USD) throw new Error("Approved external budget would be exceeded.");
  spentUsd = Number((spentUsd + estimatedUsd).toFixed(6));
  try {
    const directory = path.join(process.cwd(), "artifacts", "verification");
    mkdirSync(directory, { recursive: true });
    appendFileSync(path.join(directory, "cost-ledger.jsonl"), `${JSON.stringify({
      provider: event.provider ?? "unknown",
      purpose: event.purpose ?? "unspecified",
      timestamp: new Date().toISOString(),
      request_count: event.request_count ?? 1,
      estimated_tokens: event.estimated_tokens ?? null,
      estimated_cost_usd: estimatedUsd,
      cumulative_cost_usd: spentUsd,
    })}\n`, "utf8");
  } catch {
    // Ledger I/O is best effort and must not change provider behavior.
  }
  return getBudgetState();
}

export function resetBudgetForTests(): void {
  spentUsd = 0;
}
