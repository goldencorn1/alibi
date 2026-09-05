import { InputRef } from "@/src/contracts";
import { parseInput } from "@/src/input/parser";
import { AppMode } from "@/src/config";

export interface AnalysisRequest {
  input: string;
  mode?: AppMode;
}

export function parseAnalysisRequest(value: unknown): { ok: true; input: string; mode: AppMode } | { ok: false; message: string } {
  if (!value || typeof value !== "object") return { ok: false, message: "Request body must be a JSON object." };
  const body = value as Partial<AnalysisRequest>;
  if (typeof body.input !== "string" || body.input.trim().length === 0) return { ok: false, message: "input is required." };
  if (body.mode !== undefined && body.mode !== "live" && body.mode !== "recorded") return { ok: false, message: "mode must be live or recorded." };
  return { ok: true, input: body.input.trim(), mode: body.mode ?? "recorded" };
}

export function parseHeaderInput(request: Request): string | null {
  const value = request.headers.get("x-alibi-input");
  return value?.trim() || null;
}

export function requestInputRef(raw: string): InputRef | null {
  const parsed = parseInput(raw);
  return parsed.ok ? parsed.value : null;
}
