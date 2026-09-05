import { ApiErrorEnvelope, SummaryReport, UiState } from "@/src/contracts";

export function uiStateFromResponse(status: number, payload: unknown): UiState {
  if (status === 402) return "payment_required";
  if (status < 200 || status >= 300) {
    const code = (payload as ApiErrorEnvelope | null)?.error?.code;
    if (code === "insufficient_evidence") return "insufficient";
    if (code === "unattributed") return "unattributed";
    return "error";
  }
  const summary = payload as Partial<SummaryReport>;
  if (summary.wallet_metrics?.status === "insufficient_evidence") return "insufficient";
  if ((summary.unattributed_count ?? 0) > 0) return "unattributed";
  if (summary.language_windows?.some((window) => window.release_order === "indeterminate")) return "indeterminate";
  return "success";
}
